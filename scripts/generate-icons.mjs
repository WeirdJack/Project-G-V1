import sharp from "sharp"
import { mkdirSync, existsSync } from "fs"
import { join, dirname } from "path"

const SOURCE = join(process.cwd(), "public", "app-icon.jpg")

// Android icons (mipmap folders)
const ANDROID_ICONS = [
  { size: 48, path: "android/app/src/main/res/mipmap-mdpi/ic_launcher.png" },
  { size: 72, path: "android/app/src/main/res/mipmap-hdpi/ic_launcher.png" },
  { size: 96, path: "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png" },
  { size: 144, path: "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png" },
  { size: 192, path: "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" },
  { size: 48, path: "android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png" },
  { size: 72, path: "android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png" },
  { size: 96, path: "android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png" },
  { size: 144, path: "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png" },
  { size: 192, path: "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png" },
  { size: 512, path: "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png" },
]

// iOS icons
const IOS_ICONS = [
  { size: 20, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20x20@1x.png" },
  { size: 40, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20x20@2x.png" },
  { size: 60, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-20x20@3x.png" },
  { size: 29, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29x29@1x.png" },
  { size: 58, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29x29@2x.png" },
  { size: 87, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-29x29@3x.png" },
  { size: 40, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40x40@1x.png" },
  { size: 80, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40x40@2x.png" },
  { size: 120, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-40x40@3x.png" },
  { size: 120, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-60x60@2x.png" },
  { size: 180, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-60x60@3x.png" },
  { size: 76, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-76x76@1x.png" },
  { size: 152, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-76x76@2x.png" },
  { size: 167, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-83.5x83.5@2x.png" },
  { size: 1024, path: "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png" },
]

// PWA / web icons
const WEB_ICONS = [
  { size: 192, path: "public/icons/icon-192x192.png" },
  { size: 512, path: "public/icons/icon-512x512.png" },
  { size: 180, path: "public/apple-touch-icon.png" },
  { size: 32, path: "public/favicon-32x32.png" },
  { size: 16, path: "public/favicon-16x16.png" },
]

const ALL_ICONS = [...ANDROID_ICONS, ...IOS_ICONS, ...WEB_ICONS]

async function generate() {
  console.log(`Generating ${ALL_ICONS.length} icons from ${SOURCE}...`)

  for (const icon of ALL_ICONS) {
    const outputPath = join(process.cwd(), icon.path)
    const dir = dirname(outputPath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    await sharp(SOURCE).resize(icon.size, icon.size, { fit: "cover" }).png().toFile(outputPath)
    console.log(`  Created ${icon.path} (${icon.size}x${icon.size})`)
  }

  console.log("Done! All icons generated.")
}

generate().catch(console.error)
