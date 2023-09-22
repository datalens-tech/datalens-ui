import React from 'react';

import block from 'bem-cn-lite';
import ColorPaletteEditorContainer from 'components/ColorPaletteEditorContainer/ColorPaletteEditorContainer';
import {I18n} from 'i18n';

import './SectionColorPalettes.scss';

const b = block('dl-service-settings-migration-tenant');
const i18n = I18n.keyset('main.service-settings.view');

export const SectionColorPalettes = () => {
    return (
        <section className={b()}>
            <h4 className={b('header')}>{i18n('section_color-palettes')}</h4>
            <div className={b('content')}>
                <div className={b('description')}>
                    <ColorPaletteEditorContainer />
                </div>
            </div>
        </section>
    );
};
