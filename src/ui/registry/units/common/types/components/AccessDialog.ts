import type {SharedScope} from 'shared';

import type {ResourceType} from './IamAccessDialog';

export type AccessDialogProps = {
    resourceId: string;
    parentId?: string | null;
    resourceType: ResourceType;
    resourceScope?: SharedScope;
    resourceTitle?: string;
    canUpdateAccessBindings: boolean;
    onClose?: () => void;
    defaultTab?: string;
};
