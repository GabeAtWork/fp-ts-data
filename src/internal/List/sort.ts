import type { Order } from "@fp-ts/core/typeclass/Order"
import { pipe } from "@fp-ts/data/Function"
import * as L from "@fp-ts/data/internal/List"
import * as LB from "@fp-ts/data/internal/ListBuilder"
import type { List } from "@fp-ts/data/List"

/** @internal */
export function sort<A>(O: Order<A>) {
  return (self: List<A>): List<A> => {
    const len = L.length(self)
    const b = LB.make<A>()
    if (len === 1) {
      pipe(b, LB.append(L.unsafeHead(self)))
    } else if (len > 1) {
      const arr = new Array<[number, A]>(len)
      copyToArrayWithIndex(self, arr)
      arr.sort(([i, x], [j, y]) => {
        const c = O.compare(y)(x)
        return c !== 0 ? c : i < j ? -1 : 1
      })
      for (let i = 0; i < len; i++) {
        pipe(b, LB.append(arr[i]![1]))
      }
    }
    return LB.build(b)
  }
}

/** @internal */
function copyToArrayWithIndex<A>(list: List<A>, arr: Array<[number, A]>): void {
  let these = list
  let i = 0
  while (!L.isNil(these)) {
    arr[i] = [i, these.head]
    these = these.tail
    i++
  }
}
