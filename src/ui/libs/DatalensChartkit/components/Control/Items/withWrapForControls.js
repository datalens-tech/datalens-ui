import React from 'react';

import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {ControlQA} from 'shared';
import {CONTROL_WIDTH_PROPERTY} from 'ui/units/dash/modules/constants';
import {isMobileView} from 'ui/utils/mobile';

import {CONTROL_TYPE} from '../../../modules/constants/constants';

const b = block('chartkit-control-item');

function withWrapForControls(WrappedComponent) {
    function WithWrapForControls(props) {
        const {type, width, hidden, label, labelInside, className} = props;

        if (hidden) {
            return null;
        }

        const controlWidth = width || undefined;

        const showLabel =
            label &&
            !labelInside &&
            type !== CONTROL_TYPE.BUTTON &&
            type !== CONTROL_TYPE.CHECKBOX &&
            type !== CONTROL_TYPE.TEXTAREA;

        return (
            <div
                className={b('control', {mobile: isMobileView}, className)}
                style={{[CONTROL_WIDTH_PROPERTY]: controlWidth}}
                data-qa={ControlQA.chartkitControl}
            >
                {showLabel && (
                    <span className={b('title')} data-qa={ControlQA.controlLabel}>
                        {label}
                    </span>
                )}
                <WrappedComponent {...props} />
            </div>
        );
    }

    WithWrapForControls.propTypes = {
        ...WrappedComponent.propTypes,
        type: PropTypes.oneOf(Object.values(CONTROL_TYPE)).isRequired,
        label: PropTypes.string,
        labelInside: PropTypes.bool,
        innerLabel: PropTypes.string,
        className: PropTypes.string,
        hidden: PropTypes.bool,
        width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    };

    return WithWrapForControls;
}

export default withWrapForControls;
