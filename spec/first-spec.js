"use strict";

import from from "../src/eslinq";
import { Sequence } from "../src/eslinq";

describe(".first", () => {

	it("throws an error if called on an empty sequence", () => {
		const bomb = () => Sequence.empty().first();
		expect(bomb).toThrowError("No matching element found");
	});
	
	it("throws an error if `matches` is not a function", () => {
		const bomb = () => from([1]).first(1);
		expect(bomb).toThrowError("`matches` should be a function");
	});
	
	it("returns the element if called on a single-element sequence without a condition", () => {
		expect(from([2]).first()).toBe(2);
	});
	
	it("throws an error if the single element of a sequence does not match", () => {
		const bomb = () => from([1]).first(n => n === 2);
		expect(bomb).toThrowError("No matching element found");
	});
	
	it("returns the element if called without a condition", () => {
		expect(from([3, 4]).first()).toBe(3);
	});
	
	it("throws an error if no elements match", () => {
		const bomb = () => from([3, 4]).first(n => n === 2);
		expect(bomb).toThrowError("No matching element found");
	});

});