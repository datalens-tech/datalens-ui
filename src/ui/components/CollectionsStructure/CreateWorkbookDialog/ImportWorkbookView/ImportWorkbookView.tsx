import React from 'react';

import block from 'bem-cn-lite';
import {ProgressBar} from 'ui/components/ProgressBar/ProgressBar';
import ViewError from 'ui/components/ViewError/ViewError';

import type {ImportExportStatus} from '../../types';

import './ImportWorkbookView.scss';

const b = block('import-workbook-file-view');

export type Props = {
    status?: ImportExportStatus;
    error: null | Error;
};

export const ImportWorkbookView: React.FC<Props> = ({status, error}) => {
    switch (status) {
        case 'loading':
            return <ProgressBar size="s" className={b('progress')} value={50} />;
        case 'success':
            return <div>Success</div>;
        case 'error':
        default:
            return <ViewError containerClassName={b('error-content')} error={error} size="s" />;
    }
};
