import React from 'react';

import {Dialog, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';

import Context from '../Context/Context';
import Item from '../Item/Item';

import './ConnectByAlias.scss';

const b = block('dialog-connect-by-alias');

function ConnectByAlias({firstItemId, secondItemId, visible, onClose, onApply}) {
    if (!visible) {
        return null;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const {metas, getParamTitle} = React.useContext(Context);

    const {usedParams: firstUsedParams} = metas[firstItemId];
    const {usedParams: secondUsedParams} = metas[secondItemId];

    let firstParamDefault = firstUsedParams.length === 1 ? firstUsedParams[0] : null;
    let secondParamDefault = secondUsedParams.length === 1 ? secondUsedParams[0] : null;

    if (firstParamDefault) {
        const intersection = secondUsedParams.filter(
            (param) => param === firstParamDefault || getParamTitle(param) === firstParamDefault,
        );
        secondParamDefault = intersection.length ? intersection[0] : secondParamDefault;
    } else if (secondParamDefault) {
        const intersection = firstUsedParams.filter(
            (param) => param === secondParamDefault || getParamTitle(param) === secondParamDefault,
        );
        firstParamDefault = intersection.length ? intersection[0] : firstParamDefault;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [firstParam, setFirstParam] = React.useState(firstParamDefault);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [secondParam, setSecondParam] = React.useState(secondParamDefault);

    return (
        <Dialog open={visible} onClose={onClose} autoclosable={false}>
            <Dialog.Header caption={i18n('dash.connections-dialog.edit', 'label_alias')} />
            <Dialog.Body className={b()}>
                <div className={b('column')}>
                    <Item id={firstItemId} />
                    <Select
                        filterable
                        placeholder="—"
                        filterPlaceholder={i18n('dash.control-dialog.edit', 'placeholder_search')}
                        popupClassName={b('select-popup')}
                        value={firstParam ? [firstParam] : undefined}
                        options={firstUsedParams.map((id) => ({
                            value: id,
                            content: getParamTitle(id),
                        }))}
                        onUpdate={([value]) => setFirstParam(value)}
                    />
                </div>
                <div className={b('column')}>
                    <div />
                    <div>=</div>
                </div>
                <div className={b('column')}>
                    <Item id={secondItemId} />
                    <Select
                        qa="connect-by-alias-to-select"
                        filterable
                        filterPlaceholder={i18n('dash.control-dialog.edit', 'placeholder_search')}
                        popupClassName={b('select-popup')}
                        placeholder="—"
                        value={secondParam ? [secondParam] : undefined}
                        options={secondUsedParams.map((id) => ({
                            value: id,
                            content: getParamTitle(id),
                        }))}
                        onUpdate={([val]) => setSecondParam(val)}
                    />
                </div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                textButtonApply={i18n('dash.connections-dialog.edit', 'button_add')}
                textButtonCancel={i18n('dash.connections-dialog.edit', 'button_cancel')}
                onClickButtonApply={() => onApply(firstParam, secondParam)}
                propsButtonCancel={{qa: 'connect-by-alias-dialog-cancel-button'}}
                propsButtonApply={{qa: 'connect-by-alias-dialog-apply-button'}}
            />
        </Dialog>
    );
}
ConnectByAlias.propTypes = {
    firstItemId: PropTypes.string,
    secondItemId: PropTypes.string,
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,
};

export default ConnectByAlias;
