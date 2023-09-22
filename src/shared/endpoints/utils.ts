// Endpoints do not end with /, and when composing an url, the relative part begins with /...
// So it is not possible to simply specify /, because in the end the url will look like //.
// If you leave an empty string in the env variable, this value will be ignored,
// therefore we specify / and then we remove all slashes at the end of the line with endpoint
export function removeLastSlash(data: object) {
    return Object.entries(data).reduce((result: Record<string, unknown>, [key, value]) => {
        result[key] = typeof value === 'object' ? removeLastSlash(value) : value.replace(/\/$/, '');
        return result;
    }, {});
}
