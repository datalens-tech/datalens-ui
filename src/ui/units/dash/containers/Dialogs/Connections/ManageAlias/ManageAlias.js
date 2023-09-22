import React from 'react';

import {Xmark} from '@gravity-ui/icons';
import {Button, Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import intersection from 'lodash/intersection';
import PropTypes from 'prop-types';

import Context from '../Context/Context';
import Item from '../Item/Item';
import Param from '../Param/Param';

import './ManageAlias.scss';

const b = block('dialog-manage-alias');

function ManageAlias({visible, alias, onClose, onApply, removeAlias}) {
    if (!visible) {
        return null;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selectedParam, setSelectedParam] = React.useState(null);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [currentAlias, setCurrentAlias] = React.useState(alias);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {namespacedItems, metas} = React.useContext(Context);

    const affectedItems = namespacedItems
        .filter(({id}) => metas[id])
        .map((item) => ({
            ...item,
            intersection: intersection(metas[item.id].usedParams, currentAlias),
        }))
        .filter(
            ({intersection}) =>
                intersection.length && (!selectedParam || intersection.includes(selectedParam)),
        );

    return (
        <Dialog open={visible} onClose={onClose} autoclosable={false}>
            <Dialog.Header caption={i18n('dash.connections-dialog.edit', 'label_manage-alias')} />
            <Dialog.Body className={b()}>
                <div className={b('alias')}>
                    {currentAlias.map((param, index) => (
                        <React.Fragment key={index}>
                            <span
                                className={b('param', {selected: param === selectedParam})}
                                onClick={() =>
                                    setSelectedParam(param === selectedParam ? null : param)
                                }
                            >
                                <Param value={param} />
                                {selectedParam === param && currentAlias.length > 2 ? (
                                    <Icon
                                        data={Xmark}
                                        className={b('remove')}
                                        width="16"
                                        height="16"
                                        onClick={() => {
                                            setCurrentAlias(
                                                currentAlias.filter(
                                                    (param) => param !== selectedParam,
                                                ),
                                            );
                                            setSelectedParam(null);
                                        }}
                                    />
                                ) : null}
                            </span>
                            {index === currentAlias.length - 1 ? null : (
                                <span className={b('eq')}>=</span>
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <Dialog.Divider />
                <div className={b('influence')}>
                    <div className={b('caption')}>
                        {i18n('dash.connections-dialog.edit', 'label_alias-influence')}
                    </div>
                    {affectedItems.map(({id, intersection}) => (
                        <div className={b('affected')} key={id}>
                            <Item id={id} />
                            <span>
                                {intersection.map((param) => (
                                    <Param key={param} value={param} />
                                ))}
                            </span>
                        </div>
                    ))}
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                textButtonApply={i18n('dash.connections-dialog.edit', 'button_save')}
                textButtonCancel={i18n('dash.connections-dialog.edit', 'button_cancel')}
                onClickButtonApply={() => onApply(currentAlias)}
            >
                <Button view="outlined" size="l" onClick={removeAlias}>
                    {i18n('dash.connections-dialog.edit', 'button_remove-alias')}
                </Button>
            </Dialog.Footer>
        </Dialog>
    );
}

ManageAlias.propTypes = {
    alias: PropTypes.array,
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,
    removeAlias: PropTypes.func.isRequired,
};

export default ManageAlias;
