"use strict";

import from from "../src/eslinq";
import { double } from "./helpers";

describe("from", () => {

    it("is defined", () => {
        expect(from).toBeDefined();
    });

    it("returns something when given an empty array", () => {
        expect(from([])).toBeDefined();
    });

    describe("can also work with non-array iterables, like", () => {

        const verifyForIterable = (iterable) => {
            const expected = [2, 4, 6],
                actual = from(iterable).select(double).toArray();
            expect(actual).toEqual(expected);
        };

        it("a set", () => {
            verifyForIterable(new Set([1, 2, 3]));
        });

    });

});