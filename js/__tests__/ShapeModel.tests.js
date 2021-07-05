import ShapeModel from "../ShapeModel.js";

const div = document.createElement("div");
const shape = new ShapeModel(div);

describe("ShapeModel", () => {
  it("should detect shapes", () => {
    expect(ShapeModel.isLetter("l")).toBe(true);
    expect(ShapeModel.isLetter("1")).toBe(false);

    expect(ShapeModel.isShapeChar("0")).toBe(true);
    expect(ShapeModel.isShapeChar("a")).toBe(false);

    expect(ShapeModel.isShapeChar(null)).toBe(false);
  });

  it("should work with uninitialized element", () => {
    expect(shape.getLetter()).toBe(" ");
    expect(shape.getShape()).toBe(".");
  });

  it("should manage cell contents", () => {
    shape.setContent("l");
    expect(shape.getLetter()).toBe("l");
    expect(shape.getShape()).toBe("l");
  });

  it("should accept shape chars", () => {
    shape.setContent("1");
    expect(shape.getLetter()).toBe(" ");
    expect(shape.getShape()).toBe("1");
  });

  it("should throw if set more than single char", () => {
    const test = () => {
      shape.setContent("word");
    };
    expect(test).toThrow(Error);
  });

  it("should allow null to reset", () => {
    shape.setContent();
    expect(shape.getLetter()).toBe(" ");
    expect(shape.getShape()).toBe(".");
  });
});
