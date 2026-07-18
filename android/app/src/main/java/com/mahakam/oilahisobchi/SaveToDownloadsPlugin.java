package com.mahakam.oilahisobchi;

import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.CancellationSignal;
import android.os.Environment;
import android.os.ParcelFileDescriptor;
import android.print.PageRange;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintDocumentInfo;
import android.provider.MediaStore;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

// Faylni bevosita qurilmaning ommaviy "Yuklab olishlar" (Downloads)
// papkasiga saqlaydi — foydalanuvchi "Ulashish" oynasidan biror ilova
// tanlashi shart emas. Android 10 (API 29)+ da MediaStore.Downloads
// orqali (maxsus ruxsatsiz), undan pastda esa eski (legacy) usul bilan.
// Shuningdek: (1) saqlangan faylni "qaysi ilovada ochasiz" so'rovi bilan
// darhol ochish (open), (2) HTML hisobotni HAQIQIY PDF fayliga aylantirib
// saqlash (saveHtmlAsPdf) imkoniyatlarini beradi.
@CapacitorPlugin(name = "SaveToDownloads")
public class SaveToDownloadsPlugin extends Plugin {

    // Print-adapter oqimi tugaguncha WebView GC qilinib ketmasligi uchun
    // sinf maydoni sifatida ushlab turiladi.
    private WebView pdfWebView;

    @PluginMethod
    public void save(PluginCall call) {
        String filename = call.getString("filename");
        String content = call.getString("content");
        String mimeType = call.getString("mimeType", "application/octet-stream");

        if (filename == null || content == null) {
            call.reject("filename va content majburiy");
            return;
        }

        try {
            byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
            Uri uri = writeBytesToDownloads(bytes, filename, mimeType);
            JSObject ret = new JSObject();
            ret.put("uri", uri.toString());
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Faylni saqlashda xato: " + e.getMessage(), e);
        }
    }

    // Saqlangan faylni tizimning "Ochish uchun ilovani tanlang" oynasi
    // orqali darhol ochadi — foydalanuvchi qo'lda "Fayllar" ilovasiga
    // kirib qidirishi shart emas.
    @PluginMethod
    public void open(PluginCall call) {
        String uriStr = call.getString("uri");
        String mimeType = call.getString("mimeType", "*/*");
        if (uriStr == null) {
            call.reject("uri majburiy");
            return;
        }
        try {
            Uri uri = Uri.parse(uriStr);
            Intent viewIntent = new Intent(Intent.ACTION_VIEW);
            viewIntent.setDataAndType(uri, mimeType);
            viewIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            Intent chooser = Intent.createChooser(viewIntent, null);
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(chooser);
            call.resolve();
        } catch (Exception e) {
            call.reject("Faylni ochib bo'lmadi: " + e.getMessage(), e);
        }
    }

