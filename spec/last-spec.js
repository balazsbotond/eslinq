"use strict";

import from from "../src/eslinq";
import { Sequence } from "../src/eslinq";
import { even, constantTrue } from "./helpers";

describe(".last", () => {

    it("throws an error if called on an empty sequence", () => {
        const bomb = () => Sequence.empty().last();
        expect(bomb).toThrowError("No matching element found");
    });

    it("throws an error if called on an empty sequence with a constant true condition", () => {
        const bomb = () => Sequence.empty().last(constantTrue);
        expect(bomb).toThrowError("No matching element found");
    });

    it("throws an error if `matches` is not a function", () => {
        const bomb = () => from([1]).last(1);
        expect(bomb).toThrowError("`matches` should be a function");
    });

    it("returns the element if called on a single-element sequence without a condition", () => {
        expect(from([2]).last()).toBe(2);
    });

    it("returns the element if called on a single-element sequence with a matching condition", () => {
        expect(from([2]).last(even)).toBe(2);
    });

    it("throws an error if the single element of a sequence does not match", () => {
        const bomb = () => from([1]).last(n => n === 2);
        expect(bomb).toThrowError("No matching element found");
    });

    it("returns the last element if called without a condition", () => {
        expect(from([3, 4]).last()).toBe(4);
    });

    it("throws an error if no elements match", () => {
        const bomb = () => from([3, 4]).last(n => n === 2);
        expect(bomb).toThrowError("No matching element found");
    });

    it("returns the matching element from a sequence with one matching element", () => {
        expect(from([3, 4, 5]).last(even)).toBe(4);
    });

    it("returns the last matching element from a sequence with multiple matching element", () => {
        expect(from([3, 4, 5, 6, 7]).last(even)).toBe(6);
    });

});