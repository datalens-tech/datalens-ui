import React from 'react';

import {Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './Filters.scss';

const b = block('dl-iam-access-dialog-access-list-filters');

const i18n = I18n.keyset('component.iam-access-dialog');

export type Props = {
    searchString: string;
    subjectType: string;
    subjectTypeOptions: {
        title: string;
        value: string;
    }[];
    setSearchString: (value: string) => void;
    setSubjectType: (value: string) => void;
};

export const Filters = ({
    searchString,
    subjectTypeOptions,
    subjectType,
    setSearchString,
    setSubjectType,
}: Props) => {
    return (
        <div className={b()}>
            <div className={b('search')}>
                <TextInput
                    value={searchString}
                    placeholder={i18n('placeholder_search')}
                    onUpdate={setSearchString}
                />
            </div>
            <div className={b('subject-type')}>
                <Select
                    width="max"
                    value={[subjectType]}
                    onUpdate={([newValue]) => {
                        setSubjectType(newValue);
                    }}
                >
                    {subjectTypeOptions.map((option) => (
                        <Select.Option
                            key={option.value}
                            value={option.value}
                            content={option.title}
                        />
                    ))}
                </Select>
            </div>
        </div>
    );
};
