import qs from 'qs';

export class UrlSearch {
    searchParams: URLSearchParams;

    constructor(
        search: string | string[][] | Record<string, string> | URLSearchParams | undefined,
    ) {
        this.searchParams = new window.URLSearchParams(search);
    }

    _getPrefix(withPrefix: boolean) {
        return withPrefix ? '?' : '';
    }

    set(name: string, value: string) {
        this.searchParams.set(name, value);
        return this;
    }

    get(name: string) {
        return this.searchParams.get(name);
    }

    has(name: string) {
        return this.searchParams.has(name);
    }

    getNormalized(name: string) {
        const value = this.get(name);

        return value ? decodeURI(value) : null;
    }

    delete(name: string | string[]) {
        const names = Array.isArray(name) ? name : [name];
        names.forEach((curr) => {
            this.searchParams.delete(curr);
        });
        return this;
    }

    toString(withPrefix = true) {
        const query = this.searchParams.toString();
        return query ? this._getPrefix(withPrefix) + query : query;
    }

    toObject() {
        return qs.parse(this.searchParams.toString());
    }
}
