import React from 'react';

import {Flex, Loader, Select, Text, spacing} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {ColorPalette} from 'shared';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents';
import {showToast} from 'ui/store/actions/toaster';
import {getPaletteSelectorItems} from 'ui/units/wizard/utils/palette';

import {getSdk} from '../../../../libs/schematic-sdk';

import './DefaultPaletteSelect.scss';

const b = block('default-color-palette-select');

const i18n = I18n.keyset('component.color-palette-editor');

type DefaultPaletteSelectProps = {
    colorPalettes: ColorPalette[];
};

export const DefaultPaletteSelect = ({colorPalettes}: DefaultPaletteSelectProps) => {
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = React.useState(false);

    const defaultPaletteOptions = React.useMemo(
        () => getPaletteSelectorItems({colorPalettes}),
        [colorPalettes],
    );

    const [defaultColorPaletteId, setDefaultPaletteId] = React.useState<string>(
        window.DL.tenantSettings?.defaultColorPaletteId ??
            window.DL.defaultColorPaletteId ??
            colorPalettes[0].colorPaletteId,
    );

    const handleDefaultPaletteUpdate = (value: string[]) => {
        setIsLoading(true);
        const fallbackValue = defaultColorPaletteId;
        setDefaultPaletteId(value[0]);
        getSdk()
            .sdk.us.setDefaultColorPalette({defaultColorPaletteId: value[0]})
            .then((response) => {
                if (response.settings.defaultColorPaletteId !== value[0]) {
                    setDefaultPaletteId(response.settings.defaultColorPaletteId || fallbackValue);
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
                <Select
                    options={defaultPaletteOptions}
                    onUpdate={handleDefaultPaletteUpdate}
                    value={[defaultColorPaletteId]}
                    renderSelectedOption={(option) => {
                        return <SelectOptionWithIcon option={option} />;
                    }}
                    renderOption={(option) => {
                        return <SelectOptionWithIcon option={option} />;
                    }}
                    popupClassName={b('select-popup')}
                    className={b('select')}
                    disabled={isLoading}
                />
                {isLoading && <Loader size="s" />}
            </Flex>
        </Flex>
    );
};
