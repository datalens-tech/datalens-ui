import {GetEntryResponse} from '../../../../../../shared/schema';
import {EntryDialogOnClose} from '../../../../../components/EntryDialogues';

export type AccessRightsProps = {
    onClose: EntryDialogOnClose;
    visible: boolean;
    entry: GetEntryResponse;
    notFoundApproveRequest?: boolean;
    showCustomAccess?: boolean;
};
