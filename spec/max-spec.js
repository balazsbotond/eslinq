"use strict";

import from from "../src/eslinq";
import { identity } from "./helpers";

describe(".max", () => {

    it("throws if it is called on an empty sequence", () => {
        expect(() => from([]).max()).toThrowError("Sequence was empty");
    });

    it("throws if `transform` is not a function", () => {
        expect(() => from([]).max(1)).toThrowError("`transform` should be a function");
    });

    it("throws if `compare` is not a function", () => {
        expect(() => from([]).max(identity, 1)).toThrowError("`compare` should be a function");
    });

    it("returns the element if called on a single-element sequence", () => {
        expect(from([9999]).max()).toBe(9999);
    });

    it("returns the maximum element if called without arguments", () => {
        expect(from([9, -9, 0, -8, 8]).max()).toBe(9);
    });

    it("returns the last element in alphabetical order if called on an array of strings", () => {
        expect(from(["charlie", "alpha", "bravo"]).max()).toBe("charlie");
    });

    it("uses the `transform` function", () => {
        expect(
            from(["aa", "a", "aaa"]).max(s => s.length)
        ).toBe(3);
    });

    it("uses the `compare` function", () => {
        const compareLength = (a, b) => a.length - b.length;
        expect(
            from(["aa", "a", "aaa"]).max(identity, compareLength)
        ).toBe("aaa");
    });

});
