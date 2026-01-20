import type {ResourceType} from './IamAccessDialog';

export type AccessDialogProps = {
    resourceId: string;
    parentId?: string | null;
    resourceType: ResourceType;
    resourceTitle?: string;
    canUpdateAccessBindings: boolean;
    onClose?: () => void;
    defaultTab?: string;
};
