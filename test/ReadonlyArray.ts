import * as Order from "@fp-ts/core/typeclass/Order"
import * as Either from "@fp-ts/data/Either"
import * as Equal from "@fp-ts/data/Equal"
import { identity, pipe } from "@fp-ts/data/Function"
import * as Number from "@fp-ts/data/Number"
import * as Option from "@fp-ts/data/Option"
import type { Predicate } from "@fp-ts/data/Predicate"
import * as RA from "@fp-ts/data/ReadonlyArray"
import * as String from "@fp-ts/data/String"
import { deepStrictEqual, double, strictEqual } from "@fp-ts/data/test/util"
import * as assert from "assert"
import * as fc from "fast-check"

describe.concurrent("ReadonlyArray", () => {
  it("instances and derived exports", () => {
    expect(RA.Invariant).exist
    expect(RA.imap).exist
    expect(RA.tupled).exist
    expect(RA.bindTo).exist

    expect(RA.Covariant).exist
    expect(RA.map).exist
    expect(RA.let).exist
    expect(RA.flap).exist
    expect(RA.as).exist
    expect(RA.asUnit).exist

    expect(RA.Of).exist
    expect(RA.of).exist
    expect(RA.Do).exist

    expect(RA.Pointed).exist

    expect(RA.FlatMap).exist
    expect(RA.flatMap).exist
    expect(RA.flatten).exist
    expect(RA.andThen).exist
    expect(RA.composeKleisliArrow).exist

    expect(RA.Chainable).exist
    expect(RA.bind).exist
    expect(RA.tap).exist
    expect(RA.andThenDiscard).exist

    expect(RA.Monad).exist

    expect(RA.NonEmptyProduct).exist
    expect(RA.product).exist
    expect(RA.productMany).exist

    expect(RA.Product).exist
    expect(RA.productAll).exist
    // expect(ReadonlyArray.tuple).exist
    // expect(ReadonlyArray.struct).exist

    expect(RA.NonEmptyApplicative).exist
    expect(RA.liftSemigroup).exist
    expect(RA.lift2).exist
    expect(RA.lift3).exist
    expect(RA.ap).exist
    expect(RA.andThenDiscard).exist
    expect(RA.andThen).exist

    expect(RA.Applicative).exist
    expect(RA.liftMonoid).exist

    expect(RA.Foldable).exist
    expect(RA.reduce).exist
    expect(RA.reduceRight).exist
    expect(RA.foldMap).exist
    expect(RA.reduceKind).exist
    expect(RA.reduceRightKind).exist
    expect(RA.foldMapKind).exist

    expect(RA.Traversable).exist
    expect(RA.traverse).exist
    expect(RA.sequence).exist
    expect(RA.traverseTap).exist

    expect(RA.Compactable).exist
    expect(RA.compact).exist
    expect(RA.separate).exist

    expect(RA.Filterable).exist
    expect(RA.filterMap).exist
    expect(RA.filter).exist
    expect(RA.partition).exist
    expect(RA.partitionMap).exist
  })

  describe.concurrent("pipeables", () => {
    it("traverse", () => {
      const traverse = RA.traverse(Option.Applicative)((
        n: number
      ): Option.Option<number> => (n % 2 === 0 ? Option.none : Option.some(n)))
      deepStrictEqual(traverse([1, 2]), Option.none)
      deepStrictEqual(traverse([1, 3]), Option.some([1, 3]))
    })

    it("sequence", () => {
      const sequence = RA.sequence(Option.Applicative)
      deepStrictEqual(sequence([Option.some(1), Option.some(3)]), Option.some([1, 3]))
      deepStrictEqual(sequence([Option.some(1), Option.none]), Option.none)
    })

    it("traverseWithIndex", () => {
      deepStrictEqual(
        pipe(
          ["a", "bb"],
          RA.traverseWithIndex(Option.Applicative)((
            s,
            i
          ) => (s.length >= 1 ? Option.some(s + i) : Option.none))
        ),
        Option.some(["a0", "bb1"])
      )
      deepStrictEqual(
        pipe(
          ["a", "bb"],
          RA.traverseWithIndex(Option.Applicative)((
            s,
            i
          ) => (s.length > 1 ? Option.some(s + i) : Option.none))
        ),
        Option.none
      )
    })

    it("lookup", () => {
      deepStrictEqual(RA.lookup(0)([1, 2, 3]), Option.some(1))
      deepStrictEqual(RA.lookup(3)([1, 2, 3]), Option.none)
      deepStrictEqual(pipe([1, 2, 3], RA.lookup(0)), Option.some(1))
      deepStrictEqual(pipe([1, 2, 3], RA.lookup(3)), Option.none)
    })

    it("elem", () => {
      deepStrictEqual(RA.elem(2)([1, 2, 3]), true)
      deepStrictEqual(RA.elem(0)([1, 2, 3]), false)
      deepStrictEqual(pipe([1, 2, 3], RA.elem(2)), true)
      deepStrictEqual(pipe([1, 2, 3], RA.elem(0)), false)
    })

    it("unfold", () => {
      const as = RA.unfold(5, (n) => (n > 0 ? Option.some([n, n - 1]) : Option.none))
      deepStrictEqual(as, [5, 4, 3, 2, 1])
    })

    // TODO
    // it("wither", async () => {
    //   const wither = ReadonlyArray.wither(T.ApplicativePar)((n: number) =>
    //     T.of(n > 2 ? Option.some(n + 1) : Option.none)
    //   )
    //   deepStrictEqual(await pipe([], wither)(), [])
    //   deepStrictEqual(await pipe([1, 3], wither)(), [4])
    // })

    // TODO
    // it("wilt", async () => {
    //   const wilt = ReadonlyArray.wilt(T.ApplicativePar)((n: number) =>
    //     T.of(n > 2 ? Result.succeed(n + 1) : Result.fail(n - 1))
    //   )
    //   deepStrictEqual(await pipe([], wilt)(), separated([], []))
    //   deepStrictEqual(await pipe([1, 3], wilt)(), separated([0], [4]))
    // })

    it("map", () => {
      deepStrictEqual(
        pipe(
          [1, 2, 3],
          RA.map((n) => n * 2)
        ),
        [2, 4, 6]
      )
    })

    it("mapWithIndex", () => {
      deepStrictEqual(
        pipe(
          ["a", "b"],
          RA.mapWithIndex((s, i) => s + i)
        ),
        ["a0", "b1"]
      )
    })

    it("orElse", () => {
      deepStrictEqual(
        pipe(
          [1, 2],
          RA.orElse([3, 4])
        ),
        [1, 2, 3, 4]
      )
    })

    it("ap", () => {
      deepStrictEqual(
        pipe([(x: number) => x * 2, (x: number) => x * 3], RA.ap([1, 2, 3])),
        [
          2,
          4,
          6,
          3,
          6,
          9
        ]
      )
    })

    it("andThenDiscard", () => {
      deepStrictEqual(pipe([1, 2], RA.andThenDiscard(["a", "b", "c"])), [
        1,
        1,
        1,
        2,
        2,
        2
      ])
    })

    it("andThen", () => {
      deepStrictEqual(pipe([1, 2], RA.andThen(["a", "b", "c"])), [
        "a",
        "b",
        "c",
        "a",
        "b",
        "c"
      ])
    })

    it("flatMap", () => {
      deepStrictEqual(
        pipe(
          [1, 2, 3],
          RA.flatMap((n) => [n, n + 1])
        ),
        [1, 2, 2, 3, 3, 4]
      )
    })

    it("flatMapWithIndex", () => {
      const f = RA.flatMapWithIndex((n: number, i) => [n + i])
      deepStrictEqual(pipe([1, 2, 3], f), [1, 3, 5])
      strictEqual(pipe(RA.empty, f), RA.empty)
      const empty: ReadonlyArray<number> = []
      strictEqual(pipe(empty, f), RA.empty)
    })

    it("chainFirst", () => {
      deepStrictEqual(
        pipe(
          [1, 2, 3],
          RA.tap((n) => [n, n + 1])
        ),
        [1, 1, 2, 2, 3, 3]
      )
    })

    it("extend", () => {
      const sum = (as: ReadonlyArray<number>) => Number.MonoidSum.combineAll(as)
      deepStrictEqual(pipe([1, 2, 3, 4], RA.extend(sum)), [10, 9, 7, 4])
      deepStrictEqual(pipe([1, 2, 3, 4], RA.extend(identity)), [
        [1, 2, 3, 4],
        [2, 3, 4],
        [3, 4],
        [
          4
        ]
      ])
    })

    it("foldMap", () => {
      deepStrictEqual(pipe(["a", "b", "c"], RA.foldMap(String.Monoid)(identity)), "abc")
      deepStrictEqual(pipe([], RA.foldMap(String.Monoid)(identity)), "")
    })

    it("compact", () => {
      deepStrictEqual(RA.compact([]), [])
      deepStrictEqual(RA.compact([Option.some(1), Option.some(2), Option.some(3)]), [
        1,
        2,
        3
      ])
      deepStrictEqual(RA.compact([Option.some(1), Option.none, Option.some(3)]), [
        1,
        3
      ])
    })

    it("separate", () => {
      deepStrictEqual(RA.separate([]), [[], []])
      deepStrictEqual(
        RA.separate([Either.left(123), Either.right("123")]),
        [[123], ["123"]]
      )
    })

    it("filter", () => {
      const g = (n: number) => n % 2 === 1
      deepStrictEqual(pipe([1, 2, 3], RA.filter(g)), [1, 3])
      const x = pipe(
        [Option.some(3), Option.some(2), Option.some(1)],
        RA.filter(Option.isSome)
      )
      assert.deepStrictEqual(x, [Option.some(3), Option.some(2), Option.some(1)])
      const y = pipe(
        [Option.some(3), Option.none, Option.some(1)],
        RA.filter(Option.isSome)
      )
      assert.deepStrictEqual(y, [Option.some(3), Option.some(1)])
    })

    it("filterWithIndex", () => {
      const f = (n: number) => n % 2 === 0
      deepStrictEqual(pipe(["a", "b", "c"], RA.filterWithIndex((_, i) => f(i))), [
        "a",
        "c"
      ])
    })

    it("filterMap", () => {
      const f = (n: number) => (n % 2 === 0 ? Option.none : Option.some(n))
      deepStrictEqual(pipe([1, 2, 3], RA.filterMap(f)), [1, 3])
      deepStrictEqual(pipe([], RA.filterMap(f)), [])
    })

    it("foldMapWithIndex", () => {
      deepStrictEqual(
        pipe(
          ["a", "b"],
          RA.foldMapWithIndex(String.Monoid)((a, i) => i + a)
        ),
        "0a1b"
      )
    })

    it("filterMapWithIndex", () => {
      const f = (n: number, i: number) => ((i + n) % 2 === 0 ? Option.none : Option.some(n))
      deepStrictEqual(pipe([1, 2, 4], RA.filterMapWithIndex(f)), [1, 2])
      deepStrictEqual(pipe([], RA.filterMapWithIndex(f)), [])
    })

    it("partitionMap", () => {
      deepStrictEqual(pipe([], RA.partitionMap(identity)), [[], []])
      deepStrictEqual(
        pipe(
          [Either.right(1), Either.left("foo"), Either.right(2)],
          RA.partitionMap(identity)
        ),
        [["foo"], [1, 2]]
      )
    })

    it("partition", () => {
      deepStrictEqual(
        pipe([], RA.partition((n) => n > 2)),
        [[], []]
      )
      deepStrictEqual(
        pipe([1, 3], RA.partition((n) => n > 2)),
        [[1], [3]]
      )
    })

    it("partitionMapWithIndex", () => {
      deepStrictEqual(
        pipe([], RA.partitionMapWithIndex((a) => a)),
        [[], []]
      )
      deepStrictEqual(
        pipe(
          [Either.right(1), Either.left("foo"), Either.right(2)],
          RA.partitionMapWithIndex((a, i) => pipe(a, Either.filter((n) => n > i, "err")))
        ),
        [["foo", "err"], [1]]
      )
    })

    it("partitionWithIndex", () => {
      deepStrictEqual(
        pipe([], RA.partitionWithIndex((i, n) => i + n > 2)),
        [[], []]
      )
      deepStrictEqual(
        pipe([1, 2], RA.partitionWithIndex((i, n) => i + n > 2)),
        [[1], [2]]
      )
    })

    it("reduce", () => {
      deepStrictEqual(pipe(["a", "b", "c"], RA.reduce("", (b, a) => b + a)), "abc")
    })

    it("reduceRight", () => {
      const f = (b: string, a: string) => b + a
      deepStrictEqual(pipe(["a", "b", "c"], RA.reduceRight("", f)), "cba")
      deepStrictEqual(pipe([], RA.reduceRight("", f)), "")
    })

    it("reduceWithIndex", () => {
      deepStrictEqual(
        pipe(
          ["a", "b"],
          RA.reduceWithIndex("", (b, a, i) => b + i + a)
        ),
        "0a1b"
      )
    })

    it("reduceRightWithIndex", () => {
      deepStrictEqual(
        pipe(
          ["a", "b"],
          RA.reduceRightWithIndex("", (b, a, i) => b + i + a)
        ),
        "1b0a"
      )
    })
  })

  it("getMonoid", () => {
    const M = RA.getMonoid<number>()
    deepStrictEqual(M.combine([3, 4])([1, 2]), [1, 2, 3, 4])
    const x = [1, 2]
    deepStrictEqual(M.combine(M.empty)(x), x)
    deepStrictEqual(M.combine(x)(M.empty), x)
  })

  it("getEq", () => {
    strictEqual(Equal.equals([], []), true)
    strictEqual(Equal.equals(["a"], ["a"]), true)
    strictEqual(Equal.equals(["a", "b"], ["a", "b"]), true)
    strictEqual(Equal.equals(["a"], []), false)
    strictEqual(Equal.equals([], ["a"]), false)
    strictEqual(Equal.equals(["a"], ["b"]), false)
    strictEqual(Equal.equals(["a", "b"], ["b", "a"]), false)
    strictEqual(Equal.equals(["a", "a"], ["a"]), false)
  })

  // TODO
  // it("getOrd", () => {
  //   const O = ReadonlyArray.getOrd(String.Ord)
  //   deepStrictEqual(O.compare([], []), 0)
  //   deepStrictEqual(O.compare(["a"], ["a"]), 0)

  //   deepStrictEqual(O.compare(["b"], ["a"]), 1)
  //   deepStrictEqual(O.compare(["a"], ["b"]), -1)

  //   deepStrictEqual(O.compare(["a"], []), 1)
  //   deepStrictEqual(O.compare([], ["a"]), -1)
  //   deepStrictEqual(O.compare(["a", "a"], ["a"]), 1)
  //   deepStrictEqual(O.compare(["a", "a"], ["b"]), -1)

  //   deepStrictEqual(O.compare(["a", "a"], ["a", "a"]), 0)
  //   deepStrictEqual(O.compare(["a", "b"], ["a", "b"]), 0)

  //   deepStrictEqual(O.compare(["a", "a"], ["a", "b"]), -1)
  //   deepStrictEqual(O.compare(["a", "b"], ["a", "a"]), 1)

  //   deepStrictEqual(O.compare(["a", "b"], ["b", "a"]), -1)
  //   deepStrictEqual(O.compare(["b", "a"], ["a", "a"]), 1)
  //   deepStrictEqual(O.compare(["b", "a"], ["a", "b"]), 1)
  //   deepStrictEqual(O.compare(["b", "b"], ["b", "a"]), 1)
  //   deepStrictEqual(O.compare(["b", "a"], ["b", "b"]), -1)
  // })

  it("isEmpty", () => {
    const as: ReadonlyArray<number> = [1, 2, 3]
    deepStrictEqual(RA.isEmpty(as), false)
    deepStrictEqual(RA.isEmpty([]), true)
  })

  it("isNotEmpty", () => {
    const as: ReadonlyArray<number> = [1, 2, 3]
    deepStrictEqual(RA.isNonEmpty(as), true)
    deepStrictEqual(RA.isNonEmpty([]), false)
  })

  it("prepend", () => {
    deepStrictEqual(pipe([1, 2, 3], RA.prepend(0)), [0, 1, 2, 3])
    deepStrictEqual(pipe([[2]], RA.prepend([1])), [[1], [2]])
  })

  it("append", () => {
    const as: ReadonlyArray<number> = [1, 2, 3]
    deepStrictEqual(RA.append(4)(as), [1, 2, 3, 4])
    deepStrictEqual(RA.append([2])([[1]]), [[1], [2]])
  })

  it("head", () => {
    const as: ReadonlyArray<number> = [1, 2, 3]
    deepStrictEqual(RA.head(as), Option.some(1))
    deepStrictEqual(RA.head([]), Option.none)
  })

  it("last", () => {
    const as: ReadonlyArray<number> = [1, 2, 3]
    deepStrictEqual(RA.last(as), Option.some(3))
    deepStrictEqual(RA.last([]), Option.none)
  })

  it("tail", () => {
    const as: ReadonlyArray<number> = [1, 2, 3]
    deepStrictEqual(RA.tail(as), Option.some([2, 3]))
    deepStrictEqual(RA.tail([]), Option.none)
  })

  it("takeLeft", () => {
    expect(pipe([1, 2, 3, 4], RA.take(2))).toEqual([1, 2])
    // take(0)
    expect(pipe([1, 2, 3, 4], RA.take(0))).toEqual([])
    // out of bounds
    expect(pipe([1, 2, 3, 4], RA.take(-10))).toEqual([])
    expect(pipe([1, 2, 3, 4], RA.take(10))).toEqual([1, 2, 3, 4])
  })

  it("takeRight", () => {
    // _.empty
    strictEqual(RA.takeRight(0)(RA.empty), RA.empty)
    // empty
    const empty: ReadonlyArray<number> = []
    strictEqual(RA.takeRight(0)(empty), empty)
    const full: ReadonlyArray<number> = [1, 2]
    // non empty
    strictEqual(RA.takeRight(0)(full), RA.empty)
    deepStrictEqual(RA.takeRight(1)(full), [2])
    // full
    strictEqual(RA.takeRight(2)(full), full)
    // out of bound
    strictEqual(RA.takeRight(1)(RA.empty), RA.empty)
    strictEqual(RA.takeRight(1)(empty), empty)
    strictEqual(RA.takeRight(3)(full), full)
    strictEqual(RA.takeRight(-1)(RA.empty), RA.empty)
    strictEqual(RA.takeRight(-1)(empty), empty)
    strictEqual(RA.takeRight(-1)(full), full)
  })

  it("spanLeft", () => {
    const f = RA.spanLeft((n: number) => n % 2 === 1)
    const assertSpanLeft = (
      input: ReadonlyArray<number>,
      expectedInit: ReadonlyArray<number>,
      expectedRest: ReadonlyArray<number>
    ) => {
      const [init, rest] = f(input)
      strictEqual(init, expectedInit)
      strictEqual(rest, expectedRest)
    }
    deepStrictEqual(f([1, 3, 2, 4, 5]), [[1, 3], [2, 4, 5]])
    const empty: ReadonlyArray<number> = []
    assertSpanLeft(empty, empty, RA.empty)
    assertSpanLeft(RA.empty, RA.empty, RA.empty)
    const inputAll: ReadonlyArray<number> = [1, 3]
    assertSpanLeft(inputAll, inputAll, RA.empty)
    const inputNone: ReadonlyArray<number> = [2, 4]
    assertSpanLeft(inputNone, RA.empty, inputNone)
  })

  it("takeLeftWhile", () => {
    const f = (n: number) => n % 2 === 0
    deepStrictEqual(RA.takeLeftWhile(f)([2, 4, 3, 6]), [2, 4])
    const empty: ReadonlyArray<number> = []
    strictEqual(RA.takeLeftWhile(f)(empty), empty)
    strictEqual(RA.takeLeftWhile(f)(RA.empty), RA.empty)
    strictEqual(RA.takeLeftWhile(f)([1, 2, 4]), RA.empty)
    const input: ReadonlyArray<number> = [2, 4]
    strictEqual(RA.takeLeftWhile(f)(input), input)
  })

  it("dropLeft", () => {
    // _.empty
    strictEqual(RA.drop(0)(RA.empty), RA.empty)
    // empty
    const empty: ReadonlyArray<number> = []
    strictEqual(RA.drop(0)(empty), empty)
    const full: ReadonlyArray<number> = [1, 2]
    // non empty
    strictEqual(RA.drop(0)(full), full)
    deepStrictEqual(RA.drop(1)(full), [2])
    // full
    strictEqual(RA.drop(2)(full), RA.empty)
    // out of bound
    strictEqual(RA.drop(1)(RA.empty), RA.empty)
    strictEqual(RA.drop(1)(empty), empty)
    strictEqual(RA.drop(3)(full), RA.empty)
    strictEqual(RA.drop(-1)(RA.empty), RA.empty)
    strictEqual(RA.drop(-1)(empty), empty)
    strictEqual(RA.drop(-1)(full), full)
  })

  it("dropRight", () => {
    // _.empty
    strictEqual(RA.dropRight(0)(RA.empty), RA.empty)
    // empty
    const empty: ReadonlyArray<number> = []
    strictEqual(RA.dropRight(0)(empty), empty)
    const full: ReadonlyArray<number> = [1, 2]
    // non empty
    strictEqual(RA.dropRight(0)(full), full)
    deepStrictEqual(RA.dropRight(1)(full), [1])
    // full
    strictEqual(RA.dropRight(2)(full), RA.empty)
    // out of bound
    strictEqual(RA.dropRight(1)(RA.empty), RA.empty)
    strictEqual(RA.dropRight(1)(empty), empty)
    strictEqual(RA.dropRight(3)(full), RA.empty)
    strictEqual(RA.dropRight(-1)(RA.empty), RA.empty)
    strictEqual(RA.dropRight(-1)(empty), empty)
    strictEqual(RA.dropRight(-1)(full), full)
  })

  it("dropLeftWhile", () => {
    const f = RA.dropLeftWhile((n: number) => n > 0)
    strictEqual(f(RA.empty), RA.empty)
    const empty: ReadonlyArray<number> = []
    strictEqual(f(empty), empty)
    strictEqual(f([1, 2]), RA.empty)
    const x1: ReadonlyArray<number> = [-1, -2]
    strictEqual(f(x1), x1)
    const x2: ReadonlyArray<number> = [-1, 2]
    strictEqual(f(x2), x2)
    deepStrictEqual(f([1, -2, 3]), [-2, 3])
  })

  it("init", () => {
    const as: ReadonlyArray<number> = [1, 2, 3]
    deepStrictEqual(RA.init(as), Option.some([1, 2]))
    deepStrictEqual(RA.init([]), Option.none)
  })

  it("findIndex", () => {
    deepStrictEqual(RA.findIndex((x) => x === 2)([1, 2, 3]), Option.some(1))
    deepStrictEqual(RA.findIndex((x) => x === 2)([]), Option.none)
  })

  it("findFirst", () => {
    deepStrictEqual(
      pipe(
        [],
        RA.findFirst((x: { readonly a: number }) => x.a > 1)
      ),
      Option.none
    )
    deepStrictEqual(
      pipe(
        [{ a: 1 }, { a: 2 }, { a: 3 }],
        RA.findFirst((x) => x.a > 1)
      ),
      Option.some({ a: 2 })
    )
    deepStrictEqual(
      pipe(
        [{ a: 1 }, { a: 2 }, { a: 3 }],
        RA.findFirst((x) => x.a > 3)
      ),
      Option.none
    )
  })

  it("findFirstMap", () => {
    deepStrictEqual(
      pipe(
        [1, 2, 3],
        RA.findFirstMap((n) => (n > 1 ? Option.some(n * 2) : Option.none))
      ),
      Option.some(4)
    )
    deepStrictEqual(
      pipe(
        [1],
        RA.findFirstMap((n) => (n < 1 ? Option.some(n * 2) : Option.none))
      ),
      Option.none
    )
  })

  it("findLast", () => {
    deepStrictEqual(
      pipe(
        [],
        RA.findLast((x: { readonly a: number }) => x.a > 1)
      ),
      Option.none
    )
    deepStrictEqual(
      pipe(
        [{ a: 1 }, { a: 2 }, { a: 3 }],
        RA.findLast((x) => x.a > 1)
      ),
      Option.some({ a: 3 })
    )
    deepStrictEqual(
      pipe(
        [{ a: 1 }, { a: 2 }, { a: 3 }],
        RA.findLast((x) => x.a > 3)
      ),
      Option.none
    )
  })

  it("findLastMap", () => {
    deepStrictEqual(
      pipe(
        [1, 2, 3],
        RA.findLastMap((n) => (n > 1 ? Option.some(n * 2) : Option.none))
      ),
      Option.some(6)
    )
    deepStrictEqual(
      pipe(
        [1],
        RA.findLastMap((n) => (n > 1 ? Option.some(n * 2) : Option.none))
      ),
      Option.none
    )
  })

  it("findLastIndex", () => {
    interface X {
      readonly a: number
      readonly b: number
    }
    const xs: ReadonlyArray<X> = [
      { a: 1, b: 0 },
      { a: 1, b: 1 }
    ]
    deepStrictEqual(RA.findLastIndex((x: X) => x.a === 1)(xs), Option.some(1))
    deepStrictEqual(RA.findLastIndex((x: X) => x.a === 4)(xs), Option.none)
    deepStrictEqual(RA.findLastIndex((x: X) => x.a === 1)([]), Option.none)
  })

  it("insertAt", () => {
    deepStrictEqual(RA.insertAt(1, 1)([]), Option.none)
    deepStrictEqual(RA.insertAt(0, 1)([]), Option.some([1] as const))
    deepStrictEqual(
      RA.insertAt(2, 5)([1, 2, 3, 4]),
      Option.some([1, 2, 5, 3, 4] as const)
    )
  })

  // TODO
  // it("unsafeUpdateAt", () => {
  //   const empty: ReadonlyArray<number> = []
  //   strictEqual(ReadonlyArray.unsafeUpdateAt(1, 2, empty), empty)
  //   strictEqual(ReadonlyArray.unsafeUpdateAt(1, 2, ReadonlyArray.empty), ReadonlyArray.empty)
  //   // should return the same reference if nothing changed
  //   const input: ReadonlyArray<number> = [1, 2, 3]
  //   deepStrictEqual(
  //     pipe(ReadonlyArray.unsafeUpdateAt(1, 2, input), (out) => out === input),
  //     true
  //   )
  // })

  it("updateAt", () => {
    const as: ReadonlyArray<number> = [1, 2, 3]
    deepStrictEqual(RA.updateAt(1, 1)(as), Option.some([1, 1, 3]))
    deepStrictEqual(RA.updateAt(1, 1)([]), Option.none)
  })

  it("deleteAt", () => {
    const as: ReadonlyArray<number> = [1, 2, 3]
    deepStrictEqual(RA.deleteAt(0)(as), Option.some([2, 3]))
    deepStrictEqual(RA.deleteAt(1)([]), Option.none)
  })

  it("modifyAt", () => {
    deepStrictEqual(RA.modifyAt(1, double)([1, 2, 3]), Option.some([1, 4, 3]))
    deepStrictEqual(RA.modifyAt(1, double)([]), Option.none)
    // should return the same reference if nothing changed
    const input: ReadonlyArray<number> = [1, 2, 3]
    deepStrictEqual(
      pipe(
        input,
        RA.modifyAt(1, identity),
        Option.map((out) => out === input)
      ),
      Option.some(true)
    )
  })

  it("sort", () => {
    const S = pipe(
      Number.Order,
      Order.contramap((x: { readonly a: number }) => x.a)
    )
    deepStrictEqual(
      pipe(
        [
          { a: 3, b: "b1" },
          { a: 2, b: "b2" },
          { a: 1, b: "b3" }
        ],
        RA.sort(S)
      ),
      [
        { a: 1, b: "b3" },
        { a: 2, b: "b2" },
        { a: 3, b: "b1" }
      ]
    )
    strictEqual(RA.sort(Number.Order)(RA.empty), RA.empty)
    const as: ReadonlyArray<number> = [1]
    strictEqual(RA.sort(Number.Order)(as), as)
  })

  it("zipWith", () => {
    deepStrictEqual(
      pipe([1, 2, 3], RA.zipWith([], (n, s) => s + n)),
      []
    )
    deepStrictEqual(
      pipe([], RA.zipWith(["a", "b", "c", "d"], (n, s) => s + n)),
      []
    )
    deepStrictEqual(
      pipe([], RA.zipWith([], (n, s) => s + n)),
      []
    )
    deepStrictEqual(
      pipe([1, 2, 3], RA.zipWith(["a", "b", "c", "d"], (n, s) => s + n)),
      ["a1", "b2", "c3"]
    )
  })

  it("zip", () => {
    deepStrictEqual(pipe([], RA.zip(["a", "b", "c", "d"])), [])
    deepStrictEqual(pipe([1, 2, 3], RA.zip([])), [])
    deepStrictEqual(pipe([1, 2, 3], RA.zip(["a", "b", "c", "d"])), [
      [1, "a"],
      [2, "b"],
      [3, "c"]
    ])
    deepStrictEqual(pipe([1, 2, 3], RA.zip(["a", "b", "c", "d"])), [
      [1, "a"],
      [2, "b"],
      [3, "c"]
    ])
  })

  it("unzip", () => {
    deepStrictEqual(RA.unzip([]), [[], []])
    deepStrictEqual(
      RA.unzip([
        [1, "a"],
        [2, "b"],
        [3, "c"]
      ]),
      [
        [1, 2, 3],
        ["a", "b", "c"]
      ]
    )
  })

  it("successes", () => {
    deepStrictEqual(
      RA.rights([Either.right(1), Either.left("foo"), Either.right(2)]),
      [1, 2]
    )
    deepStrictEqual(RA.rights([]), [])
  })

  it("failures", () => {
    deepStrictEqual(
      RA.lefts([Either.right(1), Either.left("foo"), Either.right(2)]),
      ["foo"]
    )
    deepStrictEqual(RA.lefts([]), [])
  })

  it("flatten", () => {
    deepStrictEqual(RA.flatten([[1], [2], [3]]), [1, 2, 3])
  })

  it("prependAll", () => {
    deepStrictEqual(RA.prependAll([1, 2])([3, 4]), [1, 2, 3, 4])
  })

  it("intersperse", () => {
    const empty: ReadonlyArray<number> = []
    strictEqual(RA.intersperse(0)(empty), empty)
    strictEqual(RA.intersperse(0)(RA.empty), RA.empty)
    const singleton = [1]
    strictEqual(RA.intersperse(0)(singleton), singleton)
    deepStrictEqual(RA.intersperse(0)([1, 2, 3]), [1, 0, 2, 0, 3])
    deepStrictEqual(RA.intersperse(0)([1, 2]), [1, 0, 2])
    deepStrictEqual(RA.intersperse(0)([1, 2, 3, 4]), [1, 0, 2, 0, 3, 0, 4])
  })

  it("intercalate", () => {
    deepStrictEqual(RA.intercalate(String.Monoid)("-")([]), "")
    deepStrictEqual(RA.intercalate(String.Monoid)("-")(["a"]), "a")
    deepStrictEqual(RA.intercalate(String.Monoid)("-")(["a", "b", "c"]), "a-b-c")
    deepStrictEqual(RA.intercalate(String.Monoid)("-")(["a", "", "c"]), "a--c")
    deepStrictEqual(RA.intercalate(String.Monoid)("-")(["a", "b"]), "a-b")
    deepStrictEqual(RA.intercalate(String.Monoid)("-")(["a", "b", "c", "d"]), "a-b-c-d")
  })

  it("rotate", () => {
    strictEqual(RA.rotate(0)(RA.empty), RA.empty)
    strictEqual(RA.rotate(1)(RA.empty), RA.empty)

    const singleton: ReadonlyArray<number> = [1]
    strictEqual(RA.rotate(1)(singleton), singleton)
    strictEqual(RA.rotate(2)(singleton), singleton)
    strictEqual(RA.rotate(-1)(singleton), singleton)
    strictEqual(RA.rotate(-2)(singleton), singleton)
    const two: ReadonlyArray<number> = [1, 2]
    strictEqual(RA.rotate(2)(two), two)
    strictEqual(RA.rotate(0)(two), two)
    strictEqual(RA.rotate(-2)(two), two)

    deepStrictEqual(RA.rotate(1)([1, 2]), [2, 1])
    deepStrictEqual(RA.rotate(1)([1, 2, 3, 4, 5]), [5, 1, 2, 3, 4])
    deepStrictEqual(RA.rotate(2)([1, 2, 3, 4, 5]), [4, 5, 1, 2, 3])
    deepStrictEqual(RA.rotate(-1)([1, 2, 3, 4, 5]), [2, 3, 4, 5, 1])
    deepStrictEqual(RA.rotate(-2)([1, 2, 3, 4, 5]), [3, 4, 5, 1, 2])

    deepStrictEqual(RA.rotate(7)([1, 2, 3, 4, 5]), [4, 5, 1, 2, 3])
    deepStrictEqual(RA.rotate(-7)([1, 2, 3, 4, 5]), [3, 4, 5, 1, 2])

    deepStrictEqual(RA.rotate(2.2)([1, 2, 3, 4, 5]), [4, 5, 1, 2, 3])
    deepStrictEqual(RA.rotate(-2.2)([1, 2, 3, 4, 5]), [3, 4, 5, 1, 2])
  })

  it("reverse", () => {
    const empty: ReadonlyArray<number> = []
    strictEqual(RA.reverse(empty), empty)
    strictEqual(RA.reverse(RA.empty), RA.empty)
    const singleton: ReadonlyArray<number> = [1]
    strictEqual(RA.reverse(singleton), singleton)
    deepStrictEqual(RA.reverse([1, 2, 3]), [3, 2, 1])
  })

  it("matchLeft", () => {
    const len: <A>(as: ReadonlyArray<A>) => number = RA.matchLeft(
      () => 0,
      (_, tail) => 1 + len(tail)
    )
    deepStrictEqual(len([1, 2, 3]), 3)
  })

  it("matchRight", () => {
    const len: <A>(as: ReadonlyArray<A>) => number = RA.matchRight(
      () => 0,
      (init, _) => 1 + len(init)
    )
    deepStrictEqual(len([1, 2, 3]), 3)
  })

  it("scanLeft", () => {
    const f = (b: number, a: number) => b - a
    deepStrictEqual(RA.scanLeft(10, f)([1, 2, 3]), [10, 9, 7, 4])
    deepStrictEqual(RA.scanLeft(10, f)([0]), [10, 10])
    deepStrictEqual(RA.scanLeft(10, f)([]), [10])
  })

  it("scanRight", () => {
    const f = (b: number, a: number) => b - a
    deepStrictEqual(RA.scanRight(10, f)([1, 2, 3]), [-8, 9, -7, 10])
    deepStrictEqual(RA.scanRight(10, f)([0]), [-10, 10])
    deepStrictEqual(RA.scanRight(10, f)([]), [10])
  })

  // TODO
  // it("uniq", () => {
  //   interface A {
  //     readonly a: string
  //     readonly b: number
  //   }

  //   const eqA = pipe(
  //     Number.Eq,
  //     Eq.contramap((f: A) => f.b)
  //   )
  //   const arrA: A = { a: "a", b: 1 }
  //   const arrB: A = { a: "b", b: 1 }
  //   const arrC: A = { a: "c", b: 2 }
  //   const arrD: A = { a: "d", b: 2 }
  //   const arrUniq: ReadonlyArray<A> = [arrA, arrC]

  //   deepStrictEqual(ReadonlyArray.uniq(eqA)(arrUniq), arrUniq)
  //   deepStrictEqual(ReadonlyArray.uniq(eqA)([arrA, arrB, arrC, arrD]), [arrA, arrC])
  //   deepStrictEqual(ReadonlyArray.uniq(eqA)([arrB, arrA, arrC, arrD]), [arrB, arrC])
  //   deepStrictEqual(ReadonlyArray.uniq(eqA)([arrA, arrA, arrC, arrD, arrA]), [arrA, arrC])
  //   deepStrictEqual(ReadonlyArray.uniq(eqA)([arrA, arrC]), [arrA, arrC])
  //   deepStrictEqual(ReadonlyArray.uniq(eqA)([arrC, arrA]), [arrC, arrA])
  //   deepStrictEqual(ReadonlyArray.uniq(Boolean.Eq)([true, false, true, false]), [true, false])
  //   deepStrictEqual(ReadonlyArray.uniq(Number.Eq)([-0, -0]), [-0])
  //   deepStrictEqual(ReadonlyArray.uniq(Number.Eq)([0, -0]), [0])
  //   deepStrictEqual(ReadonlyArray.uniq(Number.Eq)([1]), [1])
  //   deepStrictEqual(ReadonlyArray.uniq(Number.Eq)([2, 1, 2]), [2, 1])
  //   deepStrictEqual(ReadonlyArray.uniq(Number.Eq)([1, 2, 1]), [1, 2])
  //   deepStrictEqual(ReadonlyArray.uniq(Number.Eq)([1, 2, 3, 4, 5]), [1, 2, 3, 4, 5])
  //   deepStrictEqual(ReadonlyArray.uniq(Number.Eq)([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]), [1, 2, 3, 4, 5])
  //   deepStrictEqual(ReadonlyArray.uniq(Number.Eq)([1, 2, 3, 4, 5, 1, 2, 3, 4, 5]), [1, 2, 3, 4, 5])
  //   deepStrictEqual(ReadonlyArray.uniq(String.Eq)(["a", "b", "a"]), ["a", "b"])
  //   deepStrictEqual(ReadonlyArray.uniq(String.Eq)(["a", "b", "A"]), ["a", "b", "A"])

  //   strictEqual(ReadonlyArray.uniq(Number.Eq)(ReadonlyArray.empty), ReadonlyArray.empty)
  //   const as: ReadonlyArray<number> = [1]
  //   strictEqual(ReadonlyArray.uniq(Number.Eq)(as), as)
  // })

  it("sortBy", () => {
    interface X {
      readonly a: string
      readonly b: number
      readonly c: boolean
    }
    const byName = pipe(
      String.Order,
      Order.contramap((p: { readonly a: string; readonly b: number }) => p.a)
    )
    const byAge = pipe(
      Number.Order,
      Order.contramap((p: { readonly a: string; readonly b: number }) => p.b)
    )
    const f = RA.sortBy([byName, byAge])
    const xs: ReadonlyArray<X> = [
      { a: "a", b: 1, c: true },
      { a: "b", b: 3, c: true },
      { a: "c", b: 2, c: true },
      { a: "b", b: 2, c: true }
    ]
    deepStrictEqual(f(xs), [
      { a: "a", b: 1, c: true },
      { a: "b", b: 2, c: true },
      { a: "b", b: 3, c: true },
      { a: "c", b: 2, c: true }
    ])
    const sortByAgeByName = RA.sortBy([byAge, byName])
    deepStrictEqual(sortByAgeByName(xs), [
      { a: "a", b: 1, c: true },
      { a: "b", b: 2, c: true },
      { a: "c", b: 2, c: true },
      { a: "b", b: 3, c: true }
    ])

    strictEqual(f(RA.empty), RA.empty)
    strictEqual(RA.sortBy([])(xs), xs)
  })

  it("chop", () => {
    const f = RA.chop<number, number>((as) => [as[0] * 2, as.slice(1)])
    const empty: ReadonlyArray<number> = []
    strictEqual(f(empty), RA.empty)
    strictEqual(f(RA.empty), RA.empty)
    deepStrictEqual(f([1, 2, 3]), [2, 4, 6])
  })

  it("splitAt", () => {
    const assertSplitAt = (
      input: ReadonlyArray<number>,
      index: number,
      expectedInit: ReadonlyArray<number>,
      expectedRest: ReadonlyArray<number>
    ) => {
      const [init, rest] = RA.splitAt(index)(input)
      strictEqual(init, expectedInit)
      strictEqual(rest, expectedRest)
    }
    deepStrictEqual(RA.splitAt(1)([1, 2]), [[1], [2]])
    const two: ReadonlyArray<number> = [1, 2]
    assertSplitAt(two, 2, two, RA.empty)
    deepStrictEqual(RA.splitAt(2)([1, 2, 3, 4, 5]), [
      [1, 2],
      [3, 4, 5]
    ])
    // zero
    const empty: ReadonlyArray<number> = []
    assertSplitAt(RA.empty, 0, RA.empty, RA.empty)
    assertSplitAt(empty, 0, empty, RA.empty)
    assertSplitAt(two, 0, RA.empty, two)
    // out of bounds
    assertSplitAt(RA.empty, -1, RA.empty, RA.empty)
    assertSplitAt(empty, -1, empty, RA.empty)
    assertSplitAt(two, -1, RA.empty, two)
    assertSplitAt(two, 3, two, RA.empty)
    assertSplitAt(RA.empty, 3, RA.empty, RA.empty)
    assertSplitAt(empty, 3, empty, RA.empty)
  })

  describe.concurrent("chunksOf", () => {
    it("should split a `ReadonlyArray` into length-n pieces", () => {
      deepStrictEqual(RA.chunksOf(2)([1, 2, 3, 4, 5]), [[1, 2], [3, 4], [5]])
      deepStrictEqual(RA.chunksOf(2)([1, 2, 3, 4, 5, 6]), [
        [1, 2],
        [3, 4],
        [5, 6]
      ])
      deepStrictEqual(RA.chunksOf(1)([1, 2, 3, 4, 5]), [[1], [2], [3], [4], [5]])
      deepStrictEqual(RA.chunksOf(5)([1, 2, 3, 4, 5]), [[1, 2, 3, 4, 5]])
      // out of bounds
      deepStrictEqual(RA.chunksOf(0)([1, 2, 3, 4, 5]), [[1], [2], [3], [4], [5]])
      deepStrictEqual(RA.chunksOf(-1)([1, 2, 3, 4, 5]), [[1], [2], [3], [4], [5]])

      const assertSingleChunk = (input: ReadonlyArray<number>, n: number) => {
        const chunks = RA.chunksOf(n)(input)
        strictEqual(chunks.length, 1)
        strictEqual(chunks[0], input)
      }
      // n = length
      assertSingleChunk([1, 2], 2)
      // n out of bounds
      assertSingleChunk([1, 2], 3)
    })

    it("returns an empty array if provided an empty array", () => {
      const empty: ReadonlyArray<number> = []
      strictEqual(RA.chunksOf(0)(empty), RA.empty)
      strictEqual(RA.chunksOf(0)(RA.empty), RA.empty)
      strictEqual(RA.chunksOf(1)(empty), RA.empty)
      strictEqual(RA.chunksOf(1)(RA.empty), RA.empty)
      strictEqual(RA.chunksOf(2)(empty), RA.empty)
      strictEqual(RA.chunksOf(2)(RA.empty), RA.empty)
    })

    it("should respect the law: chunksOf(n)(xs).concat(chunksOf(n)(ys)) == chunksOf(n)(xs.concat(ys)))", () => {
      const xs: ReadonlyArray<number> = []
      const ys: ReadonlyArray<number> = [1, 2]
      deepStrictEqual(
        RA.chunksOf(2)(xs).concat(RA.chunksOf(2)(ys)),
        RA.chunksOf(2)(xs.concat(ys))
      )
      fc.assert(
        fc.property(
          fc.array(fc.integer()).filter((xs) => xs.length % 2 === 0), // Ensures `xs.length` is even
          fc.array(fc.integer()),
          fc.integer({ min: 1, max: 1 }).map((x) => x * 2), // Generates `n` to be even so that it evenly divides `xs`
          (xs, ys, n) => {
            const as = RA.chunksOf(n)(xs).concat(RA.chunksOf(n)(ys))
            const bs = RA.chunksOf(n)(xs.concat(ys))
            deepStrictEqual(as, bs)
          }
        )
      )
    })
  })

  it("makeBy", () => {
    deepStrictEqual(RA.makeBy(double)(5), [0, 2, 4, 6, 8])
    strictEqual(RA.makeBy(double)(0), RA.empty)
    strictEqual(RA.makeBy(double)(-1), RA.empty)
    deepStrictEqual(RA.makeBy(double)(2.2), [0, 2])
  })

  it("replicate", () => {
    strictEqual(RA.replicate("a")(0), RA.empty)
    strictEqual(RA.replicate("a")(-1), RA.empty)
    deepStrictEqual(RA.replicate("a")(3), ["a", "a", "a"])
    deepStrictEqual(RA.replicate("a")(2.2), ["a", "a"])
  })

  it("range", () => {
    deepStrictEqual(RA.range(0, 0), [0])
    deepStrictEqual(RA.range(0, 1), [0, 1])
    deepStrictEqual(RA.range(1, 5), [1, 2, 3, 4, 5])
    deepStrictEqual(RA.range(10, 15), [10, 11, 12, 13, 14, 15])
    deepStrictEqual(RA.range(-1, 0), [-1, 0])
    deepStrictEqual(RA.range(-5, -1), [-5, -4, -3, -2, -1])
    // out of bound
    deepStrictEqual(RA.range(2, 1), [2])
    deepStrictEqual(RA.range(-1, -2), [-1])
  })

  it("union", () => {
    const two: ReadonlyArray<number> = [1, 2]
    deepStrictEqual(pipe(two, RA.union([3, 4])), [1, 2, 3, 4])
    deepStrictEqual(pipe(two, RA.union([2, 3])), [1, 2, 3])
    deepStrictEqual(pipe(two, RA.union([1, 2])), [1, 2])
    strictEqual(pipe(two, RA.union(RA.empty)), two)
    strictEqual(pipe(RA.empty, RA.union(two)), two)
    strictEqual(
      pipe(RA.empty, RA.union(RA.empty)),
      RA.empty
    )
  })

  it("intersection", () => {
    deepStrictEqual(pipe([1, 2], RA.intersection([3, 4])), [])
    deepStrictEqual(pipe([1, 2], RA.intersection([2, 3])), [2])
    deepStrictEqual(pipe([1, 2], RA.intersection([1, 2])), [1, 2])
  })

  it("difference", () => {
    deepStrictEqual(pipe([1, 2], RA.difference([3, 4])), [1, 2])
    deepStrictEqual(pipe([1, 2], RA.difference([2, 3])), [1])
    deepStrictEqual(pipe([1, 2], RA.difference([1, 2])), [])
  })

  it("getUnionMonoid", () => {
    const M = RA.getUnionMonoid<number>()
    const two: ReadonlyArray<number> = [1, 2]
    deepStrictEqual(M.combine([3, 4])(two), [1, 2, 3, 4])
    deepStrictEqual(M.combine([2, 3])(two), [1, 2, 3])
    deepStrictEqual(M.combine([1, 2])(two), [1, 2])

    strictEqual(M.combine(two)(M.empty), two)
    strictEqual(M.combine(M.empty)(two), two)
    strictEqual(M.combine(M.empty)(M.empty), M.empty)
  })

  it("getIntersectionSemigroup", () => {
    const S = RA.getIntersectionSemigroup<number>()
    deepStrictEqual(S.combine([1, 2])([3, 4]), [])
    deepStrictEqual(S.combine([1, 2])([2, 3]), [2])
    deepStrictEqual(S.combine([1, 2])([1, 2]), [1, 2])
  })

  it("should be safe when calling map with a binary function", () => {
    interface Foo {
      readonly bar: () => number
    }
    const f = (a: number, x?: Foo) => (x !== undefined ? `${a}${x.bar()}` : `${a}`)
    deepStrictEqual(pipe([1, 2], RA.map(f)), ["1", "2"])
  })

  it("empty", () => {
    strictEqual(RA.empty.length, 0)
  })

  it("do notation", () => {
    deepStrictEqual(
      pipe(
        RA.Do,
        RA.bind("a", () => [1, 2, 3]),
        RA.map(({ a }) => a * 2)
      ),
      [2, 4, 6]
    )

    deepStrictEqual(
      pipe(
        RA.Do,
        RA.bind("a", () => [1, 2, 3]),
        RA.bind("b", () => ["a", "b"]),
        RA.map(({ a, b }) => [a, b] as const)
      ),
      [
        [1, "a"],
        [1, "b"],
        [2, "a"],
        [2, "b"],
        [3, "a"],
        [3, "b"]
      ]
    )

    deepStrictEqual(
      pipe(
        RA.Do,
        RA.bind("a", () => [1, 2, 3]),
        RA.bind("b", () => ["a", "b"]),
        RA.map(({ a, b }) => [a, b] as const),
        RA.filter(([a, b]) => (a + b.length) % 2 === 0)
      ),
      [
        [1, "a"],
        [1, "b"],
        [3, "a"],
        [3, "b"]
      ]
    )
  })

  it("every", () => {
    const isPositive: Predicate<number> = (n) => n > 0
    deepStrictEqual(pipe([1, 2, 3], RA.every(isPositive)), true)
    deepStrictEqual(pipe([1, 2, -3], RA.every(isPositive)), false)
  })

  it("some", () => {
    const isPositive: Predicate<number> = (n) => n > 0
    deepStrictEqual(pipe([-1, -2, 3], RA.some(isPositive)), true)
    deepStrictEqual(pipe([-1, -2, -3], RA.some(isPositive)), false)
  })

  it("size", () => {
    deepStrictEqual(RA.size(RA.empty), 0)
    deepStrictEqual(RA.size([]), 0)
    deepStrictEqual(RA.size(["a"]), 1)
  })

  it("fromOption", () => {
    deepStrictEqual(RA.fromOption(Option.some("hello")), ["hello"])
    deepStrictEqual(RA.fromOption(Option.none), [])
  })

  it("fromResult", () => {
    deepStrictEqual(RA.fromEither(Either.right(1)), [1])
    strictEqual(RA.fromEither(Either.left("a")), RA.empty)
  })

  it("match", () => {
    const f = RA.match(
      () => "empty",
      (as) => `nonEmpty ${as.length}`
    )
    deepStrictEqual(pipe(RA.empty, f), "empty")
    deepStrictEqual(pipe([1, 2, 3], f), "nonEmpty 3")
  })

  test("zipMany", () => {
    const start = [1, 2, 3, 4, 5]
    const others = [
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4],
      [1, 2, 3, 4, 5]
    ]

    const actual = pipe(start, RA.zipMany(others))
    const expected = [[1, 1, 1, 1], [2, 2, 2, 2], [3, 3, 3, 3], [4, 4, 4, 4]]

    expect(actual).toStrictEqual(expected)
  })

  test("zipAll", () => {
    const arrays = [
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4],
      [1, 2, 3, 4, 5]
    ]

    const actual = RA.zipAll(arrays)
    const expected = [[1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4]]

    expect(actual).toStrictEqual(expected)
  })

  test("product", () => {
    const self = [1, 2, 3]
    const that = [2, 3, 4]

    const actual = pipe(self, RA.product(that))
    const expected = [[1, 2], [1, 3], [1, 4], [2, 2], [2, 3], [2, 4], [3, 2], [3, 3], [3, 4]]

    expect(actual).toStrictEqual(expected)
  })

  test("productMany", () => {
    const self = [1, 2, 3]
    const arrays = [
      [2],
      [4, 5],
      [8, 9, 10]
    ]
    const actual = pipe(self, RA.productMany(arrays))
    const expected = [[1, 2, 4, 5, 8, 9, 10], [2, 2, 4, 5, 8, 9, 10], [3, 2, 4, 5, 8, 9, 10]]
    expect(actual).toStrictEqual(expected)
  })

  test("productAll", () => {
    const arrays = [
      [2, 3],
      [4, 5],
      [8, 9, 10]
    ]
    const actual = RA.productAll(arrays)
    const expected = [[2, 4, 5, 8, 9, 10], [3, 4, 5, 8, 9, 10]]
    expect(actual).toStrictEqual(expected)
  })
})
