import React from 'react';

import {
    Col,
    Container,
    Loader,
    Row,
    Select,
    Text,
    TextInput,
    useLayoutContext,
    useThemeType,
} from '@gravity-ui/uikit';
import type {SelectOption} from '@gravity-ui/uikit';
import {unstable_Breadcrumbs as Breadcrumbs} from '@gravity-ui/uikit/unstable';
import {useHistory, useLocation} from 'react-router-dom';
import {GALLERY_ITEM_CATEGORY} from 'shared/constants';
import type {GalleryItemShort} from 'shared/types';
import {ActionPanel} from 'ui/components/ActionPanel';
import {DL} from 'ui/constants';

import {useGetGalleryItemsQuery, useGetGalleryMetaQuery} from '../../../store/api';
import {GalleryCardPreview} from '../../blocks';
import {
    block,
    galleryI18n,
    getCategoryLabelTitle,
    getLang,
    galleryAllPageI18n as i18n,
} from '../../utils';
import type {CnMods} from '../../utils';
import {SPECIAL_CATEGORY, URL_FILTER_PARAMS} from '../constants';
import {useActionPanelLayout} from '../hooks/useActionPanelLayout';

import './AllPage.scss';

const b = block('all');

const CATEGORIES_SELECT_VALUES = [
    SPECIAL_CATEGORY.ALL,
    SPECIAL_CATEGORY.EDITORS_CHOICE,
    GALLERY_ITEM_CATEGORY.EDITOR,
    GALLERY_ITEM_CATEGORY.FINANCE,
    GALLERY_ITEM_CATEGORY.HR,
    GALLERY_ITEM_CATEGORY.RETAIL,
    GALLERY_ITEM_CATEGORY.SPORTS,
];

interface UseGalleryItemsProps {
    items: GalleryItemShort[];
    editorChoiceIds: string[];
    search: string;
    category: string;
    lang: string;
}

function useSortedGalleryItems({items}: {items: GalleryItemShort[]}) {
    const sortedItems = React.useMemo(() => {
        return [...items].sort((item1, item2) => {
            if (item1.createdAt === undefined && item2.createdAt === undefined) {
                return 0;
            }
            if (item1.createdAt === undefined) {
                return 1;
            }
            if (item2.createdAt === undefined) {
                return -1;
            }
            return item2.createdAt - item1.createdAt;
        });
    }, [items]);

    return {sortedItems};
}

function useFilteredGalleryItems({
    category,
    items,
    search,
    lang,
    editorChoiceIds,
}: UseGalleryItemsProps) {
    const filteredItems = React.useMemo(() => {
        return items.reduce<GalleryItemShort[]>((acc, item) => {
            const matchesSearchValue =
                !search || item.title[lang]?.toLowerCase().includes(search.toLowerCase());

            if (!matchesSearchValue) {
                return acc;
            }

            let matchesCategory = true;

            if (item.labels && category !== SPECIAL_CATEGORY.ALL) {
                switch (category) {
                    case SPECIAL_CATEGORY.EDITORS_CHOICE: {
                        matchesCategory = editorChoiceIds.includes(item.id);
                        break;
                    }
                    default: {
                        matchesCategory = item.labels.some(
                            (label) => label.toLowerCase() === category?.toLowerCase(),
                        );
                    }
                }
            }

            if (matchesCategory) {
                acc.push(item);
            }

            return acc;
        }, []);
    }, [items, search, lang, category, editorChoiceIds]);

    return {filteredItems};
}

function getCategorySelectOptionContent(value: string) {
    let content = '';

    switch (value) {
        case SPECIAL_CATEGORY.ALL: {
            content = i18n('category_all');
            break;
        }
        case SPECIAL_CATEGORY.EDITORS_CHOICE: {
            content = galleryI18n('label_best-works');
            break;
        }
        default: {
            content = getCategoryLabelTitle(value);
        }
    }

    return content;
}

