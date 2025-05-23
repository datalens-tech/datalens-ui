import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {ArrowLeft, ArrowShapeTurnUpRight, Calendar, Person, Xmark} from '@gravity-ui/icons';
import {
    Button,
    Card,
    Col,
    Container,
    Flex,
    Icon,
    Row,
    Text,
    useLayoutContext,
    useThemeType,
} from '@gravity-ui/uikit';
import type {ButtonProps, IconData} from '@gravity-ui/uikit';
import {unstable_Breadcrumbs as Breadcrumbs} from '@gravity-ui/uikit/unstable';
import {useHistory, useParams} from 'react-router-dom';
import type {GalleryItem, TranslationsDict} from 'shared/types';
import {ActionPanel} from 'ui/components/ActionPanel';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {SmartLoader} from 'ui/components/SmartLoader/SmartLoader';
import {URL_OPTIONS} from 'ui/constants';
import {useMarkdown} from 'ui/hooks/useMarkdown';
import type {DataLensApiError} from 'ui/typings';
import {useGetGalleryItemQuery, useGetGalleryItemsQuery} from 'ui/units/gallery/store/api';
import Utils from 'ui/utils';

import {GalleryCardLabels, GalleryCardPreview, SectionHeader} from '../../blocks';
import type {ActiveMediaQuery} from '../../types';
import {block, getLang} from '../../utils';
import type {CnMods} from '../../utils';
import {PARTNER_FORM_LINK} from '../constants';

import {FullscreenGallery} from './FullscreenGallery/FullscreenGallery';
import {PreviewCard} from './PreviewCard/PreviewCard';

import './CardPage.scss';

const b = block('card');

// TODO: CHARTS-11481
const i18n = (key: string) => {
    switch (key) {
        case 'label_unknown-error':
            return 'An error occured';
        case 'label_retry':
            return 'Retry';
        default:
            return key;
    }
};

interface IconWithTextProps {
    iconData: IconData;
    text: string;
}

function getIframeUrl({publicUrl, lang, theme}: {publicUrl?: string; lang: string; theme: string}) {
    if (!publicUrl) {
        return publicUrl;
    }

    const url = new URL(publicUrl);

    url.searchParams.set(URL_OPTIONS.LANGUAGE, lang);
    url.searchParams.set(URL_OPTIONS.THEME, theme);

    return url.toString();
}

function IconWithText(props: IconWithTextProps) {
    return (
        <Flex justifyContent="center" alignItems="center" style={{columnGap: 4}}>
            <Icon size={16} data={props.iconData} className={b('icon-with-text-icon')} />
            <Text variant="body-2">{props.text}</Text>
        </Flex>
    );
}

function ContactPartnerButton(props: {
    partnerId?: string | null;
    activeMediaQuery: ActiveMediaQuery;
}) {
    const {partnerId, activeMediaQuery} = props;

    const handleClick = React.useCallback(() => {
        if (!partnerId) {
            return;
        }

        const formUrl = new URL(PARTNER_FORM_LINK);
        formUrl.searchParams.append('partner', partnerId);
        formUrl.searchParams.append('link', window.location.href);
        window.open(formUrl, '_blank');
    }, [partnerId]);

    if (!partnerId) {
        return null;
    }

    const mods: CnMods = {media: activeMediaQuery};
    const isActiveMediaQueryS = activeMediaQuery === 's';
    const buttonProps: ButtonProps = isActiveMediaQueryS ? {width: 'max', size: 'xl'} : {};

    return (
        <Button className={b('contact-partner-btn', mods)} {...buttonProps} onClick={handleClick}>
            Contact a partner
        </Button>
    );
}

interface CardActionPanelProps {
    activeMediaQuery: ActiveMediaQuery;
    entry: GalleryItem;
    showPreview: boolean;
    togglePreview: () => void;
    lang: string;
}

