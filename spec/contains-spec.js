"use strict";

import from from "../src/eslinq";

describe(".contains", () => {

    it("returns false for the empty iterable", () => {
        expect(from([]).contains(1)).toBe(false);
    });

    it("returns false for a one-element iterable and an item it doesn't contain", () => {
        expect(from([1]).contains(2)).toBe(false);
    });

    it("returns true for a one-element iterable and an item it contains", () => {
        expect(from([1]).contains(1)).toBe(true);
    });

    it("uses the strict equality operator", () => {
        expect(from([1]).contains("1")).toBe(false);
    });

    it("returns false if the iterable doesn't contain the item", () => {
        expect(from([1, 2, 3]).contains(4)).toBe(false);
    });

    it("returns true if the iterable contains the item", () => {
        expect(from([1, 2, 3]).contains(3)).toBe(true);
    });

    it("finds an undefined item", () => {
        expect(from([1, undefined]).contains(undefined)).toBe(true);
    });

    it("finds a null item", () => {
        expect(from([1, null]).contains(null)).toBe(true);
    });

    it("finds a false item", () => {
        expect(from([1, false]).contains(false)).toBe(true);
    });

});