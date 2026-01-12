import React from 'react';

import {Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import ColorPaletteEditorContainer from 'components/ColorPaletteEditorContainer/ColorPaletteEditorContainer';
import {I18n} from 'i18n';
import {Feature} from 'shared';
import {DL} from 'ui/constants';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {SectionGroup} from '../SectionGroup/SectionGroup';

import './AppearanceSettings.scss';

const b = block('service-settings-appearance');
const i18n = I18n.keyset('service-settings.main.view');

type AppearanceSettingsProps = {
    // TODO: remove with EnableNewServiceSettings
    customSettings?: React.ReactNode;
    disablePalettesEdit?: boolean;
};

const AppearanceSettings = ({customSettings, disablePalettesEdit}: AppearanceSettingsProps) => {
    const isTabContent = DL.AUTH_ENABLED && DL.IS_NATIVE_AUTH_ADMIN;

    return (
        <section className={b()}>
            <Flex
                gap={7}
                direction="column"
                className={b('content', {
                    tab: isTabContent,
                    newTab: isTabContent && isEnabledFeature(Feature.EnableNewServiceSettings),
                })}
            >
                <SectionGroup title={i18n('section_color-palettes')}>
                    <ColorPaletteEditorContainer
                        condensed={true}
                        hasEditRights={!disablePalettesEdit}
                    />
                </SectionGroup>
                {customSettings}
            </Flex>
        </section>
    );
};

export default AppearanceSettings;
