package com.mahakam.oilahisobchi;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    // MUHIM: Capacitor'ning o'zi (com.getcapacitor.BridgeWebChromeClient,
    // Bridge tomonidan avtomatik o'rnatiladi) getUserMedia() (kamera/
    // mikrofon) ruxsat so'rovlarini ALLAQACHON to'g'ri ushlaydi — tizim
    // ruxsatini so'raydi, natijaga qarab WebView so'rovini grant/deny
    // qiladi (shu bilan birga JS alert/confirm/prompt, fayl tanlash va
    // konsol log kabi boshqa muhim funksiyalarni ham). Shu sabab bu yerda
    // WebChromeClient'ni QO'LDA ALMASHTIRISH SHART EMAS — aksincha, buni
    // qilish Capacitor'ning yuqoridagi barcha ishlarini BUZIB QO'YARDI.
    // Xato "ruxsat berilmagan" AndroidManifest'da CAMERA/RECORD_AUDIO
    // ruxsatlari yo'qligidan edi (alohida tuzatildi) — bu native kodga
    // tegishli emas edi.
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(SaveToDownloadsPlugin.class);
        registerPlugin(SpeechToTextPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
