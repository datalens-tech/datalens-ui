import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {ArrowLeft, Calendar, Link as LinkIcon, Person, Xmark} from '@gravity-ui/icons';
import {
    ActionTooltip,
    Breadcrumbs,
    Button,
    Card,
    Col,
    Container,
    Flex,
    Icon,
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
import type {GalleryItem} from 'shared/types';
import {ActionPanel} from 'ui/components/ActionPanel';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';
import ErrorContent from 'ui/components/ErrorContent/ErrorContent';
import {ScrollableWithShadow} from 'ui/components/ScrollableWithShadow/ScrollableWithShadow';
import {SmartLoader} from 'ui/components/SmartLoader/SmartLoader';
import {DL} from 'ui/constants';
import {useGetGalleryItemQuery, useGetGalleryItemsQuery} from 'ui/units/gallery/store/api';
import Utils from 'ui/utils';
import {copyTextWithToast} from 'ui/utils/copyText';

import {GalleryCardLabels, GalleryCardPreview, PageHeader, SectionHeader} from '../../blocks';
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

import {CardDescription} from './CardDescription/CardDescription';
import {FullscreenGallery} from './FullscreenGallery/FullscreenGallery';
import {ImportDropdown} from './ImportDropdown/ImportDropdown';
import {CARD_IMAGE_PREVIEW_HEIGHT, PreviewCard} from './PreviewCard/PreviewCard';
import {getIframeLang, getIframeUrl} from './helpers';
import {useErrorLayoutAdjustment} from './hooks/useErrorLayoutAdjustment';

import './CardPage.scss';

const b = block('card');
const toasterI18n = I18n.keyset('component.entry-context-menu.view');

const isPromo = DL.IS_NOT_AUTHENTICATED;
const DESKTOP_ICON_SIZE = 16;
const MOBILE_ICON_SIZE = 18;

interface IconWithTextProps {
    iconData: IconData;
    text: string;
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
                <Icon data={LinkIcon} size={mobile ? MOBILE_ICON_SIZE : DESKTOP_ICON_SIZE} />
            </Button.Icon>
        </Button>
    );

    return mobile ? (
        button
    ) : (
        <ActionTooltip title={utilityI18n('button_copy')}>{button}</ActionTooltip>
    );
}

function ContactPartnerButton(props: {partnerId?: string | null}) {
    const {activeMediaQuery, isMediaActive} = useLayoutContext();
    const {partnerId} = props;

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
    const isMobileMediaQuery = !isMediaActive('m');
    const buttonProps: ButtonProps = isMobileMediaQuery ? {width: 'max', size: 'xl'} : {};

    return (
        <Button className={b('contact-partner-btn', mods)} {...buttonProps} onClick={handleClick}>
            {i18n('button_contact_partner')}
        </Button>
    );
}

interface CardActionPanelProps {
    entry: GalleryItem;
    showPreview: boolean;
    togglePreview: () => void;
    lang: string;
}

