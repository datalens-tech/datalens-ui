import * as React from 'react';

import block from 'bem-cn-lite';
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
    return <span className={b({status}, className)} />;
}
