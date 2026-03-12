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
  
  // On Android, handle status bar properly
  if (Capacitor.getPlatform() === "android") {
    // Ensure status bar does NOT overlay web content
    await StatusBar.setOverlaysWebView({ overlay: false })
    
    // Set status bar to be visible with dark background
    await StatusBar.show()
    
    // Add class for CSS targeting
    document.documentElement.classList.add("android-native")
    
    // Force a fixed top padding since overlay: false should handle it natively
    // but we add CSS backup just in case
    document.body.style.paddingTop = "0px"
  }
  
  // On iOS, status bar is handled via safe-area-inset-top
  if (Capacitor.getPlatform() === "ios") {
    document.documentElement.classList.add("ios-native")
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
