// https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
export const getBase64FromDataUrl = (dataUrl = '') => {
    return dataUrl.replace(/^data:application\/[a-z]+;base64,/, '');
};

export const getBase64 = ({
    file,
    onSuccess,
    onFailure,
}: {
    file: File;
    onSuccess: (fileInBase64: string) => void;
    onFailure: () => void;
}) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        const result = getBase64FromDataUrl((reader.result as string) || '');
        onSuccess(result);
    };
    reader.onerror = function () {
        onFailure();
    };
};
