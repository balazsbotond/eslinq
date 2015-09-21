"use strict";

import { Collection } from "../src/eslinq";

describe(".repeat", () => {

	it("throws an error if `start` is not a number", () => {
		expect(() => Collection.range("1", 2))
			.toThrowError("`start` should be a number");
	});
	
	it("throws an error if `count` is not a number", () => {
		expect(() => Collection.range(1, "2"))
			.toThrowError("`count` should be a number");
	});
	
	it("throws an error if `count` is negative", () => {
		expect(() => Collection.range(0, -1))
			.toThrowError("`count` should not be negative");
	});
	
	it("returns an empty Collection if `count` is zero", () => {
		const actual = Collection.range(1, 0).toArray(),
		      expected = [];
		
		expect(actual).toEqual(expected);
	});
	
	it("return [2, 3, 4] for (2, 3)", () => {
		const actual = Collection.range(2, 3).toArray(),
		      expected = [2, 3, 4];
		
		expect(actual).toEqual(expected);
	});
	
	it("can generate a sequence starting at a negative number", () => {
		const actual = Collection.range(-2, 4).toArray(),
		      expected = [-2, -1, 0, 1];
		
		expect(actual).toEqual(expected);
	});

});
