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
import {unstable_Breadcrumbs as Breadcrumbs} from '@gravity-ui/uikit/unstable';
import {useHistory, useLocation} from 'react-router-dom';
import {GALLERY_ITEM_CATEGORY} from 'shared/constants';
import type {GalleryItemShort} from 'shared/types';
import {ActionPanel} from 'ui/components/ActionPanel';

import {useGetGalleryItemsQuery, useGetGalleryMetaQuery} from '../../../store/api';
import {GalleryCardPreview} from '../../blocks';
import {block, getCategoryLabelTitle, getLang} from '../../utils';
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
                !search || item.title[lang]?.toLowerCase().startsWith(search.toLowerCase());

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
            content = 'All categories';
            break;
        }
        case SPECIAL_CATEGORY.EDITORS_CHOICE: {
            content = 'Editors choice';
            break;
        }
        default: {
            content = getCategoryLabelTitle(value);
        }
    }

    return content;
}

export function AllPage({isPromo}: {isPromo?: boolean}) {
    const {activeMediaQuery} = useLayoutContext();
    const history = useHistory();
    const {search: searchParams} = useLocation();
    const {isLoading, data: items = []} = useGetGalleryItemsQuery();
    const availableCategories = React.useMemo(() => {
        return Array.from(
            new Set(
                items.map((item) => item.labels?.map((label) => label.toLowerCase()) ?? []).flat(),
            ),
        );
    }, [items]);
    const [search, setSearch] = React.useState('');
    const [category, setCategory] = React.useState<string>(SPECIAL_CATEGORY.ALL);

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
    const baseMods: CnMods = {media: activeMediaQuery, maxWidth: isPromo};

    const lang = getLang();
    const themeType = useThemeType();

    const {isLoading: isMetaLoading, data: metaData} = useGetGalleryMetaQuery();
    const {filteredItems} = useFilteredGalleryItems({
        category,
        items,
        search,
        lang,
        editorChoiceIds: metaData?.editorChoice.ids ?? [],
    });
    const selectOptions = Array.from(
        new Set([...CATEGORIES_SELECT_VALUES, ...availableCategories]),
    );

    const {pageOffset, actionPanelRef} = useActionPanelLayout();

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
                        <Breadcrumbs.Item href="/gallery">Gallery</Breadcrumbs.Item>
                        <Breadcrumbs.Item disabled={true}>All entries</Breadcrumbs.Item>
                    </Breadcrumbs>
                }
                pageOffset={pageOffset}
                wrapperRef={actionPanelRef}
            />
            <Container
                className={b('container', baseMods)}
                style={{maxWidth: isPromo ? undefined : '1032px'}}
            >
                <Row space="0" style={{marginTop: 24}}>
                    <Col s="12">
                        <Text variant="header-2">All entries</Text>
                    </Col>
                </Row>
                <Row space="6" style={{marginTop: 0, marginBottom: 24}}>
                    <Col m="8" s="12">
                        <TextInput
                            defaultValue={search}
                            size="l"
                            placeholder="Search by name"
                            onUpdate={setSearch}
                        />
                    </Col>
                    <Col m="4" s="12">
                        <Select
                            onUpdate={(value) => setCategory(value[0])}
                            placeholder="Category"
                            size="l"
                            value={[category]}
                            width="max"
                        >
                            {selectOptions.map((value) => {
                                return (
                                    <Select.Option key={value} value={value}>
                                        {getCategorySelectOptionContent(value)}
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
