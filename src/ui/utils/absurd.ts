/**
 * Ensures at type-level that it will never be called
 * @param impossible Value to test
 * @throws TypeError
 * @returns never
 *
 * @example
 * enum Status { OK, FINE };
 * declare const s: Status;
 *
 * switch (s) {
 *     case Status.OK:
 *         // ...
 *         break;
 *
 *     case Status.FINE:
 *         // ...
 *         break;
 *
 *     default:
 *         // if someone extends Status with new member, this will give compile-time type error
 *         // (as well as runtime error, to prevent bad things from happening)
 *         absurd(s);
 * }
 */
export function absurd(impossible: never): never {
    console.error('Static assert has failed with this value:', impossible);
    throw new TypeError('Static assert has failed');
}
