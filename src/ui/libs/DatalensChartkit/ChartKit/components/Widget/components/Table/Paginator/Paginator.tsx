import React from 'react';

import {ChevronRight} from '@gravity-ui/icons';
import {Button, Icon, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {ChartKitTableQa} from '../../../../../../../../../shared';
import {i18n} from '../../../../../modules/i18n/i18n';

import './Paginator.scss';

interface PaginatorProps {
    onChange: (page: number) => void;
    page?: string[] | number[] | string | number;
    rowsCount?: number;
    limit?: number;
}

interface ArrowButtonProps {
    onChange: (page: number) => void;
    page: number;
    qa?: string;
    reversed?: boolean;
}

const b = block('chartkit-table-paginator');
export const START_PAGE = 1;

const preparePageValue = (page: PaginatorProps['page']) => {
    if (!page) {
        return START_PAGE;
    }

    const currentPage = Number(Array.isArray(page) ? page[0] : page);

    return Number.isNaN(currentPage) || currentPage < START_PAGE ? START_PAGE : currentPage;
};

const getRange = (page: number, limit: number, rowsCount: number) => {
    const from = (page - 1) * limit;
    const to = rowsCount < limit ? from + rowsCount : page * limit;

    return `${i18n('chartkit-table', 'paginator-rows')}: ${from + 1}–${to}`;
};

const ArrowButton: React.FC<ArrowButtonProps> = ({page, qa, reversed, onChange}) => {
    const onClick = React.useCallback(() => {
        onChange(page + (reversed ? -1 : 1));
    }, [page, reversed, onChange]);

    return (
        <Button
            size="m"
            view="normal"
            qa={qa}
            disabled={reversed && page === START_PAGE}
            onClick={onClick}
        >
            <Icon data={ChevronRight} className={b('arrow-btn', {reversed})} size={16} />
        </Button>
    );
};

const Paginator: React.FC<PaginatorProps> = ({page, rowsCount, limit, onChange}) => {
    const [inputValue, setInputValue] = React.useState<string>(String(START_PAGE));
    const currentPage = preparePageValue(page);

    const onInputBlur = React.useCallback(() => {
        if (!inputValue) {
            onChange(START_PAGE);
        }

        if (inputValue !== String(currentPage)) {
            onChange(preparePageValue(inputValue));
        }
    }, [inputValue, currentPage, onChange]);

    const onInputPressEnter = React.useCallback(
        (event: React.KeyboardEvent<HTMLElement>) => {
            if (event.key === 'Enter' && inputValue) {
                onChange(preparePageValue(inputValue));
            }
        },
        [inputValue, onChange],
    );

    React.useEffect(() => {
        setInputValue(String(preparePageValue(page)));
    }, [page]);

    return (
        <div className={b()} data-qa={ChartKitTableQa.Paginator}>
            <ArrowButton
                page={currentPage}
                qa={ChartKitTableQa.PaginatorPrevPageButton}
                reversed={true}
                onChange={onChange}
            />
            <TextInput
                className={b('page-input')}
                type="number"
                value={inputValue}
                onBlur={onInputBlur}
                onUpdate={setInputValue}
                onKeyPress={onInputPressEnter}
                qa={ChartKitTableQa.PaginatorPageInput}
            />
            <ArrowButton
                page={currentPage}
                qa={ChartKitTableQa.PaginatorNextPageButton}
                onChange={onChange}
            />
            {Boolean(limit && rowsCount) && (
                <span className={b('range')} data-qa={ChartKitTableQa.PaginatorRange}>
                    {getRange(currentPage, limit as number, rowsCount as number)}
                </span>
            )}
        </div>
    );
};

export default Paginator;
