"use strict";

import from from "../src/eslinq";

describe(".aggregate", () => {

    it("throws if it is called without arguments", () => {
        expect(() => from([1]).aggregate()).toThrowError("`processNext` should be a function");
    });

    it("throws if it is called with a single non-function argument", () => {
        expect(() => from([1]).aggregate(1)).toThrowError("`processNext` should be a function");
    });

    it("throws if `transformResult` is not a function", () => {
        /* eslint-disable no-unused-vars */
        expect(() => from([1]).aggregate((a, b) => a, 0, 1))
            .toThrowError("`transformResult` should be a function");
        /* eslint-enable no-unused-vars */
    });

    it("works as expected when only an aggregation is specified", () => {
        expect(from([1, 2, 3]).aggregate((a, b) => a + b)).toBe(6);
    });

    it("works as expected when the aggregation returns undefined", () => {
        /* eslint-disable no-unused-vars */
        expect(from([1, 2, 3]).aggregate((a, b) => undefined)).toBeUndefined();
        /* eslint-enable no-unused-vars */
    });

    it("works as expected when an aggregation and a seed is specified", () => {
        expect(from([1, 2, 3]).aggregate((a, b) => a + b, 10)).toBe(16);
    });

    it("throws if the sequence is empty and no seed is specified", () => {
        /* eslint-disable no-unused-vars */
        expect(() => from([]).aggregate((a, b) => a))
            .toThrowError("The sequence is empty and no seed has been specified");
        /* eslint-enable no-unused-vars */
    });

    it("returns the seed if the sequence is empty and a seed is specified", () => {
        /* eslint-disable no-unused-vars */
        expect(from([]).aggregate((a, b) => a, 12)).toBe(12);
        /* eslint-enable no-unused-vars */
    });

    it("works as expected when an aggregation, a seed and a transformation is specified", () => {
        expect(
            from([1, 2]).aggregate((a, b) => a * b, 3, n => n % 2 === 0 ? "even" : "odd")
        ).toBe("even");
    });

    it("works as expected with an empty sequence, a seed and a transformation", () => {
        /* eslint-disable no-unused-vars */
        expect(
            from([]).aggregate(
                (a, b) => a,
                3,
                n => n % 2 === 0 ? "even" : "odd")
        ).toBe("odd");
        /* eslint-enable no-unused-vars */
    });

});