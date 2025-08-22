import React from 'react';

import {ArrowRight, ChevronRight} from '@gravity-ui/icons';
import {Card, Col, Row, useLayoutContext, useThemeType} from '@gravity-ui/uikit';
import sortBy from 'lodash/sortBy';
import {Link as RouterLink} from 'react-router-dom';
import type {GalleryItemShort} from 'shared/types';
import type {AsyncImageProps} from 'ui/components/AsyncImage/AsyncImage';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';

import {PROMO_BLOCK_CATEGORIES, SPECIAL_CATEGORY} from '../../pages/constants';
import type {ActiveMediaQuery} from '../../types';
import {
    block,
    galleryI18n,
    getAllPageUrl,
    getCategoryLabelTitle,
    groupGalleryItemsByLabels,
    galleryLandingI18n as i18n,
} from '../../utils';

import './PromoBlockRow.scss';

const b = block('promo-block-row');

interface PromoBlockItemProps {
    title: string;
    icon?: boolean;
    counter?: number;
    primary?: boolean;
    imageProps?: AsyncImageProps[];
    category?: string;
    view?: PromoBlockRowProps['view'];
    centered?: boolean;
}

function PromoBlockItem({
    title,
    counter = 0,
    primary,
    imageProps = [],
    category,
    icon,
    view,
    centered,
}: PromoBlockItemProps) {
    const {activeMediaQuery, isMediaActive} = useLayoutContext();

    const isMobileMediaQuery = !isMediaActive('m');

    const renderImage = React.useCallback(
        (props: AsyncImageProps, index: number) => {
            let style: React.CSSProperties = {};

            if (imageProps.length > 1) {
                style = primary
                    ? {
                          top: `${(imageProps.length - 1 - index) * 20}%`,
                          left: `${(imageProps.length - 1 - index) * 18}%`,
                          ...(isMobileMediaQuery ? {width: '75%'} : {height: '110%'}),
                      }
                    : {
                          top: `${index * 20}%`,
                          left: `${(imageProps.length - 1 - index) * 20}%`,
                          ...(isMobileMediaQuery ? {width: '90%'} : {height: '110%'}),
                      };
            } else if (view === 'promo') {
                style = primary && isMediaActive('s') ? {width: '120%'} : {height: '140%'};
            } else {
                style = {
                    ...(isMediaActive('l') ? {height: '110%'} : {width: '105%'}),
                };
            }

            return (
                <div
                    key={`promo-image-${index}`}
                    className={b('item-image-container', {primary})}
                    style={style}
                >
                    <AsyncImage
                        className={b('item-image', {
                            primary,
                            media: activeMediaQuery,
                        })}
                        showSkeleton={true}
                        {...props}
                    />
                </div>
            );
        },
        [activeMediaQuery, imageProps.length, isMediaActive, isMobileMediaQuery, primary, view],
    );

    const iconComponent =
        view === 'promo' ? <ChevronRight width={22} height={22} /> : <ArrowRight />;

    return (
        <RouterLink className={b('link-wrapper')} to={getAllPageUrl({category})}>
            <Card
                className={b('item-flex', {
                    primary,
                    media: activeMediaQuery,
                    centered,
                })}
                view="clear"
            >
                <div className={b('item-title', {primary})}>
                    {title}
                    <span className={b('item-title-counter', {primary})}>
                        &nbsp;·&nbsp;{counter}
                    </span>
                    {icon && iconComponent}
                </div>
                {imageProps.length > 0 && (
                    <div className={b('item-images-container', {primary})}>
                        {imageProps.map(renderImage)}
                    </div>
                )}
            </Card>
        </RouterLink>
    );
}

interface PromoBlockRowProps {
    galleryItems: GalleryItemShort[];
    activeMediaQuery?: ActiveMediaQuery;
    editorChoiceIds?: string[];
    className?: string;
    view?: 'gallery' | 'promo';
}

export function PromoBlockRow({
    galleryItems,
    editorChoiceIds,
    className,
    view = 'gallery',
}: PromoBlockRowProps) {
    const {activeMediaQuery, isMediaActive} = useLayoutContext();
    const themeType = useThemeType();
    const itemsByLabels = groupGalleryItemsByLabels(galleryItems);
    const primaryItems = galleryItems.filter((item) => editorChoiceIds?.includes(item.id));

    const isMobileMediaQuery = !isMediaActive('m');

    const isGalleryView = view === 'gallery';

    const primaryImagesProps: AsyncImageProps[] = sortBy(primaryItems, (item) =>
        editorChoiceIds?.indexOf(item.id),
    )
        .slice(0, 3)
        .reverse()
        .map((item, index, list) => {
            const opacity = isMobileMediaQuery ? 1 : 1 - (list.length - 1 - index) * 0.1;
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
        <Row className={b({media: activeMediaQuery, view}, className)} space="6">
            <Col size={[12, {l: 8, xl: 6}]}>
                <PromoBlockItem
                    title={galleryI18n('label_best-works')}
                    counter={editorChoiceIds?.length}
                    primary={true}
                    imageProps={
                        isGalleryView ? primaryImagesProps : [{src: primaryImagesProps[0]?.src}]
                    }
                    category={SPECIAL_CATEGORY.EDITORS_CHOICE}
                    view={view}
                />
            </Col>
            {selectedCategories.map((key) => {
                const indexes = itemsByLabels[key] ?? [];
                const imageSrc = galleryItems[indexes[0]]?.images?.[themeType]?.[0] || '';

                return (
                    <Col key={`${key}`} size={[12, {s: 6, l: 4, xl: 3}]}>
                        <PromoBlockItem
                            title={getCategoryLabelTitle(key)}
                            counter={indexes.length}
                            imageProps={[
                                {
                                    src: imageSrc,
                                },
                            ]}
                            category={key}
                            view={view}
                        />
                    </Col>
                );
            })}
            <Col size={[12, {s: 6, l: 4, xl: 3}]}>
                <PromoBlockItem
                    icon={true}
                    title={i18n('label_show-all')}
                    counter={galleryItems.length}
                    imageProps={isGalleryView ? othersImageProps : []}
                    view={view}
                    centered={view === 'promo'}
                />
            </Col>
        </Row>
    );
}
