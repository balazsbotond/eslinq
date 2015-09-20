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
 * ESLinq Collection which can be queried using ESLinq methods (like
 * 'select', 'where', etc.).
 * 
 * @param {Iterable} iterable An iterable object (like an Array, a Set,
 *     or any object with a [Symbol.iterator] property).
 * @return {Collection} An ESLinq collection which can be queried using
 *     ESLinq methods (like 'select', 'where', etc.).
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
    return new Collection(iterable);
}

/**
 * An iterable collection that can be queried using ESLinq methods (like
 * 'select', 'where', etc.).
 * 
 * @implements {Iterable}
 */
export class Collection {
    constructor(iterable) {
        if (iterable instanceof Collection) iterable = iterable.iterable;

        this.iterable = iterable;
        this[Symbol.iterator] = iterable[Symbol.iterator];
    }

    /*
     * Projection and restriction methods
     */

    /**
     * Applies the specified transformation to all elements of the
     * Collection, returning a new Collection of the transformed elements.
     * 
     * @param {function(i: any): any} transform A function that is used
     *     to transform the elements of the collection.
     * @return {Collection} A new Collection of the transformed elements.
     * 
     * @example
     * const numbers = [1, 2, 3, 4, 5];
     * const even = from(numbers).select(n => n % 2 === 0);
     * for (let n of even) console.log(n); // 2 4 
     */
    select(transform) {
        const iterable = this.iterable;
        return this._spawn(function* () {
            for (let i of iterable) yield transform(i);
        });
    }

    /**
     * Applies the specified transformation to all elements of the
     * Collection. The transformation should return an iterable. The
     * resulting collection will be a concatenation of these iterables.
     * 
     * @param {function(i: any): Iterable} transform A function that is
     *     called for each Collection element. Should return a iterable.
     * @return {Collection} A concatenation of the iterables returned by
     *     the transformation function.
     * @throws {Error} If the object returned by the transform function
     *     is not iterable.
     * 
     * @example
     * const taskLists = [
     *     {tasks: [1]}, {tasks: [2, 3]}, {tasks: [4]},
     *     {tasks: []}, {tasks: [5]}
     * ];
     * const allTasks = from(taskLists).selectMany(t => t.tasks);
     * for (let t of allTasks) console.log(t); // 1 2 3 4 5
     */
    selectMany(transform) {
        const iterable = this.iterable;
        return this._spawn(function* () {
            for (let i of iterable) {
                const innerIter = transform(i);
                ensureIsIterable(innerIter, "Transform function should return an iterable");
                for (let j of innerIter) yield j;
            }
        });
    }

