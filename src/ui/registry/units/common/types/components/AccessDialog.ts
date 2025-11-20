import type {AccessDialogTab} from 'extensions/src/ui/components/AccessDialog/utils/accessDialogTab';

export type AccessDialogProps = {
    entryId?: string;
    workbookId?: string;
    collectionId?: string;
    resourceTitle?: string;
    canUpdate: boolean;
    onClose?: () => void;
    defaultTab?: AccessDialogTab;
};
