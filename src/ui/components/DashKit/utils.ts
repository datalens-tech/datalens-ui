import type React from 'react';

import type {PluginWidgetProps} from '@gravity-ui/dashkit';
import type {DashTabItemControlElement} from 'shared';
import {CustomPaletteColors} from 'ui/units/dash/containers/Dialogs/components/PaletteBackground/PaletteBackground';

import {DL} from '../../constants';
import {
    CHARTKIT_ERROR_NODE_CLASSNAME,
    CHARTKIT_MAIN_CLASSNAME,
    CHARTKIT_SCROLLABLE_NODE_CLASSNAME,
} from '../../libs/DatalensChartkit/ChartKit/helpers/constants';

import {FIXED_GROUP_HEADER_ID, MAX_AUTO_HEIGHT_PX, MIN_AUTO_HEIGHT_PX} from './constants';

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
    mainNodeSelector?: string;
    scrollableNodeSelector?: string;
    needHeightReset?: boolean;
};

const getScrollbarWidth = (node: HTMLElement) => node.offsetWidth - node.clientWidth;

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
    // contentHeight = n * rowHeight + (n - 1) * margin[y], where n is number of grid rows
    const newHeight = Math.ceil((contentHeight + margin[1]) / (rowHeight + margin[1]));
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

const setOverflowYStyle = (node: HTMLElement, value: string) => {
    const st = node.getAttribute('style');
    // If there are inline styles, we adding scrollY style in the end with !important
    node.setAttribute(
        'style',
        `${st || ''}${!st || st?.endsWith(';') ? '' : ';'}overflow-y: ${value} !important;`,
    );

    return () => {
        if (st) {
            node.setAttribute('style', st);
        } else {
            node.removeAttribute('style');
        }
    };
};

const setStyle = (node: HTMLElement, name: string, value: string) => {
    const st = node.getAttribute('style');
    // If there are inline styles, we adding scrollY style in the end with !important
    node.setAttribute(
        'style',
        `${st || ''}${!st || st?.endsWith(';') ? '' : ';'}${name}: ${value} !important;`,
    );

    return () => {
        if (st) {
            node.setAttribute('style', st);
        } else {
            node.removeAttribute('style');
        }
    };
};

// eslint-disable-next-line complexity
export function adjustWidgetLayout({
    widgetId,
    rootNode,
    needSetDefault,
    gridLayout,
    layout,
    cb,
    mainNodeSelector,
    scrollableNodeSelector,
    needHeightReset,
}: AdjustWidgetLayoutProps) {
    const correspondedLayoutItem = layout.find(({i}) => i === widgetId);
    const isFixedHeaderGroupLine = correspondedLayoutItem?.parent === FIXED_GROUP_HEADER_ID;

    if (DL.IS_MOBILE || (needSetDefault && !isFixedHeaderGroupLine)) {
        cb({widgetId, needSetDefault});
        return;
    }

    const node = rootNode.current;
    if (!node) {
        return;
    }

    const prevHeight = '100%';
    if (needHeightReset) {
        setStyle(node, 'height', 'auto');
    }

    // Disabling auto-size for grid line widgets
    if (isFixedHeaderGroupLine) {
        cb({
            widgetId,
            needSetDefault: false,
            adjustedWidgetLayout: {
                ...correspondedLayoutItem,
            },
        });
        return;
    }

    const scrollableNode = node.querySelector(
        scrollableNodeSelector || `.${CHARTKIT_SCROLLABLE_NODE_CLASSNAME}`,
    ) as HTMLElement | null;
    const mainNode = node.querySelector(mainNodeSelector || `.${CHARTKIT_MAIN_CLASSNAME}`);
    const errorNode = node.querySelector(`.${CHARTKIT_ERROR_NODE_CLASSNAME}`);

    const rootNodeTopPosition = node.getBoundingClientRect().top;

    if (errorNode && !scrollableNode) {
        const errorOffsetFromRoot = errorNode.getBoundingClientRect().top - rootNodeTopPosition;
        const fullContentHeight = errorNode.scrollHeight + errorOffsetFromRoot;

        const contentHeight =
            fullContentHeight > MAX_AUTO_HEIGHT_PX ? MAX_AUTO_HEIGHT_PX : fullContentHeight;

        setNewLayout({
            contentHeight: Math.max(MIN_AUTO_HEIGHT_PX, contentHeight),
            gridLayout,
            layout,
            cb,
            widgetId,
            needSetDefault,
        });
        if (needHeightReset) {
            setStyle(node, 'height', prevHeight);
        }
        return;
    }

    if (!scrollableNode) {
        if (needHeightReset) {
            setStyle(node, 'height', prevHeight);
        }
        return;
    }

    const scrollableNodeTopPosition = scrollableNode.getBoundingClientRect().top;
    const scrollableNodeTopOffsetFromRoot = scrollableNodeTopPosition - rootNodeTopPosition;
    const belowLyingNodesHeight = collectBelowLyingNodesHeight(scrollableNode, node, 0);

    // Calculating scrollHeight without scroll and scrollbar width
    let scrollBar = getScrollbarWidth(scrollableNode);
    let scrollHeight = scrollableNode.scrollHeight;

    if (scrollBar > 0) {
        // If scrollBar is presented and there is scalable content
        // calculating height without scroll
        const reset = setOverflowYStyle(scrollableNode, 'hidden');
        scrollHeight = scrollableNode.scrollHeight;
        scrollBar = scrollableNode.clientWidth >= scrollableNode.scrollWidth ? 0 : scrollBar;
        reset();
    } else if (scrollableNode.clientWidth < scrollableNode.scrollWidth) {
        // if scrollbar hidden but content is bigger that container
        // we assuming that horizaontal scroll is equal to vertical
        const reset = setOverflowYStyle(scrollableNode, 'scroll');
        scrollBar = getScrollbarWidth(scrollableNode);
        reset();
    }

    // Getting additional bottom paddings and margins around mainNode
    // for example tables spacing around scrollableNode
    const additionalPaddings =
        mainNode && mainNode.parentElement
            ? mainNode.parentElement.getBoundingClientRect().bottom -
              mainNode.getBoundingClientRect().bottom
            : 0;

    const fullContentHeight =
        scrollableNodeTopOffsetFromRoot +
        scrollHeight +
        scrollBar +
        belowLyingNodesHeight +
        additionalPaddings;

    const contentHeight =
        fullContentHeight > MAX_AUTO_HEIGHT_PX ? MAX_AUTO_HEIGHT_PX : fullContentHeight;

    setNewLayout({
        contentHeight: Math.max(MIN_AUTO_HEIGHT_PX, contentHeight),
        gridLayout,
        layout,
        cb,
        widgetId,
        needSetDefault,
    });
    if (needHeightReset) {
        setStyle(node, 'height', prevHeight);
    }
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

export function getControlHint(source: DashTabItemControlElement) {
    return source.showHint ? source.hint : undefined;
}

export function getPreparedWrapSettings(showBgColor: boolean, color?: string) {
    const wrapperClassMod =
        (showBgColor &&
            (color === CustomPaletteColors.LIKE_CHART ? 'with-default-color' : 'with-color')) ||
        '';

    const style = showBgColor
        ? {
              backgroundColor: color === CustomPaletteColors.LIKE_CHART ? undefined : color,
          }
        : {};

    return {
        classMod: wrapperClassMod,
        style,
    };
}
