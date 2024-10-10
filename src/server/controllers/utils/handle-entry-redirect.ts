import type {Response} from '@gravity-ui/expresskit';

import {EntryScope} from '../../../shared';
import type {GetEntryByKeyResponse} from '../../../shared/schema';

export function handleEntryRedirect(entry: GetEntryByKeyResponse, res: Response) {
    switch (entry.scope) {
        case EntryScope.Folder:
            return res.redirect(`/navigation/${entry.entryId}`);
        case EntryScope.Dataset:
            return res.redirect(`/datasets/${entry.entryId}`);
        case EntryScope.Widget:
            return res.redirect(`/wizard/${entry.entryId}`);
        case EntryScope.Dash:
            return res.redirect(`/${entry.entryId}`);
        case EntryScope.Connection:
            return res.redirect(`/connections/${entry.entryId}`);
        case EntryScope.Report:
            return res.redirect(`/reports/${entry.entryId}`);
        default:
            return res.redirect('/navigation');
    }
}
