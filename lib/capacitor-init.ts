import { Capacitor } from "@capacitor/core"

export async function initCapacitor() {
  if (!Capacitor.isNativePlatform()) return

  // Hide splash screen after app loads
  const { SplashScreen } = await import("@capacitor/splash-screen")
  await SplashScreen.hide()

  // Set status bar style
  const { StatusBar, Style } = await import("@capacitor/status-bar")
  await StatusBar.setStyle({ style: Style.Dark })
  await StatusBar.setBackgroundColor({ color: "#0a0a1a" })
  
  // On Android, make status bar overlay content and add padding via CSS variable
  if (Capacitor.getPlatform() === "android") {
    await StatusBar.setOverlaysWebView({ overlay: false })
    // Set CSS variable for status bar height
    document.documentElement.style.setProperty("--status-bar-height", "24px")
  }

  // Handle back button on Android
  const { App } = await import("@capacitor/app")
  App.addListener("backButton", ({ canGoBack }) => {
    if (!canGoBack) {
      App.exitApp()
    } else {
      window.history.back()
    }
  })
}

export function isNative(): boolean {
  return Capacitor.isNativePlatform()
}
