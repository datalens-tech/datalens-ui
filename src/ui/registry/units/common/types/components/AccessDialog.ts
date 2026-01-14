export type AccessDialogProps = {
    workbookId?: string;
    collectionId?: string;
    resourceTitle?: string;
    canUpdateAccessBindings: boolean;
    onClose?: () => void;
    defaultTab?: string;
};
