import React from 'react';

import {Alert, Loader, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import './ValuesList.scss';

const MAX_VALUES_COUNT = 100;

// ToDo: move to component keyset
const i18n = I18n.keyset('wizard');

const b = block('values-list');

type Props = {
    isLoading?: boolean;
    values?: string[];
    selected?: string;
    onSelect?: (value: string) => void;
    error?: string;
    renderItem?: (value: string) => React.ReactNode;
    className?: string;
};

export const ValuesList = (props: Props) => {
    const {
        isLoading = false,
        values = [],
        selected,
        error,
        renderItem,
        className,
        onSelect,
    } = props;
    const [searchValue, setSearchValue] = React.useState('');

    const handleSearch = (value: string) => {
        setSearchValue(value);
    };

    const items = React.useMemo(() => {
        let shownValues;

        if (searchValue) {
            const searchPattern = new RegExp(searchValue, 'i');
            shownValues = values.filter((value) => searchPattern.test(value));
        } else {
            shownValues = values;
        }

        return shownValues.slice(0, MAX_VALUES_COUNT);
    }, [searchValue, values]);

    return (
        <div className={b(null, className)}>
            {error ? (
                <Alert theme="danger" className={b('error-label')} message={error} />
            ) : (
                <React.Fragment>
                    <div className={b('search')}>
                        <TextInput
                            size="m"
                            placeholder={i18n('field_search')}
                            value={searchValue}
                            onUpdate={handleSearch}
                        />
                    </div>
                    <div className={b('items')}>
                        {isLoading ? (
                            <div className={b('loader')}>
                                <Loader size="s" />
                            </div>
                        ) : (
                            items.map((value: string) => {
                                return (
                                    <div
                                        key={value}
                                        className={b('item', {selected: selected === value})}
                                        onClick={onSelect ? () => onSelect(value) : undefined}
                                    >
                                        {renderItem ? renderItem(value) : value}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};
