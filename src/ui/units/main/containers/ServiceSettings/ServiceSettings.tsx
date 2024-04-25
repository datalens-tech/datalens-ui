import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {SectionColorPalettes} from './components/SectionColorPalettes/SectionColorPalettes';

import './ServiceSettings.scss';

const b = block('dl-service-settings');
const i18n = I18n.keyset('main.service-settings.view');

export const ServiceSettings = () => {
    return (
        <div className={b()}>
            <div className={b('content')}>
                <h3 className={b('header')}>{i18n('label_header')}</h3>
                <main className={b('sections')}>
                    <SectionColorPalettes />
                </main>
            </div>
        </div>
    );
};