function CardActionPanel({
    activeMediaQuery,
    entry,
    showPreview,
    togglePreview,
    lang,
}: CardActionPanelProps) {
    const history = useHistory();
    const isActiveMediaQueryS = activeMediaQuery === 's';
    const mods: CnMods = {media: activeMediaQuery};

    let leftItems: React.ReactNode = null;

    if (showPreview) {
        leftItems = (
            <Flex className={b('actions-left-flex', mods)}>
                {isActiveMediaQueryS && (
                    <Button view="flat" onClick={togglePreview}>
                        <Button.Icon>
                            <Icon data={ArrowLeft} />
                        </Button.Icon>
                    </Button>
                )}
                <Text variant={isActiveMediaQueryS ? 'subheader-2' : 'header-1'} ellipsis={true}>
                    {entry.title[lang]}
                </Text>
            </Flex>
        );
    } else {
        leftItems = (
            <Breadcrumbs navigate={(href) => history.push(href)}>
                <Breadcrumbs.Item href="/gallery">Gallery</Breadcrumbs.Item>
                <Breadcrumbs.Item disabled={true}>{entry.title[lang]}</Breadcrumbs.Item>
            </Breadcrumbs>
        );
    }

    let rightItems: React.ReactNode = null;

    if (isActiveMediaQueryS) {
        rightItems = (
            <Flex className={b('actions-right-flex', mods)}>
                <Button>
                    <Button.Icon>
                        <Icon data={ArrowShapeTurnUpRight} />
                    </Button.Icon>
                </Button>
            </Flex>
        );
    } else {
        rightItems = (
            <Flex className={b('actions-right-flex', mods)}>
                <Button>
                    <Button.Icon>
                        <Icon data={ArrowShapeTurnUpRight} />
                    </Button.Icon>
                </Button>
                <ContactPartnerButton
                    partnerId={entry.partnerId}
                    activeMediaQuery={activeMediaQuery}
                />
                <Button view={showPreview ? 'normal' : 'action'} onClick={togglePreview}>
                    {showPreview ? (
                        <Button.Icon>
                            <Icon data={Xmark} />
                        </Button.Icon>
                    ) : (
                        'Open'
                    )}
                </Button>
            </Flex>
        );
    }

    return <ActionPanel leftItems={leftItems} rightItems={rightItems} />;
}

interface CardPreviewProps {
    activeMediaQuery: ActiveMediaQuery;
    images?: GalleryItem['images'];
}

function CardPreview({activeMediaQuery, images}: CardPreviewProps) {
    const mods: CnMods = {media: activeMediaQuery};
    const themeType = useThemeType();
    const themeImages = React.useMemo(() => {
        return images?.[themeType] ?? [];
    }, [themeType, images]);
    const [selectedImage, setSelectedImage] = React.useState(themeImages[0] || '');
    const [showFullscreenGallery, setShowFullscreenGallery] = React.useState(false);

    const isActiveMediaQueryS = activeMediaQuery === 's';

    const handleImageClick = () => {
        if (isActiveMediaQueryS) {
            setShowFullscreenGallery(true);
        }
    };

    const handleCloseFullscreenGallery = () => {
        setShowFullscreenGallery(false);
    };

    const selectedImageIndex = themeImages.findIndex((img) => img === selectedImage);

    return (
        <React.Fragment>
            {showFullscreenGallery && isActiveMediaQueryS && (
                <FullscreenGallery
                    images={themeImages}
                    initialImageIndex={selectedImageIndex === -1 ? 0 : selectedImageIndex}
                    onClose={handleCloseFullscreenGallery}
                />
            )}
            <Col m="10" s="12">
                <Card
                    className={b('image-card')}
                    type="action"
                    view="outlined"
                    onClick={handleImageClick}
                >
                    <AsyncImage
                        className={b('image-card-content')}
                        showSkeleton={true}
                        src={selectedImage}
                    />
                </Card>
            </Col>
            <Col m="2" s="12">
                <Flex className={b('image-card-preview-flex', mods)}>
                    {themeImages.map((image, i) => {
                        return (
                            <PreviewCard
                                key={i}
                                selected={selectedImage === image}
                                onSelected={(newSelectedImage) => {
                                    setSelectedImage(newSelectedImage);
                                }}
                                image={image}
                                size={isActiveMediaQueryS ? 's' : 'auto'}
                            />
                        );
                    })}
                </Flex>
            </Col>
        </React.Fragment>
    );
}

interface CardDescriptionProps {
    lang: string;
    description?: TranslationsDict;
    shortDescription?: TranslationsDict;
}

const MarkdownContent = (props: {children: string}) => {
    const {markdown} = useMarkdown({value: props.children, className: b('md')});

    return markdown;
};

function CardDescription({lang, description, shortDescription}: CardDescriptionProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const shouldShowButton = Boolean(description);

    const getTranslation = (dict?: TranslationsDict) => dict?.[lang] || '';

    return (
        <Flex direction="column">
            {shortDescription && <Text variant="body-2">{getTranslation(shortDescription)}</Text>}
            {isExpanded && description && (
                <MarkdownContent>{getTranslation(description)}</MarkdownContent>
            )}
            {shouldShowButton && (
                <Button
                    className={b('card-description-collapse-button')}
                    size="xs"
                    view="flat-secondary"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? 'Collapse' : 'Show full'}
                </Button>
            )}
        </Flex>
    );
}

