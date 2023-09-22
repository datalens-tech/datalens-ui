import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import './SettingFeed.scss';

type Props = {
    currentFeed: string;
    onFeedUpdate: (value: string) => void;
};

const b = block('setting-feed');

const SettingFeed: React.FC<Props> = (props: Props) => {
    const {currentFeed, onFeedUpdate} = props;

    return (
        <div className={b('container')}>
            <span className={b('label')}>{i18n('wizard', 'label_feed')}</span>
            <TextInput
                type="text"
                qa="feed-input"
                pin="round-round"
                size="s"
                className={b('feed-input')}
                value={currentFeed}
                onUpdate={onFeedUpdate}
            />
        </div>
    );
};

export default SettingFeed;
