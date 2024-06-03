import type React from 'react';

export default class DialogManager {
    private static items: Record<symbol, React.ComponentType> = {};

    static get dialogs() {
        return DialogManager.items;
    }

    static registerDialog(id: symbol, component: React.ComponentType<any>) {
        DialogManager.items = {
            ...DialogManager.items,
            [id]: component,
        };
    }
}
