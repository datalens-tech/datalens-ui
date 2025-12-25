export type ImportExportStatus =
    // current request is in progress
    | 'loading'
    // the state when the request progress is being polled by other request
    | 'pending'
    // the request ended with unexpected  error
    | 'fatal-error'
    // a standart error if the conditions for the request were not met
    // it is returned as a notification
    | 'notification-error'
    | 'success'
    // the state before the request was made
    | null;

export type PublicGalleryData = {
    title: string;
    id: string;
    description?: string;
    data: string;
};
