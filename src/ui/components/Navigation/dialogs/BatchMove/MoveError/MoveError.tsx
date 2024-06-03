import React from 'react';

import {TriangleExclamationFill} from '@gravity-ui/icons';
import {Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {EntriesList} from 'components/EntriesList/EntriesList';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {openDialogErrorWithTabs} from 'store/actions/dialog';

import type {NavigationEntry} from '../../../../../../shared/schema';
import type {ErrorItem} from '../types';

import './MoveError.scss';

const b = block('dl-nav-move-error');
const i18n = I18n.keyset('component.navigation.view');

type Props = {
    onClose: () => void;
    entries: NavigationEntry[];
    errors: ErrorItem[];
};

export const MoveError = ({onClose, entries, errors}: Props) => {
    const dispatch = useDispatch();

    const failedEntries = React.useMemo(() => {
        return errors.map(({itemIndex}) => entries[itemIndex]);
    }, [entries, errors]);

    const handleClickDetails = (itemIndex: number) => {
        dispatch(
            openDialogErrorWithTabs({
                title: i18n('section_batch-move-error'),
                error: errors[itemIndex].error,
                withReport: true,
            }),
        );
    };

    return (
        <React.Fragment>
            <Dialog open={true} onClose={onClose} className={b()}>
                <Dialog.Header
                    caption={i18n('section_batch-move-error')}
                    insertBefore={
                        <Icon
                            data={TriangleExclamationFill}
                            className={b('header-icon')}
                            height="24"
                            width="24"
                        />
                    }
                />
                <Dialog.Body>
                    <div className={b('content')}>
                        <EntriesList
                            className={b('list')}
                            entries={failedEntries}
                            renderAction={(_item, itemIndex) => (
                                <Button
                                    view="outlined"
                                    onClick={() => handleClickDetails(itemIndex)}
                                >
                                    {i18n('button_details')}
                                </Button>
                            )}
                        />
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    onClickButtonCancel={onClose}
                    textButtonCancel={i18n('button_close')}
                />
            </Dialog>
        </React.Fragment>
    );
};
