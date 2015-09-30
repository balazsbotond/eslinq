"use strict";

import from from "../src/eslinq";
import { ThrowingIterable } from "./helpers";

describe(".except", () => {

	it("throws an error if called without arguments", () => {
		expect(() => from([]).except()).toThrowError("`other` should be iterable");
	});
	
	it("throws an error if called with a non-iterable argument", () => {
		expect(() => from([]).except(1)).toThrowError("`other` should be iterable");
	});
	
	it("returns empty if called on an empty sequence with an empty argument", () => {
		expect(from([]).except([]).toArray()).toEqual([]);
	});
	
	it("returns empty if called on an empty sequence with a non-empty argument", () => {
		expect(from([]).except([1, 2]).toArray()).toEqual([]);
	});
	
	it("returns the first sequence if called with an empty argument", () => {
		expect(from([1, 2]).except([]).toArray()).toEqual([1, 2]);
	});
	
	it("returns the first sequence if called with an empty argument", () => {
		expect(from([1, 2]).except([]).toArray()).toEqual([1, 2]);
	});
	
	it("returns the first sequence if the intersection is empty", () => {
		expect(from([1, 2]).except([3, 4]).toArray()).toEqual([1, 2]);
	});
	
	it("returns the elements of the first sequence not in the second one", () => {
		expect(from([1, 2]).except([2, 3, 4]).toArray()).toEqual([1]);
	});
	
	it("returns distinct elements", () => {
		expect(from([1, 2, 2, 3, 4, 3, 2, 5]).except([2, 3, 4]).toArray()).toEqual([1, 5]);
	});
	
	it("does not use the sequences before iteration", () => {
		from(new ThrowingIterable()).except(new ThrowingIterable());
	});

	it("iterates the second sequence completely when the first element" +
	   "is read from the result", () => {
		const second = from([1, 2, 3]).select(n => {
			if (n !== 3) return n;
			throw "This is expected";
		});

		const result = from([1, 2]).except(second),
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
		      result = from(first).select(transformFirst).except(second),
		      iterator = result[Symbol.iterator]();
		
		iterator.next();
		
		expect(() => iterator.next()).toThrow();
	});

});
