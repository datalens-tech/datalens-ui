import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {
    ArrowDownToLine,
    ArrowLeft,
    Calendar,
    FileArrowUp,
    Link as LinkIcon,
    Person,
    Xmark,
} from '@gravity-ui/icons';
import {
    ActionTooltip,
    Breadcrumbs,
    Button,
    Card,
    Col,
    Container,
    DropdownMenu,
    Flex,
    Icon,
    Link,
    Row,
    Text,
    useLayoutContext,
    useMobile,
    useThemeType,
} from '@gravity-ui/uikit';
import type {ButtonProps, IconData} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useHistory, useLocation, useParams} from 'react-router-dom';
import {ErrorContentTypes} from 'shared';
import type {GalleryItem, TranslationsDict} from 'shared/types';
import {ActionPanel} from 'ui/components/ActionPanel';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';
import ErrorContent from 'ui/components/ErrorContent/ErrorContent';
import {SmartLoader} from 'ui/components/SmartLoader/SmartLoader';
import {DL, URL_OPTIONS} from 'ui/constants';
import {useMarkdown} from 'ui/hooks/useMarkdown';
import {PUBLIC_GALLERY_ID_SEARCH_PARAM} from 'ui/units/collections/components/constants';
import {useGetGalleryItemQuery, useGetGalleryItemsQuery} from 'ui/units/gallery/store/api';
import Utils from 'ui/utils';
import {copyTextWithToast} from 'ui/utils/copyText';

import {GalleryCardLabels, GalleryCardPreview, PageHeader, SectionHeader} from '../../blocks';
import type {ActiveMediaQuery} from '../../types';
import {
    block,
    galleryI18n,
    getAllPageUrl,
    getGalleryItemUrl,
    getLang,
    galleryCardPageI18n as i18n,
    utilityI18n,
} from '../../utils';
import type {CnMods} from '../../utils';
import {CARD_PAGE_URL_PARAMS, PARTNER_FORM_LINK} from '../constants';
import {useElementRect} from '../hooks/useElementRect';

import {FullscreenGallery} from './FullscreenGallery/FullscreenGallery';
import {PreviewCard} from './PreviewCard/PreviewCard';
import {useErrorLayoutAdjustment} from './hooks/useErrorLayoutAdjustment';

import './CardPage.scss';

const b = block('card');
const toasterI18n = I18n.keyset('component.entry-context-menu.view');

const isPromo = DL.IS_NOT_AUTHENTICATED;

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

function LinkButton(props: ButtonProps & {entryId: string}) {
    const {entryId, ...buttonProps} = props;
    const mobile = useMobile();
    const text = `${window.location.origin}${getGalleryItemUrl({id: entryId})}`;
    const button = (
        <Button
            {...buttonProps}
            onClick={() => {
                copyTextWithToast({
                    copyText: text,
                    errorText: toasterI18n('toast_copy-error'),
                    successText: toasterI18n('toast_copy-link-success'),
                    toastName: 'dl-gallery-copy-link',
                });
            }}
        >
            <Button.Icon>
                <Icon data={LinkIcon} />
            </Button.Icon>
        </Button>
    );

    return mobile ? (
        button
    ) : (
        <ActionTooltip title={utilityI18n('button_copy')}>{button}</ActionTooltip>
    );
}

const getDropdownItem = ({icon, text, hint}: {icon: IconData; text: string; hint?: string}) => {
    return (
        <div className={b('dropdown-item')}>
            <Icon className={b('dropdown-icon')} data={icon} />
            <div className={b('dropdown-text')}>
                {text}
                {hint && <div className={b('dropdown-hint')}>{hint}</div>}
            </div>
        </div>
    );
};

