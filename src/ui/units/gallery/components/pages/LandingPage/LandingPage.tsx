import React from 'react';

import type {ButtonProps} from '@gravity-ui/uikit';
import {Button, Col, Container, Flex, Row, useLayoutContext, useThemeType} from '@gravity-ui/uikit';
import sortBy from 'lodash/sortBy';
import {Link as RouterLink} from 'react-router-dom';
import type {GetMetaRespose} from 'shared/schema/anonymous-schema/public-gallery/actions';
import type {GalleryItemShort} from 'shared/types';
import type {CreateIllustrationProps} from 'ui/components/Illustration/types';
import {createIllustration} from 'ui/components/Illustration/utils';
import {InterpolatedText} from 'ui/components/InterpolatedText/InterpolatedText';
import {SmartLoader} from 'ui/components/SmartLoader/SmartLoader';
import {DL} from 'ui/constants';

import {useGetGalleryItemsQuery, useGetGalleryMetaQuery} from '../../../store/api';
import {GalleryCardPreview, SectionHeader} from '../../blocks';
import {PromoBlockRow} from '../../blocks/PromoBlockRow/PromoBlockRow';
import {WorkOfMonth} from '../../blocks/WorkOfMonth/WorkOfMonth';
import type {CnMods} from '../../utils';
import {
    block,
    galleryAllPageI18n,
    getAllPageUrl,
    getLang,
    galleryLandingI18n as i18n,
} from '../../utils';
import {ADD_DASH_FORM_LINK, SPECIAL_CATEGORY} from '../constants';

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

function HeaderActions() {
    const {isMediaActive, activeMediaQuery} = useLayoutContext();
    const isMobileMediaQuery = !isMediaActive('m');
    const mods: CnMods = {media: activeMediaQuery};
    const buttonWidth: ButtonProps['width'] = isMobileMediaQuery ? 'max' : undefined;

    return (
        <div className={b('header-actions')}>
            <RouterLink className={b('header-actions-link', mods)} to={getAllPageUrl()}>
                <Button width={buttonWidth} size="xl" view="action">
                    {galleryAllPageI18n('title_all_entries')}
                </Button>
            </RouterLink>
            <Button
                href={ADD_DASH_FORM_LINK}
                target="_blank"
                size="xl"
                width={buttonWidth}
                view="outlined"
            >
                {i18n('button_add_dashboard')}
            </Button>
        </div>
    );
}

interface CategoryBlockRowProps {
    galleryItems: GalleryItemShort[];
    landingCategory: GetMetaRespose['landingCategories'][number];
    editorChoiceIds?: string[];
    style?: React.CSSProperties;
}

function CategoryBlockRow(props: CategoryBlockRowProps) {
    const {galleryItems, landingCategory, editorChoiceIds, style} = props;
    const themeType = useThemeType();
    const lang = getLang();
    const filteredGalleryItems = galleryItems.filter((item) => {
        if (landingCategory.category === SPECIAL_CATEGORY.EDITORS_CHOICE) {
            return editorChoiceIds?.includes(item.id);
        }

        return item.labels?.includes(landingCategory.category);
    });
    const categoryItems = sortBy(filteredGalleryItems, (item: GalleryItemShort) => {
        const index = landingCategory.ids?.indexOf(item.id);

        return index === -1 ? Infinity : index;
    }).slice(0, 3);

    return (
        <Row space="6" style={style}>
            <Col size={12}>
                <SectionHeader
                    title={landingCategory.title[lang]}
                    category={landingCategory.category}
                />
            </Col>
            {categoryItems.map((item) => {
                return (
                    <Col key={item.id} size={[12, {m: 4}]}>
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
}

export function LandingPage() {
    const {activeMediaQuery, isMediaActive} = useLayoutContext();
    const {isLoading: isDataLoading, data} = useGetGalleryItemsQuery();
    const {isLoading: isMetaLoading, data: metaData} = useGetGalleryMetaQuery();

    if (isDataLoading || isMetaLoading) {
        return <SmartLoader className={b('loader')} size="m" />;
    }

    const galleryItems = data ?? [];
    const isMobileMediaQuery = !isMediaActive('m');
    const isPromo = DL.IS_NOT_AUTHENTICATED;
    const baseMods: CnMods = {media: activeMediaQuery, maxWidth: isPromo};
    const landingCategories = Array.isArray(metaData?.landingCategories)
        ? metaData.landingCategories
        : [];
    const workOfMonthId = metaData?.workOfTheMonth.id;
    const buttonSize: ButtonProps['size'] = isMobileMediaQuery ? 'xl' : 'l';

    return (
        <Container className={b('container', baseMods)}>
            <Row className={b('header', baseMods)} space="0">
                <Col size={[12, {m: 6}]}>
                    <Flex className={b('header-illustration-flex', baseMods)}>
                        <GalleryIllustration
                            name="header"
                            className={b('header-illustration', {
                                ...baseMods,
                                medium: Boolean(DL.USER_ID),
                            })}
                            showSkeleton={true}
                            role="presentation"
                            aria-hidden="true"
                        />
                    </Flex>
                </Col>
                <Col size={[12, {m: 6}]}>
                    <Flex className={b('header-title-flex', baseMods)}>
                        <h1 className={b('header-title')}>{i18n('header_title')}</h1>
                        <span className={b('header-description')}>
                            <InterpolatedText br text={i18n('header_description')} />
                        </span>
                        <HeaderActions />
                    </Flex>
                </Col>
            </Row>
            <PromoBlockRow
                galleryItems={galleryItems}
                editorChoiceIds={metaData?.editorChoice?.ids}
                className={b('promo-block-row')}
            />
            {workOfMonthId && <WorkOfMonth id={workOfMonthId} />}
            {landingCategories.map((landingCategory, i) => {
                const isLastCategory = i === landingCategories.length - 1;

                return (
                    <CategoryBlockRow
                        key={`landing-category-${landingCategory}-${i}`}
                        galleryItems={galleryItems}
                        landingCategory={landingCategory}
                        editorChoiceIds={metaData?.editorChoice?.ids}
                        style={{
                            marginTop: 24,
                            marginBottom: isMobileMediaQuery && !isLastCategory ? 24 : 48,
                        }}
                    />
                );
            })}
            <Row className={b('add-card', baseMods)} space="0">
                <Col size={12}>
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
