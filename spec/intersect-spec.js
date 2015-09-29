"use strict";

import from from "../src/eslinq";
import { ThrowingIterable } from "./helpers";

describe(".intersect", () => {

	it("throws an error if called without arguments", () => {
		expect(() => from([]).intersect()).toThrowError("`other` should be iterable");
	});
	
	it("throws an error if called with a non-iterable argument", () => {
		expect(() => from([]).intersect(1)).toThrowError("`other` should be iterable");
	});
	
	it("returns empty if both sequences are empty", () => {
		expect(from([]).intersect([]).toArray()).toEqual([]);
	});
	
	it("returns empty if the first sequence is empty", () => {
		expect(from([]).intersect([1, 2]).toArray()).toEqual([]);
	});
	
	it("returns empty if the second sequence is empty", () => {
		expect(from([1, 2]).intersect([]).toArray()).toEqual([]);
	});
	
	it("returns empty if there are no common elements", () => {
		expect(from([1, 2]).intersect([3, 4]).toArray()).toEqual([]);
	});
	
	it("returns only the common elements", () => {
		expect(from([1, 2]).intersect([3, 2, 4]).toArray()).toEqual([2]);
	});
	
	it("returns the common elements only once", () => {
		expect(from([3, 1, 2]).intersect([3, 2, 4, 2]).toArray()).toEqual([3, 2]);
	});
	
	it("does not use the sequences before iteration", () => {
		from(new ThrowingIterable()).intersect(new ThrowingIterable());
	});

	it("iterates the second sequence completely when the first element" +
	   "is read from the result", () => {
		const second = from([1, 2, 3]).select(n => {
			if (n !== 3) return n;
			throw "This is expected";
		});

		const result = from([1, 2]).intersect(second),
		      iterator = result[Symbol.iterator]();
		
		expect(() => iterator.next()).toThrow();
	});
	
	it("iterates the first sequence as results are read", () => {
		const first = [1, 2, -1, 2],
		      second = [1],
			  transformFirst = n => {
				  if (n < 0) throw "This is expected";
				  return n;
			  },
		      result = from(first).select(transformFirst).intersect(second),
		      iterator = result[Symbol.iterator]();
		
		iterator.next();
		
		expect(() => iterator.next()).toThrow();
	});

});
