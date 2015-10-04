"use strict";

import from from "../src/eslinq";

describe(".sum", () => {

    it("returns 0 if the sequence is empty", () => {
        expect(from([]).sum()).toBe(0);
    });

    it("throws an error if the sequence contains non-numbers", () => {
        expect(() => from([1, 2, "a"]).sum()).toThrowError("Only numbers can be summed");
    });

    it("returns the element for a one-element sequence", () => {
        expect(from([6]).sum()).toBe(6);
    });

    it("returns the sum of the elements", () => {
        expect(from([6, 3, -2]).sum()).toBe(7);
    });

    it("throws an error if `getValue` is not a function", () => {
        expect(() => from([]).sum(1)).toThrowError("`getValue` should be a function");
    });

    it("uses the `getValue` function", () => {
        expect(from(["a", "abc", "abcde"]).sum(s => s.length)).toBe(9);
    });

});
