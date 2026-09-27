import { describe, expect, it } from "vitest"
import { label } from "./label.ts"
import { isBlank, titleCase } from "./text.ts"

describe("fixture", () => {
  it("capitalises", () => {
    expect(titleCase("hello")).toBe("Hello")
    expect(label("  ")).toBe("untitled")
    expect(isBlank(" ")).toBe(true)
  })
})
