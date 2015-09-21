"use strict";

import { Collection } from "../src/eslinq";

describe(".empty", () => {

	it("returns a Collection", () => {
		expect(Collection.empty()).toEqual(jasmine.any(Collection));
	});
	
	it("returns an empty Collection", () => {
		expect(Collection.empty().toArray()).toEqual([]);
		
		for (let i of Collection.empty()) {
			throw "`Collection.empty()` should return no elements";
		}
	});
	
	it("always returns the same instance", () => {
		const first = Collection.empty(),
		      second = Collection.empty();
		
		expect(first).toBe(second);
	});

});