import test, { describe } from "node:test"
import assert from "node:assert"
import { unwrittenChecker } from "./unwritten"
import { FullSlug } from "./path"

const isUnwritten = unwrittenChecker([
  "index",
  "Security/TLS",
  "Security/index",
  "Docker/Introduction",
  "Assets/diagram.png",
] as FullSlug[])
const check = (s: string) => isUnwritten(s as FullSlug)

describe("unwrittenChecker", () => {
  test("existing notes are written", () => {
    assert.strictEqual(check("Security/TLS"), false)
    assert.strictEqual(check("Docker/Introduction"), false)
  })
  test("missing notes are unwritten", () => {
    assert.strictEqual(check("transport-layer"), true)
    assert.strictEqual(check("Networks/Physical-Layer"), true)
  })
  test("folders, folder indexes, tags and the home page are written", () => {
    assert.strictEqual(check("Docker/index"), false)
    assert.strictEqual(check("Security/index"), false)
    assert.strictEqual(check("tags/security"), false)
    assert.strictEqual(check("index"), false)
  })
})
