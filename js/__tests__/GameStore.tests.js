import GameStore from "../GameStore";
import { jest } from "@jest/globals";

// Source: https://stackoverflow.com/questions/32911630/how-do-i-deal-with-localstorage-in-jest-tests
jest.spyOn(window.localStorage, "setItem");
jest.spyOn(window.localStorage, "getItem");
window.localStorage.__proto__.setItem = jest.fn();

describe("GameStore", () => {
  test("should load from storage", () => {
    const gs = new GameStore();
    expect(gs.keys).toBeTruthy();
  });
});
