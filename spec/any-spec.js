"use strict";

import from from "../src/eslinq";
import { identity, double, even } from "./helpers";

describe(".any", () => {
	
	it("returns false when given an empty iterable and a constant true condition", () => {
		expect(from([]).any(_ => true)).toBe(false);
	});
	
	it("returns false when given an empty iterable and a constant false condition", () => {
		expect(from([]).any(_ => false)).toBe(false);
	});
	
	it("returns true when given a one-element iterable and a constant true condition", () => {
		const original = [1],
			expected = true,
			actual = from(original).any(_ => true);
		expect(actual).toEqual(expected);
	});
	
	it("returns false when given a one-element iterable and a constant false condition", () => {
		const original = [1],
			expected = false,
			actual = from(original).any(_ => false);
		expect(actual).toEqual(expected);
	});
	
	it("returns false if no elements match", () => {
		const original = [1, 3, 5],
			expected = false,
			actual = from(original).any(even);
		expect(actual).toEqual(expected);
	});
	
	it("returns true if the first element matches", () => {
		expect(from([2, 3, 5]).any(even)).toBe(true);
	});
	
	it("returns true if the last element matches", () => {
		expect(from([1, 3, 4]).any(even)).toBe(true);
	});
	
	it("returns true if all elements match", () => {
		expect(from([2, 4, 6]).any(even)).toBe(true);
	});
	
	it("works if the condition returns non-boolean truthy values", () => {
		const cases = [1, '1'];
		for (let c of cases)
			expect(from([c]).any(identity)).toBe(true);
	});
	
	it("works if the condition returns non-boolean falsy values", () => {
		const original = [0, undefined, NaN, ""];
		expect(from(original).any(identity)).toBe(false);
	});
	
});