import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.health.app',
  appName: 'Health App',
  webDir: 'dist',
  android: {
    // Respect the system status bar and navigation bar, don't draw behind them
    backgroundColor: '#f8fafc',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
