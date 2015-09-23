"use strict";

import from from "../src/eslinq";
import { Sequence } from "../src/eslinq";
import { even } from "./helpers";

describe(".firstOrDefault", () => {

	it("returns undefined if called on an empty sequence without arguments", () => {
		expect(Sequence.empty().firstOrDefault()).toBeUndefined();
	});
	
	it("returns the default if called on an empty sequence with a default value", () => {
		expect(Sequence.empty().firstOrDefault(0)).toBe(0);
	});
	
	it("returns the default if called on an empty sequence with a default value and a constant true condition", () => {
		expect(Sequence.empty().firstOrDefault(0, _ => true)).toBe(0);
	});
	
	it("throws an error if `matches` is not a function", () => {
		const bomb = () => from([1]).firstOrDefault(0, 0);
		expect(bomb).toThrowError("`matches` should be a function");
	});
	
	it("returns the element if called on a single-element sequence without arguments", () => {
		expect(from([2]).firstOrDefault()).toBe(2);
	});
	
	it("returns the element if called on a single-element sequence without a condition", () => {
		expect(from([2]).firstOrDefault(0)).toBe(2);
	});
	
	it("returns the element if called on a single-element sequence with a matching condition", () => {
		expect(from([2]).firstOrDefault(0, even)).toBe(2);
	});
	
	it("returns undefined if the single element of a sequence does not match and it is called " +
	   "with an undefined default value", () => {
		expect(from([1]).firstOrDefault(undefined, n => n === 2)).toBeUndefined();
	});
	
	it("returns the default value if the single element of a sequence does not match and it is " +
	   "called with a default value", () => {
		expect(from([1]).firstOrDefault(0, n => n === 2)).toBe(0);
	});
	
	it("returns the first element if called n a multiple-element sequence without a condition", () => {
		expect(from([3, 4]).firstOrDefault()).toBe(3);
	});
	
	it("returns the default value if a multiple-element sequence contains no matching elements", () => {
		expect(from([3, 4]).firstOrDefault(-1, n => n === 2)).toBe(-1);
	});
	
	it("returns the matching element from a multiple-element sequence with one matching element", () => {
		expect(from([3, 4, 5]).firstOrDefault(-1, even)).toBe(4);
	});
	
	it("returns the first matching element from a multiple-element sequence with multiple matching element", () => {
		expect(from([3, 4, 5, 6, 7]).firstOrDefault(-1, even)).toBe(4);
	});

});