function CardActionPanel({entry, showPreview, togglePreview, lang}: CardActionPanelProps) {
    const [actionPanelNode, setActionPanelNode] = React.useState<HTMLDivElement | null>(null);
    const {rect} = useElementRect({node: actionPanelNode});
    const {activeMediaQuery, isMediaActive} = useLayoutContext();

    const actionPanelStyle = React.useMemo(() => {
        const style: React.CSSProperties = {};
        const offset = rect?.left;

        if (typeof offset === 'number') {
            style.paddingInline = `${offset}px`;
        }

        return style;
    }, [rect]);

    const isMobileMediaQuery = !isMediaActive('m');
    const mods: CnMods = {media: activeMediaQuery};
    let leftItems: React.ReactNode = null;

    if (showPreview) {
        leftItems = (
            <Flex className={b('actions-left-flex', mods)}>
                {isMobileMediaQuery && (
                    <Button view="flat" onClick={togglePreview}>
                        <Button.Icon>
                            <Icon data={ArrowLeft} />
                        </Button.Icon>
                    </Button>
                )}
                <Text
                    variant={isMobileMediaQuery ? 'subheader-2' : 'header-1'}
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
                    <Breadcrumbs.Item className={b('breadcrumbs-item')} disabled={true}>
                        {entry.title[lang]}
                    </Breadcrumbs.Item>
                </Breadcrumbs>
            </Flex>
        );
    }

    let rightItems: React.ReactNode = null;

    if (isMobileMediaQuery) {
        rightItems = (
            <Flex className={b('actions-right-flex', mods)} style={{flexShrink: 0}}>
                <LinkButton entryId={entry.id} />
                {entry.data && <ImportDropdown entryId={entry.id} url={entry.data} />}
            </Flex>
        );
    } else {
        rightItems = (
            <Flex className={b('actions-right-flex', mods)} style={{flexShrink: 0}}>
                <LinkButton entryId={entry.id} />
                <ContactPartnerButton partnerId={entry.partnerId} />
                {entry.data && <ImportDropdown entryId={entry.id} url={entry.data} />}
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
    images?: GalleryItem['images'];
}

function CardPreview({images}: CardPreviewProps) {
    const {activeMediaQuery, isMediaActive} = useLayoutContext();
    const previewContainerRef = React.useRef<HTMLDivElement>(null);
    const themeType = useThemeType();
    const mobile = useMobile();
    const themeImages = React.useMemo(() => {
        return images?.[themeType] ?? [];
    }, [themeType, images]);
    const [selectedImage, setSelectedImage] = React.useState(themeImages[0] || '');
    const [showFullscreenGallery, setShowFullscreenGallery] = React.useState(false);
    const [imageCardPreviewHeight, setImageCardPreviewHeight] = React.useState<
        number | undefined
    >();

    const isMobileMediaQuery = !isMediaActive('m');
    const previewContainerNode = previewContainerRef.current;

    const handleImageClick = () => {
        setShowFullscreenGallery(true);
    };

    const handleCloseFullscreenGallery = () => {
        setShowFullscreenGallery(false);
    };

    const selectedImageIndex = themeImages.findIndex((img) => img === selectedImage);

    React.useEffect(() => {
        setSelectedImage(themeImages[0] || '');
    }, [themeImages]);

    React.useEffect(() => {
        let nextImageCardPreviewHeight: number | undefined;

        if (isMobileMediaQuery && previewContainerRef.current) {
            const {clientHeight, offsetHeight} = previewContainerRef.current;
            const scrollBarWidth = offsetHeight - clientHeight;
            nextImageCardPreviewHeight = CARD_IMAGE_PREVIEW_HEIGHT + scrollBarWidth;
        }

        setImageCardPreviewHeight(nextImageCardPreviewHeight);
    }, [isMobileMediaQuery, previewContainerNode]);

    return (
        <React.Fragment>
            {showFullscreenGallery && isMobileMediaQuery && (
                <FullscreenGallery
                    images={themeImages}
                    initialImageIndex={selectedImageIndex === -1 ? 0 : selectedImageIndex}
                    onClose={handleCloseFullscreenGallery}
                />
            )}
            <Col size={[12, {m: 10}]}>
                <Card
                    className={b('image-card')}
                    type="action"
                    view="outlined"
                    onClick={mobile ? handleImageClick : undefined}
                >
                    <AsyncImage
                        className={b('image-card-content')}
                        showSkeleton={true}
                        src={selectedImage}
                    />
                </Card>
            </Col>
            <Col size={[12, {m: 2}]}>
                <ScrollableWithShadow direction={isMobileMediaQuery ? 'horizontal' : 'vertical'}>
                    <Flex
                        className={b('image-card-preview-flex', {media: activeMediaQuery})}
                        style={
                            typeof imageCardPreviewHeight === 'number'
                                ? {height: imageCardPreviewHeight}
                                : undefined
                        }
                        ref={previewContainerRef}
                    >
                        {themeImages.map((image, i) => {
                            return (
                                <PreviewCard
                                    key={i}
                                    selected={selectedImage === image}
                                    onSelected={(newSelectedImage) => {
                                        setSelectedImage(newSelectedImage);
                                    }}
                                    image={image}
                                    size={isMobileMediaQuery ? 's' : 'auto'}
                                />
                            );
                        })}
                    </Flex>
                </ScrollableWithShadow>
            </Col>
        </React.Fragment>
    );
}

interface CardContentProps {
    entry: GalleryItem;
    togglePreview: () => void;
    lang: string;
    maxWidth?: boolean;
}

function CardContent({entry, togglePreview, lang, maxWidth}: CardContentProps) {
    const {activeMediaQuery, isMediaActive} = useLayoutContext();

    const isMobileMediaQuery = !isMediaActive('m');
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
                <Col size={12}>
                    <PageHeader
                        activeMediaQuery={activeMediaQuery}
                        title={entry.title[lang]}
                        to={getAllPageUrl()}
                    />
                </Col>
            </Row>
            <Row space="4" spaceRow="4" style={{marginTop: 0, marginBottom: 32}}>
                <CardPreview images={entry.images} />
            </Row>
            {isMobileMediaQuery && (
                <Row space="0" spaceRow="4" style={{marginTop: 48, marginBottom: 28}}>
                    <Col size={12}>
                        <Flex className={b('actions-right-flex', mods)}>
                            <LinkButton entryId={entry.id} size="xl" />
                            <Button view="action" size="xl" width="max" onClick={togglePreview}>
                                {galleryI18n('button_open')}
                            </Button>
                        </Flex>
                        <ContactPartnerButton partnerId={entry.partnerId} />
                    </Col>
                </Row>
            )}
            <Row space="0" spaceRow="4" style={{marginTop: 48}}>
                <Col size={12}>
                    <CardDescription
                        shortDescription={entry.shortDescription}
                        description={entry.description}
                        lang={lang}
                    />
                </Col>
                <Col size={12}>
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
                <Col size={12}>
                    <GalleryCardLabels
                        labels={entry.labels}
                        labelProps={{interactive: true}}
                        getUrl={(category) => getAllPageUrl({category})}
                    />
                </Col>
            </Row>
            <Row space="6" style={{marginTop: 24}}>
                <Col size={12}>
                    <SectionHeader title={i18n('section_other_works')} />
                </Col>
                {otherWorks.map((item) => {
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
                <Col size={12} />
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

    const iframeLang = getIframeLang({labels: data?.labels, defaultLang: lang});

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
                entry={data}
                showPreview={showPreview}
                togglePreview={togglePreview}
                lang={lang}
            />
            {showPreview ? (
                <iframe
                    className={b('iframe', {mobile, promo: isPromo})}
                    src={getIframeUrl({
                        publicUrl: data.publicUrl,
                        theme: themeType,
                        lang: iframeLang,
                    })}
                />
            ) : (
                <CardContent
                    entry={data}
                    togglePreview={togglePreview}
                    lang={lang}
                    maxWidth={isPromo}
                />
            )}
        </React.Fragment>
    );
}
