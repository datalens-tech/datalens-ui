type Reducers = Record<string, any>;
type EmitChange = (reducers: Reducers) => void;

export class ReducerRegistry {
    reducers: Record<string, any>;
    emitChange: EmitChange | null;

    constructor() {
        this.reducers = {};
        this.emitChange = null;
    }

    getReducers() {
        return {
            ...this.reducers,
        };
    }

    register(reducers: Reducers) {
        this.reducers = {
            ...this.reducers,
            ...reducers,
        };

        if (this.emitChange) {
            this.emitChange(this.getReducers());
        }
    }

    reset() {
        this.reducers = {};
        this.emitChange = null;
    }

    setChangeListener(cb: EmitChange) {
        this.emitChange = cb;
    }
}

export const reducerRegistry = new ReducerRegistry();
