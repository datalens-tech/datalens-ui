import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {ColoredValue} from '../types';

import './ValueList.scss';

const b = block('dialog-color');

const MAX_VALUES_COUNT = 100;

type Props = {
    query: string;
    items: ColoredValue[];
    selected: string;
    onSelect: (value: string) => void;
    loading?: boolean;
};

const getVisibleValues = (values: ColoredValue[], searchValue: string) => {
    let result = values;

    if (searchValue) {
        const searchPattern = new RegExp(searchValue, 'i');
        result = values.filter((item) => searchPattern.test(item.value));
    }

    return result.slice(0, MAX_VALUES_COUNT);
};

export const ValueList = (props: Props) => {
    const {query, selected, loading, onSelect, items} = props;

    if (loading) {
        return (
            <div className={b('loader')}>
                <Loader size="s" />
            </div>
        );
    }

    const list = getVisibleValues(items, query);

    return (
        <React.Fragment>
            {list.map((item) => (
                <div
                    key={item.value}
                    className={b('value', {selected: selected === item.value})}
                    onClick={() => onSelect(item.value)}
                >
                    <div
                        className={b('value-color', {default: !item.color})}
                        style={{
                            backgroundColor: item.color,
                        }}
                    >
                        {item.color ? null : 'a'}
                    </div>
                    <div className={b('value-label')} title={item.value}>
                        {item.value}
                    </div>
                </div>
            ))}
        </React.Fragment>
    );
};
