import React from 'react';

import type {ButtonProps} from '@gravity-ui/uikit';
import {Button, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './Filters.scss';

const b = block('dialog-relations-filters');
const i18n = I18n.keyset('component.dialog-relations.view');

export type FiltersTypes = 'input' | 'output' | 'none';

export const DEFAULT_FILTERS: Array<FiltersTypes> = ['input', 'output', 'none'];

const getFilterProps = ({
    currentType,
    filters,
}: {
    currentType: FiltersTypes;
    filters: Array<FiltersTypes>;
}): {isActive: boolean; buttonType: ButtonProps['view']} => {
    const isActive = filters.includes(currentType);
    return {
        isActive,
        buttonType: isActive ? 'normal' : 'outlined',
    };
};

export const Filters = ({
    onChangeInput,
    onChangeButtons,
}: {
    onChangeInput: (param: string) => void;
    onChangeButtons: (param: Array<FiltersTypes>) => void;
}) => {
    const [searchValue, setSearchValue] = React.useState('');
    const [activeFilters, setActiveFilters] = React.useState<Array<FiltersTypes>>([]);

    const handleSearchValue = React.useCallback(
        (value: string) => {
            onChangeInput(value);
            setSearchValue(value);
        },
        [onChangeInput],
    );

    const handleButtonClick = React.useCallback(
        (type: FiltersTypes) => {
            let newFilters = [];
            if (activeFilters.includes(type)) {
                newFilters = activeFilters.filter((item) => item !== type);
            } else {
                newFilters = [...activeFilters, type];
            }

            setActiveFilters(newFilters);
            onChangeButtons(newFilters);
        },
        [activeFilters, onChangeButtons],
    );

    const inputButtonProps = getFilterProps({currentType: 'input', filters: activeFilters});
    const outputButtonProps = getFilterProps({currentType: 'output', filters: activeFilters});
    const noneButtonProps = getFilterProps({currentType: 'none', filters: activeFilters});

    return (
        <div className={b('top')}>
            <TextInput
                value={searchValue}
                onUpdate={handleSearchValue}
                placeholder={i18n('label_placeholder-search')}
                className={b('search')}
                hasClear={true}
            />
            <Button
                view={inputButtonProps.buttonType}
                className={b('button')}
                selected={inputButtonProps.isActive}
                onClick={() => handleButtonClick('input')}
            >
                {i18n('button_incoming')}
            </Button>
            <Button
                view={outputButtonProps.buttonType}
                className={b('button')}
                selected={outputButtonProps.isActive}
                onClick={() => handleButtonClick('output')}
            >
                {i18n('button_outcoming')}
            </Button>
            <Button
                view={noneButtonProps.buttonType}
                className={b('button')}
                selected={noneButtonProps.isActive}
                onClick={() => handleButtonClick('none')}
            >
                {i18n('button_not-linked')}
            </Button>
        </div>
    );
};
