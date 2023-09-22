export type DownloadScreenshotProps = {
    path: string;
    initDownload: boolean;
    onClose: () => void;
    filename?: string;
};
