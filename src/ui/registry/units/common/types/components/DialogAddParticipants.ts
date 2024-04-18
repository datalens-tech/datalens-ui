import {EntryFields} from 'shared/schema';

export type DialogAddParticipantsProps = {
    onClose: () => void;
    onSuccess: () => void;
    visible: boolean;
    entry: Pick<EntryFields, 'entryId' | 'key' | 'scope' | 'type'>;
    mode?: 'add' | 'request';
    showParticipantsRequests?: boolean;
    showOwners?: boolean;
    showCustomAccess?: boolean;
};
