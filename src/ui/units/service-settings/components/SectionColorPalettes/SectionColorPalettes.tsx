import React from 'react';

import {Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import ColorPaletteEditorContainer from 'components/ColorPaletteEditorContainer/ColorPaletteEditorContainer';
import {I18n} from 'i18n';
import {DL} from 'ui/constants';

import './SectionColorPalettes.scss';

const b = block('service-settings-color-palettes');
const i18n = I18n.keyset('service-settings.main.view');

const SectionColorPalettes = () => {
    const isTabContent = DL.AUTH_ENABLED && DL.IS_NATIVE_AUTH_ADMIN;

    return (
        <section className={b()}>
            {!isTabContent && (
                <Text as={'h4' as const} className={b('header')} variant="subheader-2">
                    {i18n('section_color-palettes')}
                </Text>
            )}
            <div className={b('content', {tab: isTabContent})}>
                <div className={b('description')}>
                    <ColorPaletteEditorContainer />
                </div>
            </div>
        </section>
    );
};

export default SectionColorPalettes;
