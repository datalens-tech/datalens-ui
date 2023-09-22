export const DefaultEmpty = () => {
    return null;
};

export const makeDefaultEmpty = <T,>(): React.ComponentType<T> => {
    return DefaultEmpty;
};
