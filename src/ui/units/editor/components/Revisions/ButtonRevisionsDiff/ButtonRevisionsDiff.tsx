import React, {useState} from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {EditorEntry} from '../../../types/common';
import type {ScriptsValues, TabData} from '../../../types/store';
import {RevisionsDiffDialog} from '../../RevisionsDiff/RevisionsDiff';

const i18n = I18n.keyset('component.dialog-revisions.view');
const b = block('btn-revisions-diff');

interface ButtonRevisionsDiffProps {
    className?: string;
    scriptsValues: ScriptsValues;
    isScriptsChanged: boolean;
    entry: EditorEntry;
    tabsData: TabData[];
}

export const ButtonRevisionsDiff: React.FC<ButtonRevisionsDiffProps> = ({
    className,
    scriptsValues,
    isScriptsChanged,
    entry,
    tabsData,
}: ButtonRevisionsDiffProps) => {
    const [visible, toggleVisible] = useState<boolean>(false);

    return (
        <React.Fragment>
            <Button
                view="outlined"
                size="l"
                className={b(null, className)}
                onClick={() => toggleVisible(true)}
            >
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
        </React.Fragment>
    );
};
