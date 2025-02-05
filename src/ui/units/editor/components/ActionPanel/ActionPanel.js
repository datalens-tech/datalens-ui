import React from 'react';

import {Button, Icon, Label} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';
import {ActionPanel, SlugifyUrl, Utils, usePageTitle} from 'ui';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {AccessRightsUrlOpen} from '../../../../components/AccessRights/AccessRightsUrlOpen';
import {registry} from '../../../../registry';
import {MODULE_TYPE} from '../../constants/common';
import ButtonSave from '../../containers/ButtonSave/ButtonSave';
import ButtonDrawPreview from '../ButtonDrawPreview/ButtonDrawPreview';
import EntryTypeName from '../EntryTypeName/EntryTypeName';
import {GridSchemeSelect} from '../GridSchemeSelect/GridSchemeSelect';
import {RevisionsDiffDialog} from '../RevisionsDiff/RevisionsDiff';

import FileDiff from '../../../../assets/icons/file-diff.svg';

import './ActionPanel.scss';

const i18n = I18n.keyset('component.dialog-revisions.view');

const b = block('editor-action-panel');

function ActionPanelService({
    entry,
    schemeId,
    workbookId,
    onDrawPreview,
    onSelectGridScheme,
    isGridContainsPreview,
    history,
    setActualVersion,
    tabsData,
    scriptsValues,
    isScriptsChanged,
}) {
    usePageTitle({entry});

    const [selectedRevisionForDiff, setSelectedRevisionForDiff] =
        React.useState(/* <string | undefined> */);

    const renderRevisionItemActions = React.useCallback(
        (item /* : GetRevisionsEntry */, currentRevId /* : string */) /* : React.ReactNode */ => {
            if (item.revId === currentRevId) {
                return null;
            }

            return (
                <Button
                    view="clear"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRevisionForDiff(item.revId);
                    }}
                    title={i18n('button_show-revisions-diff')}
                >
                    <Icon size={16} data={FileDiff} />
                </Button>
            );
        },
        [],
    );

    if (!entry) {
        return null;
    }

    const rightItems = [
        <React.Fragment key="rightItems">
            <GridSchemeSelect
                className={b('grid-scheme-select')}
                value={schemeId}
                onChange={(newSchemeId) => onSelectGridScheme({schemeId: newSchemeId})}
            />
            {entry.type !== MODULE_TYPE && (
                <ButtonDrawPreview
                    className={b('btn-draw-preview')}
                    onDrawPreview={onDrawPreview}
                    disabled={!isGridContainsPreview}
                />
            )}
            <ButtonSave workbookId={workbookId} />
        </React.Fragment>,
    ];

    const ActionPanelButton = registry.editor.components.get('editor/ACTION_PANEL_BUTTON');

    const centerItems = [
        <React.Fragment key="additionalEntryItems">
            {isEnabledFeature('ShowEditorPreviewLabel') && (
                <Label theme="info" className={b('preview-label')}>
                    Preview
                </Label>
            )}
            <ActionPanelButton entry={entry} className={b('custom-button')} />
        </React.Fragment>,
    ];

    const leftItems = [
        <React.Fragment key="leftItems">
            <EntryTypeName entry={entry} />
        </React.Fragment>,
    ];

    return (
        <React.Fragment>
            {Boolean(entry) && !entry.fake && (
                <React.Fragment>
                    <SlugifyUrl
                        entryId={entry.entryId}
                        name={Utils.getEntryNameFromKey(entry.key)}
                        history={history}
                    />
                    <AccessRightsUrlOpen history={history} />
                </React.Fragment>
            )}
            <ActionPanel
                key={entry.key}
                entry={entry}
                leftItems={leftItems}
                centerItems={centerItems}
                rightItems={rightItems}
                setActualVersion={setActualVersion}
                hideOpenRevisionsButton={true}
                renderRevisionItemActions={renderRevisionItemActions}
            />
            <RevisionsDiffDialog
                visible={Boolean(selectedRevisionForDiff)}
                initialRevisionLeft={selectedRevisionForDiff}
                initialRevisionRight={entry.revId}
                onClose={() => setSelectedRevisionForDiff(undefined)}
                scriptsValues={scriptsValues}
                isScriptsChanged={isScriptsChanged}
                entry={entry}
                tabsData={tabsData}
            />
        </React.Fragment>
    );
}

ActionPanelService.propTypes = {
    entry: PropTypes.shape({
        key: PropTypes.string,
        entryId: PropTypes.string,
        type: PropTypes.string.isRequired,
        fake: PropTypes.bool,
        permissions: PropTypes.shape({
            read: PropTypes.bool,
            edit: PropTypes.bool,
            admin: PropTypes.bool,
        }),
    }),
    schemeId: PropTypes.string,
    workbookId: PropTypes.string,
    onDrawPreview: PropTypes.func.isRequired,
    onSelectGridScheme: PropTypes.func.isRequired,
    isGridContainsPreview: PropTypes.bool.isRequired,
    setActualVersion: PropTypes.func,

    history: PropTypes.object.isRequired,

    isScriptsChanged: PropTypes.bool,
    scriptsValues: PropTypes.object,
    tabsData: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            language: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            docs: PropTypes.shape({
                path: PropTypes.string.isRequired,
                title: PropTypes.string.isRequired,
            }),
        }),
    ),
};

export default ActionPanelService;
