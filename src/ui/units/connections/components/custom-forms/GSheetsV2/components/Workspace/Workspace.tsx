import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {parseError} from 'ui/utils/errors/parse';

import {Veil} from '../../../../../../../components/Veil/Veil';
import type {ApplySourceSettings} from '../../../../../store';
import {getGSheetErrorData} from '../../../../../utils';
import type {ErrorContentAction} from '../../../../ErrorView/ErrorView';
import {ErrorView} from '../../../../ErrorView/ErrorView';
import type {GSheetListItem, UpdateColumnFilter} from '../../types';

import {EmptyWorkspace} from './EmptyWorkspace';
import {GSheetSourceInfoWorkspace} from './GSheetSourceInfoWorkspace';
import {GSheetSourceWorkspace} from './GSheetSourceWorkspace';
import {GSheetWorkspace} from './GSheetWorkspace';
import {shouldToShowVeil} from './utils';

const b = block('conn-form-gsheets');
const i18n = I18n.keyset('connections.gsheet.view');

type WorkspaceProps = {
    columnFilter: string;
    selectedItem?: GSheetListItem;
    authorized?: boolean;
    updateColumnFilter: UpdateColumnFilter;
    updateSourceSettings: ApplySourceSettings;
    clickGoogleLoginButton: () => void;
};

export const Workspace = (props: WorkspaceProps) => {
    const {
        columnFilter,
        selectedItem,
        authorized,
        updateColumnFilter,
        updateSourceSettings,
        clickGoogleLoginButton,
    } = props;
    const showVeil = shouldToShowVeil(selectedItem);
    const mods = {
        empty: !selectedItem,
        readonly: selectedItem?.type === 'gsheetReadonlySource',
    };
    const content = React.useMemo(() => {
        if (!selectedItem) {
            return <EmptyWorkspace />;
        }

        if (selectedItem.error) {
            const {title, description} = getGSheetErrorData({
                type: selectedItem.type,
                error: selectedItem.error,
            });
            const errorStatus = parseError(selectedItem.error).status;
            const permissionDenied = errorStatus === 403;
            let action: ErrorContentAction | undefined;

            if (permissionDenied && !authorized) {
                action = {
                    text: i18n('button_google-login'),
                    buttonProps: {view: 'normal'},
                    handler: clickGoogleLoginButton,
                };
            }

            return (
                <ErrorView
                    className={b('workspace-error')}
                    error={selectedItem.error}
                    title={title}
                    description={description}
                    action={action}
                    showDebugInfo={!permissionDenied}
                />
            );
        }

        switch (selectedItem.type) {
            case 'uploadedGSheet': {
                return <GSheetWorkspace item={selectedItem} />;
            }
            case 'gsheetSourceInfo': {
                return <GSheetSourceInfoWorkspace item={selectedItem} />;
            }
            case 'gsheetEditableSource':
            case 'gsheetReadonlySource': {
                return (
                    <GSheetSourceWorkspace
                        columnFilter={columnFilter}
                        item={selectedItem}
                        updateColumnFilter={updateColumnFilter}
                        updateSourceSettings={updateSourceSettings}
                    />
                );
            }
            default: {
                return null;
            }
        }
    }, [
        columnFilter,
        selectedItem,
        authorized,
        updateColumnFilter,
        updateSourceSettings,
        clickGoogleLoginButton,
    ]);

    return (
        <div className={b('workspace', mods)}>
            {content}
            {showVeil && <Veil />}
        </div>
    );
};
