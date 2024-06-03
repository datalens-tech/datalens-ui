import React from 'react';

import {ArrowToggle, Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import type {CollapseProps} from './types';

import './Collapse.scss';

const b = block('dl-collapse');

export function Collapse({
    className,
    headerClassName,
    title,
    titleClassName,
    children,
    toolbar,
    toolbarClassName,
    contentClassName,
    arrowPosition = 'right',
    arrowView = 'icon',
    arrowQa,
    arrowClassName,
    emptyState = 'No data',
    titleSize = 'l',
    contentMarginTop = 12,
    defaultIsExpand = false,
    isSecondary = false,
    beforeExpandChange,
    isExpand: isControlledExpand,
    cacheContent,
}: CollapseProps) {
    const [isExpand, setIsExpand] = React.useState(isControlledExpand || defaultIsExpand);
    const [contentMounted, setContentMounted] = React.useState(false);

    React.useEffect(() => {
        if (isControlledExpand !== undefined) {
            beforeExpandChange?.(isControlledExpand);
            setIsExpand(isControlledExpand);
        }
    }, [beforeExpandChange, isControlledExpand]);

    const toggleExpand = React.useCallback(() => {
        const newExpandValue = !isExpand;

        beforeExpandChange?.(newExpandValue);

        setIsExpand(newExpandValue);
    }, [setIsExpand, isExpand, beforeExpandChange]);

    const initContent = React.useCallback((element: HTMLDivElement | null) => {
        if (element !== null) {
            setContentMounted(true);
        }
    }, []);

    const shouldRenderContent = children && (isExpand || (cacheContent && contentMounted));

    return (
        <div className={b({collapsed: !isExpand}, className)}>
            <div className={b('header', headerClassName)}>
                <div
                    className={b(
                        'panel',
                        {
                            'no-data': !children,
                        },
                        titleClassName,
                    )}
                    onClick={toggleExpand}
                >
                    {children && arrowPosition === 'left' && (
                        <CollapseToggler
                            arrowPosition={arrowPosition}
                            isSecondary={isSecondary}
                            arrowView={arrowView}
                            arrowQa={arrowQa}
                            arrowClassName={arrowClassName}
                            titleSize={titleSize}
                            isExpand={isExpand}
                        />
                    )}
                    {typeof title === 'string' ? (
                        <h2
                            className={b('title', {
                                size: titleSize,
                                secondary: isSecondary,
                            })}
                        >
                            {title}
                        </h2>
                    ) : (
                        title
                    )}
                    {children && arrowPosition === 'right' && (
                        <CollapseToggler
                            arrowPosition={arrowPosition}
                            isSecondary={isSecondary}
                            arrowView={arrowView}
                            arrowQa={arrowQa}
                            arrowClassName={arrowClassName}
                            titleSize={titleSize}
                            isExpand={isExpand}
                        />
                    )}
                </div>

                {toolbar && <div className={b('toolbar', toolbarClassName)}>{toolbar}</div>}
            </div>

            {!children && <h4 className={b('empty-state-title')}>{emptyState}</h4>}

            {shouldRenderContent && (
                <div
                    className={b('content', contentClassName)}
                    style={{marginTop: contentMarginTop}}
                    ref={initContent}
                >
                    {children}
                </div>
            )}
        </div>
    );
}

interface CollapseTogglerProps {
    isExpand: boolean;
    isSecondary: boolean;
    titleSize: 's' | 'm' | 'l';
    arrowView: 'icon' | 'button';
    arrowPosition: 'left' | 'right';
    arrowQa?: string;
    arrowClassName?: string;
}

const arrowSizes = {
    s: 14,
    m: 16,
    l: 20,
};

function CollapseToggler({
    arrowView,
    arrowPosition,
    arrowQa,
    arrowClassName,
    isSecondary,
    titleSize,
    isExpand,
}: CollapseTogglerProps) {
    const arrowDirection = isExpand ? 'top' : 'bottom';

    return (
        <div
            data-qa={arrowQa}
            className={b(
                'arrow-wrapper',
                {
                    secondary: isSecondary,
                    position: arrowPosition,
                },
                arrowClassName,
            )}
        >
            {arrowView === 'button' ? (
                <Button view="flat" className={b('arrow-button')} aria-expanded={isExpand}>
                    <ArrowToggle
                        className={b('arrow')}
                        direction={arrowDirection}
                        size={arrowSizes[titleSize]}
                    />
                </Button>
            ) : (
                <ArrowToggle
                    className={b('arrow')}
                    direction={arrowDirection}
                    size={arrowSizes[titleSize]}
                />
            )}
        </div>
    );
}
