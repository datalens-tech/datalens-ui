import type {EntryDialogProps} from 'ui/components/EntryDialogues';

export type DialogDashMetaProps = EntryDialogProps & {
    title: string;
    subTitle?: string;
    text?: string;
    maxLength?: number;
    isEditMode?: boolean;
    canEdit?: boolean;
    onApply?: (text: string) => void;
    onEdit?: (text: string) => void;
    onCancel?: () => void;
    onContactService?: () => void;
    onCloseCallback?: () => void;
};
