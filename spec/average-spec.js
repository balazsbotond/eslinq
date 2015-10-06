"use strict";

import from from "../src/eslinq";
import { Sequence } from "../src/eslinq";

describe(".average", () => {

    it("throws an error if the sequence is empty", () => {
        expect(() => from([]).average()).toThrowError("Sequence was empty");
    });

    it("throws an error if `getValue` is specified but not a function", () => {
        expect(() => from([]).average(1)).toThrowError("`getValue` should be a function");
    });

    it("throws an error if the sequence contains a non-number", () => {
        expect(() => from([false]).average()).toThrowError("Only numbers can be averaged");
    });

    it("iterates the sequence eagerly", () => {
        expect(() => from([1, 2, 3, false]).average()).toThrowError("Only numbers can be averaged");
    });

    it("throws an error if the return value of `getValue` is not a number", () => {
        expect(() => from([1]).average(x => "I'm not a number")) // eslint-disable-line no-unused-vars
            .toThrowError("Only numbers can be averaged");
    });

    it("returns the single element for a single-element iterable", () => {
        expect(from(Sequence.repeat(2, 1)).average()).toBe(2);
    });

    it("returns the arithmetic mean of the elements", () => {
        expect(from([2, 3, 4]).average()).toBe(3);
    });

    it("works if there are negative numbers in the sequence", () => {
        expect(from([-1, 1, 3]).average()).toBe(1);
    });

    it("works if there are fractions in the sequence", () => {
        expect(from([0.6, 1.1, 1.6]).average()).toBe(1.1);
    });

});
