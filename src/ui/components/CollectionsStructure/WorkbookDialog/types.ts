import type {DialogFooterProps} from '@gravity-ui/uikit';

export type GetDialogFooterPropsOverride = (
    props: DialogFooterProps &
        Required<Pick<DialogFooterProps, 'textButtonCancel' | 'textButtonApply'>> & {
            qaApplyButton?: string;
        },
) => DialogFooterProps;
