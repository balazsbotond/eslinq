"use strict";

import { Collection } from "../src/eslinq";

describe(".repeat", () => {

	it("throws an error if `count` is not a number", () => {
		expect(() => Collection.repeat(0, false))
			.toThrowError("`count` should be a number");
	});
	
	it("throws an error if `count` is negative", () => {
		expect(() => Collection.repeat(0, -1))
			.toThrowError("`count` should not be negative");
	});
	
	it("returns an empty Collection if `count` is zero", () => {
		const actual = Collection.repeat("a", 0).toArray(),
		      expected = [];
		
		expect(actual).toEqual(expected);
	});
	
	it("repeats `item` `count` times", () => {
		const actual = Collection.repeat("a", 3).toArray(),
		      expected = ["a", "a", "a"];
		
		expect(actual).toEqual(expected);
	});

});
