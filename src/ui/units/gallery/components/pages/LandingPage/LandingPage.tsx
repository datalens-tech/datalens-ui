import React from 'react';

import {ArrowRight, Medal} from '@gravity-ui/icons';
import {
    Button,
    Card,
    Col,
    Container,
    Flex,
    Icon,
    Link,
    Loader,
    Row,
    useLayoutContext,
    useThemeType,
} from '@gravity-ui/uikit';
import sortBy from 'lodash/sortBy';
import {useHistory} from 'react-router';
import {GALLERY_ITEM_CATEGORY} from 'shared/constants';
import type {GalleryItemShort} from 'shared/types';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';
import type {AsyncImageProps} from 'ui/components/AsyncImage/AsyncImage';
import type {CreateIllustrationProps} from 'ui/components/Illustration/types';
import {createIllustration} from 'ui/components/Illustration/utils';

import {useGetGalleryItemsQuery, useGetGalleryMetaQuery} from '../../../store/api';
import {GalleryCardPreview, SectionHeader} from '../../blocks';
import type {ActiveMediaQuery} from '../../types';
import {block, getAllPageUrl, groupGalleryItemsByLabels} from '../../utils';
import type {CnMods} from '../../utils';
import {ADD_DASH_FORM_LINK, PROMO_BLOCK_CATEGORIES, SPECIAL_CATEGORY} from '../constants';

import './LandingPage.scss';

const b = block('landing');
const galleryIllustrationStore = {
    dark: {
        header: () => import('../../../../../assets/images/illustration/dark/gallery-header.svg'),
    },
    light: {
        header: () => import('../../../../../assets/images/illustration/light/gallery-header.svg'),
    },
};
const BaseIllustration = createIllustration([galleryIllustrationStore]);

function GalleryIllustration(props: Omit<CreateIllustrationProps, 'name'>) {
    return <BaseIllustration name="galleryHeader" {...props} />;
}

interface PromoBlockItemProps {
    title: string;
    icon?: boolean;
    activeMediaQuery?: ActiveMediaQuery;
    counter?: number;
    primary?: boolean;
    imageProps?: AsyncImageProps[];
    category?: string;
}

