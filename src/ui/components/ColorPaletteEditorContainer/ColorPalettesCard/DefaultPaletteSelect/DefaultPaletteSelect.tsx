import React from 'react';

import {Flex, Loader, Text, spacing} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {ColorPalette} from 'shared';
import {ColorPaletteSelect} from 'ui/components/ColorPaletteSelect/ColorPaletteSelect';
import {getAvailableClientPalettesMap} from 'ui/constants/common';
import {showToast} from 'ui/store/actions/toaster';

import {getSdk} from '../../../../libs/schematic-sdk';

import './DefaultPaletteSelect.scss';

const b = block('default-color-palette-select');

const i18n = I18n.keyset('component.color-palette-editor');

type DefaultPaletteSelectProps = {
    colorPalettes: ColorPalette[];
    disabled?: boolean;
};

export const DefaultPaletteSelect = ({colorPalettes, disabled}: DefaultPaletteSelectProps) => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = React.useState(false);

    const getDefaultColorPaletteValue = React.useCallback(() => {
        const allPalettes = [
            ...Object.values(getAvailableClientPalettesMap()).map((p) => p.id),
            ...colorPalettes.map((p) => p.colorPaletteId),
        ];

        const tenantDefaultValue = window.DL.tenantSettings?.defaultColorPaletteId;
        if (tenantDefaultValue && allPalettes.includes(tenantDefaultValue)) {
            return tenantDefaultValue;
        }

        return window.DL.defaultColorPaletteId ?? '';
    }, [colorPalettes]);

    const [defaultColorPaletteId, setDefaultPaletteId] = React.useState<string>(
        getDefaultColorPaletteValue(),
    );

    React.useEffect(() => {
        setDefaultPaletteId(getDefaultColorPaletteValue());
    }, [getDefaultColorPaletteValue]);

    const handleDefaultPaletteUpdate = (value: string[]) => {
        setIsLoading(true);
        const fallbackValue = defaultColorPaletteId;
        setDefaultPaletteId(value[0]);
        getSdk()
            .sdk.us.setDefaultColorPalette({defaultColorPaletteId: value[0]})
            .then((response) => {
                let newPaletteValue = value[0];
                if (response.settings.defaultColorPaletteId !== newPaletteValue) {
                    newPaletteValue = response.settings.defaultColorPaletteId || fallbackValue;
                    setDefaultPaletteId(newPaletteValue);
                }

                if (window.DL.tenantSettings) {
                    window.DL.tenantSettings.defaultColorPaletteId = newPaletteValue;
                }
                dispatch(
                    showToast({
                        title: i18n('toast_update-default-palette-success'),
                        type: 'success',
                    }),
                );
            })
            .catch((error) => {
                setDefaultPaletteId(fallbackValue);
                dispatch(
                    showToast({
                        title: i18n('toast_update-default-palette-failed'),
                        error,
                    }),
                );
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Flex
            gap={1}
            direction="column"
            className={b(null, spacing({mb: 3}))}
            alignItems="flex-start"
        >
            <Text className={spacing({mb: 0.5})}>{i18n('label_default-palette')}</Text>
            <Flex gap={2} className={b('row')}>
                <ColorPaletteSelect
                    colorPalettes={colorPalettes}
                    onUpdate={handleDefaultPaletteUpdate}
                    value={defaultColorPaletteId}
                    disabled={isLoading || disabled}
                    className={b('select')}
                />
                {isLoading && <Loader size="s" />}
            </Flex>
        </Flex>
    );
};
