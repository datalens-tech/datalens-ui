import React from 'react';

import {HelpPopover} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import PropTypes from 'prop-types';
import {ControlQA} from 'shared';
import {DL} from 'ui/constants';
import {useMarkdown} from 'ui/hooks/useMarkdown';
import {isMobileView} from 'ui/utils/mobile';

import {CONTROL_TYPE} from '../../../modules/constants/constants';

const b = block('chartkit-control-item');

const Markdown = (props) => {
    const {markdown} = useMarkdown({value: props.value});
    return <React.Fragment>{markdown}</React.Fragment>;
};

function withWrapForControls(WrappedComponent) {
    function WithWrapForControls(props) {
        const {
            type,
            width,
            hidden,
            label,
            labelInside,
            className,
            style,
            renderOverlay,
            labelClassName,
            hint,
        } = props;

        if (hidden) {
            return null;
        }

        const showLabel =
            label &&
            !labelInside &&
            type !== CONTROL_TYPE.BUTTON &&
            type !== CONTROL_TYPE.CHECKBOX &&
            type !== CONTROL_TYPE.TEXTAREA;

        const customStyle = style || {width};
        const controlStyle = DL.IS_MOBILE ? {width: '100%'} : customStyle;

        return (
            <div
                className={b('control', {mobile: isMobileView}, className)}
                style={controlStyle}
                data-qa={ControlQA.chartkitControl}
            >
                {renderOverlay?.()}
                {showLabel && (
                    <span
                        className={b('title', labelClassName)}
                        data-qa={ControlQA.controlLabel}
                        title={label}
                    >
                        {label}
                        {hint && (
                            <HelpPopover
                                content={<Markdown value={hint} />}
                                className={b('hint')}
                            />
                        )}
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
