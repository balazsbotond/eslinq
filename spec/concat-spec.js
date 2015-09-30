"use strict";

import from from "../src/eslinq";
import { ThrowingIterable } from "./helpers";

describe(".concat", () => {

    it("empty + empty = empty", () => {
        const actual = from([]).concat([]).toArray();
        expect(actual).toEqual([]);
    });

    it("non-empty + empty = non-empty", () => {
        const original = [1, 2],
            expected = original,
            actual = from(original).concat([]).toArray();
        expect(actual).toEqual(expected);
    });

    it("empty + non-empty = non-empty", () => {
        const original = [],
            other = [1, 2],
            expected = other,
            actual = from(original).concat(other).toArray();
        expect(actual).toEqual(expected);
    });

    it("concatenates two non-empty iterables as expected", () => {
        const original = [1, 2],
            other = [3, 4],
            expected = original.concat(other),
            actual = from(original).concat(other).toArray();
        expect(actual).toEqual(expected);
    });

    it("throws if its argument is not iterable", () => {
        const invalidConcat = () => from([]).concat(1);
        expect(invalidConcat).toThrowError("`other` should be iterable");
    });

    it("does not eagerly start iterating the first sequence", () => {
        const bomb = new ThrowingIterable();
        from([]).concat(bomb);
    });

    it("does not start iterating the second sequence before iterating the first one is complete", () => {
        const bomb = new ThrowingIterable(),
            concat = from([1]).concat(bomb);

        for (let i of concat) break; // eslint-disable-line no-unused-vars
    });

});