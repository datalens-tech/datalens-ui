import * as React from 'react';

import block from 'bem-cn-lite';
import {RevisionsListQa} from 'shared';
import type {RevisionStatusKey} from 'ui/utils/revisions';

import './RevisionStatusPoint.scss';

const b = block('revision-status-point');

export function RevisionStatusPoint({
    status,
    className,
}: {
    status: RevisionStatusKey;
    className?: string;
}) {
    let qa;
    switch (status) {
        case 'draft':
            qa = RevisionsListQa.RevisionsListRowDraft;
            break;
        case 'notActual':
            qa = RevisionsListQa.RevisionsListRowNotActual;
            break;
        case 'published':
            qa = RevisionsListQa.RevisionsListRowActual;
            break;
    }

    return <span data-qa={qa} className={b({status}, className)} />;
}
