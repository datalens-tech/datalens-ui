import React from 'react';

import {Checkbox, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {SectionWrapper} from '../../../../../../components/SectionWrapper/SectionWrapper';

import {Row} from './Row';
import {Title} from './Title';

import '../Settings.scss';

const b = block('dialog-settings');
const i18n = I18n.keyset('dash.settings-dialog.edit');

type AutoRefreshProps = {
    autoUpdateValue: boolean;
    onChangeAutoUpdate: () => void;
    intervalDisabled: boolean;
    intervalValue: string;
    onUpdateInterval: (text: string) => void;
    onBlurInterval: () => void;
    silentLoadingValue: boolean;
    silentLoadingDisabled: boolean;
    onChangeSilentLoading: () => void;
};

export const AutoRefresh = ({
    autoUpdateValue,
    onChangeAutoUpdate,
    intervalValue,
    intervalDisabled,
    onUpdateInterval,
    onBlurInterval,
    silentLoadingValue,
    silentLoadingDisabled,
    onChangeSilentLoading,
}: AutoRefreshProps) => {
    return (
        <SectionWrapper>
            <Row>
                <Title text={i18n('label_autoupdate')} titleMods="strong" />
                <Checkbox
                    size="l"
                    checked={autoUpdateValue}
                    onChange={onChangeAutoUpdate}
                    className={b('box')}
                />
            </Row>
            <Row>
                <Title text={`${i18n('label_autoupdate-interval')} (${i18n('field_seconds')})`} />
                <div className={b('sub-row')}>
                    <TextInput
                        className={b('configure-btn')}
                        type="number"
                        disabled={intervalDisabled}
                        value={intervalValue}
                        onUpdate={onUpdateInterval}
                        onBlur={onBlurInterval}
                    />
                </div>
            </Row>
            <Row>
                <Title text={i18n('label_loading')} />
                <Checkbox
                    size="l"
                    checked={!silentLoadingValue}
                    disabled={silentLoadingDisabled}
                    onChange={onChangeSilentLoading}
                    className={b('box')}
                />
            </Row>
        </SectionWrapper>
    );
};
