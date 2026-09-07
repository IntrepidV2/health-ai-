package com.health.app;

import android.os.Bundle;
import android.view.View;
import android.view.Window;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Force dark status bar icons (so they're visible on light background)
        Window window = getWindow();
        window.setStatusBarColor(0xFFF8FAFC);
        window.setNavigationBarColor(0xFFF8FAFC);

        View decorView = window.getDecorView();
        WindowInsetsControllerCompat controller = new WindowInsetsControllerCompat(window, decorView);
        controller.setAppearanceLightStatusBars(true);
        controller.setAppearanceLightNavigationBars(true);
    }
}
