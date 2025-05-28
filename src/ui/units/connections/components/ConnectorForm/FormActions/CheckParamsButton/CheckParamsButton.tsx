import React from 'react';

import type {ButtonButtonProps} from '@gravity-ui/uikit';
import {Button, Icon, Popover} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {CheckData} from '../../../../store';

import iconError from 'ui/assets/icons/error.svg';
import iconOkay from 'ui/assets/icons/okay.svg';

import './CheckParamsButton.scss';

const b = block('conn-form-check-params-button');
const i18n = I18n.keyset('connections.form');
const ICON_SIZE = 16;

type OwnProps = {
    checkData: CheckData;
    onTooltipActionButtonClick: () => void;
};
type CheckParamsButtonProps = ButtonButtonProps & OwnProps;

export const CheckParamsButton = (props: CheckParamsButtonProps) => {
    const {checkData, loading, disabled, onClick, onTooltipActionButtonClick} = props;

    return (
        <div className={b()}>
            <Button
                size="l"
                view="outlined"
                loading={loading}
                disabled={disabled}
                onClick={onClick}
            >
                {i18n('button_verify')}
            </Button>
            {checkData.status !== 'unknown' && (
                <Popover
                    disabled={checkData.status !== 'error'}
                    className={b('tooltip')}
                    tooltipActionButton={{
                        text: i18n('button_details'),
                        onClick: onTooltipActionButtonClick,
                    }}
                    content={i18n('toast_verify-error')}
                >
                    <Icon
                        className={b('icon')}
                        data={checkData.status === 'error' ? iconError : iconOkay}
                        size={ICON_SIZE}
                    />
                </Popover>
            )}
        </div>
    );
};
