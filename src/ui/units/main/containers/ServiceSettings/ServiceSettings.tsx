import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Feature} from 'shared/types/feature';
import Utils from 'utils/utils';

import {SectionColorPalettes} from './components/SectionColorPalettes/SectionColorPalettes';

import './ServiceSettings.scss';

const b = block('dl-service-settings');
const i18n = I18n.keyset('main.service-settings.view');

export const ServiceSettings = () => {
    const isColorPalettesEnabled = Utils.isEnabledFeature(Feature.CustomColorPalettes);

    return (
        <div className={b()}>
            <div className={b('content')}>
                <h3 className={b('header')}>{i18n('label_header')}</h3>
                <main className={b('sections')}>
                    {isColorPalettesEnabled && <SectionColorPalettes />}
                </main>
            </div>
        </div>
    );
};
