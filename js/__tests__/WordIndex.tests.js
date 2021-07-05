import WordIndex from "../WordIndex.js";
import { describe, expect, it } from "@jest/globals";
import fetchMockJest from "fetch-mock-jest";

const text = "101,dog,cat,rat\n110,bro,sno,tho\n111,dry,tsk,zzz";
fetchMockJest.get("data/wordshape.txt", text);

describe("WordIndex", () => {
  it("should load words", (done) => {
    WordIndex.reset();
    const wi = new WordIndex();
    expect(wi.isLoaded()).toBe(false);
    wi.onLoaded(() => {
      expect(wi.isLoaded()).toBe(true);
      done();
    });
  }, 300);

  it("should create index", () => {
    const wi = new WordIndex();
    wi.onLoaded((index) => {
      const words = index.get("111");
      expect(words.length).toBe(3);
    });
  }, 100);

  it("should find matching shapes", () => {
    const wi = new WordIndex();
    const words = wi.getWordsByShape("1..");
    expect(words.length).toBe(9);
  }, 100);

  it("should find complex shapes", () => {
    const wi = new WordIndex();
    const words = wi.getWordsByShape("1.o");
    expect(words.length).toBe(3);
  }, 100);

  it("spaces match any character", () => {
    const wi = new WordIndex();
    const words = wi.getWordsByShape("   ");
    expect(words.length).toBe(9);
  });

  it("should find specific words", () => {
    const wi = new WordIndex();
    const words = wi.getWordsByShape("zzz");
    expect(words.length).toBe(1);
  });
});
