class LocalStorage {
    static restore(key: string) {
        try {
            const data = window.localStorage.getItem(key);
            if (data === null) {
                return null;
            }
            return JSON.parse(data);
        } catch (err) {
            return null;
        }
    }

    static store(key: string, data: unknown) {
        try {
            window.localStorage.setItem(key, JSON.stringify(data));
        } catch (err) {
            console.error(`data not saved in localeStorage: ${err}`);
        }
    }
}

export default LocalStorage;
