import React from 'react';

import type {RenderRowActionsProps, TableColumnConfig} from '@gravity-ui/uikit';
import {Button, Table, withTableActions} from '@gravity-ui/uikit';
import {useSelector} from 'react-redux';
import {FormSection} from 'ui/components/FormSection/FormSection';
import {DL} from 'ui/constants/common';
import {selectNeedSimilarSelectorsCheck} from 'ui/store/selectors/controlDialog';

import {useSimilarSelectorsActions} from '../../hooks/useSimilarSelectorsActions';

type SimilarSelector = {
    id: string;
    title: string;
    tabTitle: string;
    tabId: string;
    widgetId: string;
    joined: boolean;
};

const TableWithActions = withTableActions<SimilarSelector>(Table);

// Mock i18n keys based on DL.USER_LANG
const mockI18n = {
    ru: {
        button_join_all: 'Объединить все',
        button_join_selectors: 'Объединить',
        hint_find_similiar_selectors: 'Найти селекторы с таким же полем или параметром',
        label_find_no_similiar_selectors:
            'Нет похожих селекторов. У селекторов должны быть такие же поле или параметр',
        label_finding_similiar_selectors_progress: 'Поиск похожих селекторов',
        label_joined_selectors: 'Объединены',
        label_similiar_selectors: 'Похожие селекторы',
        label_similiar_selectors_tab: 'Вкладка',
        label_similiar_selectors_title: 'Заголовок',
    },
    en: {
        button_join_all: 'Join all',
        button_join_selectors: 'Join',
        hint_find_similiar_selectors: 'Find selectors with the same field or parameter',
        label_find_no_similiar_selectors:
            'No similar selectors. Selectors must have the same field or parameter',
        label_finding_similiar_selectors_progress: 'Finding similar selectors',
        label_joined_selectors: 'Joined',
        label_similiar_selectors: 'Similar selectors',
        label_similiar_selectors_tab: 'Tab',
        label_similiar_selectors_title: 'Title',
    },
};

const getMockText = (key: keyof typeof mockI18n.en): string => {
    const lang = (DL.USER_LANG || 'ru') as 'ru' | 'en';
    return mockI18n[lang]?.[key] || mockI18n.en[key];
};

const Content = ({
    selectors,
    isLoading,
    onSelectorJoin,
}: {
    selectors: SimilarSelector[];
    isLoading: boolean;
    onSelectorJoin: (selector: SimilarSelector) => void;
}) => {
    const columns = React.useMemo<TableColumnConfig<SimilarSelector>[]>(
        () => [
            {
                id: 'title',
                name: getMockText('label_similiar_selectors_title'),
            },
            {
                id: 'tabTitle',
                name: getMockText('label_similiar_selectors_tab'),
            },
        ],
        [],
    );

    const renderRowActions = React.useCallback(
        ({item}: RenderRowActionsProps<SimilarSelector>) => {
            const handleJoin = () => {
                if (item.joined) {
                    return;
                }
                onSelectorJoin(item);
            };
            return (
                <Button view="flat" onClick={handleJoin} selected={item.joined}>
                    {item.joined
                        ? getMockText('label_joined_selectors')
                        : getMockText('button_join_selectors')}
                </Button>
            );
        },
        [onSelectorJoin],
    );

    if (isLoading) {
        return null;
    }

    if (selectors.length === 0) {
        return <div>{getMockText('label_find_no_similiar_selectors')}</div>;
    }

    return (
        <TableWithActions
            width="max"
            columns={columns}
            data={selectors}
            renderRowActions={renderRowActions}
        />
    );
};

export const SimilarSelectorsBlock = () => {
    const needSimilarSelectorsCheck = useSelector(selectNeedSimilarSelectorsCheck);

    const [isLoading, setIsLoading] = React.useState(false);
    const [selectors, setSelectors] = React.useState<SimilarSelector[]>([]);

    const {joinSelector, getSimilarSelectors} = useSimilarSelectorsActions();

    React.useEffect(() => {
        if (needSimilarSelectorsCheck) {
            setSelectors([]);
            setIsLoading(true);
            setSelectors(getSimilarSelectors());
            setIsLoading(false);
        }
    }, [getSimilarSelectors, needSimilarSelectorsCheck]);

    const handleSelectorJoin = React.useCallback(
        (selector: SimilarSelector) => {
            joinSelector(selector);
            setSelectors(
                selectors.map((item) => (item.id === selector.id ? {...item, joined: true} : item)),
            );
        },
        [joinSelector, selectors],
    );

    if (!needSimilarSelectorsCheck) {
        return null;
    }

    const title =
        selectors.length > 0
            ? getMockText('label_similiar_selectors')
            : getMockText('label_finding_similiar_selectors_progress');

    return (
        <FormSection showLoader={isLoading} title={title}>
            <Content
                selectors={selectors}
                isLoading={isLoading}
                onSelectorJoin={handleSelectorJoin}
            />
        </FormSection>
    );
};
