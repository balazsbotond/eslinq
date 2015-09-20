"use strict";

import from from "../src/eslinq";

const owners = [
	{ name: "Kathy", pets: ["dog", "cat"] },
	{ name: "Johnny", pets: ["monkey", "spider"] },
	{ name: "Annie", pets: ["monkey", "cat"] }
];

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
				double = n => n * 2,
				actual = from(iterable).select(double).toArray();
			expect(actual).toEqual(expected);
		};
		
		it("a set", () => {
		 	verifyForIterable(new Set([1, 2, 3]));
		});
		
	});

	describe("select", () => {

		const identity = n => n,
			double = n => n * 2;

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
});