const sharp = require("sharp")
const { mkdirSync, existsSync } = require("fs")
const { join, dirname } = require("path")

const SOURCE = "/vercel/share/v0-project/public/app-icon.jpg"
const TMP = "/tmp/kriklu-icons"

const ALL_ICONS = [
  { size: 192, name: "icon-192x192.png" },
  { size: 512, name: "icon-512x512.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 32, name: "favicon-32x32.png" },
  { size: 16, name: "favicon-16x16.png" },
]

async function generate() {
  if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true })
  console.log(`Generating ${ALL_ICONS.length} icons from ${SOURCE} to ${TMP}...`)

  for (const icon of ALL_ICONS) {
    const outputPath = join(TMP, icon.name)
    await sharp(SOURCE).resize(icon.size, icon.size, { fit: "cover" }).png().toFile(outputPath)
    console.log(`  Created ${icon.name} (${icon.size}x${icon.size}) -> ${outputPath}`)
  }

  console.log("Done! Copy icons from " + TMP)
}

generate().catch(console.error)
