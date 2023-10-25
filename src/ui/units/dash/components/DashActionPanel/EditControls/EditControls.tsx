import React from 'react';

import {Gear} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DashboardActionPanelControlsQa} from 'shared/constants/qa/dash';

import EntryDialogues from '../../../../../components/EntryDialogues/EntryDialogues';
import NavigationPrompt from '../../../../../components/NavigationPrompt/NavigationPrompt';
import {Description} from '../Description/Description';
import {SaveDropDown} from '../SaveDropDown/SaveDropDown';

import '../DashActionPanel.scss';

const b = block('dash-action-panel');
const i18n = I18n.keyset('dash.action-panel.view');

type EditControlsProps = {
    revId?: string;
    publishedId?: string;
    onSaveAndPublishDashClick: () => void;
    onSaveAsDraftDashClick: () => void;
    onSaveAsNewClick: () => void;
    onOpenDialogSettingsClick: () => void;
    onOpenDialogConnectionsClick: () => void;
    onCancelClick: () => void;
    onOpenDialogTabsClick: () => void;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
    isDraft: boolean;
    isRenameWithoutReload?: boolean;
    loading: boolean;
};

export const EditControls = (props: EditControlsProps) => {
    const {
        revId,
        publishedId,
        onSaveAndPublishDashClick,
        onSaveAsDraftDashClick,
        onSaveAsNewClick,
        onOpenDialogSettingsClick,
        onOpenDialogConnectionsClick,
        onOpenDialogTabsClick,
        entryDialoguesRef,
        isDraft,
        isRenameWithoutReload,
        onCancelClick,
        loading,
    } = props;

    const isCurrentRevisionActual = revId === publishedId;

    const defaultButtonSaveText = isCurrentRevisionActual ? 'button_save' : 'button_save-as-draft';
    const defaultButtonSaveHandler = isCurrentRevisionActual
        ? onSaveAndPublishDashClick
        : onSaveAsDraftDashClick;
    const defaultButtonSaveQA = isCurrentRevisionActual
        ? 'action-button-save'
        : 'action-button-save-as-draft';

    const savingControls = (
        <React.Fragment>
            <Button view="outlined" size="m" onClick={onCancelClick} qa="action-button-cancel">
                {i18n('button_cancel')}
            </Button>
            <div className={b('buttons-save-wrapper')}>
                <Button
                    className={b('button-save')}
                    view="action"
                    size="m"
                    loading={loading}
                    disabled={!isDraft}
                    onClick={defaultButtonSaveHandler}
                    qa={defaultButtonSaveQA}
                >
                    {i18n(defaultButtonSaveText)}
                </Button>
                <SaveDropDown
                    isActualRevision={isCurrentRevisionActual}
                    onSavePublishClick={onSaveAndPublishDashClick}
                    onSaveDraftClick={onSaveAsDraftDashClick}
                    onSaveAsNewClick={onSaveAsNewClick}
                />
            </div>
        </React.Fragment>
    );

    return (
        <React.Fragment>
            <Button
                view="flat"
                size="m"
                onClick={onOpenDialogSettingsClick}
                title={i18n('button_settings')}
                qa={DashboardActionPanelControlsQa.SettingsButton}
            >
                <Icon data={Gear} height={18} width={18} />
            </Button>
            <Description canEdit={true} entryDialoguesRef={entryDialoguesRef} />
            <Button
                view="normal"
                size="m"
                onClick={onOpenDialogConnectionsClick}
                qa="action-button-connections"
            >
                {i18n('button_connections')}
            </Button>
            <Button view="normal" size="m" onClick={onOpenDialogTabsClick} qa="action-button-tabs">
                {i18n('button_tabs')}
            </Button>
            {savingControls}
            <NavigationPrompt key="navigation-prompt" when={isDraft && !isRenameWithoutReload} />
            <EntryDialogues ref={entryDialoguesRef} />
        </React.Fragment>
    );
};
