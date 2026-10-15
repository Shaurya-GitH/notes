import test, { describe } from "node:test"
import assert from "node:assert"
import { placeRadial } from "./graphLayout"

const nodes = (...ids: string[]) => ids.map((id) => ({ id, x: 0, y: 0 }))

describe("placeRadial", () => {
  test("this note sits in the middle, links out right, backlinks left", () => {
    const n = nodes("me", "a", "b", "back")
    placeRadial(n, "me", new Set(["a", "b"]), 260, 240)
    const [me, a, b, back] = n
    assert.deepStrictEqual([me.x, me.y], [130, 120])
    assert.ok(a.x > me.x && b.x > me.x)
    assert.ok(back.x < me.x)
  })

  test("a single neighbour sits level with this note", () => {
    const n = nodes("me", "a")
    placeRadial(n, "me", new Set(["a"]), 260, 240)
    assert.ok(Math.abs(n[1].y - 120) < 1e-9)
    assert.ok(n[1].x > 130)
  })

  test("neighbours alternate between two radii and stay inside the box", () => {
    const n = nodes("me", "a", "b", "c", "d")
    placeRadial(n, "me", new Set(["a", "b", "c", "d"]), 260, 240)
    const dist = n.slice(1).map((p) => Math.hypot(p.x - 130, p.y - 120))
    assert.ok(Math.abs(dist[0] - dist[2]) < 1e-9 && Math.abs(dist[1] - dist[3]) < 1e-9)
    assert.ok(dist[1] < dist[0])
    for (const p of n) assert.ok(p.x >= 0 && p.x <= 260 && p.y >= 0 && p.y <= 240)
  })
})
