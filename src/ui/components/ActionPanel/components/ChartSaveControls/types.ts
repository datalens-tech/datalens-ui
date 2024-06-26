import type {ButtonView, IconData} from '@gravity-ui/uikit';

export type AdditionalButtonTemplate = {
    key: string;
    action: () => void;
    text?: string;
    textClassName?: string;
    className?: string;
    icon?: {
        data: IconData;
        size?: number;
        className?: string;
    };
    hidden?: boolean;
    loading?: boolean;
    view?: ButtonView;
    disabled?: boolean;
    qa?: string;
    title?: string;
    hotkey?: string;
};
