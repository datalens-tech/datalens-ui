export abstract class BaseSdk<
    T,
    M extends Record<string, (entry: T, options: any) => T> = {},
    S extends Record<string, any> = {},
    O extends object = {},
> {
    abstract mutations?: M;
    abstract selectors?: S;

    abstract create(): Promise<T>;
    abstract get(options: {id: string} & O): Promise<T>;
    abstract update(options: {id: string} & O, newEntry: T): Promise<T>;
    abstract delete(options: {id: string} & O): Promise<void>;

    async lazyBatch(options: {id: string} & O) {
        const entry = await this.get(options);

        return this.batchMutations.bind(this, entry);
    }

    batchMutations(entry: T, mutations: Array<{name: keyof M; options: any}>) {
        let newEntry = entry;

        for (const mutation of mutations) {
            if (this.mutations && mutation.name in this.mutations) {
                newEntry = this.mutations[mutation.name](entry, mutation.options);
            }
        }

        return newEntry;
    }
}
