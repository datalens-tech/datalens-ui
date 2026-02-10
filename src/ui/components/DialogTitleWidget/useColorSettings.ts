import React from 'react';

import type {BackgroundSettings, ColorSettings, OldBackgroundSettings} from 'shared';
import {Feature} from 'shared';
import {getResultedOldBgColor} from 'shared/modules/dash-scheme-converter';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {getWidgetColorSettings} from 'ui/utils/widgets/colors';

type UseColorSettingsProps = {
    color?: string;
    colorSettings?: ColorSettings;
    defaultOldColor: string | undefined;
    enableSeparateThemeColorSelector?: boolean;
    isNewWidget: boolean;
};

const isDashColorPickersByThemeEnabled = isEnabledFeature(Feature.EnableDashColorPickersByTheme);

export function useColorSettings(props: UseColorSettingsProps) {
    const getPartialStateFromProps = React.useCallback(
        (propsLocal: UseColorSettingsProps) => {
            return {
                oldColor:
                    props.isNewWidget && isDashColorPickersByThemeEnabled
                        ? undefined
                        : propsLocal.color ?? propsLocal.defaultOldColor,
                colorSettings: getWidgetColorSettings({
                    colorSettings: propsLocal.colorSettings,
                    oldColor: propsLocal.color,
                    defaultOldColor:
                        props.isNewWidget && isDashColorPickersByThemeEnabled
                            ? undefined
                            : propsLocal.defaultOldColor,
                    enableMultiThemeColors: propsLocal.enableSeparateThemeColorSelector ?? true,
                }),
            };
        },
        [props.isNewWidget],
    );

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
        setBgSettings({
            oldColor: color,
        });
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
    background: OldBackgroundSettings | undefined;
    backgroundSettings: BackgroundSettings | undefined;
    defaultOldColor: string | undefined;
    enableSeparateThemeColorSelector: boolean;
    isNewWidget: boolean;
};

function getColorSettingsProps({
    background,
    backgroundSettings,
    defaultOldColor,
    enableSeparateThemeColorSelector,
    isNewWidget,
}: UseBackgroundColorSettingsProps): UseColorSettingsProps {
    return {
        color:
            isNewWidget && isDashColorPickersByThemeEnabled
                ? undefined
                : getResultedOldBgColor(background, defaultOldColor),
        colorSettings: backgroundSettings?.color,
        defaultOldColor,
        enableSeparateThemeColorSelector,
        isNewWidget,
    };
}

export function useBackgroundColorSettings({
    background,
    backgroundSettings,
    defaultOldColor,
    enableSeparateThemeColorSelector = true,
    isNewWidget,
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
            isNewWidget,
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
