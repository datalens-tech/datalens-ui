import React from 'react';

import {FormRow} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {HintRow} from '../../Control2/Sections/AppearanceSection/Rows/HintRow/HintRow';
import {InnerTitleRow} from '../../Control2/Sections/AppearanceSection/Rows/InnerTitleRow/InnerTitleRow';
import {TitleRow} from '../../Control2/Sections/AppearanceSection/Rows/TitleRow/TitleRow';
import {CommonSettingsSection} from '../../Control2/Sections/CommonSettingsSection/CommonSettingsSection';
import {InputTypeSelector} from '../../Control2/Sections/CommonSettingsSection/InputTypeSelector/InputTypeSelector';
import {OperationSelector} from '../../Control2/Sections/OperationSelector/OperationSelector';
import {ValueSelector} from '../../Control2/Sections/ValueSelector/ValueSelector';
import {SelectorTypeSelect} from '../../Control2/SelectorTypeSelect/SelectorTypeSelect';

import './../GroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

export const GroupControlBody = () => {
    return (
        <React.Fragment>
            <FormRow label={i18n('label_source')}>
                <SelectorTypeSelect showExternalType={false} mode="select" />
            </FormRow>
            <div className={b('section')}>
                <CommonSettingsSection hideCommonFields={true} />
            </div>

            <div className={b('section', {'top-divider': true})}>
                <TitleRow />
            </div>
            <div className={b('section')}>
                <InnerTitleRow />
            </div>
            <div className={b('section')}>
                <HintRow />
            </div>
            <div className={b('section', {'bottom-divider': true})}>
                <InputTypeSelector />
            </div>
            <div className={b('section')}>
                <OperationSelector />
            </div>
            <div className={b('section')}>
                <ValueSelector />
            </div>
        </React.Fragment>
    );
};
