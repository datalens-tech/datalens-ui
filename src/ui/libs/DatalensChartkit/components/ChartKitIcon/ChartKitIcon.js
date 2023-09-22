import React from 'react';

import PropTypes from 'prop-types';

import {ICONS_MENU_DEFAULT_SIZE} from '../../menu/MenuItems';

// not Icon because Button looks at the name of the component and compares it with Icon
// The logic from uikit/Icon is taken as the basis for the render (when refactoring, see why you can't use Icon from uikit and what does Button have to do with it)
function ChartKitIcon(params) {
    const {
        name,
        size = ICONS_MENU_DEFAULT_SIZE,
        viewBoxSize = ICONS_MENU_DEFAULT_SIZE,
        className,
        onClick,
        fill = 'currentColor',
        fillOpacity = '1',
        stroke,
        qa = '',
    } = params;
    const width = params.width || size;
    const height = params.height || size;

    const data = params.data;

    const props = {
        xmlns: 'http://www.w3.org/2000/svg',
        xmlnsXlink: 'http://www.w3.org/1999/xlink',
        width,
        height,
        className,
        onClick,
        fill,
        stroke,
        fillOpacity,
        'data-qa': qa,
    };
    const IconComponent = typeof data === 'function' ? data() : data;
    if (IconComponent.defaultProps) {
        IconComponent.defaultProps.width = IconComponent.defaultProps.height = undefined;
    }
    return (
        <svg {...props} viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} data-icon={name}>
            {IconComponent}
        </svg>
    );
}

ChartKitIcon.propTypes = {
    size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    viewBoxSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    className: PropTypes.string,
    onClick: PropTypes.func,
    fill: PropTypes.string,
    stroke: PropTypes.string,
    qa: PropTypes.string,
    data: PropTypes.func,
};

ChartKitIcon.defaultProps = {
    size: 16,
    viewBoxSize: 16,
    className: '',
    onClick: () => {},
};

export default ChartKitIcon;
