import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {EntryAuthorData, ValidationErrors} from '../types';

import './AuthorSection.scss';

const b = block('dl-dialog-public-author-section');
const i18n = I18n.keyset('component.dialog-switch-public.view');

export type AuthorSectionProps = {
    validationErrors: ValidationErrors;
    className?: string;
    scope: 'widget' | 'dash';
    authorData: EntryAuthorData;
    progress: boolean;
    disabled: boolean;
    onChange: ({link, text}: {link?: string; text?: string}) => void;
    showWarning?: boolean;
    linkLabel?: string;
    textLabel?: string;
};

function AuthorSection(props: AuthorSectionProps) {
    const {
        className,
        authorData,
        disabled,
        onChange,
        scope,
        validationErrors,
        showWarning = true,
        linkLabel = i18n('label_author-link'),
        textLabel = i18n('label_author-text'),
    } = props;

    return (
        <div className={b(null, className)}>
            {showWarning && (
                <React.Fragment>
                    <div className={b('title')}>{i18n('section_author')}</div>
                    <div className={b('description')}>
                        {i18n('label_author-description', {
                            subject: i18n(`label_author-subject-${scope}`),
                        })}
                    </div>
                </React.Fragment>
            )}
            <div className={b('form')}>
                <FormRow label={textLabel} className={b('form-row')}>
                    <TextInput
                        error={validationErrors.text ?? false}
                        value={authorData.text}
                        disabled={disabled}
                        onUpdate={(value) => onChange({text: value})}
                    ></TextInput>
                </FormRow>
                <FormRow label={linkLabel} className={b('form-row')}>
                    <TextInput
                        error={validationErrors.link ?? false}
                        value={authorData.link}
                        disabled={disabled}
                        onUpdate={(value) => onChange({link: value})}
                    ></TextInput>
                </FormRow>
            </div>
        </div>
    );
}

export default AuthorSection;
