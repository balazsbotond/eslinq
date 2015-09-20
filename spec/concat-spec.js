"use strict";

import from from "../src/eslinq";

describe(".concat", () => {

	it("empty + empty = empty", () => {
		const actual = from([]).concat([]).toArray(); 
		expect(actual).toEqual([]);
	});
	
	it("non-empty + empty = non-empty", () => {
		const original = [1, 2],
			expected = original,
			actual = from(original).concat([]).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("empty + non-empty = non-empty", () => {
		const original = [],
			other = [1, 2],
			expected = other,
			actual = from(original).concat(other).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("should concatenate two non-empty iterables as expected", () => {
		const original = [1, 2],
			other = [3, 4],
			expected = original.concat(other),
			actual = from(original).concat(other).toArray();
		expect(actual).toEqual(expected);
	});

});