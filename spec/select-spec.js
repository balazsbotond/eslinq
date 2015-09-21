"use strict";

import from from "../src/eslinq";
import { identity, double, ThrowingIterable } from "./helpers";

describe(".select", () => {
	
	it("fails early if it is called without arguments", () => {
		expect(() => from([]).select()).toThrowError("`transform` should be a function");
	});
	
	it("fails early if it is called with a non-function argument", () => {
		expect(() => from([]).select(0)).toThrowError("`transform` should be a function");
	});
	
	it("does not start iteration eagerly", () => {
		from(new ThrowingIterable()).select(_ => _);
	});

	it("returns an empty iterable when given an empty iterable", () => {
		const original = [],
			expected = [],
			actual = from(original).select(identity).toArray();
		expect(actual).toEqual(expected);
	});

	it("returns the element itself when given the identity function", () => {
		const original = [1, 2],
			expected = [1, 2],
			actual = from(original).select(identity).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("can transform a one-element array", () => {
		const original = [1],
			expected = [2],
			actual = from(original).select(double).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("can transform a two-element array", () => {
		const original = [1, 2],
			expected = [2, 4],
			actual = from(original).select(double).toArray();
		expect(actual).toEqual(expected); 
	});
	
	const verifyWithConstant = (constant) => {
		const original = [1, 2],
			expected = [constant, constant],
			actual = from(original).select(_ => constant).toArray();
		expect(actual).toEqual(expected);
	}
	
	it("works as expected if the transform function returns undefined", () => {
		verifyWithConstant(undefined);
	});
	
	it("works as expected if the transform function returns null", () => {
		verifyWithConstant(null);
	});
	
	it("works as expected if the transform function returns false", () => {
		verifyWithConstant(false);
	});
	
	it("can change the type of the elements", () => {
		const original = [1, 2, 3],
			  expected = ["1", "2", "3"],
			  stringify = n => n.toString(),
			  actual = from(original).select(stringify).toArray();

		expect(actual).toEqual(expected);
	});
	
	it("passes the index of the current element to `transform`", () => {
		const original = [1, 2, 3],
		      expected = [1, 3, 5],
			  addIndex = (item, index) => item + index,
			  actual = from(original).select(addIndex).toArray();
		
		expect(actual).toEqual(expected);
	});

});