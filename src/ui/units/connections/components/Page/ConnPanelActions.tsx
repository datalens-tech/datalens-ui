import React from 'react';

import block from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {type WorkbookId} from 'shared';
import {registry} from 'ui/registry';

import {schemaLoadingSelector, uiSchemaSelector} from '../../store';

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
    const schemaLoading = useSelector(schemaLoadingSelector);
    const uiSchema = useSelector(uiSchemaSelector);
    const {showCreateEditorChartButton} = uiSchema || {};
    const {CreateEditorChartButton} = registry.connections.components.getAll();

    return schemaLoading ? null : (
        <div className={b()}>
            {showCreateEditorChartButton && entryId && (
                <CreateEditorChartButton entryId={entryId} workbookId={workbookId} />
            )}
            <CreateQlChartButton entryId={entryId} workbookId={workbookId} />
            <CreateDatasetButton entryId={entryId} entryKey={entryKey} />
            {s3BasedFormOpened && <S3BasedConnButton />}
        </div>
    );
};

export default ConnPanelActions;
