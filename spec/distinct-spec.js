"use strict";

import from from "../src/eslinq";

describe(".distinct", () => {
	
	it("returns the empty iterable if given the empty iterable", () => {
		expect(from([]).distinct().toArray()).toEqual([]);
	});
	
	it("returns the element if given a one-element iterable", () => {
		expect(from([1]).distinct().toArray()).toEqual([1]);
	});
	
	it("returns [1] if given [1, 1]", () => {
		expect(from([1, 1]).distinct().toArray()).toEqual([1]);
	});
	
	it("returns [1, 2] if given [1, 2]", () => {
		expect(from([1, 2]).distinct().toArray()).toEqual([1, 2]);
	});
	
	it("returns [1, 2] if given [1, 1, 2]", () => {
		expect(from([1, 1, 2]).distinct().toArray()).toEqual([1, 2]);
	});
	
	it("returns [1, 2] if given [1, 2, 2]", () => {
		expect(from([1, 2, 2]).distinct().toArray()).toEqual([1, 2]);
	});
	
	it("returns [3, 2, 1] if given [3, 2, 3, 2, 2, 1, 1, 1, 2]", () => {
		const original = [3, 2, 3, 2, 2, 1, 1, 1, 2],
			expected = [3, 2, 1],
			actual = from(original).distinct().toArray();
		expect(actual).toEqual(expected);
	});
	
});