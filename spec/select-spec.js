"use strict";

import from from "../src/eslinq";
import { identity, double } from "./helpers";

describe(".select", () => {

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

});