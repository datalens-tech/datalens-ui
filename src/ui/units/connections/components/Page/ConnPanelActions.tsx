import React from 'react';

import block from 'bem-cn-lite';
import type {WorkbookId} from 'shared';

import {CreateDatasetButton, CreateQlChartButton, S3BasedConnButton} from './components';

import './ConnPanelActions.scss';

type ConnPanelActionsProps = {
    entryId: string | null;
    entryKey: string;
    s3BasedFormOpened: boolean;
    workbookId?: WorkbookId;
};

const b = block('conn-panel-actions');

const ConnPanelActions = ({
    entryId,
    entryKey,
    s3BasedFormOpened,
    workbookId,
}: ConnPanelActionsProps) => {
    return (
        <div className={b()}>
            <CreateQlChartButton entryId={entryId} workbookId={workbookId} />
            <CreateDatasetButton entryId={entryId} entryKey={entryKey} />
            {s3BasedFormOpened && <S3BasedConnButton />}
        </div>
    );
};

export default ConnPanelActions;
