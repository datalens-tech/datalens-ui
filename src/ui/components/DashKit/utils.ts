import React from 'react';

import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {DL} from '../../constants';
import {
    CHARTKIT_ERROR_NODE_CLASSNAME,
    CHARTKIT_SCROLLABLE_NODE_CLASSNAME,
} from '../../libs/DatalensChartkit/ChartKit/helpers/constants';

import {MAX_AUTO_HEIGHT_PX} from './constants';

/*
    The description is taken from dashkit (removed from there), but the meaning has not changed much.

    In the method, we get a link to the PluginWidget component with the first argument,
    we access the corresponding DOM node, remove the necessary dimensions 
    (the height of the element taking into account the scroll (scrollHeight), 
    the offset of the scrollable element from the upper edge of the widget),
    having these dimensions and the height of the row grid (_gridLayout.rowhight),
    we get new values of the grid configuration parameters to adjust the height of element to grid
    so that the entire contents of the widget were visible (without a scrollbar).
    The MAX_AUTO_HEIGHT_PX constant is defined above - the maximum allowable value of the height of the widget,
    if the height of the grid element exceeds this value, the new height of the widget will not be as close as possible to MAX_AUTO_HEIGHT_PX because of config parameters.
    (due to the multiplicity of the height to the value of _gridLayout.Rowhight by a few pixels less)
    and the scroll will remain.

    @param {PluginWidget} widget - link to the PluginWidget component
    @param {boolean} needSetDefaultHeight - flag indicating that the default parameters/dimensions of the grid element
        need to be set (disabling auto-height)
*/

export type AdjustWidgetLayoutProps = {
    rootNode: React.RefObject<HTMLElement>;
    widgetId: string;
    needSetDefault?: boolean;
    gridLayout: PluginWidgetProps['gridLayout'];
    layout: PluginWidgetProps['layout'];
    cb: PluginWidgetProps['adjustWidgetLayout'];
};

const setNewLayout = ({
    gridLayout,
    layout,
    widgetId,
    cb,
    contentHeight,
    needSetDefault,
}: {
    gridLayout: AdjustWidgetLayoutProps['gridLayout'];
    layout: AdjustWidgetLayoutProps['layout'];
    widgetId: AdjustWidgetLayoutProps['widgetId'];
    cb: AdjustWidgetLayoutProps['cb'];
    needSetDefault: AdjustWidgetLayoutProps['needSetDefault'];
    contentHeight: number;
}) => {
    const {rowHeight, margin} = gridLayout;
    const newHeight = Math.ceil(contentHeight / (rowHeight + margin[1])) + 1;
    const correspondedLayoutItemIndex = layout.findIndex((layoutItem) => layoutItem.i === widgetId);
    const correspondedLayoutItem = layout[correspondedLayoutItemIndex];

    if (
        correspondedLayoutItem.h === newHeight &&
        correspondedLayoutItem.minH === newHeight &&
        correspondedLayoutItem.maxH === newHeight
    ) {
        // if the calculated parameters are already set in the config
        return;
    }

    const adjustedWidgetLayout = {
        ...correspondedLayoutItem,
        h: newHeight,
        maxH: newHeight,
        minH: newHeight,
    };

    cb({widgetId, needSetDefault, adjustedWidgetLayout});
};

export function adjustWidgetLayout({
    widgetId,
    rootNode,
    needSetDefault,
    gridLayout,
    layout,
    cb,
}: AdjustWidgetLayoutProps) {
    if (DL.IS_MOBILE || needSetDefault) {
        cb({widgetId, needSetDefault});
        return;
    }

    const node = rootNode.current;
    if (!node) {
        return;
    }

    const scrollableNode = node.querySelector(`.${CHARTKIT_SCROLLABLE_NODE_CLASSNAME}`);

    const errorNode = node.querySelector(`.${CHARTKIT_ERROR_NODE_CLASSNAME}`);

    if (errorNode && !scrollableNode) {
        const fullContentHeight = errorNode.scrollHeight;

        const contentHeight =
            fullContentHeight > MAX_AUTO_HEIGHT_PX ? MAX_AUTO_HEIGHT_PX : fullContentHeight;

        setNewLayout({
            contentHeight,
            gridLayout,
            layout,
            cb,
            widgetId,
            needSetDefault,
        });
        return;
    }

    if (!scrollableNode) {
        return;
    }

    const rootNodeTopPosition = node.getBoundingClientRect().top;
    const scrollableNodeTopPosition = scrollableNode.getBoundingClientRect().top;

    const scrollableNodeTopOffsetFromRoot = scrollableNodeTopPosition - rootNodeTopPosition;
    const belowLyingNodesHeight = collectBelowLyingNodesHeight(scrollableNode, node, 0);

    const {scrollHeight} = scrollableNode;

    // If widget has horizontal scroll, then we must add scrollBar height to fullContentHeight.
    // We consider that horizontal scrollBar is equal to vertical scrollBar,
    // so we could calculate horizontal scrollBar size.

    let scrollBar = 0;
    if (scrollableNode.scrollWidth > scrollableNode.clientWidth) {
        scrollBar = (scrollableNode as HTMLElement).offsetWidth - scrollableNode.clientWidth;
    }

    const fullContentHeight =
        scrollHeight + scrollableNodeTopOffsetFromRoot + belowLyingNodesHeight + scrollBar;

    const contentHeight =
        fullContentHeight > MAX_AUTO_HEIGHT_PX ? MAX_AUTO_HEIGHT_PX : fullContentHeight;

    setNewLayout({
        contentHeight,
        gridLayout,
        layout,
        cb,
        widgetId,
        needSetDefault,
    });
}

function collectBelowLyingNodesHeight(
    node: Element,
    limitNode: Element,
    currentHeight = 0,
): number {
    if (node === limitNode) {
        return currentHeight;
    }

    const nextSibling = node.nextElementSibling;
    let height = currentHeight;

    if (nextSibling) {
        height = currentHeight + nextSibling.getBoundingClientRect().height;
    }

    if (nextSibling && nextSibling.nextElementSibling) {
        return collectBelowLyingNodesHeight(nextSibling, limitNode, height);
    } else if (node.parentElement) {
        return collectBelowLyingNodesHeight(node.parentElement, limitNode, height);
    } else {
        return height;
    }
}
