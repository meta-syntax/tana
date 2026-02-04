import sharp from 'sharp'
import { join } from 'node:path'

const WIDTH = 1200
const HEIGHT = 630

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#0f1117"/>

  <!-- 背景装飾 -->
  <circle cx="1050" cy="150" r="300" fill="#f97316" opacity="0.05"/>
  <circle cx="150" cy="500" r="200" fill="#f97316" opacity="0.03"/>

  <!-- ブックマークアイコン（favicon準拠） -->
  <g transform="translate(100, 180) scale(8)">
    <g opacity="0.4">
      <path d="M 8 8 L 14 8 L 14 24 L 11 21.5 L 8 24 Z" fill="#fb923c"/>
    </g>
    <g opacity="0.65">
      <path d="M 13 7 L 19 7 L 19 25 L 16 22.5 L 13 25 Z" fill="#f97316"/>
    </g>
    <g>
      <path d="M 18 6 L 24 6 L 24 26 L 21 23.5 L 18 26 Z" fill="#f97316"/>
    </g>
  </g>

  <!-- テキスト -->
  <text x="420" y="260" font-family="sans-serif" font-size="72" font-weight="bold" fill="#ffffff">
    Tana
  </text>
  <text x="420" y="340" font-family="sans-serif" font-size="28" fill="#a1a1aa">
    ブックマークを、いつでも取り出せる資産に。
  </text>

  <!-- 区切り線 -->
  <rect x="420" y="380" width="80" height="3" rx="1.5" fill="#f97316"/>

  <!-- サブテキスト -->
  <text x="420" y="430" font-family="sans-serif" font-size="20" fill="#71717a">
    個人向けブックマーク管理Webアプリ
  </text>
  <text x="420" y="460" font-family="sans-serif" font-size="20" fill="#71717a">
    OGP自動取得 ・ サムネイル表示 ・ かんたん検索
  </text>
</svg>
`

async function main() {
  const outputPath = join(import.meta.dirname!, '..', 'public', 'og-image.png')

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath)

  console.log(`OGP image generated: ${outputPath}`)
}

main().catch(console.error)
