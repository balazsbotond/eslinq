/*
 * ESLinq - LINQ for EcmaScript 2015
 *
 * An easy and elegant way of working with iterables.
 *
 * Full source code and examples:
 * http://github.com/balazsbotond/eslinq
 */

/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Botond Balazs <balazsbotond@gmail.com>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

"use strict";

/**
 * Helper function that wraps the specified iterable instance in an
 * ESLinq Sequence which can be queried using ESLinq operators (like
 * 'select', 'where', etc.).
 * 
 * @param {Iterable} iterable An iterable object (like an Array, a Set,
 *     or any object with a [Symbol.iterator] property).
 * @return {Sequence} An ESLinq Sequence which can be queried using
 *     ESLinq operators (like 'select', 'where', etc.).
 * 
 * @example
 * const numbers = [1, 2, 3, 4, 5];
 * const squaresOfEvenNumbers =
 *     from(numbers)
 *         .where(n => n % 2 === 0)
 *         .select(n => n * n);
 * 
 * for (let n of squaresOfEvenNumbers)
 *     console.log(n); // 4 16
 */
export default function from(iterable) {
    return new Sequence(iterable);
}

/**
 * An iterable sequence that can be queried using ESLinq operators (like
 * 'select', 'where', etc.).
 * 
 * @implements {Iterable}
 */
export class Sequence {
    constructor(iterable) {
        this.iterable = iterable;
        this[Symbol.iterator] = iterable[Symbol.iterator];
    }

    /*
     * Projection and restriction methods
     */

    /**
     * Applies the specified transformation to all elements of the
     * `Sequence`, returning a new `Sequence` of the transformed elements.
     * 
     * @param {function(item: *, index: number): *} transform A function
     *     that is used to transform the elements of the sequence. The first
     *     argument, `item`, is the current sequence element, the second one,
     *     `index`, is the zero-based index of the current element.
     * 
     * @return {Sequence} A new `Sequence` of the transformed elements.
     * 
     * @throws {TypeError} if `transform` is not a function
     * 
     * @example
     * // Simple case, only the `item` parameter of `matches` is used
     * const numbers = [1, 2, 3, 4, 5],
     *       even = from(numbers).select(n => n % 2 === 0);
     * 
     * for (let n of even) {
     *     console.log(n); // 2 4
     * }
     * 
     * // Here we also use the `index` parameter
     * const numbers = [1, 2, 3, 4, 5],
     *       numbersPlusIndices = from(numbers).select((n, i) => n + i);
     * 
     * for (let n of numbersPlusIndices) {
     *     console.log(n); // 1 3 5 7 9
     * }
     */
    select(transform) {
        ensureIsFunction(transform, "`transform` should be a function");

        const generator = function* () {
            let index = 0;
            for (let item of this.iterable) {
                yield transform(item, index);
                index++;
            }
        };

        return this._wrap(generator);
    }

    /**
     * Applies the specified transformations to all elements of the
     * Sequence. The first transformation returns an iterable. The second
     * one, if present, is called for each element of the output of the
     * first, and returns an arbitrary value. The result is either a concatenation
     * of the iterables returned by the first transformation, or a sequence
     * containing the values returned by the second.
     * 
     * @param {function(item: *, index: number): Iterable} getIterable A
     *     function that returns an iterable for each sequence element. The 
     *     first argument, `item`, is the current sequence element, the
     *     second one, `index`, is the zero-based index of the current element.
     * 
     * @param {function(item: *, innerItem: *): *} [transform] A function
     *     that is called for each element of the iterables returned by
     *     `getIterable`. The final sequence contains the output of this
     *     function. The first argument, `item`, is the current item of the original
     *     sequence, the second, `innerItem`, is the current element of the iterable
     *     returned by `getIterable`.
     * 
     * @return {Sequence} A sequence of the values returned by the composition
     *     of the transformation functions.
     * 
     * @throws {Error} If the object returned by `getIterable` is not iterable.
     * 
     * @example
     * // Simple example, only the `getIterable` function is used
     * const taskLists = [
     *     {tasks: [1]}, {tasks: [2, 3]}, {tasks: [4]},
     *     {tasks: []}, {tasks: [5]}
     * ];
     * 
     * const allTasks = from(taskLists).selectMany(t => t.tasks);
     * 
     * for (let t of allTasks) {
     *     console.log(t); // 1 2 3 4 5
     * }
     * 
     * // Here we use both transformation functions
     * const tasksByDate = [
     *     {
     *         date: "2015-09-20",
     *         tasks: [
     *             { id: 1, text: "buy groceries" },
     *             { id: 2, text: "do laundry" },
     *             { id: 3, text: "meet Janet" }
     *         ]
     *     },
     *     // ... more objects like above ...
     * ];
     * 
     * const allTasks =
     *     from(tasksByDate)
     *         .selectMany(date => date.tasks, (date, task) => task.text);
     * 
     * for (let task of allTasks) {
     *     console.log(task);
     * }
     * 
     * // Output:
     * //     buy groceries
     * //     do laundry
     * //     meet Janet
     * //     ...
     */
    selectMany(getIterable, transform = (_, n) => n) {
        ensureIsFunction(getIterable, "`getIterable` should be a function");
        ensureIsFunction(transform, "`transform` should be a function");

        const generator = function* () {
            let index = 0;

            for (let item of this.iterable) {
                const innerIterable = getIterable(item, index);
                ensureIsIterable(innerIterable, "`getIterable` should return an iterable");

                for (let innerItem of innerIterable) {
                    yield transform(item, innerItem);
                }
                
                index++;
            }
        };

        return this._wrap(generator);
    }

