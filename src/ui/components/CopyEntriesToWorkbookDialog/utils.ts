import {EntryScope} from 'shared';

export const checkFileConnection = (entry: {scope: string; type: string}) => {
    return (
        entry.scope === EntryScope.Connection &&
        (entry.type === 'file' || entry.type === 'gsheets_v2' || entry.type === 'yadocs')
    );
};
