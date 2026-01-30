export type DialogEntryDescriptionProps = {
    title: string;
    subTitle?: string;
    canEdit?: boolean;
    isEditMode?: boolean;
    description?: string;
    maxLength?: number;
    onEdit?: (text: string) => void;
    onApply?: (text: string) => void;
    onCancel?: () => void;
    onCloseCallback?: () => void;
    onContactService?: () => void;
};
