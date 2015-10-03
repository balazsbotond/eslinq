"use strict";

import from from "../src/eslinq";
import { identity, ThrowingIterable } from "./helpers";

describe(".toLookup", () => {

    it("throws an error if called without arguments", () => {
        expect(() => from([]).toLookup()).toThrowError("`getKey` should be a function");
    });

    it("throws an error if `transform` is specified but not a function", () => {
        expect(() => from([]).toLookup(identity, 1))
            .toThrowError("`transform` should be a function");
    });

    it("uses eager evaluation", () => {
        expect(() => from(new ThrowingIterable()).toLookup(identity)).toThrow();
    });

    it("returns an empty sequence if called on an empty one", () => {
        expect(from([]).toLookup(identity).size).toBe(0);
    });

    it("works as expected of only `getKey` is specified", () => {
        const source = ["abc", "de", "fgh", "ij", "klmn"],
            byLength = from(source).toLookup(s => s.length);

        expect(byLength.size).toBe(3);

        expect(byLength.has(2)).toBe(true);
        expect(byLength.has(3)).toBe(true);
        expect(byLength.has(4)).toBe(true);

        expect(byLength.get(2)).toEqual(["de", "ij"]);
        expect(byLength.get(3)).toEqual(["abc", "fgh"]);
        expect(byLength.get(4)).toEqual(["klmn"]);
    });

    it("works as expected if both `getKey` and `transform` are specified", () => {
        const source = ["abc", "de", "fgh", "ij", "klmn"],
            byLength = from(source).toLookup(s => s.length, s => s[0]);

        expect(byLength.size).toBe(3);

        expect(byLength.has(2)).toBe(true);
        expect(byLength.has(3)).toBe(true);
        expect(byLength.has(4)).toBe(true);

        expect(byLength.get(2)).toEqual(["d", "i"]);
        expect(byLength.get(3)).toEqual(["a", "f"]);
        expect(byLength.get(4)).toEqual(["k"]);
    });

});