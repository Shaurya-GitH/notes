// The 404 page's plates. The page is one drawing (design/404/easel-lines.png, generated with the
// model that made the site's other plates): a starry night in plain black outlines, and an easel
// standing in it whose canvas is the only colour.
//   easel-lines-ink.webp     the whole drawing with every pixel black or white, the canvas left bare
//   easel-lines-canvas.webp  the canvas's own patch of the drawing, in colour; 404.tsx lays it over
//                            the ink at PATCH (x, y in the drawing's pixels) through a mask of the face
// Run: node scripts/notfound-plates.mjs
import sharp from "sharp"
import drawing from "../quartz/components/pages/404-plate.json" with { type: "json" }

const src = "design/404/easel-lines.png"
const out = "quartz/static/vg"
// the canvas face just inside its black edge (corners clockwise from top left); 404.tsx masks the
// colour a little wider, out to the middle of that edge
const FACE = [
  [141, 289],
  [499, 299],
  [532, 549],
  [168, 570],
]
const { x: left, y: top, width, height } = drawing.patch
// one star sat where the lettering goes
const ERASE = { x0: 856, y0: 120, x1: 940, y1: 200 }

const inFace = (x, y) =>
  FACE.every(([ax, ay], k) => {
    const [bx, by] = FACE[(k + 1) % 4]
    return (bx - ax) * (y - ay) - (by - ay) * (x - ax) >= 0
  })

const source = sharp(src)
const { width: sourceWidth, height: sourceHeight } = await source.metadata()
if (sourceWidth !== drawing.width || sourceHeight !== drawing.height) {
  throw new Error(
    `Expected a ${drawing.width} × ${drawing.height} drawing, got ${sourceWidth} × ${sourceHeight}`,
  )
}

// drawn at one and a half times the size, so the pen's edges stay clean when every pixel is cut to
// black or white
const S = 1.5
const [W, H] = [sourceWidth * S, sourceHeight * S]
const { data } = await source
  .clone()
  .resize(W, H, { kernel: "lanczos3" })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
const ink = Buffer.alloc(W * H)
for (let i = 0; i < W * H; i++) {
  const [x, y] = [(i % W) / S, Math.floor(i / W) / S]
  const [r, g, b] = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]]
  const light = (r * 299 + g * 587 + b * 114) / 1000
  const erased = x > ERASE.x0 && x < ERASE.x1 && y > ERASE.y0 && y < ERASE.y1
  // the canvas goes back to bare white, for the colour to fade out over; only the easel's clamp
  // and ledge, which cross its top and bottom edges, keep their ink
  const fitting = (x > 294 && x < 368 && y < 302) || (x > 256 && x < 474 && y > 548)
  const black = inFace(x, y) ? fitting && light < 70 : light < 140
  ink[i] = black && !erased ? 0 : 255
}
await sharp(ink, { raw: { width: W, height: H, channels: 1 } })
  .webp({ lossless: true })
  .toFile(`${out}/easel-lines-ink.webp`)

await source
  .extract({ left, top, width, height })
  .webp({ quality: 88 })
  .toFile(`${out}/easel-lines-canvas.webp`)
