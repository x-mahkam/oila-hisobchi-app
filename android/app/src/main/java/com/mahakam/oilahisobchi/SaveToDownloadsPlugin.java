package com.mahakam.oilahisobchi;

import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;

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
@CapacitorPlugin(name = "SaveToDownloads")
public class SaveToDownloadsPlugin extends Plugin {

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
            Context ctx = getContext();
            byte[] bytes = content.getBytes(StandardCharsets.UTF_8);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues values = new ContentValues();
                values.put(MediaStore.Downloads.DISPLAY_NAME, filename);
                values.put(MediaStore.Downloads.MIME_TYPE, mimeType);
                values.put(MediaStore.Downloads.IS_PENDING, 1);

                Uri collection = MediaStore.Downloads.EXTERNAL_CONTENT_URI;
                Uri item = ctx.getContentResolver().insert(collection, values);
                if (item == null) {
                    call.reject("Yuklab olishlar papkasida fayl yaratib bo'lmadi");
                    return;
                }
                try (OutputStream out = ctx.getContentResolver().openOutputStream(item)) {
                    if (out == null) throw new IOException("OutputStream olinmadi");
                    out.write(bytes);
                }
                values.clear();
                values.put(MediaStore.Downloads.IS_PENDING, 0);
                ctx.getContentResolver().update(item, values, null, null);

                JSObject ret = new JSObject();
                ret.put("uri", item.toString());
                call.resolve(ret);
            } else {
                // Android 9 va pastda (API < 29): ommaviy Downloads papkasiga
                // to'g'ridan-to'g'ri yozish (WRITE_EXTERNAL_STORAGE talab qiladi,
                // manifestda maxSdkVersion="28" bilan cheklangan).
                File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                if (!downloadsDir.exists()) downloadsDir.mkdirs();
                File outFile = new File(downloadsDir, filename);
                try (FileOutputStream fos = new FileOutputStream(outFile)) {
                    fos.write(bytes);
                }
                JSObject ret = new JSObject();
                ret.put("uri", Uri.fromFile(outFile).toString());
                call.resolve(ret);
            }
        } catch (Exception e) {
            call.reject("Faylni saqlashda xato: " + e.getMessage(), e);
        }
    }
}
