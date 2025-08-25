import React from 'react';

import {Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import ColorPaletteEditorContainer from 'components/ColorPaletteEditorContainer/ColorPaletteEditorContainer';
import {I18n} from 'i18n';
import {Feature} from 'shared';
import {DL} from 'ui/constants';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {SectionGroup} from '../SectionGroup/SectionGroup';

import './GeneralSettings.scss';

const b = block('service-settings-general');
const i18n = I18n.keyset('service-settings.main.view');

type GeneralSettingsProps = {
    customSettings?: React.ReactNode;
    disablePalettesEdit?: boolean;
};

const GeneralSettings = ({customSettings, disablePalettesEdit}: GeneralSettingsProps) => {
    const isTabContent = DL.AUTH_ENABLED && DL.IS_NATIVE_AUTH_ADMIN;
    const isDefaultPaletteControlAvailable = isEnabledFeature(Feature.EnableTenantSettingPalettes);

    return (
        <section className={b()}>
            <Flex gap={7} direction="column" className={b('content', {tab: isTabContent})}>
                <SectionGroup title={i18n('section_color-palettes')}>
                    <ColorPaletteEditorContainer
                        condensed={true}
                        hasEditRights={!disablePalettesEdit}
                        enableDefaultColorPalette={isDefaultPaletteControlAvailable}
                    />
                </SectionGroup>
                {customSettings}
            </Flex>
        </section>
    );
};

export default GeneralSettings;
