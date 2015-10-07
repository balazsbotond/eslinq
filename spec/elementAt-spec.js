"use strict";

import from from "../src/eslinq";
import { Sequence } from "../src/eslinq";

describe(".elementAt", () => {

    describe("for arrays", () => {
        it("throws an error for the empty sequence", () => {
            expect(() => from([]).elementAt(0)).toThrowError("Index too large");
        });

        it("throws an error if `index` is not a number", () => {
            expect(() => from([1, 2, 3]).elementAt(false)).toThrowError("`index` should be a number");
        });

        it("throws an error if `index` is negative", () => {
            expect(() => from([1, 2, 3]).elementAt(-1)).toThrowError("`index` should not be negative");
        });

        it("throws an error if `index` is equal to the length of the sequence", () => {
            expect(() => from([1, 2, 3]).elementAt(3)).toThrowError("Index too large");
        });

        it("throws an error if `index` is greater than the length of the sequence", () => {
            expect(() => from([1, 2, 3]).elementAt(4)).toThrowError("Index too large");
        });

        it("returns the element at the specified index", () => {
            const things = [1, false, null, undefined, 0, "a"];

            things.forEach((n, i) => expect(from(things).elementAt(i)).toBe(n));
        });
    });

    describe("for non-arrays", () => {
        function yieldFrom(array) {
            return {
                [Symbol.iterator]: function* () { for (let i of array) yield i; }
            };
        }

        it("throws an error for the empty sequence", () => {
            expect(() => from(Sequence.empty()).elementAt(0)).toThrowError("Index too large");
        });

        it("throws an error if `index` is not a number", () => {
            expect(() => from(yieldFrom([1, 2, 3])).elementAt(false)).toThrowError("`index` should be a number");
        });

        it("throws an error if `index` is negative", () => {
            expect(() => from(yieldFrom([1, 2, 3])).elementAt(-1)).toThrowError("`index` should not be negative");
        });

        it("throws an error if `index` is equal to the length of the sequence", () => {
            expect(() => from(yieldFrom([1, 2, 3])).elementAt(3)).toThrowError("Index too large");
        });

        it("throws an error if `index` is greater than the length of the sequence", () => {
            expect(() => from(yieldFrom([1, 2, 3])).elementAt(4)).toThrowError("Index too large");
        });

        it("returns the element at the specified index", () => {
            const things = yieldFrom([1, false, null, undefined, 0, "a"]);
            let i = 0;

            for (let n of things) {
                expect(from(things).elementAt(i++)).toBe(n);
            }
        });
    });
});