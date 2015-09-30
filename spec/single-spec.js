"use strict";

import from from "../src/eslinq";
import { Sequence } from "../src/eslinq";
import { even, constantTrue } from "./helpers";

describe(".single", () => {

    it("throws an error if called on an empty sequence", () => {
        const bomb = () => Sequence.empty().single();
        expect(bomb).toThrowError("No matching element found");
    });

    it("throws an error if called on an empty sequence with a constant true condition", () => {
        const bomb = () => Sequence.empty().single(constantTrue);
        expect(bomb).toThrowError("No matching element found");
    });

    it("throws an error if `matches` is not a function", () => {
        const bomb = () => from([1]).single(1);
        expect(bomb).toThrowError("`matches` should be a function");
    });

    it("returns the element if called on a single-element sequence without a condition", () => {
        expect(from([2]).single()).toBe(2);
    });

    it("returns the element if called on a single-element sequence with a matching condition", () => {
        expect(from([2]).single(even)).toBe(2);
    });

    it("throws an error if the single element of a sequence does not match", () => {
        const bomb = () => from([1]).single(n => n === 2);
        expect(bomb).toThrowError("No matching element found");
    });

    it("throws an error if called without a condition on a multiple-element sequence", () => {
        const bomb = () => from([3, 4]).single();
        expect(bomb).toThrowError("Sequence contains more than one matching element");
    });

    it("throws an error if no elements match", () => {
        const bomb = () => from([3, 4]).single(n => n === 2);
        expect(bomb).toThrowError("No matching element found");
    });

    it("returns the matching element from a sequence with one matching element", () => {
        expect(from([3, 4, 5]).single(even)).toBe(4);
    });

    it("throws an error on a sequence with multiple matching element", () => {
        const bomb = () => from([3, 4, 5, 6, 7]).single(even);
        expect(bomb).toThrowError("Sequence contains more than one matching element");
    });

});