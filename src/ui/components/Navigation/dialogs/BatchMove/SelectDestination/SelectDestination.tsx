import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import PathSelect from 'components/PathSelect/PathSelect';
import {I18n} from 'i18n';
import {EntryScope, normalizeDestination} from 'shared';
import Utils from 'utils';

import type {NavigationEntry} from '../../../../../../shared/schema';

import './SelectDestination.scss';

const b = block('dl-nav-move-select-destination');
const i18n = I18n.keyset('component.navigation.view');

export type SelectDestinationProps = {
    entries: NavigationEntry[];
    onSelectDestionation: (destination: string, hasChanges: boolean) => void;
    onClose: () => void;
};

export const SelectDestination = ({
    onClose,
    entries,
    onSelectDestionation,
}: SelectDestinationProps) => {
    const [path, setPath] = React.useState(() => Utils.getPathBefore({path: entries[0].key}));

    const inactiveEntryKeys: string[] | undefined = React.useMemo(() => {
        const folders = entries.filter((entry) => entry.scope === EntryScope.Folder);
        return folders.length > 0 ? folders.map((entry) => entry.key) : undefined;
    }, [entries]);

    const handleChoosePath = (value: string) => setPath(normalizeDestination(value));

    const handlerApplyClick = () => {
        const hasChanges = path !== Utils.getPathBefore({path: entries[0].key});
        onSelectDestionation(path, hasChanges);
    };

    return (
        <Dialog size="s" open={true} onClose={onClose}>
            <Dialog.Header caption={i18n('section_batch-move-select-destination')} />
            <Dialog.Body>
                <div className={b('content')}>
                    <PathSelect
                        size="l"
                        defaultPath={path}
                        withInput={false}
                        onChoosePath={handleChoosePath}
                        inactiveEntryKeys={inactiveEntryKeys}
                    />
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                textButtonCancel={i18n('button_cancel')}
                onClickButtonApply={handlerApplyClick}
                textButtonApply={i18n('button_apply')}
            />
        </Dialog>
    );
};