function PromoBlockItem({
    activeMediaQuery,
    title,
    counter = 0,
    primary,
    imageProps = [],
    category,
    icon,
}: PromoBlockItemProps) {
    const history = useHistory();

    const handleClick = React.useCallback(() => {
        const url = getAllPageUrl({category});
        history.push(url);
    }, [history, category]);

    return (
        <Card
            className={b('promo-block-item-flex', {primary, media: activeMediaQuery})}
            view="clear"
            type="action"
            onClick={handleClick}
        >
            <div className={b('promo-block-item-title', {primary})}>
                {title}
                <span className={b('promo-block-item-title-counter', {primary})}>
                    &nbsp;·&nbsp;{counter}
                </span>
                {icon && (
                    <Button size="l" view="flat">
                        <Button.Icon>
                            <ArrowRight />
                        </Button.Icon>
                    </Button>
                )}
            </div>
            <div className={b('promo-block-item-images-container', {primary})}>
                {imageProps.map((props, index) => {
                    let style: React.CSSProperties = {};
                    if (imageProps.length > 1) {
                        style = primary
                            ? {
                                  top: `${(imageProps.length - 1 - index) * 20}%`,
                                  left: `${(imageProps.length - 1 - index) * 18}%`,
                                  ...(activeMediaQuery === 's' ? {width: '75%'} : {height: '110%'}),
                              }
                            : {
                                  top: `${index * 20}%`,
                                  left: `${(imageProps.length - 1 - index) * 20}%`,
                                  ...(activeMediaQuery === 's' ? {width: '90%'} : {height: '110%'}),
                              };
                    } else {
                        style = {
                            ...(activeMediaQuery === 's' ? {width: '105%'} : {height: '110%'}),
                        };
                    }

                    return (
                        <div
                            key={`promo-image-${index}`}
                            className={b('promo-block-item-image-container', {primary})}
                            style={style}
                        >
                            <AsyncImage
                                className={b('promo-block-item-image', {
                                    primary,
                                    media: activeMediaQuery,
                                })}
                                showSkeleton={true}
                                {...props}
                            />
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

interface PromoBlockRowProps {
    galleryItems: GalleryItemShort[];
    activeMediaQuery?: ActiveMediaQuery;
    editorChoice?: {
        ids: string[];
    };
}

function PromoBlockRow({galleryItems, activeMediaQuery, editorChoice}: PromoBlockRowProps) {
    const themeType = useThemeType();
    const itemsByLabels = groupGalleryItemsByLabels(galleryItems);
    const primaryItems = galleryItems.filter((item) => editorChoice?.ids.includes(item.id));
    const primaryImagesProps: AsyncImageProps[] = primaryItems
        .slice(0, 3)
        .map((item, index, list) => {
            const opacity = activeMediaQuery === 's' ? 1 : 1 - (list.length - 1 - index) * 0.1;
            return {
                src: item.images?.[themeType]?.[0] || '',
                style: {
                    opacity,
                },
            };
        });

    const selectedCategories = sortBy(
        Object.keys(itemsByLabels),
        (label) => -1 * PROMO_BLOCK_CATEGORIES.indexOf(label.toLowerCase()),
    ).slice(0, 5);

    const othersImageProps: AsyncImageProps[] = galleryItems
        .filter((item) => selectedCategories.every((category) => !item?.labels?.includes(category)))
        .slice(0, 3)
        .map((item, index, list) => {
            return {
                src: item.images?.[themeType]?.[0] || '',
                style: {
                    opacity: 1 - (list.length - 1 - index) * 0.35,
                },
            };
        });

    return (
        <Row className={b('promo-block', {media: activeMediaQuery})} space="6">
            <Col l="6" m="6" s="12">
                <PromoBlockItem
                    title="Editor's choice"
                    counter={editorChoice?.ids.length}
                    primary={true}
                    activeMediaQuery={activeMediaQuery}
                    imageProps={primaryImagesProps}
                    category={SPECIAL_CATEGORY.EDITORS_CHOICE}
                />
            </Col>
            {selectedCategories.map((key) => {
                const indexes = itemsByLabels[key] ?? [];
                const imageSrc = galleryItems[indexes[0]]?.images?.[themeType]?.[0] || '';

                return (
                    <Col key={`${key}`} l="3" m="3" s="12">
                        <PromoBlockItem
                            title={`${key.charAt(0).toUpperCase()}${key.slice(1)}`}
                            counter={indexes.length}
                            activeMediaQuery={activeMediaQuery}
                            imageProps={[
                                {
                                    src: imageSrc,
                                },
                            ]}
                            category={key}
                        />
                    </Col>
                );
            })}
            <Col l="3" m="3" s="12">
                <PromoBlockItem
                    icon={true}
                    title={`Показать все`}
                    counter={galleryItems.length}
                    activeMediaQuery={activeMediaQuery}
                    imageProps={othersImageProps}
                />
            </Col>
        </Row>
    );
}

export function LandingPage() {
    const {activeMediaQuery} = useLayoutContext();
    const isActiveMediaQueryS = activeMediaQuery === 's';
    const baseMods: CnMods = {media: activeMediaQuery};
    const themeType = useThemeType();
    const {isLoading: isDataLoading, data} = useGetGalleryItemsQuery();
    const {isLoading: isMetaLoading, data: metaData} = useGetGalleryMetaQuery();

    if (isDataLoading || isMetaLoading) {
        return (
            <div className={b('loader')}>
                <Loader size="m" />
            </div>
        );
    }

    const galleryItems = data ?? [];

    return (
        <Container className={b('container', baseMods)}>
            {/* Header */}
            <Row className={b('header', baseMods)} space="0">
                <Col l="6" m="6" s="12">
                    <Flex className={b('header-illustration-flex', baseMods)}>
                        <GalleryIllustration
                            name="header"
                            className={b('header-illustration', baseMods)}
                            showSkeleton={true}
                        />
                    </Flex>
                </Col>
                <Col l="6" m="6" s="12">
                    <Flex className={b('header-title-flex', baseMods)}>
                        <h1 className={b('header-title')}>Gallery</h1>
                        <span className={b('header-description')}>
                            Use ready-made dashboards and charts,
                            <br /> share your work with the community
                        </span>
                    </Flex>
                </Col>
            </Row>
            {/* Promo block */}
            <PromoBlockRow
                galleryItems={galleryItems}
                activeMediaQuery={activeMediaQuery}
                editorChoice={metaData?.editorChoice}
            />
            {/* Work of the month */}
            <Row className={b('work-of-the-month', baseMods)} space="0">
                <Col m="6" s="12">
                    <Flex className={b('work-of-the-month-flex', baseMods)}>
                        <span className={b('work-of-the-month-medal', {media: activeMediaQuery})}>
                            <Icon data={Medal} />
                            Work of the month
                        </span>
                        <div className={b('work-of-the-month-title', {media: activeMediaQuery})}>
                            COVID-19 Statistics
                        </div>
                        {!isActiveMediaQueryS && (
                            <div className={b('work-of-the-month-description')}>
                                Up-to-date statistics with real-time data on the number of cases,
                                recoveries and vaccinations
                            </div>
                        )}
                        {!isActiveMediaQueryS && (
                            <div className={b('work-of-the-month-actions')}>
                                <Button size="l" view="action">
                                    Open
                                </Button>
                                <Button size="l" view="flat">
                                    Learn more
                                    <Button.Icon>
                                        <ArrowRight />
                                    </Button.Icon>
                                </Button>
                            </div>
                        )}
                    </Flex>
                </Col>
                <Col m="6" s="12">
                    <Flex style={{alignItems: 'center', height: '100%'}}>
                        <Card
                            view="clear"
                            type="action"
                            style={{
                                overflow: 'hidden',
                                height: 'max-content',
                                lineHeight: 0,
                                maxHeight: '100%',
                            }}
                        >
                            <AsyncImage
                                src="https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png"
                                style={{
                                    width: '100%',
                                    borderRadius: 4,
                                }}
                                showSkeleton={true}
                            />
                        </Card>
                    </Flex>
                </Col>
                {isActiveMediaQueryS && (
                    <Col s="12">
                        <div className={b('work-of-the-month-actions')}>
                            <Button size="xl" view="action" style={{width: '50%'}}>
                                Open
                            </Button>
                            <Button size="xl" view="flat" style={{width: '50%'}}>
                                Learn more
                            </Button>
                        </div>
                    </Col>
                )}
            </Row>
            {/* The best of 2024 */}
            <Row space="6" style={{marginTop: 24, marginBottom: isActiveMediaQueryS ? 24 : 48}}>
                <Col s="12">
                    <SectionHeader activeMediaQuery={activeMediaQuery} title="The best of 2024" />
                </Col>
                {galleryItems.slice(0, 3).map((item) => {
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
            {/* Editor examples */}
            <Row space="6" style={{marginTop: 24, marginBottom: isActiveMediaQueryS ? 24 : 48}}>
                <Col s="12">
                    <SectionHeader
                        activeMediaQuery={activeMediaQuery}
                        title="What can be done in the editor"
                        category={GALLERY_ITEM_CATEGORY.EDITOR}
                    />
                </Col>
                {galleryItems.slice(3, 6).map((item) => {
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
            {/* Maps examples */}
            <Row space="6" style={{marginTop: 24, marginBottom: 48}}>
                <Col s="12">
                    <SectionHeader
                        activeMediaQuery={activeMediaQuery}
                        title="With maps"
                        category={GALLERY_ITEM_CATEGORY.GEO}
                    />
                </Col>
                {galleryItems.slice(6, 9).map((item) => {
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
            {/* Add your example */}
            <Row className={b('add-card', baseMods)} space="0">
                <Col s="12">
                    <Flex className={b('add-card-flex')}>
                        <div className={b('add-card-title')}>Add your example</div>
                        <div className={b('add-card-description')}>
                            Share your solutions and inspire others
                        </div>
                        <Link view="normal" target="_blank" href={ADD_DASH_FORM_LINK}>
                            <Button className={b('add-card-button')} size="xl" view="action">
                                Add dashboard
                            </Button>
                        </Link>
                    </Flex>
                </Col>
            </Row>
        </Container>
    );
}
