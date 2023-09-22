export const getCapitalizedStr = (str: string) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`;

export const getTextOverflowedStr = (str: string, maxLength: number) => {
    // horten the line for ellipsis
    if (str.length > maxLength - 3) {
        return `${str.substr(0, maxLength)}...`;
    }

    return str;
};