    /**
     * Filters the Collection by a condition specified.
     * 
     * @param {function(i: any): boolean} matches A function that returns
     *     true if an element is to be included in the result.
     * @return {Collection} A Collection of the elements for which the
     *     'matches' function returned true.
     * 
     * @example
     * const numbers = [1, 2, 3, 4, 5];
     * const even = from(numbers).where(n => n % 2 === 0);
     * for (let n of even) console.log(n); // 2 4
     */
    where(matches) {
        const iterable = this.iterable;
        return this._spawn(function* () {
            for (let i of iterable) if (matches(i)) yield i;
        });
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
     *     determines whether an element of the Collection satisfies
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
     *     determines whether an element of the Collection satisfies
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
     * @return {Collection} The concatenation of the two iterables.
     * 
     * @example
     * const numbers = [1, 2],
     *       letters = ["a", "b"],
     *       result  = from(numbers).concat(letters);
     * for (let i of result) console.log(i); // 1 2 a b
     */
    concat(other) {
        const self = this;
        return this._spawn(function* () {
            for (let i of self.iterable) yield i;
            for (let j of other) yield j;
        });
    }

    /**
     * Returns the distinct elements in the collection (removes duplication).
     * 
     * @return {Collection} A Collection containing the distinct elements
     *     of the original one.
     * 
     * @example
     * const numbers = [1, 1, 1, 2, 3, 4, 3],
     *       noDupl = from(numbers).distinct();
     * for (let n of noDupl) console.log(n); // 1 2 3 4
     */
    distinct() {
        return new Collection(new Set(this.iterable));
    }

    /**
     * Returns all elements of the iterable except the ones in `other`.
     * 
     * @param {Iterable} other The iterable to be subtracted.
     * @return {Collection} All elements of the iterable except the ones
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
        other = new Collection(other);
        return this._spawn(function* () {
            // TODO: this is a very naive implementation. We should build
            // a set from `other` and use that for the lookup.
            for (let i of iterable) if (!other.contains(i)) yield i;
        });
    }

    /**
     * Returns the elements both iterables (this and `other`) contain.
     * 
     * @param {Iterable} other The iterable to intersect the current one with.
     * @return {Collection} The elements both iterables contain.
     * 
     * @example
     * const a = [1, 2, 3],
     *       b = [2, 3, 4],
     *       i = from(a).intersect(b);
     * for (let n of i) console.log(i); // 2 3
     */
    intersect(other) {
        const iterable = this.iterable;
        other = new Collection(other);
        return this._spawn(function* () {
            // TODO: this is a very naive implementation. We should build
            // a set from `other` and use that for the lookup.
           for (let i of iterable) if (other.contains(i)) yield i;
        });
    }

    /**
     * Returns the distinct elements from both iterables (this and `other`).
     * 
     * @param {Iterable} other The iterable to union the current one with.
     * @return {Collection} The distinct elements from both iterables.
     * 
     * @example
     * const a = [1, 2, 1, 3, 2],
     *       b = [3, 3, 4, 5, 4],
     *       u = from(a).union(b);
     * for (let i of u) console.log(i); // 1 2 3 4 5
     */
    union(other) {
        return new Collection(this.iterable).concat(other).distinct();
    }

    /*
     * Ordering methods
     */

     orderBy(get, compare = compareDefault) {
        let result = Array.from(this.iterable);
        result.sort((a, b) => compare(get(a), get(b)));
        return new Collection(result);
     }

     orderByDescending(get, compare = compareDefault) {
        let result = Array.from(this.iterable);
        result.sort((a, b) => compare(get(b), get(a)));
        return new Collection(result);
     }

     reverse() {
        const array = Array.from(this.iterable);
        return this._spawn(function* () {
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
        return new Collection(map);
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
            this._ensureIsNumber(i);
            sum += select(i);
            count++;
        }
        return sum / count;
    }
    
    sum(select = n => n) {
        let sum;
        for (let i of this.iterable) {
            this._ensureIsNumber(i);
            sum += select(i);
        }
        return sum;
    }
    
    count(matches = _ => true) {
        let count = 0;
        for (let i of this.iterable) if (matches(i)) count++;
        return count;
    }

    /*
     * Paging methods
     */

    elementAt(index) {
        ensureNotNegative(index, "index");
        const element = this._elementAt(index);
        ensureIsDefined(element, "Index too large");
        return element;
    }
    
    elementAtOrDefault(index, defaultValue) {
        ensureNotNegative(index, "index");
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
                    throw "Collection contains more than one matching element";
                item = i;
                found = true;
            }
        }
        return { found, item };
    }
    
    skip(count) {
        const iterable = this.iterable;
        return this._spawn(function* () {
            let c = 0;
            for (let i of iterable) if (++c > count) yield i;
        });
    }
    
    skipWhile(matches) {
        const iterable = this.iterable;
        return this._spawn(function* () {
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
        return this._spawn(function* () {
            let c = 0;
            for (let i of iterable) {
                if (++c <= count) yield i;
                else break;
            }
        });
    }

    takeWhile(matches) {
        const iterable = this.iterable;
        return this._spawn(function* () {
            for (let i of iterable) {
                if (matches(i)) yield i;
                else break;
            }
        }); 
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

    _spawn(generator) {
        return new Collection({ [Symbol.iterator]: generator });
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

function ensureIsNumber(n) {
    if (typeof n !== "number")
        throw new Error("Only numbers can be averaged");
}

function ensureNotNegative(n, name) {
    if (n < 0) throw new Error(`${name} must not be negative`);
}

function ensureIsDefined(x, message) {
    if (x === undefined) throw new Error(message);
}

function ensureIsFunction(f, message) {
    if (typeof f !== "function") throw new Error(message);
}

function ensureIsIterable(i, message) {
    const iter = i[Symbol.iterator];
    ensureIsDefined(iter, message);
    ensureIsFunction(iter, message);
}
