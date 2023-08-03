// Copyright 2023 the V8 project authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
//
// Flags: --harmony-set-methods

(function TestDifferenceSetFirstShorter() {
  const firstSet = new Set();
  firstSet.add(42);
  firstSet.add(43);

  const otherSet = new Set();
  otherSet.add(42);
  otherSet.add(46);
  otherSet.add(47);

  const resultSet = new Set();
  resultSet.add(43);

  const resultArray = Array.from(resultSet);
  const differenceArray = Array.from(firstSet.difference(otherSet));

  assertEquals(resultArray, differenceArray);
})();

(function TestDifferenceSetSecondShorter() {
  const firstSet = new Set();
  firstSet.add(42);
  firstSet.add(43);
  firstSet.add(44);

  const otherSet = new Set();
  otherSet.add(42);
  otherSet.add(45);

  const resultSet = new Set();
  resultSet.add(43);
  resultSet.add(44);

  const resultArray = Array.from(resultSet);
  const differenceArray = Array.from(firstSet.difference(otherSet));

  assertEquals(resultArray, differenceArray);
})();

(function TestDifferenceMapFirstShorter() {
  const firstSet = new Set();
  firstSet.add(42);
  firstSet.add(43);

  const other = new Map();
  other.set(42);
  other.set(46);
  other.set(47);

  const resultSet = new Set();
  resultSet.add(43);

  const resultArray = Array.from(resultSet);
  const differenceArray = Array.from(firstSet.difference(other));

  assertEquals(resultArray, differenceArray);
})();

(function TestDifferenceMapSecondShorter() {
  const firstSet = new Set();
  firstSet.add(42);
  firstSet.add(43);
  firstSet.add(44);

  const other = new Map();
  other.set(42);

  const resultSet = new Set();
  resultSet.add(43);
  resultSet.add(44);

  const resultArray = Array.from(resultSet);
  const differenceArray = Array.from(firstSet.difference(other));

  assertEquals(resultArray, differenceArray);
})();

(function TestDifferenceSetLikeObjectFirstShorter() {
  const SetLike = {
    arr: [42, 43, 45],
    size: 3,
    keys() {
      return this.arr[Symbol.iterator]();
    },
    has(key) {
      return this.arr.indexOf(key) != -1;
    }
  };

  const firstSet = new Set();
  firstSet.add(42);
  firstSet.add(43);

  const resultSet = new Set();

  const resultArray = Array.from(resultSet);
  const differenceArray = Array.from(firstSet.difference(SetLike));

  assertEquals(resultArray, differenceArray);
})();

(function TestDifferenceSetLikeObjectSecondShorter() {
  const SetLike = {
    arr: [42, 43],
    size: 3,
    keys() {
      return this.arr[Symbol.iterator]();
    },
    has(key) {
      return this.arr.indexOf(key) != -1;
    }
  };

  const firstSet = new Set();
  firstSet.add(42);
  firstSet.add(43);
  firstSet.add(44);

  const resultSet = new Set();
  resultSet.add(44);

  const resultArray = Array.from(resultSet);
  const differenceArray = Array.from(firstSet.difference(SetLike));

  assertEquals(resultArray, differenceArray);
})();

(function TestDifferenceSetEqualLength() {
  let arrIndex = [];
  const SetLike = {
    arr: [42, 43, 45],
    size: 3,
    keys() {
      return this.arr[Symbol.iterator]();
    },
    has(key) {
      arrIndex.push(this.arr.indexOf(key));
      return this.arr.indexOf(key) != -1;
    }
  };

  const firstSet = new Set();
  firstSet.add(42);
  firstSet.add(43);
  firstSet.add(44);

  const resultSet = new Set();
  resultSet.add(44);

  const resultArray = Array.from(resultSet);
  const differenceArray = Array.from(firstSet.difference(SetLike));

  assertEquals(arrIndex, [0, 1, -1]);
  assertEquals(resultArray, differenceArray);
})();

(function TestDifferenceSetShrinking() {
  const firstSet = new Set();
  firstSet.add(42);
  firstSet.add(43);
  firstSet.add(44);
  firstSet.add(45);
  firstSet.add(46);
  firstSet.add(47);
  firstSet.add(48);
  firstSet.add(49);

  const otherSet = new Set();
  otherSet.add(43);
  otherSet.add(44);
  otherSet.add(45);
  otherSet.add(46);
  otherSet.add(47);
  otherSet.add(48);
  otherSet.add(49);

  const resultSet = new Set();
  resultSet.add(42);

  const resultArray = Array.from(resultSet);
  const differenceArray = Array.from(firstSet.difference(otherSet));

  assertEquals(resultArray, differenceArray);
})();
