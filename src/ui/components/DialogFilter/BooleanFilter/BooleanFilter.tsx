import React from 'react';

import {RadioGroup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import type {ChangeValue} from '../typings';

import './BooleanFilter.scss';

const b = block('dl-dialog-filter');
const i18n = I18n.keyset('component.dl-dialog-filter.view');

interface BooleanFilterProps {
    values: string[];
    changeValue: ChangeValue;
}

const BooleanFilter: React.FC<BooleanFilterProps> = (props) => {
    const {values, changeValue} = props;

    const onChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            changeValue([e.target.value]);
        },
        [changeValue],
    );

    return (
        <div className={b('filter-boolean')}>
            <div className={b('label')}>
                <span>{i18n('label_value')}</span>
            </div>
            <RadioGroup
                // possible options True/true | False/false
                value={(values[0] || '').toLowerCase()}
                onChange={onChange}
            >
                <RadioGroup.Option content="true" value="true" />
                <RadioGroup.Option content="false" value="false" />
            </RadioGroup>
        </div>
    );
};

export default BooleanFilter;
