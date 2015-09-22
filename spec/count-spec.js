"use strict";

import from from "../src/eslinq";
import { Sequence } from "../src/eslinq";
import { even } from "./helpers";

describe(".distinct", () => {
	
	it("throws if `matches` is specified but not a function", () => {
		const thisShouldThrow = () => from([0]).count(false);
		expect(thisShouldThrow).toThrowError("`matches` should be a function");
	});
	
	it("returns 0 for an empty array", () => {
		expect(from([]).count()).toEqual(0);
	});
	
	it("returns 0 for an empty iterable", () => {
		expect(from(Sequence.empty()).count()).toEqual(0);
	});
	
	it("returns 0 for an empty `Map`", () => {
		expect(from(new Map()).count()).toEqual(0);
	});
	
	it("returns 0 for an empty `Set`", () => {
		expect(from(new Set()).count()).toEqual(0);
	});
	
	it("returns 1 for a one-element array", () => {
		expect(from([8]).count()).toEqual(1);
	});
	
	it("returns 1 for a one-element `Set`", () => {
		const set = new Set();
		set.add(8);
		expect(from(set).count()).toEqual(1);
	});
	
	it("returns the number of elements in a heterogenous array", () => {
		const array = [0, undefined, false, null, NaN, [], 1, true];
		expect(from(array).count()).toEqual(8);
	});
	
	it("returns 0 for an empty array and a constant true function", () => {
		expect(from([]).count(_ => true)).toEqual(0);
	});
	
	it("returns 0 for an array with some elements and a constant false function", () => {
		expect(from([3, 2, 1]).count(_ => false)).toEqual(0);
	});
	
	it("returns the number of matching elements in the sequence", () => {
		expect(from([2, 3, 4]).count(even)).toEqual(2);
	});
	
});