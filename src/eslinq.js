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
        if (iterable instanceof Sequence) iterable = iterable.iterable;

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
     * @param {function(item: any, index: number): any} transform A function
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
     * @param {function(item: any, index: number): Iterable} getSequence A
     *     function that returns an iterable for each sequence element. The 
     *     first argument, `item`, is the current sequence element, the
     *     second one, `index`, is the zero-based index of the current element.
     * 
     * @param {function(seq: Iterable, item: any): any} [transform] A function
     *     that is called for each element of the iterables returned by
     *     `getSequence`. The final sequence contains the output of this
     *     function. The first argument, `seq`, is the current iterable, the
     *     second, `item`, is the current element of that iterable.
     * 
     * @return {Sequence} A sequence of the values returned by the composition
     *     of the transformation functions.
     * 
     * @throws {Error} If the object returned by `getSequence` is not iterable.
     * 
     * @example
     * // Simple example, only the `getSequence` function is used
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
     *         .selectMany(date => date.tasks, (tasks, task) => task);
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
    selectMany(getSequence, transform = (_, n) => n) {
        ensureIsFunction(getSequence, "`getSequence` should be a function");
        ensureIsFunction(transform, "`transform` should be a function");

        const generator = function* () {
            let index = 0;

            for (let item of this.iterable) {
                const seq = getSequence(item, index);
                ensureIsIterable(seq, "`getSequence` should return an iterable");

                for (let innerItem of seq) {
                    yield transform(item, innerItem);
                }
                
                index++;
            }
        }

        return this._wrap(generator);
    }

    /**
     * Filters the Sequence by a condition specified.
     * 
     * @param {function(item: any, index: number): boolean} matches A
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
        }

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
     * @param {function(i: any): boolean} matches A function that
     *     determines whether an element of the Sequence satisfies
     *     a condition.
     * @return {boolean} true if all elements satisfy the condition,
     *     otherwise, false.
     * 
     * @example
     * const numbers = [1, 2, 3],
     *       even = [2, 4, 6],
     *       isEven = n => n % 2 === 0;
     * from(numbers).all(isEven); // false
     * from(even).all(isEven); // true
     */
    all(matches) {
        for (let i of this.iterable) if (!matches(i)) return false;
        return true;
    }

    /**
     * Determines whether at least one element satisfies a condition.
     * 
     * @param {function(i: any): boolean} matches A function that
     *     determines whether an element of the Sequence satisfies
     *     a condition.
     * @return {boolean} true if at least one element satisfies the
     *     condition, otherwise, false.
     * 
     * @example
     * const numbers = [1, 2, 3],
     *       even = [2, 4, 6],
     *       isOdd = n => n % 2 !== 0;
     * from(numbers).any(isOdd); // true
     * from(even).any(isOdd); // false
     */
    any(matches = _ => true) {
        for (let i of this.iterable) if (matches(i)) return true;
        return false;
    }

    /**
     * Determines whether at least one element is equal to the item specified
     * using the strict equality operator.
     * 
     * @param {any} item The item to find.
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
     * for (let n of noDupl) console.log(n); // 1 2 3 4
     */
    distinct() {
        return new Sequence(new Set(this.iterable));
    }

    /**
     * Returns all elements of the iterable except the ones in `other`.
     * 
     * @param {Iterable} other The iterable to be subtracted.
     * @return {Sequence} All elements of the iterable except the ones
     *     in `other`.
     * 
     * @example
     * const numbers = [1, 2, 3, 4, 5],
     *       exceptions = [3, 4],
     *       difference = from(numbers).except(exceptions);
     * for (let n of difference) console.log(n); // 1 2 5
     */
    except(other) {
        const iterable = this.iterable;
        other = new Sequence(other);
        return this._wrap(function* () {
            // TODO: this is a very naive implementation. We should build
            // a set from `other` and use that for the lookup.
            for (let i of iterable) if (!other.contains(i)) yield i;
        });
    }

    /**
     * Returns the elements both iterables (this and `other`) contain.
     * 
     * @param {Iterable} other The iterable to intersect the current one with.
     * @return {Sequence} The elements both iterables contain.
     * 
     * @example
     * const a = [1, 2, 3],
     *       b = [2, 3, 4],
     *       i = from(a).intersect(b);
     * for (let n of i) console.log(i); // 2 3
     */
    intersect(other) {
        const iterable = this.iterable;
        other = new Sequence(other);
        return this._wrap(function* () {
            // TODO: this is a very naive implementation. We should build
            // a set from `other` and use that for the lookup.
           for (let i of iterable) if (other.contains(i)) yield i;
        });
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
        return new Sequence(this.iterable).concat(other).distinct();
    }

    /*
     * Ordering methods
     */

     orderBy(get, compare = compareDefault) {
        let result = Array.from(this.iterable);
        result.sort((a, b) => compare(get(a), get(b)));
        return new Sequence(result);
     }

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

    aggregate(aggr) {
        let acc;
        for (let i of this.iterable) acc = !acc ? i : aggr(acc, i);
        return acc;
    }

    average(select = n => n) {
        let sum = 0, count = 0;
        for (let i of this.iterable) {
            ensureIsNumber(i, "Only numbers can be averaged");
            sum += select(i);
            count++;
        }
        return sum / count;
    }
    
    sum(select = n => n) {
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
     * @param {function(item: any): boolean} matches A function that should
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
            matches = _ => true;
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
            if (i === index) return i;
            i++;
        }
        return undefined;
    }
    
    first(matches = _ => true) {
        for (let i of this.iterable) if (matches(i)) return i;
        throw "No matching element found";
    }
    
    firstOrDefault(matches = _ => true, defaultValue) {
        for (let i of this.iterable) if (matches(i)) return i;
        return defaultValue;
    }
    
    last(matches = _ => true) {
        const result = this._last(matches);
        if (!result.found)
            throw "No matching element found";
        return result.item;
    }
    
    lastOrDefault(matches = _ => true, defaultValue) {
        const result = this._last(matches);
        if (!result.found)
            return defaultValue;
        return result.item;
    }
    
    _last(matches = _ => true) {
        let found = false, item;
        for (let i of this.iterable)
            if (matches(i)) { item = i; found = true; }
        return { found, item };
    }
    
    single(matches = _ => true) {
        const result = this._single(matches);
        if (!result.found)
            throw "No matching element found";
        return result.item;
    }
    
    singleOrDefault(matches = _ => true, defaultValue) {
        const result = this._single(matches);
        if (!result.found)
            return defaultValue;
        return result.item;
    }
    
    _single(matches = _ => true) {
        let found = false, item;
        for (let i of this.iterable) {
            if (matches(i)) {
                if (found)
                    throw "Sequence contains more than one matching element";
                item = i;
                found = true;
            }
        }
        return { found, item };
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
     * @param {any} item The item to be repeated.
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
     * @throws {RangeError} if (1) count is negative
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
        for (let i of this.iterable) console.log(i);
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
    const iter = i[Symbol.iterator];
    ensureIsDefined(iter, message);
    ensureIsFunction(iter, message);
}
