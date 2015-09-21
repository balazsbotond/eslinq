"use strict";

import from from "../src/eslinq";
import { even, ThrowingIterable } from "./helpers";

describe(".where", () => {
	
	const verifyAllElementsReturned = (original) => {
		const expected = original,
			actual = from(original).where(_ => true).toArray();
		expect(actual).toEqual(expected);
	};
	
	it("fails early if it is called without arguments", () => {
		expect(() => from([]).where()).toThrowError("`matches` should be a function");
	});
	
	it("fails early if it is called with a non-function argument", () => {
		expect(() => from([]).where(0)).toThrowError("`matches` should be a function");
	});
	
	it("does not start iteration eagerly", () => {
		from(new ThrowingIterable()).where(_ => true);
	});
	
	it("returns an empty iterable when given an empty iterable", () => {
		const original = [],
			expected = [],
			actual = from(original).where(even).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("returns an empty iterable when no elements match", () => {
		const original = [1, 3, 5],
			expected = [],
			actual = from(original).where(even).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("returns only matching elements", () => {
		const original = [1, 2, 3, 4, 5],
			expected = [2, 4],
			actual = from(original).where(even).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("returns all elements when all of them match", () => {
		const original = [2, 4, 6],
			actual = from(original).where(_ => true).toArray();
		expect(actual).toEqual(original);
	});
	
	it("returns an empty iterable if the only element in a sequence does not match", () => {
		const original = [1],
			expected = [],
			actual = from(original).where(even).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("returns the element if the only element in a sequence matches", () => {
		const original = [2],
			expected = [2],
			actual = from(original).where(even).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("works as expected if there are undefined elements in the sequence", () => {
		verifyAllElementsReturned([1, undefined]);
	});
	
	it("works as expected if there are null elements in the sequence", () => {
		verifyAllElementsReturned([1, null]);
	});
	
	it("works as expected if there are false elements in the sequence", () => {
		verifyAllElementsReturned([1, false]);
	});
	
	it("should set the `index` property of `matches` properly", () => {
		let expectedIndex = 0;
		const verifyIndex = (item, index) => {
			expect(index).toEqual(expectedIndex);
			expectedIndex++;
			return false;
		};
		const numbers = [1, 2, 3];
		from(numbers).where(verifyIndex).toArray();
	});
	
});