interface CardContentProps {
    activeMediaQuery: ActiveMediaQuery;
    entry: GalleryItem;
    togglePreview: () => void;
    lang: string;
}

function CardContent({activeMediaQuery, entry, togglePreview, lang}: CardContentProps) {
    const isActiveMediaQueryS = activeMediaQuery === 's';
    const mods: CnMods = {media: activeMediaQuery};
    const themeType = useThemeType();
    const {data: galleryItems = []} = useGetGalleryItemsQuery();
    const otherWorks = galleryItems
        .slice(0, 4)
        .filter((item) => item.id !== entry.id)
        .slice(0, 3);

    return (
        <Container className={b('container', mods)}>
            <Row space="0" style={{marginTop: 28, marginBottom: 28}}>
                <Col s="12">
                    <Text variant="header-2">{entry.title[lang]}</Text>
                </Col>
            </Row>
            <Row space="4" spaceRow="4" style={{marginTop: 0, marginBottom: 32}}>
                <CardPreview activeMediaQuery={activeMediaQuery} images={entry.images} />
            </Row>
            {isActiveMediaQueryS && (
                <Row space="0" spaceRow="4" style={{marginTop: 48, marginBottom: 28}}>
                    <Col s="12">
                        <Flex className={b('actions-right-flex', mods)}>
                            <Button size="xl" onClick={togglePreview}>
                                <Button.Icon>
                                    <Icon data={ArrowShapeTurnUpRight} size={20} />
                                </Button.Icon>
                            </Button>
                            <Button view="action" size="xl" width="max" onClick={togglePreview}>
                                Open
                            </Button>
                        </Flex>
                        <ContactPartnerButton
                            partnerId={entry.partnerId}
                            activeMediaQuery={activeMediaQuery}
                        />
                    </Col>
                </Row>
            )}
            <Row space="0" spaceRow="4" style={{marginTop: 48}}>
                <Col s="12">
                    <CardDescription
                        shortDescription={entry.shortDescription}
                        description={entry.description}
                        lang={lang}
                    />
                </Col>
                <Col s="12">
                    <Flex className={b('card-info-flex', mods)}>
                        <IconWithText iconData={Person} text={entry.createdBy} />
                        <IconWithText
                            iconData={Calendar}
                            text={dateTime({input: entry.createdAt}).format('DD MMMM YYYY')}
                        />
                    </Flex>
                </Col>
                <Col s="12">
                    <GalleryCardLabels labels={entry.labels} />
                </Col>
            </Row>
            <Row space="6" style={{marginTop: 24}}>
                <Col s="12">
                    <SectionHeader activeMediaQuery={activeMediaQuery} title="Other works" />
                </Col>
                {otherWorks.map((item) => {
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
                <Col s="12" />
            </Row>
        </Container>
    );
}

export function CardPage() {
    const {activeMediaQuery} = useLayoutContext();
    const [showPreview, setShowPreview] = React.useState(false);

    const {id} = useParams<{id: string}>();

    const {isLoading, data, error, refetch} = useGetGalleryItemQuery({id});

    const lang = getLang();
    const themeType = useThemeType();

    const togglePreview = () => {
        setShowPreview(!showPreview);
    };

    if (isLoading) {
        return <SmartLoader className={b('loader')} size="m" />;
    }

    if (error || !data) {
        const {
            code,
            status,
            message = i18n('label_unknown-error'),
            details,
        } = error && 'message' in error ? Utils.parseErrorResponse(error as DataLensApiError) : {};

        const isNotFound = code === 'NOT_FOUND' || status === 404;
        const name = isNotFound ? 'notFound' : 'error';
        const canRetry = !isNotFound;

        return (
            <div className={b('error')}>
                <PlaceholderIllustration
                    name={name}
                    title={details?.title ?? message}
                    description={details?.description}
                    renderAction={
                        canRetry
                            ? () => <Button onClick={refetch}>{i18n('label_retry')}</Button>
                            : undefined
                    }
                />
            </div>
        );
    }

    return (
        <React.Fragment>
            <CardActionPanel
                activeMediaQuery={activeMediaQuery}
                entry={data}
                showPreview={showPreview}
                togglePreview={togglePreview}
                lang={lang}
            />
            {showPreview ? (
                <iframe
                    className={b('iframe')}
                    src={getIframeUrl({publicUrl: data.publicUrl, theme: themeType, lang})}
                />
            ) : (
                <CardContent
                    activeMediaQuery={activeMediaQuery}
                    entry={data}
                    togglePreview={togglePreview}
                    lang={lang}
                />
            )}
        </React.Fragment>
    );
}
