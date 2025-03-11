import type {DialogFooterProps} from '@gravity-ui/uikit';

export type GetDialogFooterProps = (
    props: DialogFooterProps & Required<Pick<DialogFooterProps, 'textButtonCancel'>>,
) => DialogFooterProps;
