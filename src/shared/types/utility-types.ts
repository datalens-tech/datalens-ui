import type {Falsy} from 'utility-types';

export type EmptyObject = {
    [K in any]: never;
};

export type Truthy<T> = T extends Falsy ? never : T;

// This `is guard` is convenient to use in map.filter(isTruthy) to filter truthy values
export function isTruthy<T>(value: T): value is Truthy<T> {
    return Boolean(value);
}

export type Nullable<T> = T | null;

export type NullableValues<T> = {
    [P in keyof T]: T[P] | null;
};

export type NestedPartial<T, K extends keyof T> = Partial<
    Omit<T, K> & {[key in keyof T]: Partial<T[K]>}
>;

// https://stackoverflow.com/a/47914631
export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// https://stackoverflow.com/a/53050575
type NoUndefinedField<T> = {
    [P in keyof T]-?: NoUndefinedField<Exclude<T[P], null | undefined>>;
};

export type WithRequired<T, K extends keyof T> = T & {[P in K]-?: T[P]};

export type NonNullableBy<T, K extends keyof T> = Omit<T, K> & NoUndefinedField<Pick<T, K>>;

type ObjectKeys<T extends object> = `${Exclude<keyof T, symbol>}`;

export const objectKeys = Object.keys as <T extends object>(value: T) => Array<ObjectKeys<T>>;

export type ValueOf<T extends object> = T[keyof T];
