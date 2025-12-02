import type {SharedScope} from 'shared';

export enum ResourceType {
    Collection = 'collection',
    Workbook = 'workbook',
    SharedEntry = 'sharedEntry',
}

export type IamAccessDialogProps = {
    open: boolean;
    resourceId: string;
    resourceType: ResourceType;
    resourceTitle: string;
    resourceScope?: SharedScope;
    parentId: string | null;
    canUpdate: boolean;
    onClose: () => void;
};
