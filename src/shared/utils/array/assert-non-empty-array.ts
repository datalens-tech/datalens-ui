export function assertNonEmptyArray<T>(arr: T[]): asserts arr is [T, ...T[]] {
    if (arr.length === 0) {
        throw new Error('Array for discriminated union must not be empty');
    }
}
