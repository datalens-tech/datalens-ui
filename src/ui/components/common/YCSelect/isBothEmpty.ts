export function isBothEmpty<T extends unknown>(
    valueA: T[] | Set<T>,
    valueB: T[] | Set<T>,
): boolean {
    if (Array.isArray(valueA) && Array.isArray(valueB)) {
        return valueA.length === 0 && valueB.length === 0;
    }

    if (valueA instanceof Set && valueB instanceof Set) {
        return valueA.size === 0 && valueB.size === 0;
    }

    return false;
}
