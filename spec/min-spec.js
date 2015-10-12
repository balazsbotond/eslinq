"use strict";

import from from "../src/eslinq";
import { identity } from "./helpers";

describe(".min", () => {

    it("throws if it is called on an empty sequence", () => {
        expect(() => from([]).min()).toThrowError("Sequence was empty");
    });

    it("throws if `transform` is not a function", () => {
        expect(() => from([]).min(1)).toThrowError("`transform` should be a function");
    });

    it("throws if `compare` is not a function", () => {
        expect(() => from([]).min(identity, 1)).toThrowError("`compare` should be a function");
    });

    it("returns the element if called on a single-element sequence", () => {
        expect(from([9999]).min()).toBe(9999);
    });

    it("returns the minimum element if called without arguments", () => {
        expect(from([9, -9, 0, -8, 8]).min()).toBe(-9);
    });

    it("returns the first element in alphabetical order if called on an array of strings", () => {
        expect(from(["charlie", "alpha", "bravo"]).min()).toBe("alpha");
    });

    it("uses the `transform` function", () => {
        expect(
            from(["aa", "a", "aaa"]).min(s => s.length)
        ).toBe(1);
    });

    it("uses the `compare` function", () => {
        const compareLength = (a, b) => a.length - b.length;
        expect(
            from(["aa", "a", "aaa"]).min(identity, compareLength)
        ).toBe("a");
    });

});