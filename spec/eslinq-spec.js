"use strict";

import from from "../src/eslinq";

const owners = [
	{ name: "Kathy", pets: ["dog", "cat"] },
	{ name: "Johnny", pets: ["monkey", "spider"] },
	{ name: "Annie", pets: ["monkey", "cat"] }
];

const identity = n => n,
	double = n => n * 2,
	even = n => n % 2 === 0;

describe("from", () => {

	it("is defined", () => {
		expect(from).toBeDefined();
	});

	it("returns something when given an empty array", () => {
		expect(from([])).toBeDefined();
	});
	
	describe("can also work with non-array iterables, like", () => {

		const verifyForIterable = (iterable) => {
			const expected = [2, 4, 6],
				actual = from(iterable).select(double).toArray();
			expect(actual).toEqual(expected);
		};
		
		it("a set", () => {
		 	verifyForIterable(new Set([1, 2, 3]));
		});
		
	});

	describe("select", () => {

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

	});
	
	describe("selectMany", () => {

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
	
	describe("where", () => {
		
		const verifyAllElementsReturned = (original) => {
			const expected = original,
				actual = from(original).where(_ => true).toArray();
			expect(actual).toEqual(expected);
		};
		
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
		
		it("returns an empty iterable if the only element in a collection does not match", () => {
			const original = [1],
				expected = [],
				actual = from(original).where(even).toArray();
			expect(actual).toEqual(expected);
		});
		
		it("returns the element if the only element in a collection matches", () => {
			const original = [2],
				expected = [2],
				actual = from(original).where(even).toArray();
			expect(actual).toEqual(expected);
		});
		
		it("works as expected if there are undefined elements in the collection", () => {
			verifyAllElementsReturned([1, undefined]);
		});
		
		it("works as expected if there are null elements in the collection", () => {
			verifyAllElementsReturned([1, null]);
		});
		
		it("works as expected if there are false elements in the collection", () => {
			verifyAllElementsReturned([1, false]);
		});
		
	});
});