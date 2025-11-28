export type AccessDialogProps = {
    entryId?: string;
    workbookId?: string;
    collectionId?: string;
    resourceTitle?: string;
    canUpdateAccessBindings: boolean;
    onClose?: () => void;
    defaultTab?: string;
};
