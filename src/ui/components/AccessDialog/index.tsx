import type {AccessDialogProps} from 'ui/registry/units/common/types/components/AccessDialog';

export const DIALOG_ACCESS = Symbol('DIALOG_ACCESS');

export type OpenDialogAccessDialogArgs = {
    id: typeof DIALOG_ACCESS;
    props: AccessDialogProps;
};
