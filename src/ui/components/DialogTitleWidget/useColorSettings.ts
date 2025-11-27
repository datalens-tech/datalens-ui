import React from 'react';

import type {BackgroundSettings, ColorSettings, OldBackgroundSettings} from 'shared';
import {CustomPaletteBgColors, Feature} from 'shared';
import {getResultedOldBgColor} from 'shared/modules/dash-scheme-converter';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {getWidgetColorSettings} from 'ui/utils/widgetColors';

type UseColorSettingsProps = {
    color?: string;
    colorSettings?: ColorSettings;
    defaultOldColor?: string;
    enableSeparateThemeColorSelector?: boolean;
};

const isDashColorPickersByThemeEnabled = isEnabledFeature(Feature.EnableDashColorPickersByTheme);

export function useColorSettings(props: UseColorSettingsProps) {
    const getPartialStateFromProps = React.useCallback((propsLocal: UseColorSettingsProps) => {
        return {
            oldColor: propsLocal.color ?? propsLocal.defaultOldColor,
            colorSettings: getWidgetColorSettings({
                colorSettings: propsLocal.colorSettings,
                oldColor: propsLocal.color,
                defaultOldColor: propsLocal.defaultOldColor ?? CustomPaletteBgColors.NONE,
                enableMultiThemeColors: propsLocal.enableSeparateThemeColorSelector ?? true,
            }),
        };
    }, []);

    const [{oldColor, colorSettings}, setBgSettings] = React.useState<{
        oldColor?: string;
        colorSettings?: ColorSettings;
    }>(getPartialStateFromProps(props));

    const updateStateByProps = React.useCallback(
        (propsLocal: UseColorSettingsProps) => {
            setBgSettings(getPartialStateFromProps(propsLocal));
        },
        [getPartialStateFromProps],
    );

    const setOldColor = React.useCallback((color?: string) => {
        setBgSettings((prev) => ({
            ...prev,
            oldColor: color,
        }));
    }, []);

    const setColorSettings = React.useCallback((settings?: ColorSettings) => {
        setBgSettings({
            oldColor: undefined,
            colorSettings: settings,
        });
    }, []);

    return {
        oldColor,
        colorSettings,
        setOldColor,
        setColorSettings,
        updateStateByProps,
    };
}

type UseBackgroundColorSettingsProps = {
    background?: OldBackgroundSettings;
    backgroundSettings?: BackgroundSettings;
    defaultOldColor?: string;
    enableSeparateThemeColorSelector?: boolean;
};

function getColorSettingsProps(propsLocal: UseBackgroundColorSettingsProps): UseColorSettingsProps {
    return {
        color: getResultedOldBgColor(propsLocal.background, propsLocal.defaultOldColor),
        colorSettings: propsLocal.backgroundSettings?.color,
        defaultOldColor: propsLocal.defaultOldColor,
        enableSeparateThemeColorSelector: propsLocal.enableSeparateThemeColorSelector,
    };
}

export function useBackgroundColorSettings({
    background,
    backgroundSettings,
    defaultOldColor = CustomPaletteBgColors.NONE,
    enableSeparateThemeColorSelector = true,
}: UseBackgroundColorSettingsProps) {
    const {
        oldColor: oldBackgroundColor,
        colorSettings: backgroundColorSettings,
        setOldColor: setOldBackgroundColor,
        setColorSettings: setBackgroundColorSettings,
        updateStateByProps: updateStateByPropsColorSettings,
    } = useColorSettings(
        getColorSettingsProps({
            background,
            backgroundSettings,
            defaultOldColor,
            enableSeparateThemeColorSelector,
        }),
    );

    const resultedBackgroundSettings = React.useMemo(
        () =>
            getResultedBackgroundSettings({
                oldBackgroundColor,
                backgroundColorSettings,
            }),
        [oldBackgroundColor, backgroundColorSettings],
    );

    const updateStateByProps = React.useCallback(
        (propsLocal: UseBackgroundColorSettingsProps) => {
            updateStateByPropsColorSettings(getColorSettingsProps(propsLocal));
        },
        [updateStateByPropsColorSettings],
    );

    return {
        oldBackgroundColor,
        backgroundColorSettings,
        setOldBackgroundColor,
        setBackgroundColorSettings,
        updateStateByProps,
        resultedBackgroundSettings,
    };
}

export function getResultedBackgroundSettings({
    oldBackgroundColor,
    backgroundColorSettings,
}: {
    oldBackgroundColor?: string;
    backgroundColorSettings?: ColorSettings;
}): {
    backgroundSettings?: BackgroundSettings;
    background?: Omit<OldBackgroundSettings, 'enabled'>;
} {
    return backgroundColorSettings || isDashColorPickersByThemeEnabled
        ? {backgroundSettings: {color: backgroundColorSettings}}
        : {background: oldBackgroundColor ? {color: oldBackgroundColor} : undefined};
}
