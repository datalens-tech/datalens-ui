export const removeEmptyFields = <T extends Record<string, unknown>>(data: T) => {
    const preparedData: T = {...data};
    Object.entries(preparedData).forEach(([key, value]) => {
        if (!value) {
            delete preparedData[key as keyof T];
        }
    });

    return preparedData;
};