    // Berilgan HTML matnini (hisobot/tilxat) qurilmaning tizim darajasidagi
    // WebView bosib chiqarish mexanizmi (android.print.PrintDocumentAdapter)
    // orqali HAQIQIY PDF faylga aylantirib, to'g'ridan-to'g'ri Yuklab
    // olishlar papkasiga saqlaydi. Foydalanuvchidan hech qanday "Chop etish"
    // dialogini ko'rsatmasdan, fon rejimida ishlaydi.
    @PluginMethod
    public void saveHtmlAsPdf(PluginCall call) {
        String html = call.getString("html");
        String filename = call.getString("filename");
        if (html == null || filename == null) {
            call.reject("html va filename majburiy");
            return;
        }
        getActivity().runOnUiThread(() -> {
            try {
                pdfWebView = new WebView(getContext());
                pdfWebView.getSettings().setJavaScriptEnabled(false);
                pdfWebView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onPageFinished(WebView view, String url) {
                        writePdfFromWebView(view, filename, call);
                    }
                });
                pdfWebView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
            } catch (Exception e) {
                call.reject("PDF yaratishda xato: " + e.getMessage(), e);
            }
        });
    }

    private void writePdfFromWebView(WebView view, String filename, PluginCall call) {
        try {
            PrintDocumentAdapter adapter = view.createPrintDocumentAdapter(filename);
            PrintAttributes attrs = new PrintAttributes.Builder()
                .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                .setResolution(new PrintAttributes.Resolution("pdf", "pdf", 300, 300))
                .setMinMargins(PrintAttributes.Margins.NO_MARGINS)
                .build();

            adapter.onLayout(null, attrs, null, new PrintDocumentAdapter.LayoutResultCallback() {
                @Override
                public void onLayoutFinished(PrintDocumentInfo info, boolean changed) {
                    writePdfPages(adapter, filename, call);
                }

                @Override
                public void onLayoutFailed(CharSequence error) {
                    call.reject("PDF tayyorlashda xato: " + error);
                    pdfWebView = null;
                }
            }, null);
        } catch (Exception e) {
            call.reject("PDF yaratishda xato: " + e.getMessage(), e);
            pdfWebView = null;
        }
    }

    private void writePdfPages(PrintDocumentAdapter adapter, String filename, PluginCall call) {
        Uri targetUri = null;
        ParcelFileDescriptor pfd = null;
        try {
            Context ctx = getContext();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues values = new ContentValues();
                values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
                values.put(MediaStore.Downloads.MIME_TYPE, "application/pdf");
                values.put(MediaStore.Downloads.IS_PENDING, 1);
                targetUri = ctx.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                if (targetUri == null) throw new IOException("MediaStore yozuvi yaratilmadi");
                pfd = ctx.getContentResolver().openFileDescriptor(targetUri, "w");
            } else {
                File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                if (!downloadsDir.exists()) downloadsDir.mkdirs();
                File outFile = new File(downloadsDir, filename);
                pfd = ParcelFileDescriptor.open(
                    outFile,
                    ParcelFileDescriptor.MODE_WRITE_ONLY | ParcelFileDescriptor.MODE_CREATE | ParcelFileDescriptor.MODE_TRUNCATE
                );
                targetUri = FileProvider.getUriForFile(ctx, ctx.getPackageName() + ".fileprovider", outFile);
            }
        } catch (Exception e) {
            call.reject("PDF faylini yaratishda xato: " + e.getMessage(), e);
            pdfWebView = null;
            return;
        }

        final Uri finalUri = targetUri;
        final ParcelFileDescriptor finalPfd = pfd;
        adapter.onWrite(new PageRange[] { PageRange.ALL_PAGES }, finalPfd, new CancellationSignal(), new PrintDocumentAdapter.WriteResultCallback() {
            @Override
            public void onWriteFinished(PageRange[] pages) {
                try {
                    finalPfd.close();
                } catch (IOException ignored) {}
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        ContentValues doneValues = new ContentValues();
                        doneValues.put(MediaStore.Downloads.IS_PENDING, 0);
                        getContext().getContentResolver().update(finalUri, doneValues, null, null);
                    }
                    JSObject ret = new JSObject();
                    ret.put("uri", finalUri.toString());
                    call.resolve(ret);
                } catch (Exception e) {
                    call.reject("PDF faylini yakunlashda xato: " + e.getMessage(), e);
                }
                pdfWebView = null;
            }

            @Override
            public void onWriteFailed(CharSequence error) {
                try {
                    finalPfd.close();
                } catch (IOException ignored) {}
                call.reject("PDF yozishda xato: " + error);
                pdfWebView = null;
            }
        });
    }

    private Uri writeBytesToDownloads(byte[] bytes, String filename, String mimeType) throws Exception {
        Context ctx = getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
            values.put(MediaStore.Downloads.MIME_TYPE, mimeType);
            values.put(MediaStore.Downloads.IS_PENDING, 1);

            Uri collection = MediaStore.Downloads.EXTERNAL_CONTENT_URI;
            Uri item = ctx.getContentResolver().insert(collection, values);
            if (item == null) {
                throw new IOException("Yuklab olishlar papkasida fayl yaratib bo'lmadi");
            }
            try (OutputStream out = ctx.getContentResolver().openOutputStream(item)) {
                if (out == null) throw new IOException("OutputStream olinmadi");
                out.write(bytes);
            }
            values.clear();
            values.put(MediaStore.Downloads.IS_PENDING, 0);
            ctx.getContentResolver().update(item, values, null, null);
            return item;
        } else {
            // Android 9 va pastda (API < 29): ommaviy Downloads papkasiga
            // to'g'ridan-to'g'ri yozish (WRITE_EXTERNAL_STORAGE talab qiladi,
            // manifestda maxSdkVersion="28" bilan cheklangan). ACTION_VIEW
            // orqali xavfsiz ochish uchun file:// emas, FileProvider content://
            // Uri qaytariladi (API24+da file:// FileUriExposedException beradi).
            File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            if (!downloadsDir.exists()) downloadsDir.mkdirs();
            File outFile = new File(downloadsDir, filename);
            try (FileOutputStream fos = new FileOutputStream(outFile)) {
                fos.write(bytes);
            }
            return FileProvider.getUriForFile(ctx, ctx.getPackageName() + ".fileprovider", outFile);
        }
    }
}
