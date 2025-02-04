import React, {useState} from 'react';

import {Button, spacing} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import type {EditorEntry} from '../../types/common';
import type {ScriptsValues, TabData} from '../../types/store';
import {RevisionsDiffDialog} from '../RevisionsDiff/RevisionsDiff';

const i18n = I18n.keyset('component.dialog-revisions.view');

interface ButtonRevisionsDiffProps {
    scriptsValues: ScriptsValues;
    isScriptsChanged: boolean;
    entry: EditorEntry;
    tabsData: TabData[];
}

export const ButtonRevisionsDiff: React.FC<ButtonRevisionsDiffProps> = ({
    scriptsValues,
    isScriptsChanged,
    entry,
    tabsData,
}: ButtonRevisionsDiffProps) => {
    const [visible, toggleVisible] = useState<boolean>(false);

    return (
        <div className={spacing({pt: 1, px: 2, pb: 2})}>
            <Button view="outlined" size="l" width="auto" onClick={() => toggleVisible(true)}>
                {i18n('button_show-revisions-diff')}
            </Button>
            <RevisionsDiffDialog
                visible={visible}
                onClose={() => toggleVisible(false)}
                scriptsValues={scriptsValues}
                isScriptsChanged={isScriptsChanged}
                entry={entry}
                tabsData={tabsData}
            />
        </div>
    );
};
