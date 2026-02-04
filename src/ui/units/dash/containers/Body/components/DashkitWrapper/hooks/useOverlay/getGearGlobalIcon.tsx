import React from 'react';

import {Gear, Globe, LayoutTabs} from '@gravity-ui/icons';
import block from 'bem-cn-lite';

import './OverlayControls.scss';

const b = block('dash-body-overlay-controls');

/**
 * Combined icon component that displays Gear (16px) with global icon (10px) overlaid in the top-right corner.
 * Returns SVG that can be used as IconProps['data'].
 * The Globe icon has a rounded border that adapts to the background color via CSS.
 */
export const getGearGlobalIcon = (iconProps: {type: 'allTabs' | 'selectedTabs'}) => {
    const GearGlobalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={16}
                height={16}
                fill="none"
                viewBox="0 0 20 20"
                className={b('gear-global-icon')}
                style={{overflow: 'visible'}}
                {...props}
            >
                <g transform="translate(2, 2)">
                    <Gear width={16} height={16} />
                </g>

                <circle
                    className={b('global-icon-background')}
                    cx="16"
                    cy="4"
                    r="5.5"
                    fill="var(--g-color-base-float)"
                />

                <g transform="translate(11, -1)">
                    {iconProps.type === 'allTabs' ? (
                        <Globe width={10} height={10} />
                    ) : (
                        <LayoutTabs width={10} height={10} />
                    )}
                </g>
            </svg>
        );
    };

    GearGlobalIcon.displayName = 'GearGlobalIcon';

    return GearGlobalIcon;
};