function UseButton(props: {url: string; entryId: string}) {
    const history = useHistory();

    return (
        <DropdownMenu
            items={[
                {
                    action: () => {
                        Utils.downloadFileByUrl(props.url, `${props.entryId}.json`);
                    },
                    text: getDropdownItem({
                        text: i18n('button_download'),
                        hint: i18n('text_download-desctiption'),
                        icon: ArrowDownToLine,
                    }),
                },
                {
                    action: () => {
                        const redirectUrl = `/collections/?${PUBLIC_GALLERY_ID_SEARCH_PARAM}=${props.entryId}`;

                        if (DL.IS_NOT_AUTHENTICATED) {
                            window.location.href = redirectUrl;
                        } else {
                            history.push(redirectUrl);
                        }
                    },
                    text: getDropdownItem({
                        text: i18n('button_import'),
                        hint: i18n('text_import-desctiption'),
                        icon: FileArrowUp,
                    }),
                },
            ]}
            renderSwitcher={(props) => <Button {...props}>{i18n('button_use')}</Button>}
        />
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
            {i18n('button_contact_partner')}
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
                <Text
                    variant={isActiveMediaQueryS ? 'subheader-2' : 'header-1'}
                    ellipsis={true}
                    style={{minWidth: 0}}
                >
                    {entry.title[lang]}
                </Text>
            </Flex>
        );
    } else {
        leftItems = (
            <Flex style={{minWidth: 0, flexGrow: 1, flexShrink: 1, flexBasis: 'auto'}}>
                <Breadcrumbs className={b('breadcrumbs')}>
                    <Breadcrumbs.Item href="/gallery">
                        {galleryI18n('label_gallery')}
                    </Breadcrumbs.Item>
                    <Breadcrumbs.Item disabled={true}>{entry.title[lang]}</Breadcrumbs.Item>
                </Breadcrumbs>
            </Flex>
        );
    }

    let rightItems: React.ReactNode = null;

    if (isActiveMediaQueryS) {
        rightItems = (
            <Flex className={b('actions-right-flex', mods)} style={{flexShrink: 0}}>
                <LinkButton entryId={entry.id} />
                {entry.data && <UseButton entryId={entry.id} url={entry.data} />}
            </Flex>
        );
    } else {
        rightItems = (
            <Flex className={b('actions-right-flex', mods)} style={{flexShrink: 0}}>
                <LinkButton entryId={entry.id} />
                <ContactPartnerButton
                    partnerId={entry.partnerId}
                    activeMediaQuery={activeMediaQuery}
                />
                {entry.data && <UseButton entryId={entry.id} url={entry.data} />}
                <Button view={showPreview ? 'normal' : 'action'} onClick={togglePreview}>
                    {showPreview ? (
                        <Button.Icon>
                            <Icon data={Xmark} />
                        </Button.Icon>
                    ) : (
                        galleryI18n('button_open')
                    )}
                </Button>
            </Flex>
        );
    }

    return (
        <ActionPanel
            leftItems={leftItems}
            rightItems={rightItems}
            wrapperRef={isPromo ? setActionPanelNode : undefined}
            style={{
                ...actionPanelStyle,
                maxWidth: '100vw',
                overflow: 'hidden',
            }}
        />
    );
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

    React.useEffect(() => {
        setSelectedImage(themeImages[0] || '');
    }, [themeImages]);

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

function CardDescription({lang, description, shortDescription}: CardDescriptionProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const {markdown} = useMarkdown({value: getTranslation(description), className: b('md')});
    const shouldShowButton = Boolean(description);

    function getTranslation(dict?: TranslationsDict) {
        return dict?.[lang] || '';
    }

    React.useEffect(() => {
        setIsExpanded(false);
    }, [description, shortDescription]);

    return (
        <Flex direction="column">
            {shortDescription && <Text variant="body-2">{getTranslation(shortDescription)}</Text>}
            {isExpanded && description && markdown}
            {shouldShowButton && (
                <Link
                    className={b('card-description-collapse')}
                    href="#"
                    onClick={(event) => {
                        event.preventDefault();
                        setIsExpanded(!isExpanded);
                    }}
                    view="secondary"
                    visitable={false}
                >
                    {isExpanded ? i18n('button_collapse') : i18n('button_show_full')}
                </Link>
            )}
        </Flex>
    );
}

interface CardContentProps {
    activeMediaQuery: ActiveMediaQuery;
    entry: GalleryItem;
    togglePreview: () => void;
    lang: string;
    maxWidth?: boolean;
}

