package com.mahakam.oilahisobchi;

import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

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
// Shuningdek saqlangan faylni "qaysi ilovada ochasiz" so'rovi bilan
// darhol ochish (open) imkoniyatini beradi.
//
// MUHIM: PDF fayllar bu yerda YARATILMAYDI — ular JS tomonida (jsPDF +
// html2canvas orqali, useExport.js'ga q.) tayyor binary sifatida
// generatsiya qilinadi, so'ng shu yerga base64 (isBase64=true) ko'rinishda
// yoziladi. Avval sinab ko'rilgan "WebView'ni android.print.PrintDocumentAdapter
// orqali PDF'ga aylantirish" usuli ISHLAMAYDI — PrintDocumentAdapter.
// LayoutResultCallback/WriteResultCallback konstruktorlari package-private
// (faqat android.print paketi ichidan chaqirilishi mumkin), shu sabab
// ilova kodi ulardan meros ololmaydi (build xatosi: "is not public...
// cannot be accessed from outside package").
@CapacitorPlugin(name = "SaveToDownloads")
public class SaveToDownloadsPlugin extends Plugin {

    @PluginMethod
    public void save(PluginCall call) {
        String filename = call.getString("filename");
        String content = call.getString("content");
        String mimeType = call.getString("mimeType", "application/octet-stream");
        boolean isBase64 = Boolean.TRUE.equals(call.getBoolean("isBase64", false));

        if (filename == null || content == null) {
            call.reject("filename va content majburiy");
            return;
        }

        try {
            byte[] bytes = isBase64 ? Base64.decode(content, Base64.DEFAULT) : content.getBytes(StandardCharsets.UTF_8);
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
