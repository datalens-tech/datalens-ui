import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {ActionPanel, SlugifyUrl, Utils, usePageTitle} from 'ui';

import {AccessRightsUrlOpen} from '../../../../components/AccessRights/AccessRightsUrlOpen';
import {registry} from '../../../../registry';
import {MODULE_TYPE} from '../../constants/common';
import ButtonSave from '../../containers/ButtonSave/ButtonSave';
import ButtonDrawPreview from '../ButtonDrawPreview/ButtonDrawPreview';
import EntryLabel from '../EntryLabel/EntryLabel';
import EntryTypeName from '../EntryTypeName/EntryTypeName';
import {GridSchemeSelect} from '../GridSchemeSelect/GridSchemeSelect';

import './ActionPanel.scss';

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
}) {
    usePageTitle({entry});

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
            <ActionPanelButton entry={entry} className={b('custom-button')} />
            <EntryLabel entry={entry} />
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
};

export default ActionPanelService;
