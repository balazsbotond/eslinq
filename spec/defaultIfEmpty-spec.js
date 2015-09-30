"use strict";

import from from "../src/eslinq";

describe(".defaultIfEmpty", () => {
    // These test cases are from Jon Skeet's article on reimplmenting `defaultIfEmpty`:
    // http://codeblog.jonskeet.uk/2010/12/29/reimplementing-linq-to-objects-part-12-defaultifempty/

    it("returns [undefined] if the input is empty and no default is specified", () => {
        expect(from([]).defaultIfEmpty().toArray()).toEqual([undefined]);
    });

    it("returns [0] if the input is empty and the default value is 0", () => {
        expect(from([]).defaultIfEmpty(0).toArray()).toEqual([0]);
    });

    it("returns the original sequence if the input is non-empty and no default is specified", () => {
        expect(from([1, 2]).defaultIfEmpty().toArray()).toEqual([1, 2]);
    });

    it("returns the original sequence if the input is non-empty and the default value is 0", () => {
        expect(from([1, 2]).defaultIfEmpty(0).toArray()).toEqual([1, 2]);
    });

});