import React from 'react';

import {ArrowRight} from '@gravity-ui/icons';
import {
    Button,
    Card,
    Col,
    Container,
    Flex,
    Row,
    useLayoutContext,
    useThemeType,
} from '@gravity-ui/uikit';
import type {ButtonProps} from '@gravity-ui/uikit';
import sortBy from 'lodash/sortBy';
import {Link as RouterLink} from 'react-router-dom';
import type {GalleryItemShort} from 'shared/types';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';
import type {AsyncImageProps} from 'ui/components/AsyncImage/AsyncImage';
import type {CreateIllustrationProps} from 'ui/components/Illustration/types';
import {createIllustration} from 'ui/components/Illustration/utils';
import {InterpolatedText} from 'ui/components/InterpolatedText/InterpolatedText';
import {SmartLoader} from 'ui/components/SmartLoader/SmartLoader';
import {DL} from 'ui/constants';

import {useGetGalleryItemsQuery, useGetGalleryMetaQuery} from '../../../store/api';
import {GalleryCardPreview, SectionHeader} from '../../blocks';
import {WorkOfMonth} from '../../blocks/WorkOfMonth/WorkOfMonth';
import type {ActiveMediaQuery} from '../../types';
import {
    block,
    galleryAllPageI18n,
    galleryI18n,
    getAllPageUrl,
    getCategoryLabelTitle,
    getLang,
    groupGalleryItemsByLabels,
    galleryLandingI18n as i18n,
} from '../../utils';
import type {CnMods} from '../../utils';
import {ADD_DASH_FORM_LINK, PROMO_BLOCK_CATEGORIES, SPECIAL_CATEGORY} from '../constants';

import './LandingPage.scss';

const b = block('landing');
const galleryIllustrationStore = {
    dark: {
        header: () => import('../../../../../assets/images/illustration/dark/gallery-header.png'),
    },
    light: {
        header: () => import('../../../../../assets/images/illustration/light/gallery-header.png'),
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
    const renderImage = React.useCallback(
        (props: AsyncImageProps, index: number) => {
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
        },
        [activeMediaQuery, imageProps, primary],
    );

    return (
        <RouterLink className={b('promo-block-link-wrapper')} to={getAllPageUrl({category})}>
            <Card
                className={b('promo-block-item-flex', {primary, media: activeMediaQuery})}
                view="clear"
                type="action"
            >
                <div className={b('promo-block-item-title', {primary})}>
                    {title}
                    <span className={b('promo-block-item-title-counter', {primary})}>
                        &nbsp;·&nbsp;{counter}
                    </span>
                    {icon && <ArrowRight />}
                </div>
                <div className={b('promo-block-item-images-container', {primary})}>
                    {imageProps.map(renderImage)}
                </div>
            </Card>
        </RouterLink>
    );
}

interface PromoBlockRowProps {
    galleryItems: GalleryItemShort[];
    activeMediaQuery?: ActiveMediaQuery;
    editorChoiceIds?: string[];
}

function PromoBlockRow({galleryItems, activeMediaQuery, editorChoiceIds}: PromoBlockRowProps) {
    const themeType = useThemeType();
    const itemsByLabels = groupGalleryItemsByLabels(galleryItems);
    const primaryItems = galleryItems.filter((item) => editorChoiceIds?.includes(item.id));
    const primaryImagesProps: AsyncImageProps[] = sortBy(primaryItems, (item) =>
        editorChoiceIds?.indexOf(item.id),
    )
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
                    title={galleryI18n('label_best-works')}
                    counter={editorChoiceIds?.length}
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
                            title={getCategoryLabelTitle(key)}
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
                    title={i18n('label_show-all')}
                    counter={galleryItems.length}
                    activeMediaQuery={activeMediaQuery}
                    imageProps={othersImageProps}
                />
            </Col>
        </Row>
    );
}

interface HeaderActionsProps {
    activeMediaQuery?: ActiveMediaQuery;
}

