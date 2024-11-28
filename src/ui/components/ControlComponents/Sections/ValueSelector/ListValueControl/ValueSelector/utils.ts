export const convertDefaultValue = (defaultValue?: string | string[]) => {
    if (Array.isArray(defaultValue)) return defaultValue;
    if (typeof defaultValue === 'string') return [defaultValue];

    return undefined;
};
