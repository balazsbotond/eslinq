"use strict";

import from from "../src/eslinq";
import { ThrowingIterable } from "./helpers";

describe(".union", () => {

    it("throws an error if called without arguments", () => {
        expect(() => from([]).union()).toThrowError("`other` should be iterable");
    });

    it("throws an error if called with a non-iterable argument", () => {
        expect(() => from([]).union(1)).toThrowError("`other` should be iterable");
    });

    it("returns empty if called on the empty array with an empty argument", () => {
        expect(from([]).union([]).toArray()).toEqual([]);
    });

    it("returns the original sequence if `other` is empty", () => {
        expect(from([1, 2]).union([]).toArray()).toEqual([1, 2]);
    });

    it("returns `other` if the original sequence is empty", () => {
        expect(from([]).union([1, 2]).toArray()).toEqual([1, 2]);
    });

    it("produces the concatenation of the two sequences if there is no common element", () => {
        expect(from([1, 2]).union([3, 4]).toArray()).toEqual([1, 2, 3, 4]);
    });

    it("returns the distinct elements if there are common ones", () => {
        expect(from([1, 2]).union([3, 2]).toArray()).toEqual([1, 2, 3]);
    });

    it("iterates the first sequence lazily", () => {
        const result = from(new ThrowingIterable()).union([1]),
            iterator = result[Symbol.iterator]();

        expect(() => iterator.next()).toThrow();
    });

    it("iterates the second sequence only after the first one has been exhausted", () => {
        const result = from([1, 2]).union(new ThrowingIterable()),
            iterator = result[Symbol.iterator]();

        iterator.next();
        iterator.next();

        expect(() => iterator.next()).toThrow();
    });

});
