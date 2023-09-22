import React from 'react';

import {TriangleExclamationFill} from '@gravity-ui/icons';
import {Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {EntriesList} from 'components/EntriesList/EntriesList';
import {EntryDialogName, EntryDialogues} from 'components/EntryDialogues';
import {I18n} from 'i18n';

import type {NavigationEntry} from '../../../../../../shared/schema';

import './AccessError.scss';

const b = block('dl-nav-move-access-error');
const i18n = I18n.keyset('component.navigation.view');

type Props = {
    onClose: () => void;
    onNext: () => void;
    entries: NavigationEntry[];
};

export const AccessError = ({onClose, onNext, entries}: Props) => {
    const entryDialoguesRef = React.useRef<EntryDialogues>(null);

    const entriesWithoutEditRights = React.useMemo(() => {
        return entries.filter((entry) => entry.permissions.edit === false);
    }, [entries]);

    const hasButtonApply = entries.length !== entriesWithoutEditRights.length;

    const handleClickRequestRights = (item: NavigationEntry) => {
        entryDialoguesRef.current?.open({
            dialog: EntryDialogName.Unlock,
            dialogProps: {
                entry: item,
            },
        });
    };

    return (
        <React.Fragment>
            <Dialog open={true} onClose={onClose} className={b()}>
                <Dialog.Header
                    caption={i18n('section_batch-move-access-error')}
                    insertBefore={
                        <Icon
                            data={TriangleExclamationFill}
                            className={b('header-icon')}
                            size="24"
                        />
                    }
                />
                <Dialog.Body>
                    <div className={b('content')}>
                        <div className={b('description')}>
                            {i18n('label_batch-move-access-error-description')}
                        </div>
                        <EntriesList
                            className={b('list')}
                            entries={entriesWithoutEditRights}
                            renderAction={(item) => (
                                <Button
                                    view="outlined"
                                    onClick={() => handleClickRequestRights(item)}
                                >
                                    {i18n('button_request-rights')}
                                </Button>
                            )}
                        />
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={onClose}
                    textButtonCancel={hasButtonApply ? i18n('button_cancel') : i18n('button_close')}
                    onClickButtonApply={hasButtonApply ? onNext : undefined}
                    textButtonApply={hasButtonApply ? i18n('button_continue-anyway') : undefined}
                />
            </Dialog>
            <EntryDialogues ref={entryDialoguesRef} />
        </React.Fragment>
    );
};
