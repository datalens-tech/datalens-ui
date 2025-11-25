export type AccessDialogProps = {
    entryId?: string;
    workbookId?: string;
    collectionId?: string;
    resourceTitle?: string;
    canUpdate: boolean;
    onClose?: () => void;
    defaultTab?: string;
};
