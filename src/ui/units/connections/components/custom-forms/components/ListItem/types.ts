export type ActionError<T = unknown> = {
    type: 'error';
    item: T;
    message: string;
    onClick?: (item: T) => void;
};

export type ActionDelete<T = unknown> = {
    type: 'delete';
    item: T;
    onClick?: (item: T) => void;
};

export type ActionMore<T = unknown> = {
    type: 'more';
    item: T;
    onReplace?: (item: T) => void;
    onRename?: (item: T) => void;
    onDelete?: (item: T) => void;
};

export type ListItemAction<T = unknown> = ActionError<T> | ActionDelete<T> | ActionMore<T>;

export type ListItemProps<T = unknown> = {
    title: string;
    description?: string;
    actions?: ListItemAction<T>[];
    qa?: string;
};
