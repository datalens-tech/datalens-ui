import React from 'react';

import type {ThemeType} from '@gravity-ui/uikit';
import {color as d3Color} from 'd3-color';
import type {BackgroundSettings, OldBackgroundSettings} from 'shared';
import type {CommonVisualSettings} from 'ui/components/DashKit/DashKit';
import {getResultedBgColor} from 'ui/components/DashKit/utils';
import {computeColorFromToken} from 'ui/utils/widgetColors';

interface CalculateInternalMarginsParams {
    resultedHexWidgetColor: string | undefined;
    dashBackground?: OldBackgroundSettings;
    dashBackgroundSettings?: BackgroundSettings;
    themeType: ThemeType;
}

export function useInternalMarginsEnabled({
    dashSettings,
    currentValue,
}: {
    dashSettings: CommonVisualSettings;
    currentValue?: boolean;
}) {
    const [internalMarginsEnabled, setInternalMarginsEnabled] = React.useState(currentValue);

    return {
        internalMarginsEnabled,
        setInternalMarginsEnabled,
        initialDisabledValue: dashSettings.widgetsSettings?.internalMarginsEnabled ?? true,
    };
}

export function calculateInternalMarginsEnabled({
    resultedHexWidgetColor,
    dashBackground,
    dashBackgroundSettings,
    themeType,
}: CalculateInternalMarginsParams): boolean {
    const bodyStyles = getComputedStyle(document.body);
    const orgDashBgColor = bodyStyles.getPropertyValue('--dl-color-dashboard-background').trim();
    const orgWidgetBgColor = bodyStyles.getPropertyValue('--dl-color-widget-background').trim();

    const finalWidgetBgHexColor = resultedHexWidgetColor ?? computeColorFromToken(orgWidgetBgColor);

    const resultedHexDashBgColor = computeColorFromToken(
        getResultedBgColor(dashBackground, themeType, undefined, dashBackgroundSettings),
    );

    const finalDashBgHexColor = resultedHexDashBgColor ?? computeColorFromToken(orgDashBgColor);

    return !shouldDisableInternalMargins(finalWidgetBgHexColor, finalDashBgHexColor);
}

function shouldDisableInternalMargins(
    widgetBgHexColor: string | undefined,
    dashBgHexColor: string | undefined,
): boolean {
    const isWidgetTransparent =
        !widgetBgHexColor || (d3Color(widgetBgHexColor)?.opacity ?? 0) === 0;

    let colorsMatch = false;
    if (widgetBgHexColor !== undefined && dashBgHexColor !== undefined) {
        colorsMatch = widgetBgHexColor.toLowerCase() === dashBgHexColor.toLowerCase();
    }

    return isWidgetTransparent || colorsMatch;
}
