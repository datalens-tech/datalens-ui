class MonacoModelSyncManager {
    constructor() {
        this._states = {};
    }

    createModel({monaco, id, value, language}) {
        if (this._states[id]) {
            return {
                model: this._states[id].model,
                viewState: this._states[id].viewState,
            };
        }
        const model = monaco.editor.createModel(value, language);
        this._states[id] = {
            model,
            viewState: null,
            editors: [],
        };
        return {
            model,
            viewState: null,
        };
    }

    saveEditor({id, editor}) {
        this._states[id].editors.push(editor);
    }

    someEditorSyncValue({id, value}) {
        return this._states[id].editors.some((editor) => editor.getValue() === value);
    }

    saveViewState({id, viewState}) {
        this._states[id].viewState = viewState;
        this._states[id].editors.forEach((editor) => editor.restoreViewState(viewState));
    }

    destroyEditor({id, editor}) {
        if (typeof editor === 'undefined') {
            return;
        }
        const state = this._states[id];
        if (!state) {
            console.warn(`[MonacoModelSyncManager::destroyEditor]: not found id = ${id}`);
            return;
        }
        const {editors, viewState, model} = state;
        const activeEditors = editors.filter((e) => e !== editor);
        const resultState = {
            viewState: activeEditors.length ? viewState : editor.saveViewState(),
            model,
            editors: activeEditors,
        };
        this._states[id] = resultState;
        if (typeof editor !== 'undefined') {
            editor.setModel(null);
            editor.dispose();
        }
    }

    destroyAll() {
        Object.keys(this._states).forEach((id) => {
            const {model, editors} = this._states[id];
            editors.forEach((editor) => {
                if (typeof editor !== 'undefined') {
                    editor.setModel(null);
                    editor.dispose();
                }
            });
            model.dispose();
        });
        this._states = {};
    }
}

export default new MonacoModelSyncManager();