function CardContent({activeMediaQuery, entry, togglePreview, lang, maxWidth}: CardContentProps) {
    const isActiveMediaQueryS = activeMediaQuery === 's';
    const mods: CnMods = {media: activeMediaQuery, maxWidth};
    const themeType = useThemeType();
    const {data: galleryItems = []} = useGetGalleryItemsQuery();
    const otherWorks = galleryItems
        .slice(0, 4)
        .filter((item) => item.id !== entry.id)
        .slice(0, 3);

    return (
        <Container className={b('container', mods)}>
            <Row space="0" style={{marginTop: 24, marginBottom: 24}}>
                <Col s="12">
                    <PageHeader title={entry.title[lang]} to={getAllPageUrl()} />
                </Col>
            </Row>
            <Row space="4" spaceRow="4" style={{marginTop: 0, marginBottom: 32}}>
                <CardPreview activeMediaQuery={activeMediaQuery} images={entry.images} />
            </Row>
            {isActiveMediaQueryS && (
                <Row space="0" spaceRow="4" style={{marginTop: 48, marginBottom: 28}}>
                    <Col s="12">
                        <Flex className={b('actions-right-flex', mods)}>
                            <LinkButton entryId={entry.id} size="xl" />
                            <Button view="action" size="xl" width="max" onClick={togglePreview}>
                                {galleryI18n('button_open')}
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
                        {Boolean(entry.createdAt) && (
                            <IconWithText
                                iconData={Calendar}
                                text={dateTime({input: entry.createdAt}).format('DD MMMM YYYY')}
                            />
                        )}
                    </Flex>
                </Col>
                <Col s="12">
                    <GalleryCardLabels
                        labels={entry.labels}
                        labelProps={{interactive: true}}
                        getUrl={(category) => getAllPageUrl({category})}
                    />
                </Col>
            </Row>
            <Row space="6" style={{marginTop: 24}}>
                <Col s="12">
                    <SectionHeader
                        activeMediaQuery={activeMediaQuery}
                        title={i18n('section_other_works')}
                    />
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

export const isActivePreview = (urlSearchParams: URLSearchParams) => {
    return (
        urlSearchParams.has(CARD_PAGE_URL_PARAMS.PREVIEW, '1') ||
        urlSearchParams.has(CARD_PAGE_URL_PARAMS.PREVIEW, 'true') ||
        urlSearchParams.has(CARD_PAGE_URL_PARAMS.PREVIEW, '')
    );
};

export function CardPage() {
    const {activeMediaQuery} = useLayoutContext();
    const location = useLocation();
    const history = useHistory();
    const themeType = useThemeType();
    const mobile = useMobile();
    const {id} = useParams<{id: string}>();
    const {isLoading, data, error, refetch} = useGetGalleryItemQuery({id});
    const {search: searchParams} = location;
    const urlSearchParams = new URLSearchParams(searchParams);
    const showPreview = isActivePreview(urlSearchParams);
    const lang = getLang();

    useErrorLayoutAdjustment(error);

    const togglePreview = () => {
        const urlParams = new URLSearchParams(searchParams);
        const hasPreviewParam = isActivePreview(urlParams);

        if (hasPreviewParam) {
            urlParams.delete(CARD_PAGE_URL_PARAMS.PREVIEW);
        } else {
            urlParams.set(CARD_PAGE_URL_PARAMS.PREVIEW, '1');
        }

        history.replace({
            search: `?${urlParams.toString()}`,
        });
    };

    if (isLoading) {
        return <SmartLoader className={b('loader')} size="m" />;
    }

    if (error || !data) {
        const parsedError = Utils.parseRtkQueryError(error);
        const {status, code, message = galleryI18n('label_error'), details} = parsedError;
        const isNotFound = code === ErrorContentTypes.NOT_FOUND || status === 404;
        const canRetry = !isNotFound;
        const errorTitle = isNotFound ? galleryI18n('label_not_found') : details?.title ?? message;

        return (
            <div className={b('error')}>
                <ErrorContent
                    error={parsedError}
                    type={code}
                    title={errorTitle}
                    showDebugInfo={!isNotFound}
                    action={
                        canRetry
                            ? {
                                  text: galleryI18n('button_retry'),
                                  handler: refetch,
                                  buttonProps: {view: 'normal'},
                              }
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
                    className={b('iframe', {mobile, promo: isPromo})}
                    src={getIframeUrl({publicUrl: data.publicUrl, theme: themeType, lang})}
                />
            ) : (
                <CardContent
                    activeMediaQuery={activeMediaQuery}
                    entry={data}
                    togglePreview={togglePreview}
                    lang={lang}
                    maxWidth={isPromo}
                />
            )}
        </React.Fragment>
    );
}
