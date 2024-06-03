import type {GetEntryResponse} from '../../../../../../shared/schema';
import type {EntryDialogOnClose} from '../../../../../components/EntryDialogues';

export type AccessRightsProps = {
    onClose: EntryDialogOnClose;
    visible: boolean;
    entry: GetEntryResponse;
    notFoundApproveRequest?: boolean;
    showCustomAccess?: boolean;
};
