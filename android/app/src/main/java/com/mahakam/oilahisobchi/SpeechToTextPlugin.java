package com.mahakam.oilahisobchi;

import android.Manifest;
import android.content.Intent;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.ArrayList;

// Android WebView (Capacitor ichida ishlatiladigan) brauzerning Web Speech
// API'sini (window.SpeechRecognition) HAQIQIY nutqni tanib olish xizmatiga
// ulamaydi — RECORD_AUDIO ruxsati berilgan bo'lsa ham "not-allowed" xatosi
// bilan ishlamay qoladi. Shu sabab bu yerda qurilmaning o'zidagi
// android.speech.SpeechRecognizer (tizim darajasidagi nutqni tanib olish)
// ishlatiladi va natija JS tomonga "result"/"error"/"end" hodisalari orqali
// uzatiladi.
@CapacitorPlugin(
    name = "SpeechToText",
    permissions = { @Permission(strings = { Manifest.permission.RECORD_AUDIO }, alias = "microphone") }
)
public class SpeechToTextPlugin extends Plugin {

    private SpeechRecognizer recognizer;

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("available", SpeechRecognizer.isRecognitionAvailable(getContext()));
        call.resolve(ret);
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (getPermissionState("microphone") != com.getcapacitor.PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "onMicPermissionResult");
            return;
        }
        startListening(call);
    }

    @PermissionCallback
    private void onMicPermissionResult(PluginCall call) {
        if (getPermissionState("microphone") == com.getcapacitor.PermissionState.GRANTED) {
            startListening(call);
        } else {
            call.reject("not-allowed");
        }
    }

    private void startListening(PluginCall call) {
        String lang = call.getString("lang", "en-US");
        getActivity().runOnUiThread(() -> {
            try {
                if (recognizer != null) {
                    recognizer.destroy();
                    recognizer = null;
                }
                if (!SpeechRecognizer.isRecognitionAvailable(getContext())) {
                    call.reject("not-available");
                    return;
                }
                recognizer = SpeechRecognizer.createSpeechRecognizer(getContext());
                recognizer.setRecognitionListener(new RecognitionListener() {
                    @Override
                    public void onReadyForSpeech(Bundle params) {}

                    @Override
                    public void onBeginningOfSpeech() {}

                    @Override
                    public void onRmsChanged(float rmsdB) {}

                    @Override
                    public void onBufferReceived(byte[] buffer) {}

                    @Override
                    public void onEndOfSpeech() {}

                    @Override
                    public void onError(int error) {
                        JSObject data = new JSObject();
                        data.put("error", mapError(error));
                        notifyListeners("error", data);
                        JSObject endData = new JSObject();
                        notifyListeners("end", endData);
                    }

                    @Override
                    public void onResults(Bundle results) {
                        emitResult(results, true);
                        JSObject endData = new JSObject();
                        notifyListeners("end", endData);
                    }

                    @Override
                    public void onPartialResults(Bundle partialResults) {
                        emitResult(partialResults, false);
                    }

                    @Override
                    public void onEvent(int eventType, Bundle params) {}

                    private void emitResult(Bundle bundle, boolean isFinal) {
                        ArrayList<String> matches = bundle.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                        if (matches != null && !matches.isEmpty()) {
                            JSObject data = new JSObject();
                            data.put("transcript", matches.get(0));
                            data.put("isFinal", isFinal);
                            notifyListeners("result", data);
                        }
                    }
                });

                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, lang);
                intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getContext().getPackageName());

                recognizer.startListening(intent);
                call.resolve();
            } catch (Exception e) {
                call.reject("start-failed: " + e.getMessage(), e);
            }
        });
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            if (recognizer != null) {
                recognizer.stopListening();
            }
            call.resolve();
        });
    }

    @Override
    protected void handleOnDestroy() {
        if (getActivity() == null) return;
        getActivity().runOnUiThread(() -> {
            if (recognizer != null) {
                recognizer.destroy();
                recognizer = null;
            }
        });
    }

    private String mapError(int error) {
        switch (error) {
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                return "not-allowed";
            case SpeechRecognizer.ERROR_NO_MATCH:
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                return "no-speech";
            case SpeechRecognizer.ERROR_NETWORK:
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                return "network";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                return "busy";
            default:
                return "error";
        }
    }
}
