import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import {CHART_SETTINGS} from '../../../../constants';
import SettingSwitcher from '../SettingSwitcher/SettingSwitcher';

import './SettingTitleMode.scss';

type Props = {
    titleMode: string;
    inputValue: string;
    onChangeSwitcher: (value: string) => void;
    onChangeInput: (value: string) => void;
};

const b = block('setting-title-mode');

const SettingTitleMode: React.FC<Props> = (props: Props) => {
    const {titleMode, inputValue} = props;
    const title = i18n('wizard', 'label_header');

    return (
        <div className={b('container')}>
            <SettingSwitcher
                currentValue={titleMode}
                checkedValue={CHART_SETTINGS.TITLE_MODE.SHOW}
                uncheckedValue={CHART_SETTINGS.TITLE_MODE.HIDE}
                onChange={props.onChangeSwitcher}
                title={title}
                qa="title-mode-switcher"
            />
            <TextInput
                className={b('title-input')}
                type="text"
                qa="title-input"
                pin="round-round"
                size="s"
                value={inputValue}
                disabled={titleMode === 'hide'}
                onUpdate={props.onChangeInput}
            />
        </div>
    );
};

export default SettingTitleMode;
