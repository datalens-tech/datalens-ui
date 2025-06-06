import React from 'react';

import {
    Breadcrumbs,
    Col,
    Container,
    Row,
    Select,
    Switch,
    TextInput,
    useLayoutContext,
    useThemeType,
} from '@gravity-ui/uikit';
import type {SelectOptionGroup} from '@gravity-ui/uikit';
import {useHistory, useLocation} from 'react-router-dom';
import {ActionPanel} from 'ui/components/ActionPanel';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {SmartLoader} from 'ui/components/SmartLoader/SmartLoader';
import {DL} from 'ui/constants';

import {UNIT_ROUTE} from '../../../constants/routes';
import {useGetGalleryItemsQuery, useGetGalleryMetaQuery} from '../../../store/api';
import {GalleryCardPreview, PageHeader} from '../../blocks';
import {
    block,
    galleryI18n,
    getCategoryLabelTitle,
    getLang,
    galleryAllPageI18n as i18n,
} from '../../utils';
import type {CnMods} from '../../utils';
import {SPECIAL_CATEGORY, URL_FILTER_PARAMS} from '../constants';
import {useElementRect} from '../hooks/useElementRect';

import {useFilteredGalleryItems, useSortedGalleryItems} from './hooks';

import './AllPage.scss';

const b = block('all');

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
    const [canBeUsed, setCanBeUsed] = React.useState<boolean>(false);
    const [actionPanelNode, setActionPanelNode] = React.useState<HTMLDivElement | null>(null);
    const {rect} = useElementRect({node: actionPanelNode});
    const actionPanelStyle = React.useMemo(() => {
        const style: React.CSSProperties = {};
        const offset = rect?.left;

        if (typeof offset === 'number') {
            style.paddingInline = `${offset}px`;
        }

        return style;
    }, [rect]);
    const lang = getLang();
    const {sortedItems} = useSortedGalleryItems({items});
    const {filteredItems} = useFilteredGalleryItems({
        category,
        items: sortedItems,
        search,
        lang,
        editorChoiceIds: metaData?.editorChoice.ids ?? [],
        canBeUsed,
    });
    const availableCategories = React.useMemo(() => {
        return Array.from(
            new Set(
                items.map((item) => item.labels?.map((label) => label.toLowerCase()) ?? []).flat(),
            ),
        );
    }, [items]);
    const selectOptions: SelectOptionGroup[] = React.useMemo(() => {
        const allOptions = Array.from(new Set([...availableCategories]));
        const sortedOptions = allOptions
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
                label: '',
                options: [
                    {
                        value: SPECIAL_CATEGORY.ALL,
                        content: getCategorySelectOptionContent(SPECIAL_CATEGORY.ALL),
                    },
                    {
                        value: SPECIAL_CATEGORY.EDITORS_CHOICE,
                        content: getCategorySelectOptionContent(SPECIAL_CATEGORY.EDITORS_CHOICE),
                    },
                ],
            },
            {
                label: '',
                options: sortedOptions,
            },
        ];
    }, [availableCategories]);

    const isPromo = DL.IS_NOT_AUTHENTICATED;
    const baseMods: CnMods = {media: activeMediaQuery, maxWidth: isPromo};

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

    const handleCanBeUsedUpdate = React.useCallback(() => {
        const urlSearchParams = new URLSearchParams(searchParams);

        if (urlSearchParams.has(URL_FILTER_PARAMS.CAN_BE_USED)) {
            urlSearchParams.delete(URL_FILTER_PARAMS.CAN_BE_USED);
        } else {
            urlSearchParams.set(URL_FILTER_PARAMS.CAN_BE_USED, 'true');
        }

        history.push(`?${urlSearchParams.toString()}`);
    }, [history, searchParams]);

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

            setCanBeUsed(urlSearchParams.has(URL_FILTER_PARAMS.CAN_BE_USED));
        }
    }, [availableCategories, isLoading, items.length, searchParams]);

    if (isLoading || isMetaLoading) {
        return <SmartLoader className={b('loader')} size="m" />;
    }

    let content: React.ReactNode = null;

    if (filteredItems.length > 0) {
        content = filteredItems.map((item) => {
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
        });
    } else {
        content = (
            <PlaceholderIllustration
                className={b('placeholder-empty')}
                description={i18n('label_empty-state-description')}
                direction="column"
                name="notFound"
                size="l"
                title={i18n('label_empty-state-title')}
            />
        );
    }

    return (
        <React.Fragment>
            <ActionPanel
                leftItems={
                    <Breadcrumbs>
                        <Breadcrumbs.Item href="/gallery">
                            {galleryI18n('label_gallery')}
                        </Breadcrumbs.Item>
                        <Breadcrumbs.Item disabled={true}>
                            {galleryI18n('label_all_entries')}
                        </Breadcrumbs.Item>
                    </Breadcrumbs>
                }
                wrapperRef={isPromo ? setActionPanelNode : undefined}
                style={actionPanelStyle}
            />
            <Container
                className={b('container', baseMods)}
                style={{maxWidth: isPromo ? undefined : '1032px'}}
            >
                <Row space="0" style={{marginTop: 24}}>
                    <Col s="12">
                        <PageHeader title={i18n('title_all_entries')} to={UNIT_ROUTE.ROOT} />
                    </Col>
                </Row>
                <Row space="6" style={{marginTop: 0, marginBottom: 24}}>
                    <Col m="6" s="12">
                        <TextInput
                            defaultValue={search}
                            hasClear={true}
                            size="l"
                            placeholder={i18n('filter_search_placeholder')}
                            onUpdate={setSearch}
                        />
                    </Col>
                    <Col m="6" s="12" className={b('filters', {mobile: DL.IS_MOBILE})}>
                        <div className={b('filter-category', {mobile: DL.IS_MOBILE})}>
                            <Select
                                filterable={true}
                                onUpdate={handleCategorySelectUpdate}
                                placeholder={i18n('filter_category_placeholder')}
                                popupClassName={b('category-select-popup')}
                                size="l"
                                value={[category]}
                                width="max"
                            >
                                {selectOptions.map((group, i) => {
                                    return (
                                        <Select.OptionGroup
                                            label={group.label}
                                            key={`${group.label}-${i}`}
                                        >
                                            {group.options?.map((option) => {
                                                return (
                                                    <Select.Option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.content}
                                                    </Select.Option>
                                                );
                                            })}
                                        </Select.OptionGroup>
                                    );
                                })}
                            </Select>
                        </div>
                        <div className={b('filter-can-be-used', {mobile: DL.IS_MOBILE})}>
                            <Switch checked={canBeUsed} onChange={handleCanBeUsedUpdate}>
                                {i18n('filter_can-be-used')}
                            </Switch>
                        </div>
                    </Col>
                </Row>
                <Row space="6" spaceRow="8">
                    {content}
                </Row>
            </Container>
        </React.Fragment>
    );
}
