"use strict";

import from from "../src/eslinq";
import { Sequence } from "../src/eslinq";

describe(".elementAtOrDefault", () => {

    describe("for arrays", () => {
        it("returns undefined for the empty sequence if called without a default value", () => {
            expect(from([]).elementAtOrDefault(0)).toBeUndefined();
        });

        it("returns the default for the empty sequence if called with a default value", () => {
            expect(from([]).elementAtOrDefault(0, "a")).toBe("a");
        });

        it("throws an error if `index` is not a number", () => {
            expect(() => from([1, 2, 3]).elementAtOrDefault(false)).toThrowError("`index` should be a number");
        });

        it("throws an error if `index` is negative", () => {
            expect(() => from([1, 2, 3]).elementAtOrDefault(-1)).toThrowError("`index` should not be negative");
        });

        it("returns undefined if `index` is equal to the length of the sequence and it is called without a default value", () => {
            expect(from([1, 2, 3]).elementAtOrDefault(3)).toBeUndefined();
        });

        it("returns the default if `index` is equal to the length of the sequence and it is called with a default value", () => {
            expect(from([1, 2, 3]).elementAtOrDefault(3, 1)).toBe(1);
        });

        it("returns undefined if `index` is greater than the length of the sequence and it is called without a default value", () => {
            expect(from([1, 2, 3]).elementAtOrDefault(4)).toBeUndefined();
        });

        it("returns the default if `index` is greater than the length of the sequence and it is called with a default value", () => {
            expect(from([1, 2, 3]).elementAtOrDefault(4, 1)).toBe(1);
        });

        it("returns the element at the specified index", () => {
            const things = [1, false, null, undefined, 0, "a"];

            things.forEach((n, i) => expect(from(things).elementAtOrDefault(i)).toBe(n));
        });
    });

    describe("for non-arrays", () => {
        function yieldFrom(array) {
            return {
                [Symbol.iterator]: function* () { for (let i of array) yield i; }
            };
        }

        it("returns undefined for the empty sequence if called without a default value", () => {
            expect(from(Sequence.empty()).elementAtOrDefault(0)).toBeUndefined();
        });

        it("returns the default for the empty sequence if called with a default value", () => {
            expect(from(Sequence.empty()).elementAtOrDefault(0, "a")).toBe("a");
        });

        it("throws an error if `index` is not a number", () => {
            expect(() => from(yieldFrom([1, 2, 3])).elementAtOrDefault(false)).toThrowError("`index` should be a number");
        });

        it("throws an error if `index` is negative", () => {
            expect(() => from(yieldFrom([1, 2, 3])).elementAtOrDefault(-1)).toThrowError("`index` should not be negative");
        });

        it("returns undefined if `index` is equal to the length of the sequence and it is called without a default value", () => {
            expect(from(yieldFrom([1, 2, 3])).elementAtOrDefault(3)).toBeUndefined();
        });

        it("returns the default if `index` is equal to the length of the sequence and it is called with a default value", () => {
            expect(from(yieldFrom([1, 2, 3])).elementAtOrDefault(3, 1)).toBe(1);
        });

        it("returns undefined if `index` is greater than the length of the sequence and it is called without a default value", () => {
            expect(from(yieldFrom([1, 2, 3])).elementAtOrDefault(4)).toBeUndefined();
        });

        it("returns the default if `index` is greater than the length of the sequence and it is called with a default value", () => {
            expect(from(yieldFrom([1, 2, 3])).elementAtOrDefault(4, 1)).toBe(1);
        });

        it("returns the element at the specified index", () => {
            const things = yieldFrom([1, false, null, undefined, 0, "a"]);
            let i = 0;

            for (let n of things) {
                expect(from(things).elementAtOrDefault(i++)).toBe(n);
            }
        });
    });
});