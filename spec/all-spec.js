"use strict";

import from from "../src/eslinq";
import { identity } from "./helpers";

describe(".all", () => {
	
	it("throws if it is called with a non-function argument", () => {
		expect(() => from([1]).all(0)).toThrowError("`matches` should be a function");
	});
	
	it("returns true when given an empty iterable and a constant true condition", () => {
		const original = [],
			expected = true,
			actual = from(original).all(_ => true);
		expect(actual).toEqual(expected);
	});
	
	it("returns true when given an empty iterable and a constant false condition", () => {
		const original = [],
			expected = true,
			actual = from(original).all(_ => false);
		expect(actual).toEqual(expected);
	});
	
	it("returns true when given a one-element iterable and a constant true condition", () => {
		const original = [1],
			expected = true,
			actual = from(original).all(_ => true);
		expect(actual).toEqual(expected);
	});
	
	it("returns false when given a one-element iterable and a constant false condition", () => {
		const original = [1],
			expected = false,
			actual = from(original).all(_ => false);
		expect(actual).toEqual(expected);
	});
	
	it("returns true if all elements match", () => {
		const original = [1, 2, 3],
			expected = true,
			matches = n => n < 4,
			actual = from(original).all(matches);
		expect(actual).toEqual(expected);
	});
	
	it("returns false if no elements match", () => {
		const original = [1, 2, 3],
			expected = false,
			matches = n => n >= 4,
			actual = from(original).all(matches);
		expect(actual).toEqual(expected);
	});
	
	it("returns false if one element doesn't match", () => {
		const original = [1, 2, 3],
			expected = false,
			matches = n => n < 3,
			actual = from(original).all(matches);
		expect(actual).toEqual(expected);
	});
	
	it("works if the condition returns non-boolean truthy values", () => {
		const original = [1, '1'];
		expect(from(original).all(identity)).toBe(true);
	});
	
	it("works if the condition returns non-boolean falsy values", () => {
		const cases = [0, undefined, NaN, ""];
		for (let c of cases)
			expect(from([c]).all(identity)).toBe(false);
	});
	
});