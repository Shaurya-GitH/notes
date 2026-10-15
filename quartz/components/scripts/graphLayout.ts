// The local graph's radial layout: this note in the middle, the notes it links to on the right,
// the notes linking here on the left, alternating between two radii so labels do not collide.

export type Point = { id: string; x: number; y: number }

export function placeRadial<T extends Point>(
  nodes: T[],
  current: string,
  outs: Set<string>,
  w: number,
  h: number,
) {
  const me = nodes.find((n) => n.id === current)
  if (!me) return
  me.x = w / 2
  me.y = h / 2
  const right = nodes.filter((n) => n !== me && outs.has(n.id)),
    left = nodes.filter((n) => n !== me && !outs.has(n.id))
  const R = Math.min(w * 0.24, h * 0.36)
  const place = (arr: T[], a0: number, a1: number) =>
    arr.forEach((n, i) => {
      const a = arr.length === 1 ? (a0 + a1) / 2 : a0 + ((a1 - a0) * i) / (arr.length - 1)
      const r = R * (i % 2 ? 0.86 : 1)
      n.x = w / 2 + Math.cos(a) * r
      n.y = h / 2 + Math.sin(a) * r
    })
  place(right, -Math.PI * 0.42, Math.PI * 0.42)
  place(left, Math.PI * 1.42, Math.PI * 0.58)
}
