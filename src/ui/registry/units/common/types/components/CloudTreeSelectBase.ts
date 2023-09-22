export type CloudTreeSelectBaseProps = {
    onFolderClick?: (cloudId: string, folderId: string) => void;
    folderId?: string;
    storeCloudData?: boolean;
    showOnlyContent?: boolean;
};
