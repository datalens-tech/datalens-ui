import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import EntryDialogues from '../../../../../components/EntryDialogues/EntryDialogues';
import {DL} from '../../../../../constants/common';
import {isEmbeddedMode} from '../../../../../utils/embedded';
import {Description} from '../Description/Description';

import '../DashActionPanel.scss';

const i18n = I18n.keyset('dash.action-panel.view');

type ViewControlsProps = {
    canEdit: boolean;
    progress: boolean;
    isLoadingEditMode: boolean;
    onEditClick: () => void;
    onAccessClick: () => void;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
    isWorkbook?: boolean;
    showOpenedDescription: boolean;
};

export const ViewControls = (props: ViewControlsProps) => {
    const {
        canEdit,
        progress,
        isLoadingEditMode,
        onEditClick,
        onAccessClick,
        entryDialoguesRef,
        isWorkbook,
        showOpenedDescription,
    } = props;

    if (isEmbeddedMode()) {
        return null;
    }

    const isEditBtnLoading = progress || isLoadingEditMode;

    return (
        <React.Fragment>
            <Description
                canEdit={canEdit}
                onEditClick={onEditClick}
                showOpenedDescription={showOpenedDescription}
            />
            <EntryDialogues ref={entryDialoguesRef} />
            {canEdit && !DL.IS_MOBILE && (
                <Button
                    view="normal"
                    size="m"
                    loading={isEditBtnLoading}
                    onClick={() => onEditClick()}
                    qa="action-button-edit"
                >
                    {i18n('button_edit')}
                </Button>
            )}
            {!canEdit && !isWorkbook && (
                <Button view="normal" size="m" onClick={onAccessClick}>
                    {i18n('button_request-rights')}
                </Button>
            )}
        </React.Fragment>
    );
};
