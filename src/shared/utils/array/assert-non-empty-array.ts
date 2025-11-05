export function assertNonEmptyArray<T>(arr: T[], message?: string): asserts arr is [T, ...T[]] {
    if (arr.length === 0) {
        throw new Error(message ?? 'Array must not be empty!');
    }
}
