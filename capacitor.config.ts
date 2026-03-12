import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "com.kriklu.app",
  appName: "Kriklu",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#0a0a1a",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0a1a",
      overlaysWebView: false,
    },
  },
  android: {
    buildOptions: {
      releaseType: "APK",
    },
  },
}

export default config
