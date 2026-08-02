import { defineConfig } from '@capacitor/cli';

export default defineConfig({
  appId: 'com.kamal.smsfinance.web',
  appName: 'SmsFinance Web',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      showSpinner: false
    }
  }
});
