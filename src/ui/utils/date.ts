// TODO: add localization option
export const getDefaultDateFormat = (args: {withTime?: boolean} = {}) => {
    const {withTime = false} = args;
    return withTime ? 'DD.MM.YYYY HH:mm:ss' : 'DD.MM.YYYY';
};