export function AllPage() {
    const {activeMediaQuery} = useLayoutContext();
    const history = useHistory();
    const {search: searchParams} = useLocation();
    const {isLoading, data: items = []} = useGetGalleryItemsQuery();
    const themeType = useThemeType();
    const {isLoading: isMetaLoading, data: metaData} = useGetGalleryMetaQuery();
    const [search, setSearch] = React.useState('');
    const [category, setCategory] = React.useState<string>(SPECIAL_CATEGORY.ALL);
    const lang = getLang();
    const {sortedItems} = useSortedGalleryItems({items});
    const {filteredItems} = useFilteredGalleryItems({
        category,
        items: sortedItems,
        search,
        lang,
        editorChoiceIds: metaData?.editorChoice.ids ?? [],
    });
    const availableCategories = React.useMemo(() => {
        return Array.from(
            new Set(
                items.map((item) => item.labels?.map((label) => label.toLowerCase()) ?? []).flat(),
            ),
        );
    }, [items]);
    const selectOptions: SelectOption[] = React.useMemo(() => {
        const allOptions = Array.from(
            new Set([...CATEGORIES_SELECT_VALUES, ...availableCategories]),
        );
        const sortedOptions = allOptions
            .filter((option) => option !== SPECIAL_CATEGORY.ALL)
            .sort((option1, option2) => {
                const content1 = getCategorySelectOptionContent(option1);
                const content2 = getCategorySelectOptionContent(option2);
                return content1.localeCompare(content2);
            })
            .map((value) => ({
                value,
                content: getCategorySelectOptionContent(value),
            }));

        return [
            {
                value: SPECIAL_CATEGORY.ALL,
                content: getCategorySelectOptionContent(SPECIAL_CATEGORY.ALL),
            },
            ...sortedOptions,
        ];
    }, [availableCategories]);

    const isPromo = DL.IS_NOT_AUTHENTICATED;
    const baseMods: CnMods = {media: activeMediaQuery, maxWidth: isPromo};

    const {style, actionPanelRef} = useActionPanelLayout();

    const handleCategorySelectUpdate = React.useCallback(
        (value: string[]) => {
            const newCategory = value[0];
            const urlSearchParams = new URLSearchParams(searchParams);

            if (newCategory === SPECIAL_CATEGORY.ALL) {
                urlSearchParams.delete(URL_FILTER_PARAMS.CATEGORY);
            } else {
                urlSearchParams.set(URL_FILTER_PARAMS.CATEGORY, newCategory);
            }

            history.push(`?${urlSearchParams.toString()}`);
            setCategory(newCategory);
        },
        [history, searchParams],
    );

    React.useEffect(() => {
        if (!isLoading && items.length > 0) {
            const urlSearchParams = new URLSearchParams(searchParams);
            const selectedCategory = urlSearchParams.get(URL_FILTER_PARAMS.CATEGORY) ?? '';

            if (
                availableCategories.some((d) => d === selectedCategory.toLowerCase()) ||
                Object.values(SPECIAL_CATEGORY).includes(selectedCategory)
            ) {
                setCategory(selectedCategory);
            }

            const searchValue = urlSearchParams.get(URL_FILTER_PARAMS.SEARCH_TEXT);
            if (searchValue) {
                setSearch(searchValue);
            }
        }
    }, [availableCategories, isLoading, items.length, searchParams]);

    if (isLoading || isMetaLoading) {
        return (
            <div className={b('loader')}>
                <Loader size="m" />
            </div>
        );
    }

    return (
        <React.Fragment>
            <ActionPanel
                leftItems={
                    <Breadcrumbs navigate={(href) => history.push(href)}>
                        <Breadcrumbs.Item href="/gallery">
                            {galleryI18n('label_gallery')}
                        </Breadcrumbs.Item>
                        <Breadcrumbs.Item disabled={true}>
                            {galleryI18n('label_all_entries')}
                        </Breadcrumbs.Item>
                    </Breadcrumbs>
                }
                wrapperRef={isPromo ? actionPanelRef : undefined}
                style={isPromo ? style : undefined}
            />
            <Container
                className={b('container', baseMods)}
                style={{maxWidth: isPromo ? undefined : '1032px'}}
            >
                <Row space="0" style={{marginTop: 24}}>
                    <Col s="12">
                        <Text variant="header-2">{i18n('title_all_entries')}</Text>
                    </Col>
                </Row>
                <Row space="6" style={{marginTop: 0, marginBottom: 24}}>
                    <Col m="8" s="12">
                        <TextInput
                            defaultValue={search}
                            hasClear={true}
                            size="l"
                            placeholder={i18n('filter_search_placeholder')}
                            onUpdate={setSearch}
                        />
                    </Col>
                    <Col m="4" s="12">
                        <Select
                            filterable={true}
                            onUpdate={handleCategorySelectUpdate}
                            placeholder={i18n('filter_category_placeholder')}
                            size="l"
                            value={[category]}
                            width="max"
                        >
                            {selectOptions.map((value) => {
                                return (
                                    <Select.Option key={value.value} value={value.value}>
                                        {value.content}
                                    </Select.Option>
                                );
                            })}
                        </Select>
                    </Col>
                </Row>
                <Row space="6" spaceRow="8">
                    {filteredItems.map((item) => {
                        return (
                            <Col key={item.id} l="4" m="4" s="12">
                                <GalleryCardPreview
                                    id={item.id}
                                    title={item.title}
                                    createdBy={item.createdBy}
                                    labels={item.labels}
                                    imageSrc={item.images?.[themeType]?.[0] || ''}
                                />
                            </Col>
                        );
                    })}
                </Row>
            </Container>
        </React.Fragment>
    );
}
