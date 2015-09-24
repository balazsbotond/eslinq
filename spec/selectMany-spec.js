"use strict";

import from from "../src/eslinq";
import { owners, identity } from "./helpers";

const tasksByDate = [
	{
		date: "2015-09-20",
		tasks: [
			{ id: 1, text: "buy groceries" },
			{ id: 2, text: "do laundry" },
			{ id: 3, text: "meet Janet" }
		]
	},
	{
		date: "2015-09-21",
		tasks: [
			{ id: 4, text: "write homework" },
			{ id: 5, text: "learn ESLinq" }
		]
	}
];

const allTasks = [
	"buy groceries", "do laundry", "meet Janet", "write homework", "learn ESLinq"
];

describe(".selectMany", () => {

	const getPets = o => o.pets;
	
	it("throws if `getIterable` is not a function", () => {
		const bomb = () => from([]).selectMany(1);
		expect(bomb).toThrowError("`getIterable` should be a function");
	});
	
	it("throws if `transform` is not a function", () => {
		const bomb = () => from([]).selectMany(i => i, 1);
		expect(bomb).toThrowError("`transform` should be a function");
	});

	it("returns an empty iterable when given an empty iterable", () => {
		const original = [],
			expected = [],
			actual = from(original).selectMany(getPets).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("throws an error if `getIterable` does not return an iterable", () => {
		const original = [1, 2],
			wrapper = () => from(original).selectMany(identity).toArray(),
			expectedError = "`getIterable` should return an iterable";
		expect(wrapper).toThrowError(expectedError);
	});
	
	it("returns the concatenation of the arrays returned by transform", () => {
		const expected = ["dog", "cat", "monkey", "spider", "monkey", "cat"],
			actual = from(owners).selectMany(getPets).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("behaves correctly if `getIterable` returns an empty iterable", () => {
		const original = [[1], [], [2], []],
			expected = [1, 2],
			actual = from(original).selectMany(identity).toArray();
		expect(actual).toEqual(expected);
	});
	
	it("behaves correctly if a `transform` function is present", () => {
		const original = tasksByDate,
		      expected = allTasks,
			  getTasks = date => date.tasks,
			  getText = (tasks, task) => task.text,
			  actual = from(original).selectMany(getTasks, getText).toArray();
		
		expect(actual).toEqual(expected);
	});
	
	it("passes the index of the current element to `getIterable`", () => {
		const original = [[3], [6], [9]],
		      expected = [0, 1, 2],
			  getIndex = (item, index) => [index],
			  actual = from(original).selectMany(getIndex).toArray();
		
		expect(actual).toEqual(expected);
	});

	it("works if both functions are present and all parameters are used", () => {
		// NOTE: this is a direct port of Jon Skeet's test case from here:
		// http://codeblog.jonskeet.uk/2010/12/27/reimplementing-linq-to-objects-part-9-selectmany/
		// (he calls this test `FlattenWithProjectionAndIndex`)
		
		const numbers = [3, 5, 20, 15],
		      expected = ["3: 3", "5: 6", "20: 2", "20: 2", "15: 1", "15: 8"],
			  actual = from(numbers).selectMany(
				  (x, index) => (x + index).toString().split(""),
				  (x, c) => x + ": " + c
			  ).toArray();
		
		expect(actual).toEqual(expected);
	});

});
