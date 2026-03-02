const sharp = require("sharp")
const { mkdirSync, existsSync } = require("fs")
const { join, dirname } = require("path")

const SOURCE = join(process.cwd(), "public", "app-icon.jpg")

const ANDROID_ICONS = [
  { size: 48, path: "android/app/src/main/res/mipmap-mdpi/ic_launcher.png" },
  { size: 72, path: "android/app/src/main/res/mipmap-hdpi/ic_launcher.png" },
  { size: 96, path: "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png" },
  { size: 144, path: "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png" },
  { size: 192, path: "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png" },
  { size: 512, path: "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png" },
]

const WEB_ICONS = [
  { size: 192, path: "public/icons/icon-192x192.png" },
  { size: 512, path: "public/icons/icon-512x512.png" },
  { size: 180, path: "public/apple-touch-icon.png" },
  { size: 32, path: "public/favicon-32x32.png" },
  { size: 16, path: "public/favicon-16x16.png" },
]

const ALL_ICONS = [...ANDROID_ICONS, ...WEB_ICONS]

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