    /**
     * Filters the Sequence by a condition specified.
     * 
     * @param {function(item: *, index: number): boolean} matches A
     *     function that returns true if an element is to be included in 
     *     the result. The first argument, `item`, is the current sequence
     *     element, the second one, `index`, is the zero-based index of the
     *     current element.
     *  
     * @return {Sequence} A Sequence of the elements for which the
     *     'matches' function returned true.
     * 
     * @throws {TypeError} if `matches` is not a function
     * 
     * @example
     * // Simple case, only the `item` parameter of `matches` is used
     * const numbers = [1, 2, 3, 4, 5],
     *       even = from(numbers).where(n => n % 2 === 0);
     *  
     * for (let n of even) console.log(n); // 2 4
     * 
     * // Here we also use the `index` parameter
     * const numbers = [2, 1, 3, 0, 4],
     *       itemEqualsIndex = (item, index) => item === index,
     *       numbersEqualToTheirIndices = from(numbers).where(itemEqualsIndex);
     * 
     * for (let n of numbersEqualToTheirIndices) {
     *     console.log(n); // 1 4
     * }
     */
    where(matches) {
        ensureIsFunction(matches, "`matches` should be a function");
        
        const generator = function* () {
            let index = 0;
            for (let item of this.iterable) {
                if (matches(item, index)) {
                    yield item;
                }
                index++;
            }
        };

        return this._wrap(generator);
    }

    /*
     * Join methods
     */

    /*
     * Set methods
     */

