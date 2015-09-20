"use strict";

import from from "../src/eslinq";
import { owners, identity } from "./helpers";

describe(".selectMany", () => {

	const getPets = o => o.pets;

	it("returns an empty iterable when given an empty iterable", () => {
		const original = [],
			expected = [],
			actual = from(original).selectMany(getPets).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("throws an error if the transform function does not return an iterable", () => {
		const original = [1, 2],
			wrapper = () => from(original).selectMany(identity).toArray(),
			expectedError = "Transform function should return an iterable";
		expect(wrapper).toThrowError(expectedError);
	});
	
	it("returns the concatenation of the arrays returned by transform", () => {
		const expected = ["dog", "cat", "monkey", "spider", "monkey", "cat"],
			actual = from(owners).selectMany(getPets).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("behaves correctly if the transform function returns an empty iterable", () => {
		const original = [[1], [], [2], []],
			expected = [1, 2],
			actual = from(original).selectMany(identity).toArray();
		expect(actual).toEqual(expected);
	});

});