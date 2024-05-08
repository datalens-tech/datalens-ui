import React from 'react';

import {FormRow} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {Utils} from '../../../../../../../ui';
import {Feature} from '../../../../../../../shared';
import {HintRow} from '../../Control2/Sections/AppearanceSection/Rows/HintRow/HintRow';
import {InnerTitleRow} from '../../Control2/Sections/AppearanceSection/Rows/InnerTitleRow/InnerTitleRow';
import {TitleRow} from '../../Control2/Sections/AppearanceSection/Rows/TitleRow/TitleRow';
import {CommonSettingsSection} from '../../Control2/Sections/CommonSettingsSection/CommonSettingsSection';
import {SelectorTypeSelect} from '../../Control2/SelectorTypeSelect/SelectorTypeSelect';

import './../GroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

export const GroupControlBody = () => {
    const canSetHint = Utils.isEnabledFeature(Feature.FieldHint);

    return (
        <React.Fragment>
            <FormRow label={i18n('label_source')}>
                <SelectorTypeSelect showExternalType={false} mode="select" />
            </FormRow>
            <div className={b('section')}>
                <TitleRow />
            </div>
            <div className={b('section')}>
                <InnerTitleRow />
            </div>
            {canSetHint && (
                <div className={b('section')}>
                    <HintRow />
                </div>
            )}
            <div className={b('section')}>
                <CommonSettingsSection />
            </div>
        </React.Fragment>
    );
};
