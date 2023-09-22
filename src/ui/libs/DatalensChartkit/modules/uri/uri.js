function tryDecodeURIComponent(component) {
    try {
        return decodeURIComponent(component);
    } catch (error) {
        return component;
    }
}

function parseQuery(query) {
    const searchParams = new URLSearchParams(query);
    const result = {};

    searchParams.forEach((value, key) => {
        const decodedKey = tryDecodeURIComponent(key);
        const decodedValue = tryDecodeURIComponent(value);

        result[decodedKey] = result[decodedKey] || [];
        result[decodedKey].push(decodedValue);
    });

    return result;
}

class URI {
    static makeQueryString(params = {}) {
        const stringifiedDict = Object.keys(params).reduce((result, key) => {
            const value = params[key];
            if (Array.isArray(value)) {
                return result.concat(value.map((value) => ({key, value}))); // eslint-disable-line no-shadow
            } else {
                result.push({key, value});
            }
            return result;
        }, []);

        return stringifiedDict.length
            ? '?' +
                  stringifiedDict
                      .map(
                          ({key, value}) =>
                              encodeURIComponent(key) + '=' + encodeURIComponent(value),
                      )
                      .join('&')
            : '';
    }

    get pathname() {
        return this._pathname;
    }

    set pathname(value) {
        // TODO: make special to check value for validity
        this._pathname = value;
    }

    constructor(url = '') {
        const parts =
            /^(?:([^:]*):\/\/([^:/?#]+)(?::([\d]+))?)?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/.exec(
                url,
            );

        this._protocol = parts[1] || '';
        this._hostname = parts[2] || '';
        this._port = parts[3] || '';
        this._pathname = parts[4] || '/';
        this._query = parts[5] || '';
        this._hash = parts[6] || '';

        this._params = parseQuery(this._query);
    }

    getParam(key) {
        const value = this._params[key];
        return Array.isArray(value) && value.length === 1 ? value[0] : value;
    }

    getParams() {
        return Object.keys(this._params).reduce((result, key) => {
            result[key] = this.getParam(key);
            return result;
        }, {});
    }

    setParam(key, value) {
        if (!key) {
            return;
        }
        this._params[key] = value === undefined || value === null ? '' : value;
    }

    setParams(params = {}) {
        Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value === undefined || value === null) {
                value = '';
            }
            this._params[key] = Array.isArray(value) ? value.map(String) : [String(value)];
        });
    }

    delParam(key) {
        delete this._params[key];
    }

    updateParams(params = {}) {
        Object.keys(params).forEach((key) => {
            const value = params[key];
            if (value === null) {
                delete this._params[key];
            } else {
                this._params[key] = Array.isArray(value) ? value.map(String) : [String(value)];
            }
        });
    }

    toString() {
        return (
            (this._protocol ? this._protocol + '://' : '') +
            this._hostname +
            (this._port ? ':' + this._port : '') +
            (this._pathname.substr(0, 1) === '/' ? this._pathname : '/' + this._pathname) +
            URI.makeQueryString(this._params) +
            (this._hash ? '#' + this._hash : '')
        );
    }
}

export default URI;
