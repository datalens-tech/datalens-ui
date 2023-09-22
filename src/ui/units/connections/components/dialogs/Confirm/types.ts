import type {
    DialogBodyProps,
    DialogFooterProps,
    DialogHeaderProps,
    DialogProps,
} from '@gravity-ui/uikit';

export type DialogConfirmProps = {
    description?: string;
    dialogProps?: Partial<Omit<DialogProps, 'open' | 'onClose'>>;
    headerProps?: DialogHeaderProps;
    bodyProps?: DialogBodyProps;
    footerProps?: Omit<DialogFooterProps, 'onClickButtonApply' | 'onClickButtonCancel'>;
    onClose: () => void;
    onApply: () => void;
};
