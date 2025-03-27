import {Toaster} from '@gravity-ui/uikit';

const toaster = new Toaster();

// default in Toast is 5000
const COPY_TOAST_HIDE_TIMEOUT = 2000;

export const copyTextWithToast = ({
    copyText,
    toastName,
    successText,
    errorText,
}: {
    copyText: string;
    toastName: string;
    successText: string;
    errorText: string;
}) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(copyText);
        toaster.add({
            name: toastName,
            title: successText,
            theme: 'success',
            autoHiding: COPY_TOAST_HIDE_TIMEOUT,
        });
        return;
    }

    toaster.add({
        name: toastName,
        title: errorText,
        theme: 'danger',
        autoHiding: COPY_TOAST_HIDE_TIMEOUT,
    });
};