function HeaderActions({activeMediaQuery}: HeaderActionsProps) {
    const isActiveMediaQueryS = activeMediaQuery === 's';
    const mods: CnMods = {media: activeMediaQuery};
    const buttonSize: ButtonProps['size'] = isActiveMediaQueryS ? 'xl' : 'l';
    const buttonWidth: ButtonProps['width'] = isActiveMediaQueryS ? 'max' : undefined;

    return (
        <div className={b('header-actions')}>
            <RouterLink className={b('header-actions-link', mods)} to={getAllPageUrl()}>
                <Button width={buttonWidth} size={buttonSize} view="action">
                    {galleryAllPageI18n('title_all_entries')}
                </Button>
            </RouterLink>
            <Button
                href={ADD_DASH_FORM_LINK}
                target="_blank"
                size={buttonSize}
                width={buttonWidth}
                view="outlined"
            >
                {i18n('button_add_dashboard')}
            </Button>
        </div>
    );
}

export function LandingPage() {
    const {activeMediaQuery} = useLayoutContext();
    const themeType = useThemeType();
    const {isLoading: isDataLoading, data} = useGetGalleryItemsQuery();
    const {isLoading: isMetaLoading, data: metaData} = useGetGalleryMetaQuery();

    if (isDataLoading || isMetaLoading) {
        return <SmartLoader className={b('loader')} size="m" />;
    }

    const galleryItems = data ?? [];
    const isActiveMediaQueryS = activeMediaQuery === 's';
    const isPromo = DL.IS_NOT_AUTHENTICATED;
    const baseMods: CnMods = {media: activeMediaQuery, maxWidth: isPromo};
    const lang = getLang();
    const landingCategories = Array.isArray(metaData?.landingCategories)
        ? metaData.landingCategories
        : [];
    const workOfMonthId = metaData?.workOfTheMonth.id;
    const buttonSize: ButtonProps['size'] = isActiveMediaQueryS ? 'xl' : 'l';

    return (
        <Container className={b('container', baseMods)}>
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
                        <h1 className={b('header-title')}>{i18n('header_title')}</h1>
                        <span className={b('header-description')}>
                            <InterpolatedText br text={i18n('header_description')} />
                        </span>
                        <HeaderActions activeMediaQuery={activeMediaQuery} />
                    </Flex>
                </Col>
            </Row>
            <PromoBlockRow
                galleryItems={galleryItems}
                activeMediaQuery={activeMediaQuery}
                editorChoiceIds={metaData?.editorChoice?.ids}
            />
            {workOfMonthId && <WorkOfMonth id={workOfMonthId} />}
            {landingCategories.map((landingCategoriy, i) => {
                const isLastCategory = i === landingCategories.length - 1;
                return (
                    <Row
                        key={`landing-category-${landingCategoriy}-${i}`}
                        space="6"
                        style={{
                            marginTop: 24,
                            marginBottom: isActiveMediaQueryS && !isLastCategory ? 24 : 48,
                        }}
                    >
                        <Col s="12">
                            <SectionHeader
                                activeMediaQuery={activeMediaQuery}
                                title={landingCategoriy.title[lang]}
                                category={landingCategoriy.category}
                            />
                        </Col>
                        {galleryItems
                            .filter((item) => {
                                if (landingCategoriy.category === SPECIAL_CATEGORY.EDITORS_CHOICE) {
                                    return metaData?.editorChoice?.ids.includes(item.id);
                                }
                                return item.labels?.includes(landingCategoriy.category);
                            })
                            .slice(0, 3)
                            .map((item) => {
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
                );
            })}
            <Row className={b('add-card', baseMods)} space="0">
                <Col s="12">
                    <Flex className={b('add-card-flex')}>
                        <div className={b('add-card-title')}>{i18n('section_add_example')}</div>
                        <div className={b('add-card-description')}>
                            <InterpolatedText br text={i18n('section_add_description')} />
                        </div>
                        <Button
                            className={b('add-card-button')}
                            href={ADD_DASH_FORM_LINK}
                            size={buttonSize}
                            target="_blank"
                            view="action"
                        >
                            {i18n('button_add_dashboard')}
                        </Button>
                    </Flex>
                </Col>
            </Row>
        </Container>
    );
}
