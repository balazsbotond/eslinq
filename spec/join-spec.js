"use strict";

import from from "../src/eslinq";
import { identity, ThrowingIterable } from "./helpers";

describe(".join", () => {

    it("throws an error if called without arguments", () => {
        expect(() => from([]).join()).toThrowError("`inner` should be iterable");
    });

    it("throws an error if called with only one argument", () => {
        expect(() => from([]).join([])).toThrowError("`getOuterKey` should be a function");
    });

    it("throws an error if called with only two arguments", () => {
        expect(() => from([]).join([], identity)).toThrowError("`getInnerKey` should be a function");
    });

    it("returns the empty sequence if the original and inner sequences are both empty", () => {
        expect(from([]).join([], identity, identity, identity).toArray()).toEqual([]);
    });

    it("uses lazy evaluation", () => {
        from(new ThrowingIterable())
            .join(new ThrowingIterable(), identity, identity, identity);
    });

    it("iterates the original sequence lazily", () => {
        const first = [1, -1, 2],
            second = [1],
            transformFirst = n => {
                if (n < 0) throw "This is expected";
                return n;
            },
            result = from(first).select(transformFirst).join(second, identity, identity),
            iterator = result[Symbol.iterator]();

        iterator.next();

        expect(() => iterator.next()).toThrow();
    });

    it("iterates the inner sequence eagerly", () => {
        const first = [1],
            second = [1, 2, -1],
            transformSecond = n => {
                if (n < 0) throw "This is expected";
                return n;
            },
            throwsAtLastElement = from(second).select(transformSecond),
            result = from(first).join(throwsAtLastElement, identity, identity);

        expect(() => result[Symbol.iterator]().next()).toThrow();
    });

    it("yields no elements if there are no matching keys", () => {
        const first = ["a", "ab", "abc"],
            second = ["abcd", "abcde"],
            getLength = s => s.length,
            joined = from(first).join(second, getLength, getLength).toArray();

        expect(joined.length).toBe(0);
    });

    it("yields only those elements that have matching keys", () => {
        const first = ["a", "ab", "abc"],
            second = ["abcd", "abcde", "g", "gh", "i"],
            getLength = s => s.length,
            joined = from(first).join(second, getLength, getLength).toArray();

        expect(joined).toEqual([["a", "g"], ["a", "i"], ["ab", "gh"]]);
    });

});