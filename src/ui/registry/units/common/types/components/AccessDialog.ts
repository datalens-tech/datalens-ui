export type AccessDialogProps = {
    workbookId?: string;
    collectionId?: string;
    resourceTitle?: string;
    canUpdate: boolean;
    onClose?: () => void;
};
