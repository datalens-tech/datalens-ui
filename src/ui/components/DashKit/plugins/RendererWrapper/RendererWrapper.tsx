import React from 'react';

import block from 'bem-cn-lite';
import type {DashTabItemType} from 'shared';

import type {OnWidgetLoadDataHandler} from '../../context/WidgetContext';
import {useWidgetContext} from '../../context/WidgetContext';

import './RendererWrapper.scss';

const b = block('dashkit-plugin-container');

type RendererProps = {
    id: string;
    type: 'widget' | 'text' | 'title' | `${DashTabItemType.Image}`;
    nodeRef?: React.RefObject<HTMLDivElement>;
    classMod?: string;
    style?: React.CSSProperties;
    beforeContentNode?: React.ReactNode;
    children?: React.ReactNode;
};

type ChildrenProps = {
    onWidgetLoadData?: OnWidgetLoadDataHandler;
};

export const RendererWrapper: React.FC<RendererProps> = React.memo(
    ({children, type, nodeRef, classMod, beforeContentNode, ...props}) => {
        const innerNodeRef = React.useRef(null);
        const {onWidgetLoadData} = useWidgetContext({
            id: props.id,
            elementRef: nodeRef || innerNodeRef,
        });

        return (
            <React.Fragment>
                {beforeContentNode}
                <div
                    ref={nodeRef || innerNodeRef}
                    className={b('wrapper', {
                        [type]: Boolean(type),
                        [String(classMod)]: Boolean(classMod),
                    })}
                    {...props}
                >
                    {React.Children.map(children, (child) => {
                        return React.isValidElement(child)
                            ? React.cloneElement(child, {
                                  onWidgetLoadData,
                              } as Partial<ChildrenProps>)
                            : child;
                    })}
                </div>
            </React.Fragment>
        );
    },
);

RendererWrapper.displayName = 'RendererWrapper';
