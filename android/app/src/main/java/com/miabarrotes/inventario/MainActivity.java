package com.miabarrotes.inventario;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {}
package com.miabarrotes.inventario;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity implements SensorEventListener {
    private SensorManager sensorManager;
    private Sensor lightSensor;
    private float lastLux = -1f;
    private static final int PERMISSION_REQUEST_CODE = 1001;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestAppPermissions();

        // Permitir acceso a la cámara dentro del WebView de Capacitor
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    runOnUiThread(() -> request.grant(request.getResources()));
                }
            });
        }

        // Inicializar Sensor de Luz Ambiental (Sensor.TYPE_LIGHT)
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            lightSensor = sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT);
        }
    }

    private void requestAppPermissions() {
        List<String> needed = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            needed.add(Manifest.permission.CAMERA);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }
        if (!needed.isEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toArray(new String[0]), PERMISSION_REQUEST_CODE);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (sensorManager != null && lightSensor != null) {
            sensorManager.registerListener(this, lightSensor, SensorManager.SENSOR_DELAY_NORMAL);
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_LIGHT) {
            float lux = event.values[0];
            if (Math.abs(lux - lastLux) >= 5f) {
                lastLux = lux;

                // Ajustar brillo de pantalla según iluminación del local
                float brightness = lux < 50f ? 0.35f : (lux > 400f ? 1.0f : 0.70f);
                WindowManager.LayoutParams layout = getWindow().getAttributes();
                layout.screenBrightness = brightness;
                getWindow().setAttributes(layout);

                // Enviar lectura de luxes a React
                if (getBridge() != null && getBridge().getWebView() != null) {
                    final String js = "window.dispatchEvent(new CustomEvent('ambientLightChange', { detail: { lux: " + lux + " } }));";
                    getBridge().getWebView().post(() -> getBridge().getWebView().evaluateJavascript(js, null));
                }
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // No requiere acción
    }
}