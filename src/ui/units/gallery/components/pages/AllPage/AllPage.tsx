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
import type {GalleryItem} from 'shared/types';
import {ActionPanel} from 'ui/components/ActionPanel';

import {useGetGalleryItemsQuery} from '../../../store/api';
import {GalleryCardPreview} from '../../blocks';
import {block, getCategoryLabelTitle, getLang} from '../../utils';
import type {CnMods} from '../../utils';
import {SPECIAL_CATEGORY, URL_FILTER_PARAMS} from '../constants';
import {EDITORS_CHOICE_ITEM_IDS} from '../mocks';

import './AllPage.scss';

const b = block('all');

const CATEGORIES_SELECT_VALUES = [
    SPECIAL_CATEGORY.ALL,
    SPECIAL_CATEGORY.EDITORS_CHOICE,
    GALLERY_ITEM_CATEGORY.EDITOR,
    GALLERY_ITEM_CATEGORY.EDUCATION,
    GALLERY_ITEM_CATEGORY.FINANCE,
    GALLERY_ITEM_CATEGORY.HR,
    GALLERY_ITEM_CATEGORY.IT,
    GALLERY_ITEM_CATEGORY.RETAIL,
    GALLERY_ITEM_CATEGORY.SPORTS,
];

interface UseGalleryItemsProps {
    items: GalleryItem[];
    search: string;
    category: string;
    lang: string;
}

function useFilteredGalleryItems({category, items, search, lang}: UseGalleryItemsProps) {
    const filteredItems = React.useMemo(() => {
        return items.reduce<GalleryItem[]>((acc, item) => {
            const matchesSearchValue =
                !search || item.title[lang]?.toLowerCase().startsWith(search.toLowerCase());

            if (!matchesSearchValue) {
                return acc;
            }

            let matchesCategory = true;

            if (item.labels && category !== SPECIAL_CATEGORY.ALL) {
                switch (category) {
                    case SPECIAL_CATEGORY.EDITORS_CHOICE: {
                        matchesCategory = EDITORS_CHOICE_ITEM_IDS.includes(item.id);
                        break;
                    }
                    default: {
                        matchesCategory = item.labels.includes(category);
                    }
                }
            }

            if (matchesCategory) {
                acc.push(item);
            }

            return acc;
        }, []);
    }, [category, items, search, lang]);

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

export function AllPage() {
    const {activeMediaQuery} = useLayoutContext();
    const history = useHistory();
    const {search: searchParams} = useLocation();
    const defaultFilterValues = React.useMemo(() => {
        const urlSearchParams = new URLSearchParams(searchParams);
        const value = urlSearchParams.get(URL_FILTER_PARAMS.CATEGORY) ?? '';

        return {
            category: CATEGORIES_SELECT_VALUES.includes(value) ? value : SPECIAL_CATEGORY.ALL,
            search: urlSearchParams.get(URL_FILTER_PARAMS.SEARCH_TEXT) ?? '',
        };
    }, [searchParams]);
    const baseMods: CnMods = {media: activeMediaQuery};
    const [search, setSearch] = React.useState(defaultFilterValues.search);
    const [category, setCategory] = React.useState<string>(defaultFilterValues.category);
    const lang = getLang();
    const themeType = useThemeType();

    const {isLoading, data: items = []} = useGetGalleryItemsQuery({});
    const {filteredItems} = useFilteredGalleryItems({
        category,
        items,
        search,
        lang,
    });

    if (isLoading) {
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
            />
            <Container className={b('container', baseMods)} style={{maxWidth: '1032px'}}>
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
                            {CATEGORIES_SELECT_VALUES.map((value) => {
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