    /**
     * Determines whether all elements satisfy a condition.
     * 
     * @param {function(i: *): boolean} matches A function that
     *     determines whether an element of the Sequence satisfies
     *     a condition.
     * 
     * @return {boolean} true if all elements satisfy the condition,
     *     otherwise, false.
     * 
     * @throws {TypeError} if `matches` is not a function
     * 
     * @example
     * const numbers = [1, 2, 3],
     *       even = [2, 4, 6],
     *       isEven = n => n % 2 === 0;
     * 
     * from(numbers).all(isEven); // false
     * from(even).all(isEven); // true
     */
    all(matches) {
        ensureIsFunction(matches, "`matches` should be a function");

        for (let i of this.iterable) {
            if (!matches(i)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Determines whether at least one element satisfies a condition.
     * 
     * Without a condition, `!c.any()` can be used to quickly test whether
     * a sequence is empty. This is the preferred way of testing emptiness
     * vs. `c.count() === 0`, as it always runs in O(1) time.
     * 
     * @param {function(i: *): boolean} matches A function that
     *     determines whether an element of the Sequence satisfies
     *     a condition.
     * 
     * @return {boolean} true if at least one element satisfies the
     *     condition, otherwise, false.
     * 
     * @throws {TypeError} if `matches` is not a function
     * 
     * @example
     * // Without a condition, `any` can be used to quickly test whether
     * // a sequence is empty.
     * const empty = [],
     *       nonEmpty = [1];
     * 
     * console.log(from(empty).any()); // false
     * console.log(from(nonEmpty).any()); // true
     * 
     * // With a condition
     * const numbers = [1, 2, 3],
     *       even = [2, 4, 6],
     *       isOdd = n => n % 2 !== 0;
     * from(numbers).any(isOdd); // true
     * from(even).any(isOdd); // false
     */
    any(matches = constantTrue) {
        ensureIsFunction(matches, "`matches` should be a function");

        for (let i of this.iterable) {
            if (matches(i)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Determines whether at least one element is equal to the item specified
     * using the strict equality operator.
     * 
     * @param {*} item The item to find.
     * @return {boolean} true if at least one element is equal to the item
     *     specified, otherwise, false.
     * 
     * @example
     * const numbers = [1, 2, 3];
     * from(numbers).contains(n => n % 2 === 0); // true, 2 is even
     * from(numbers).contains(n => n > 3); // false, all elements less than 3
     */
    contains(item) {
        for (let i of this.iterable) if (i === item) return true;
        return false;
    }

    /**
     * Concatenates the iterable specified with the current one.
     * 
     * @param {Iterable} other The iterable to concatenate after this instance.
     * @return {Sequence} The concatenation of the two iterables.
     * 
     * @example
     * const numbers = [1, 2],
     *       letters = ["a", "b"],
     *       result  = from(numbers).concat(letters);
     * 
     * for (let i of result) {
     *     console.log(i); // 1 2 a b
     * }
     */
    concat(other) {
        ensureIsIterable(other, "`other` should be iterable");

        const generator = function* () {
            for (let i of this.iterable) yield i;
            for (let j of other) yield j;
        };
        
        return this._wrap(generator);
    }

    /**
     * Returns the distinct elements in the sequence (removes duplication).
     * 
     * @return {Sequence} A Sequence containing the distinct elements
     *     of the original one.
     * 
     * @example
     * const numbers = [1, 1, 1, 2, 3, 4, 3],
     *       noDupl = from(numbers).distinct();
     * 
     * for (let n of noDupl) console.log(n); // 1 2 3 4
     */
    distinct() {
        const generator = function* () {
            const seen = new Set();
            
            for (let i of this.iterable) {
                if (!seen.has(i)) {
                    seen.add(i);
                    yield i;
                }
            }
        };
        
        return this._wrap(generator);
    }

    /**
     * Returns all elements of the iterable except the ones in `other`.
     * 
     * @param {Iterable} other The iterable to be subtracted.
     * 
     * @return {Sequence} All elements of the iterable except the ones
     *     in `other`.
     * 
     * @throws {TypeError}
     * 
     * @example
     * const numbers = [1, 2, 3, 4, 5],
     *       exceptions = [3, 4],
     *       difference = from(numbers).except(exceptions);
     * 
     * for (let n of difference) console.log(n); // 1 2 5
     */
    except(other) {
        ensureIsIterable(other, "`other` should be iterable");
        
        const generator = function* () {
            const seen = new Set(other);
            
            for (let i of this.iterable) {
                if (!seen.has(i)) {
                    seen.add(i);
                    yield i;
                }
            } 
        };
        
        return this._wrap(generator); 
    }

    /**
     * Returns the distinct elements both iterables (this and `other`) contain.
     * 
     * @param {Iterable} other The iterable to intersect the current one with.
     * 
     * @return {Sequence} The elements both iterables contain.
     * 
     * @throws {TypeError} if `other` is not iterable.
     * 
     * @example
     * const a = [1, 2, 3],
     *       b = [2, 3, 4, 3],
     *       i = from(a).intersect(b);
     * 
     * for (let n of i) console.log(i); // 2 3
     */
    intersect(other) {
        ensureIsIterable(other, "`other` should be iterable");
        
        const generator = function* () {
            const seen = new Set(other);

            for (let i of this.iterable) {
                if (seen.has(i)) {
                    yield i;
                }
            }
        };
        
        return this._wrap(generator);
    }

    /**
     * Returns the distinct elements from both iterables (this and `other`).
     * 
     * @param {Iterable} other The iterable to union the current one with.
     * @return {Sequence} The distinct elements from both iterables.
     * 
     * @example
     * const a = [1, 2, 1, 3, 2],
     *       b = [3, 3, 4, 5, 4],
     *       u = from(a).union(b);
     * for (let i of u) console.log(i); // 1 2 3 4 5
     */
    union(other) {
        ensureIsIterable(other, "`other` should be iterable");
        
        const generator = function* () {
            const seen = new Set();
            for (let i of this.iterable) {
                if (!seen.has(i)) {
                    seen.add(i);
                    yield i;
                }
            }
            for (let i of other) {
                if (!seen.has(i)) {
                    seen.add(i);
                    yield i;
                }
            }
        };
        
        return this._wrap(generator);
    }

    /*
     * Ordering methods
     */

    /**
     * Returns a new sequence that contains the elements of the original ordered by
     * the return value of the `get` function. An optional `compare` function can
     * also be specified to implement custom comparison logic (by default, the
     * `orderBy` operator orders the sequence based on the result of the standard
     * ECMAScript comparison operators).
     */
     orderBy(get, compare = compareDefault) {
         let result = Array.from(this.iterable);
         result.sort((a, b) => compare(get(a), get(b)));
         return new Sequence(result);
     }

    /**
     * Returns a new sequence that contains the elements of the original in descending order,
     * ordered by the return value of the `get` function. An optional `compare` function can
     * also be specified to implement custom comparison logic (by default, the
     * `orderBy` operator orders the sequence based on the result of the standard
     * ECMAScript comparison operators).
     */
     orderByDescending(get, compare = compareDefault) {
         let result = Array.from(this.iterable);
         result.sort((a, b) => compare(get(b), get(a)));
         return new Sequence(result);
     }

     reverse() {
         const array = Array.from(this.iterable);
         return this._wrap(function* () {
             for (let i = array.length - 1; i >= 0; i--) yield array[i];
         });
     }

    /*
     * Grouping methods
     */

    groupBy(getKey) {
        const map = new Map();
        for (let i of this.iterable) {
            const key = getKey(i);
            if (map.has(key)) map.get(key).push(i);
            else map.set(getKey(i), [i]);
        }
        return new Sequence(map);
    }

    /*
     * Aggregate methods
     */

    /**
     * Applies an aggregation function over the sequence.
     * 
     * @param {function(accumulator: *, current: *): *} processNext An aggregation
     *     function that gets the accumulated value and the current element of the
     *     sequence.
     * 
     * @param {*} [seed] The initial value of the accumulator. If it is not
     *     specified, the first element of the sequence is used as the seed.
     * 
     * @param {function(result: *): *} [transformResult] A transformation that is
     *     applied to the end result of the aggregation.
     * 
     * @throws {TypeError} if `process` is not a function
     * @throws {TypeError} if `transformResult` is specified but is not a function
     * @throws {RangeError} if the sequence is empty and no seed has been specified
     * 
     * @example
     * // Add all numbers in the array. The first one is used as the seed.
     * const numbers = [1, 2, 3],
     *       sum = from(numbers).aggregate((a, b) => a + b);
     * 
     * console.log(sum); // 6
     * 
     * // Concatenate all strings in the array. Use a seed value.
     * const animals = ["cat", "dog", "fish", "frog"],
     *       list = from(animals).aggregate((a, b) => a + ", " + b, "Animals: ");
     * 
     * console.log(list); // Animals: cat, dog, fish, frog
     * 
     * // Use a transformation on the result
     * const animals = ["cat", "dog", "fish", "frog"],
     *       concatNext = (a, b) => a + ", " + b,
     *       prefix = "Animals: ",
     *       makeParagraph = x => "<p>" + x + "</p>",
     *       paragraph = from(animals).aggregate(concatNext, prefix, makeParagraph);
     * 
     * console.log(paragraph);
     * 
     * // Output:
     * //     <p>Animals: cat, dog, fish, frog</p>
     */
    aggregate(processNext, seed, transformResult = identity) {
        ensureIsFunction(transformResult, "`transformResult` should be a function");
        ensureIsFunction(processNext, "`processNext` should be a function");

        const iterator = this.iterable[Symbol.iterator]();
        let result = iterator.next(),
            accumulator = seed;
            
        if (result.done) {
            if (seed !== undefined) return transformResult(seed);
            throw new RangeError("The sequence is empty and no seed has been specified");
        }
        
        if (seed === undefined) accumulator = result.value;
        else accumulator = processNext(seed, result.value);

        result = iterator.next();
        
        while(!result.done) {
            accumulator = processNext(accumulator, result.value);
            result = iterator.next();
        }
        
        return transformResult(accumulator);
    }

    average(select = identity) {
        let sum = 0, count = 0;
        for (let i of this.iterable) {
            ensureIsNumber(i, "Only numbers can be averaged");
            sum += select(i);
            count++;
        }
        return sum / count;
    }
    
    sum(select = identity) {
        let sum;
        for (let i of this.iterable) {
            ensureIsNumber(i, "Only numbers can be summed");
            sum += select(i);
        }
        return sum;
    }
    
    /**
     * Returns the number of elements in the `Sequence`.
     * 
     * If a `matches` function is specified, returns the number of matching
     * elements.
     * 
     * **Note:** To quickly test whether a sequence is empty, use `!c.any()` instead
     * of `.count() === 0` as the former always runs in O(1) time.
     * 
     * **Complexity:**
     * 
     * - O(1) if the `Iterable` wrapped by this `Sequence` is an `Array`, `Map` or `Set`
     * - O(n) for other `Iterable`s
     * 
     * *Note:* The complexity is O(1) only if the `Array`, `Map` or `Set` is wrapped
     * directly, like `from([1, 2]).count()`. Indirect wrapping will cause the entire
     * sequence to be iterated, as it is the case for
     * `from([1, 2]).where(n => n % 2 === 0).count()`.
     * 
     * @param {function(item: *): boolean} matches A function that should
     *     return `true` for all elements to be included in the count and
     *     `false` for those to be excluded.
     * 
     * @return {number} The number of matching elements in the `Sequence`.
     * 
     * @throws {TypeError} if `matches` is specified, but it is not a function.
     * 
     * @example
     * // No condition specified
     * const numbers = [1, 2, 3, 4],
     *       isEven = n => n % 2 === 0,
     *       count = from(numbers).count();
     * 
     * console.log(count); // 4
     * 
     * // Count matching elements
     * const numbers = [1, 2, 3, 4],
     *       isEven = n => n % 2 === 0,
     *       numberOfEvens = from(numbers).count(isEven);
     * 
     * console.log(numberOfEvens); // 2
     */
    count(matches) {
        if (matches === undefined) {
            // If the wrapped iterable is an `Array`, `Map` or `Set`,
            // we can use these O(1) shortcuts to get the length.
            if (this.iterable instanceof Array) {
                return this.iterable.length;
            } else if (
                this.iterable instanceof Set ||
                this.iterable instanceof Map) {
                return this.iterable.size;
            }
            matches = identity;
        } else {
            ensureIsFunction(matches, "`matches` should be a function");
        }

        let count = 0;

        for (let i of this.iterable) {
            if (matches(i)) {
                count++;
            }
        }

        return count;
    }

    /*
     * Paging methods
     */

    elementAt(index) {
        ensureIsNotNegative(index, "`index` should not be negative");
        const element = this._elementAt(index);
        ensureIsDefined(element, "Index too large");
        return element;
    }
    
    elementAtOrDefault(index, defaultValue) {
        ensureIsNotNegative(index, "`index` should not be negative");
        const element = this._elementAt(index);
        return element !== undefined ? element : defaultValue;
    }
    
    _elementAt(index) {
        let i = 0;
        for (let item of this.iterable) {
            if (i === index) return item;
            i++;
        }
        return undefined;
    }
    
    /**
     * Returns the first element of the sequence. If a `matches` function
     * is specified, it returns the first matching element.
     * 
     * **Evaluation:** eager
     * 
     * @param {function(i: *): boolean} [matches] A function that returns
     * `true` if an element satisfies a condition, `false` otherwise.
     * 
     * @return {*} The first (matching) element. 
     * 
     * @throws {TypeError} if `matches` is not a function
     * 
     * @throws {RangeError} if the sequence contains no elements or no
     *     matching element has been found.
     * 
     * @example
     * // No condition specified, simply retrieve the first element of
     * // the sequence:
     * const numbers = [1, 2, 3, 4, 5],
     *       first = from(numbers).first();
     * 
     * console.log(first); // 1
     * 
     * // Getting the first element that matches a condition:
     * const numbers = [1, 2, 3, 4, 5],
     *       firstEven = from(numbers).first(n => n % 2 === 0);
     * 
     * console.log(firstEven); // 2
     */
    first(matches = constantTrue) {
        ensureIsFunction(matches, "`matches` should be a function");

        for (let i of this.iterable) {
            if (matches(i)) {
                return i;
            }
        }

        throw new RangeError("No matching element found");
    }
    
    /**
     * Returns the first element of a sequence or a user-specified default value.
     * If a `matches` function is specified, it returns the first matching
     * element or the default value.
     * 
     * **Evaluation:** eager
     * 
     * @param {*} [defaultValue=undefined] The default value to return
     *     if the sequence contains no (matching) elements.
     * 
     * @param {function(i: *): boolean} [matches] A function that returns
     *     `true` if an element satisfies a condition, `false` otherwise.
     * 
     * @return {*} The first (matching) element of the sequence or the default
     *     value.
     * 
     * @throws {TypeError} if `matches` is not a function
     * 
     * @example
     * // Get first element of a non-empty sequence
     * const numbers = [1, 2, 3];
     * console.log(from(numbers).firstOrDefault()); // Output: 1
     * 
     * // Try to get first element of an empty sequence. No default value specified.
     * console.log(from([]).firstOrDefault()); // Output: undefined
     * 
     * // Try to get first element of an empty sequence. 0 is specified as a default.
     * console.log(from([]).firstOrDefault(0)); // Output: 0
     * 
     * // Get first matching element of a sequence with matching elements
     * const numbers = [1, 2, 3, 4];
     * console.log(from(numbers).firstOrDefault(0, n => n % 2 === 0)); // Output: 2
     * 
     * // Get first matching element of a sequence without a matching element
     * const numbers = [1, 3, 5];
     * console.log(from(numbers).firstOrDefault(0, n => n % 2 === 0)); // Output: 0
     */
    firstOrDefault(defaultValue, matches = constantTrue) {
        ensureIsFunction(matches, "`matches` should be a function");

        for (let i of this.iterable) {
            if (matches(i)) {
                return i;
            }
        }

        return defaultValue;
    }
    
    /**
     * Returns the last element of the sequence. If a `matches` function
     * is specified, it returns the last matching element.
     * 
     * **Evaluation:** eager
     * 
     * @param {function(i: *): boolean} [matches] A function that returns
     * `true` if an element satisfies a condition, `false` otherwise.
     * 
     * @return {*} The last (matching) element. 
     * 
     * @throws {TypeError} if `matches` is not a function
     * 
     * @throws {RangeError} if the sequence contains no elements or no
     *     matching element has been found.
     * 
     * @example
     * // No condition specified, simply retrieve the last element of
     * // the sequence:
     * const numbers = [1, 2, 3, 4, 5],
     *       last = from(numbers).last();
     * 
     * console.log(last); // 5
     * 
     * // Getting the last element that matches a condition:
     * const numbers = [1, 2, 3, 4, 5],
     *       lastEven = from(numbers).last(n => n % 2 === 0);
     * 
     * console.log(lastEven); // 4
     */
    last(matches = constantTrue) {
        ensureIsFunction(matches, "`matches` should be a function");
        
        const { found, item } = this._last(matches);

        if (!found) {
            throw RangeError("No matching element found");
        }
        return item;
    }
    
    /**
     * Returns the last element of a sequence or a user-specified default value.
     * If a `matches` function is specified, it returns the last matching
     * element or the default value.
     * 
     * **Evaluation:** eager
     * 
     * @param {*} [defaultValue=undefined] The default value to return
     *     if the sequence contains no (matching) elements.
     * 
     * @param {function(i: *): boolean} [matches] A function that returns
     *     `true` if an element satisfies a condition, `false` otherwise.
     * 
     * @return {*} The last (matching) element of the sequence or the default
     *     value.
     * 
     * @throws {TypeError} if `matches` is not a function
     * 
     * @example
     * // Get last element of a non-empty sequence
     * const numbers = [1, 2, 3];
     * console.log(from(numbers).lastOrDefault()); // Output: 3
     * 
     * // Try to get last element of an empty sequence. No default value specified.
     * console.log(from([]).lastOrDefault()); // Output: undefined
     * 
     * // Try to get last element of an empty sequence. 0 is specified as a default.
     * console.log(from([]).lastOrDefault(0)); // Output: 0
     * 
     * // Get last matching element of a sequence with matching elements
     * const numbers = [1, 2, 3, 4];
     * console.log(from(numbers).lastOrDefault(0, n => n % 2 === 0)); // Output: 4
     * 
     * // Get last matching element of a sequence without a matching element
     * const numbers = [1, 3, 5, 7];
     * console.log(from(numbers).lastOrDefault(0, n => n % 2 === 0)); // Output: 0
     */
    lastOrDefault(defaultValue, matches = constantTrue) {
        ensureIsFunction(matches, "`matches` should be a function");

        const { found, item } = this._last(matches);

        return found ? item : defaultValue;
    }
    
    _last(matches = constantTrue) {
        let found = false, item;

        for (let i of this.iterable) {
            if (matches(i)) { 
                item = i;
                found = true;
            }
        }

        return { found, item };
    }
    
    /**
     * Returns the only element of the sequence. If a `matches` function
     * is specified, it returns the single matching element.
     * 
     * **Evaluation:** eager
     * 
     * **Note:** `singleOrDefault` can be used to express that a sequence should
     * contain at most one (matching) element, and the presence of multiple (matching)
     * elements is an error.
     * 
     * @param {function(i: *): boolean} [matches] A function that returns
     * `true` if an element satisfies a condition, `false` otherwise.
     * 
     * @return {*} The single (matching) element. 
     * 
     * @throws {TypeError} if `matches` is not a function
     * 
     * @throws {RangeError} if the sequence contains no elements, if no
     *     matching element has been found, if the sequence contains more
     *     than one (matching) element.
     * 
     * @example
     * // No condition specified, simply retrieve the only element of
     * // the sequence:
     * const numbers = [1],
     *       single = from(numbers).single();
     * 
     * console.log(single); // 1
     * 
     * // Getting the only element that matches a condition:
     * const numbers = [1, 2, 3],
     *       singleEven = from(numbers).single(n => n % 2 === 0);
     * 
     * console.log(singleEven); // 2
     * 
     * // `single` can be used to express that we expect only one matching
     * // element when the presence of more than one matching elements is
     * // a programming error:
     * 
     * // this is expected to contain only one even number
     * const numbers = [1, 2, 3, 4, 5];
     * 
     * // BOOM! this throws a RangeError because the sequence contains more
     * // than one matching element
     * const even = from(numbers).single(even);
     */
    single(matches = constantTrue) {
        ensureIsFunction(matches, "`matches` should be a function");
        
        const { found, item } = this._single(matches);

        if (!found) {
            throw RangeError("No matching element found");
        }
        return item;
    }
    
    /**
     * Returns the single element of a sequence or a user-specified default value.
     * If a `matches` function is specified, it returns the single matching
     * element or the default value.
     * 
     * **Evaluation:** eager
     * 
     * **Note:** `singleOrDefault` can be used to express that a sequence should
     * contain at most one (matching) element, and the presence of multiple (matching)
     * elements is an error.
     * 
     * @param {*} [defaultValue=undefined] The default value to return
     *     if the sequence contains no (matching) elements.
     * 
     * @param {function(i: *): boolean} [matches] A function that returns
     *     `true` if an element satisfies a condition, `false` otherwise.
     * 
     * @return {*} The single (matching) element of the sequence or the default
     *     value.
     * 
     * @throws {TypeError} if `matches` is not a function
     * @throws {RangeError} if the sequence contains more than one matching element
     * 
     * @example
     * // Get the only element of a non-empty sequence
     * const numbers = [1];
     * console.log(from(numbers).singleOrDefault()); // Output: 1
     * 
     * // Try to get the single element of an empty sequence. No default value specified.
     * console.log(from([]).singleOrDefault()); // Output: undefined
     * 
     * // Try to get single element of an empty sequence. 0 is specified as a default.
     * console.log(from([]).singleOrDefault(0)); // Output: 0
     * 
     * // Get single matching element of a sequence with matching elements
     * const numbers = [1, 2, 3];
     * console.log(from(numbers).singleOrDefault(0, n => n % 2 === 0)); // Output: 2
     * 
     * // Get last matching element of a sequence without a matching element
     * const numbers = [1, 3, 5, 7];
     * console.log(from(numbers).singleOrDefault(0, n => n % 2 === 0)); // Output: 0
     * 
     * // Get single matching element of a sequence with multiple matching elements
     * const numbers = [1, 2, 3, 4];
     * 
     * // BOOM! This throws a `RangeError`:
     * console.log(from(numbers).singleOrDefault(0, n => n % 2 === 0));
     */
    singleOrDefault(defaultValue, matches = constantTrue) {
        ensureIsFunction(matches, "`matches` should be a function");
        
        const { found, item } = this._single(matches);
        
        if (!found) {
            return defaultValue;
        }
        
        return item;
    }
    
    _single(matches = constantTrue) {
        let found = false, item;

        for (let i of this.iterable) {
            if (matches(i)) {
                if (found) {
                    throw RangeError("Sequence contains more than one matching element");
                }
                item = i;
                found = true;
            }
        }

        return { found, item };
    }
    
    /**
     * Returns a sequence containing a default value if the input sequence
     * is empty; otherwise returns the input sequence.
     * 
     * **Evaluation:** lazy
     * 
     * @param {*} [defaultValue] if the input sequence is empty, the result
     *     is a sequence containing this value. 
     * 
     * @return {Sequence} a sequence containing a default value if the input
     *     sequence is empty; otherwise the input sequence.
     * 
     * @example
     * // If the input sequence is not empty, the result is the original
     * // sequence
     * const ex1 = from([1, 2]).defaultIfEmpty();
     * 
     * for (let i of ex1) {
     *     console.log(i);
     * }
     * 
     * // Output:
     * //     1
     * //     2
     * 
     * // If the input sequence is empty, the result is a sequence containing
     * // one `undefined` value
     * const ex2 = from([]).defaultIfEmpty();
     * 
     * for (let i of ex2) {
     *     console.log(i);
     * }
     * 
     * // Output:
     * //     undefined
     * 
     * // If the input sequence is empty and a default value is specified,
     * // the result is a sequence the only item of which is the default value
     * const ex3 = from([]).defaultIfEmpty(0);
     * 
     * for (let i of ex2) {
     *     console.log(i);
     * }
     * 
     * // Output:
     * //     0
     */
    defaultIfEmpty(defaultValue) {
        const generator = function* () {
            const iterator = this.iterable[Symbol.iterator]();
            let next = iterator.next();

            if (next.done) {
                yield defaultValue;
                return;
            }

            while (!next.done) {
                yield next.value;
                next = iterator.next();
            }
        };
        
        return this._wrap(generator);
    }
    
    skip(count) {
        const iterable = this.iterable;
        return this._wrap(function* () {
            let c = 0;
            for (let i of iterable) if (++c > count) yield i;
        });
    }
    
    skipWhile(matches) {
        const iterable = this.iterable;
        return this._wrap(function* () {
            let wasFalse = false;
            for (let i of iterable) {
                if (wasFalse || !matches(i)) {
                    wasFalse = true;
                    yield i;
                }
            } 
        });
    }
    
    take(count) {
        const iterable = this.iterable;
        return this._wrap(function* () {
            let c = 0;
            for (let i of iterable) {
                if (++c <= count) yield i;
                else break;
            }
        });
    }

    takeWhile(matches) {
        const iterable = this.iterable;
        return this._wrap(function* () {
            for (let i of iterable) {
                if (matches(i)) yield i;
                else break;
            }
        }); 
    }
    
    /*
     * Factory methods
     */
    
    /**
     * Returns an empty `Sequence`.
     * 
     * **Note:**
     * The `Sequence` instance returned by `empty` is cached, that is,
     * it always returns the same instance.
     * 
     * @return {Sequence} A `Sequence` that has no elements.
     * 
     * @example
     * console.log("start");
     * 
     * for (let i of Sequence.empty()) {
     *     console.log(i);
     * }
     * 
     * console.log("end");
     * 
     * // Output:
     * //     start
     * //     end
     */
    static empty() {
        let self = Sequence;

        if (self._emptyInstance === undefined) {
            self._emptyInstance = self._wrap(function* () {});
        }

        return self._emptyInstance;
    }
    
    /**
     * Returns a `Sequence` that contains the specified element repeated
     * the specified number of times.
     * 
     * @param {*} item The item to be repeated.
     * @param {number} count How many times to repeat the item.
     * 
     * @return {Sequence} A `Sequence` that contains the specified element
     *     repeated the specified number of times.
     * 
     * @throws {TypeError} if `count` is not a number
     * @throws {RangeError} if `count` is negative
     * 
     * @example
     * for (let i of Sequence.repeat("a", 3)) {
     *     console.log(i);
     * }
     * 
     * // Output:
     * //     a
     * //     a
     * //     a
     */
    static repeat(item, count) {
        ensureIsNumber(count, "`count` should be a number");
        ensureIsNotNegative(count, "`count` should not be negative");
        
        const generator = function* () {
            for (let i = 0; i < count; i++) {
                yield item;
            }
        };
        
        return Sequence._wrap(generator);
    }
    
    /**
     * Returns an increasing sequence of integers, of `count` items,
     * starting at `start`.
     * 
     * @param {number} start The first element of the sequence.
     * @param {number} count The number of elements.
     * 
     * @return {Sequence} An increasing sequence of integers, of
     *     `count` items, starting at `start`.
     * 
     * @throws {TypeError} if either `start` or `count` is not a number
     * @throws {RangeError} if count is negative
     * 
     * @example
     * for (let i of Sequence.range(2, 4)) {
     *     console.log(i);
     * }
     * 
     * // Output:
     * //     2
     * //     3
     * //     4
     * //     5
     */
    static range(start, count) {
        ensureIsNumber(start, "`start` should be a number");
        ensureIsNumber(count, "`count` should be a number");
        ensureIsNotNegative(count, "`count` should not be negative");
        
        const generator = function* () {
            for (let i = 0; i < count; i++) {
                yield start + i;
            }
        };
        
        return Sequence._wrap(generator);
    }
    
    /*
     * Conversion methods
     */
    
    toArray() {
        return Array.from(this.iterable);
    }

    /*
     * Private helpers
     */

    _wrap(generator) {
        return new Sequence({ [Symbol.iterator]: generator.bind(this) });
    }
    
    static _wrap(generator) {
        return new Sequence({ [Symbol.iterator]: generator });
    }
    
    _log() {
        /* eslint-disable no-console */
        for (let i of this.iterable) console.log(i);
        /* eslint-enable no-console */
    }
}

/*
 * Functions used as default arguments
 */

function compareDefault(a, b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}

function identity(n) { return n; }
function constantTrue() { return true; }

/*
 * Argument validation helpers
 */

function ensureIsNumber(n, message) {
    if (typeof n !== "number") {
        throw new TypeError(message);
    }
}

function ensureIsNotNegative(n, message) {
    if (n < 0) throw new RangeError(message);
}

function ensureIsDefined(x, message) {
    if (x === undefined) throw new TypeError(message);
}

function ensureIsFunction(f, message) {
    if (typeof f !== "function") throw new TypeError(message);
}

function ensureIsIterable(i, message) {
    ensureIsDefined(i, message);
    const iter = i[Symbol.iterator];
    ensureIsDefined(iter, message);
    ensureIsFunction(iter, message);
}
