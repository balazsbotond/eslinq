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

export default function from(iterable) {
    return new Collection(iterable);
}

class Collection {
    constructor(iterable) {
        if (iterable instanceof Collection) iterable = iterable.iterable;

        this.iterable = iterable;
        this[Symbol.iterator] = iterable[Symbol.iterator];
    }

    /*
     * Projection and restriction methods
     */

    select(transform) {
        const iterable = this.iterable;
        return this._spawn(function* () {
            for (let i of iterable) yield transform(i);
        });
    }

    selectMany(transform) {
        const iterable = this.iterable;
        return this._spawn(function* () {
            for (let i of iterable) for (let j of transform(i)) yield j;
        });
    }

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

    all(matches) {
        for (let i of this.iterable) if (!matches(i)) return false;
        return true;
    }

    any(matches = _ => true) {
        for (let i of this.iterable) if (matches(i)) return true;
        return false;
    }

    contains(item) {
        for (let i of this.iterable) if (i === item) return true;
        return false;
    }

    concat(other) {
        const self = this;
        return this._spawn(function* () {
            for (let i of self.iterable) yield i;
            for (let j of other) yield j;
        });
    }

    distinct() {
        return new Collection(new Set(this.iterable));
    }

    except(other) {
        const iterable = this.iterable;
        other = new Collection(other);
        return this._spawn(function* () {
            for (let i of iterable) if (!other.contains(i)) yield i;
        });
    }

    intersect(other) {
        const iterable = this.iterable;
        other = new Collection(other);
        return this._spawn(function* () {
           for (let i of iterable) if (other.contains(i)) yield i;
        });
    }

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
        throw "Only numbers can be averaged";
}

function ensureNotNegative(n, name) {
    if (n < 0) throw `${name} must not be negative`;
}

function ensureIsDefined(x, message) {
    if (x === undefined) throw message;
}