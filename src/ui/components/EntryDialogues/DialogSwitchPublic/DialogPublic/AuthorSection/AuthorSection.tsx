import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {EntryAuthorData} from '../types';

import './AuthorSection.scss';

const b = block('dl-dialog-public-author-section');
const i18n = I18n.keyset('component.dialog-switch-public.view');

type Props = {
    className?: string;
    scope: 'widget' | 'dash';
    authorData: EntryAuthorData;
    progress: boolean;
    disabled: boolean;
    onChange: ({link, text}: {link?: string; text?: string}) => void;
};

function AuthorSection(props: Props) {
    const {className, authorData, disabled, onChange, scope} = props;

    return (
        <div className={b(null, className)}>
            <div className={b('title')}>{i18n('section_author')}</div>
            <div className={b('description')}>
                {i18n('label_author-description', {subject: i18n(`label_author-subject-${scope}`)})}
            </div>
            <div className={b('row')}>
                <div className={b('row-prefix')}>{i18n('label_author-text')}</div>
                <TextInput
                    value={authorData.text}
                    disabled={disabled}
                    onUpdate={(value) => onChange({text: value})}
                ></TextInput>
            </div>
            <div className={b('row')}>
                <div className={b('row-prefix')}>{i18n('label_author-link')}</div>
                <TextInput
                    value={authorData.link}
                    disabled={disabled}
                    onUpdate={(value) => onChange({link: value})}
                ></TextInput>
            </div>
        </div>
    );
}

export default AuthorSection;
