export enum ResourceType {
    Collection = 'collection',
    Workbook = 'workbook',
}

export type IamAccessDialogProps = {
    open: boolean;
    resourceId: string;
    resourceType: ResourceType;
    resourceTitle: string;
    parentId: string | null;
    canUpdate: boolean;
    onClose: () => void;
};
