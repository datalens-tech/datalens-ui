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
import {useHistory} from 'react-router';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';
import type {AsyncImageProps} from 'ui/components/AsyncImage/AsyncImage';
import type {CreateIllustrationProps} from 'ui/components/Illustration/types';
import {createIllustration} from 'ui/components/Illustration/utils';
import {GALLERY_ITEM_CATEGORY} from 'ui/units/gallery/constants/gallery-item';

import {useGetGalleryItemsQuery} from '../../../store/api';
import type {GalleryItem} from '../../../types';
import {GalleryCardPreview, SectionHeader} from '../../blocks';
import type {ActiveMediaQuery} from '../../types';
import {block, getAllPageUrl, groupGalleryItemsByLabels} from '../../utils';
import type {CnMods} from '../../utils';
import {ADD_DASH_FORM_LINK, SPECIAL_CATEGORY} from '../constants';
import {EDITORS_CHOICE_ITEM_IDS} from '../mocks';

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
            </div>
            <div className={b('promo-block-item-image-container', {primary})}>
                {imageProps.map((props, index) => (
                    <AsyncImage
                        key={`promo-image-${index}`}
                        className={b('promo-block-item-image', {primary})}
                        showSkeleton={true}
                        {...props}
                    />
                ))}
            </div>
        </Card>
    );
}

interface PromoBlockRowProps {
    title: string;
    galleryItems: GalleryItem[];
    activeMediaQuery?: ActiveMediaQuery;
}

function PromoBlockRow({title, galleryItems, activeMediaQuery}: PromoBlockRowProps) {
    const themeType = useThemeType();
    const itemsByLabels = groupGalleryItemsByLabels(galleryItems);
    const primaryItems = galleryItems.filter((item) => EDITORS_CHOICE_ITEM_IDS.includes(item.id));
    const primaryImagesProps: AsyncImageProps[] = primaryItems.map((item, index) => {
        const baseStyle: React.CSSProperties = {
            width: '76%',
            objectFit: 'cover',
        };
        let stylesByImageIndex: React.CSSProperties = {};
        if (index === 0) {
            stylesByImageIndex = {
                ...stylesByImageIndex,
                left: '30%',
                top: '45%',
                opacity: 0.8,
            };
        } else if (index === 1) {
            stylesByImageIndex = {
                ...stylesByImageIndex,
                left: '15%',
                top: '25%',
                opacity: 0.9,
            };
        }
        return {
            src: item.images?.[themeType]?.[0] || '',
            style: {
                ...baseStyle,
                ...stylesByImageIndex,
            },
        };
    });
    return (
        <Row className={b('promo-block', {media: activeMediaQuery})} space="6">
            {activeMediaQuery !== 's' && (
                <Col s="12">
                    <SectionHeader activeMediaQuery={activeMediaQuery} title={title} />
                </Col>
            )}
            <Col l="6" m="6" s="12">
                <PromoBlockItem
                    title="Editor's choice"
                    counter={EDITORS_CHOICE_ITEM_IDS.length}
                    primary={true}
                    activeMediaQuery={activeMediaQuery}
                    imageProps={primaryImagesProps}
                    category={SPECIAL_CATEGORY.EDITORS_CHOICE}
                />
            </Col>
            {Object.entries(itemsByLabels).map(([key, indexes]) => {
                const imageSrc = galleryItems[indexes[0]].images?.[themeType]?.[0] || '';
                return (
                    <Col key={`${key}`} l="3" m="3" s="12">
                        <PromoBlockItem
                            title={`${key.charAt(0).toUpperCase()}${key.slice(1)}`}
                            counter={indexes.length}
                            activeMediaQuery={activeMediaQuery}
                            imageProps={[
                                {
                                    src: imageSrc,
                                    style: {
                                        objectFit: 'cover',
                                        ...(activeMediaQuery === 's'
                                            ? {width: '110%'}
                                            : {height: '110%'}),
                                    },
                                },
                            ]}
                            category={key}
                        />
                    </Col>
                );
            })}
        </Row>
    );
}

export function LandingPage() {
    const {activeMediaQuery} = useLayoutContext();
    const isActiveMediaQueryS = activeMediaQuery === 's';
    const baseMods: CnMods = {media: activeMediaQuery};
    const themeType = useThemeType();
    const {isLoading, data} = useGetGalleryItemsQuery({});

    if (isLoading) {
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
                title="Industries"
                galleryItems={galleryItems}
                activeMediaQuery={activeMediaQuery}
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
