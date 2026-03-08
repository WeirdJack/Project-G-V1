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
    // Make status bar NOT overlay web content (gives us native padding)
    await StatusBar.setOverlaysWebView({ overlay: false })
    
    // Also set a CSS variable for additional safety padding
    // Android status bar is typically 24dp but can be 25-48dp on notched devices
    const statusBarHeight = Math.max(24, window.screen.height - window.innerHeight > 100 ? 48 : 24)
    document.documentElement.style.setProperty("--status-bar-height", `${statusBarHeight}px`)
    
    // Add a class so we can target Android specifically in CSS
    document.documentElement.classList.add("android-native")
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
