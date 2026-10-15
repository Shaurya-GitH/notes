import test, { describe } from "node:test"
import assert from "node:assert"
import { rank, snippet } from "./searchRank"
import type { ContentDetails } from "../../plugins/emitters/contentIndex"

const note = (title: string, content: string, tags: string[] = []) =>
  ({
    slug: title,
    filePath: title + ".md",
    title,
    links: [],
    tags,
    content,
  }) as unknown as ContentDetails

const index = {
  index: note("Home", "tls everywhere"),
  "Security/TLS": note("TLS", "Transport Layer Security handshake"),
  "Security/mTLS": note("mTLS", "mutual tls between client and server"),
  "Docker/Introduction": note("Introduction", "containers and images", ["docker"]),
}

describe("rank", () => {
  test("every word must match, title hits first, home page excluded", () => {
    assert.deepStrictEqual(
      rank(index, ["tls"]).map((h) => h.slug),
      ["Security/TLS", "Security/mTLS"],
    )
    assert.deepStrictEqual(
      rank(index, ["tls", "client"]).map((h) => h.slug),
      ["Security/mTLS"],
    )
  })

  test("a title that starts with the word outranks one that only contains it", () => {
    const [first, second] = rank(index, ["tls"])
    assert.ok(first.score > second.score)
  })

  test("#tag words match tags", () => {
    assert.deepStrictEqual(
      rank(index, ["#docker"]).map((h) => h.slug),
      ["Docker/Introduction"],
    )
    assert.deepStrictEqual(rank(index, ["#nope"]), [])
  })
})

describe("snippet", () => {
  test("starts 40 characters before the first hit, with ellipses", () => {
    const text = "a".repeat(100) + "needle" + "b".repeat(300)
    const s = snippet(text, ["needle"])
    assert.ok(s.startsWith("…"))
    assert.ok(s.endsWith("…"))
    assert.strictEqual(s.indexOf("needle"), 41)
  })

  test("short text is returned whole", () => {
    assert.strictEqual(snippet("short note", ["note"]), "short note")
  })
})
