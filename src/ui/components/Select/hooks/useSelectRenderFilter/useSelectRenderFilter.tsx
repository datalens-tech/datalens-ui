import React from 'react';

import type {SelectOption, SelectProps} from '@gravity-ui/uikit';
import {Button, SegmentedRadioGroup as RadioButton, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import debounce from 'lodash/debounce';

import './ListControls.scss';

const DEBOUNCE_TIME = 500;

const i18n = I18n.keyset('dash.control-dialog.edit');

const b = block('select-list-controls');

export const VIEW_MODES = {
    ALL: 'ALL',
    SELECTED: 'SELECTED',
};

export type UseSelectRenderFilter<T = any> = {
    options: SelectOption<T>[];
    disableUIKitFilterAlgorithm?: boolean;
    onFilterChange?: (filter: string, viewMode: keyof typeof VIEW_MODES) => void;
} & Pick<SelectProps, 'value' | 'onUpdate' | 'multiple' | 'hasClear'>;

const optionViewModes = [
    {content: i18n('radio-button_all'), value: VIEW_MODES.ALL},
    {content: i18n('radio-button_selected'), value: VIEW_MODES.SELECTED},
];

export const useSelectRenderFilter = <T,>({
    value,
    options,
    onUpdate,
    multiple,
    disableUIKitFilterAlgorithm,
    onFilterChange,
    hasClear = true,
}: UseSelectRenderFilter<T>) => {
    const [viewMode, setViewMode] = React.useState(VIEW_MODES.ALL);
    const prev = React.useRef<{selectedModeOptions?: typeof options}>({});
    const [searchPattern, setSearchPattern] = React.useState<string | undefined>();

    const onSearch = React.useCallback(
        debounce((searchPattern = '', mode: string) => {
            onFilterChange?.(searchPattern, mode as keyof typeof VIEW_MODES);
        }, DEBOUNCE_TIME),
        [onFilterChange],
    );

    const onViewModeChange = React.useCallback(
        (mode) => {
            setViewMode(mode);
            onSearch(searchPattern, mode);
        },
        [onSearch, searchPattern],
    );

    const resetFilterState = React.useCallback(() => {
        setViewMode(VIEW_MODES.ALL);
        setSearchPattern('');
        onSearch('', VIEW_MODES.ALL);
    }, [setViewMode, setSearchPattern, onSearch]);

    const optionsByViewMode = React.useMemo(() => {
        if (viewMode === VIEW_MODES.SELECTED) {
            if (!prev.current.selectedModeOptions) {
                prev.current = {
                    selectedModeOptions: value?.map((val) => ({value: val, content: val})),
                };
            }
            return prev.current.selectedModeOptions;
        } else {
            prev.current.selectedModeOptions = undefined;
        }
        return options;
    }, [value, options, viewMode]);

    const selectAll = React.useCallback(() => {
        onUpdate?.(options.filter((opt) => !opt?.disabled).map((opt) => opt?.value));
    }, [onUpdate, options]);

    const deselectAll = React.useCallback(() => {
        onUpdate?.([]);
        setViewMode(VIEW_MODES.ALL);
    }, [onUpdate]);

    const buttonActionProps = React.useMemo(
        () => ({
            select: {
                title: i18n('button_select-all'),
                onClick: selectAll,
            },
            deselect: {
                title: i18n('button_deselect-all'),
                onClick: deselectAll,
            },
        }),
        [selectAll, deselectAll],
    );

    const renderCustomFilter: SelectProps['renderFilter'] = ({
        onChange,
        onKeyDown,
        value: innerInputValue,
        ref,
    }) => {
        let buttonProps;
        if (multiple) {
            buttonProps = value?.length ? buttonActionProps.deselect : buttonActionProps.select;
        } else {
            const disabled = !value?.length;
            buttonProps = {...buttonActionProps.deselect, disabled};
        }

        const disableFilterAlgorithm =
            viewMode === VIEW_MODES.SELECTED ? false : disableUIKitFilterAlgorithm;

        // uikit.Select lose value when reopen popup
        if (!disableFilterAlgorithm && searchPattern && innerInputValue !== searchPattern) {
            onChange(searchPattern);
        }

        // hide deselect button if hasClear is false
        const showActionButton = hasClear || multiple;

        return (
            <div className={b()}>
                <TextInput
                    controlRef={ref}
                    value={searchPattern}
                    placeholder={i18n('placeholder_search')}
                    onUpdate={(val) => {
                        if (!disableFilterAlgorithm) {
                            onChange(val);
                        }
                        setSearchPattern(val);
                        onSearch(val, viewMode);
                    }}
                    onKeyDown={onKeyDown}
                />
                <div className={b('buttons')}>
                    <RadioButton
                        size="s"
                        disabled={viewMode === VIEW_MODES.ALL && !value?.length}
                        onUpdate={(mode) => {
                            if (mode === VIEW_MODES.ALL) {
                                onChange('');
                            }

                            onViewModeChange(mode);
                        }}
                        options={optionViewModes}
                        value={viewMode}
                    />
                    {showActionButton && (
                        <Button size="s" view="flat" {...buttonProps}>
                            {buttonProps.title}
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    return {
        options: optionsByViewMode,
        renderFilter: renderCustomFilter,
        searchPattern,
        resetFilterState,
    };
};
