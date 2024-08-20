import React from 'react';

import {Copy} from '@gravity-ui/icons';
import {Button, Checkbox, Icon, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ChartkitMenuDialogsQA} from 'shared';
import {URL_OPTIONS as COMMON_URL_OPTIONS, DL, PRODUCT_NAME, SHEET_IDS} from 'ui/constants';
import type {ChartKitProps} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {URL_OPTIONS as CHARTKIT_URL_OPTIONS} from 'ui/libs/DatalensChartkit/modules/constants/constants';
import type {ChartsData, ChartsProps} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';
import URI from 'ui/libs/DatalensChartkit/modules/uri/uri';
import type {Widget} from 'ui/libs/DatalensChartkit/types';
import {registry} from 'ui/registry';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import {AdaptiveDialog} from '../AdaptiveDialog/AdaptiveDialog';
import DialogManager from '../DialogManager/DialogManager';

import {ShareLink} from './ShareLink/ShareLink';

import './DialogShare.scss';

const i18n = I18n.keyset('component.dialog-share.view');
export const DIALOG_SHARE = Symbol('DIALOG_SHARE');

const languageOptions = [
    {content: i18n('value_language-auto'), value: ''},
    {content: i18n('value_language-rus'), value: 'ru'},
    {content: i18n('value_language-eng'), value: 'en'},
];

const themeOptions = [
    {content: i18n('value_theme-auto'), value: ''},
    {content: i18n('value_theme-dark'), value: 'dark'},
    {content: i18n('value_theme-light'), value: 'light'},
];

const b = block('dialog-share');

export type DialogShareProps = {
    onClose: () => void;
    visible?: boolean;
    showLinkDescription?: boolean;
    showMarkupLink?: boolean;
    propsData: ChartKitProps<ChartsProps, ChartsData>;
    showHideComments?: boolean;
    loadedData?: Widget & ChartsData;
    urlIdPrefix?: string;
    initialParams?: Record<string, number>;
    hasDefaultSize?: boolean;
    showSelectorsCheckbox?: boolean;
    showFederation?: boolean;
    showEmbedLink?: boolean;
    showHideMenu?: boolean;
    showCopyAndExitBtn?: boolean;
};

const getInitialLink = (
    loadedData: (Widget & ChartsData) | {},
    propsData: ChartKitProps<ChartsProps, ChartsData>,
    idPrefix = '/',
    initialParams = {
        [COMMON_URL_OPTIONS.EMBEDDED]: 1,
    },
): URI => {
    const id = (loadedData && 'entryId' in loadedData && loadedData.entryId) || propsData.id;
    const locationUrl = location.origin + (id ? idPrefix + id : propsData.source);

    const initialLink = new URI(locationUrl);
    initialLink.setParams({...propsData.params, ...initialParams});
    return initialLink;
};

export const DialogShare: React.FC<DialogShareProps> = ({
    onClose,
    visible = true,
    showLinkDescription,
    showMarkupLink,
    showHideComments,
    loadedData = {},
    propsData,
    urlIdPrefix,
    initialParams = {},
    hasDefaultSize,
    showEmbedLink = true,
    showHideMenu = true,
    showSelectorsCheckbox,
    showFederation,
    showCopyAndExitBtn,
}) => {
    const [currentUrl, setCurrentUrl] = React.useState(
        getInitialLink(loadedData, propsData, urlIdPrefix, initialParams),
    );
    const [selectedTheme, setSelectedTheme] = React.useState('');
    const [selectedLang, setSelectedLang] = React.useState('');
    const [isFederationSelected, setIsFederationSelected] = React.useState(Boolean(showFederation));
    const [hideMenu, setHideMenu] = React.useState(
        Boolean(initialParams[COMMON_URL_OPTIONS.NO_CONTROLS]),
    );
    const [hideComments, setHideComments] = React.useState(
        Boolean(initialParams[CHARTKIT_URL_OPTIONS.HIDE_COMMENTS]),
    );
    const [isSelectorsSaved, setIsSelectorsSaved] = React.useState(
        Boolean(initialParams[CHARTKIT_URL_OPTIONS.HIDE_COMMENTS]),
    );

    const defaultSize = hasDefaultSize ? ' width="100%" height="400px"' : '';
    const queryState = new URLSearchParams(window.location.search).get(COMMON_URL_OPTIONS.STATE);

    const getLink = React.useCallback(() => currentUrl.toString(), [currentUrl]);
    const getHTML = React.useCallback(
        () => `<iframe frameborder="0" src="${getLink()}"${defaultSize}></iframe>`,
        [getLink, defaultSize],
    );

    React.useEffect(() => {
        setCurrentUrl((paramsUrl: URI) => {
            const updatedLink = new URI(paramsUrl.toString());

            updatedLink.updateParams({
                [COMMON_URL_OPTIONS.LANGUAGE]: selectedLang || null,
                [COMMON_URL_OPTIONS.THEME]: selectedTheme || null,
                [CHARTKIT_URL_OPTIONS.HIDE_COMMENTS]: hideComments ? 1 : null,
                [COMMON_URL_OPTIONS.NO_CONTROLS]: hideMenu ? 1 : null,
                [COMMON_URL_OPTIONS.STATE]: isSelectorsSaved ? queryState : null,
                [COMMON_URL_OPTIONS.YC_FEDERATION_ID]: isFederationSelected
                    ? DL.USER.federationId
                    : null,
            });

            return updatedLink;
        });
    }, [
        selectedLang,
        selectedTheme,
        hideMenu,
        hideComments,
        isSelectorsSaved,
        isFederationSelected,
    ]);

    const handleChangeMenuParam = () => setHideMenu(!hideMenu);
    const handleChangeCommentsParam = () => setHideComments(!hideComments);
    const handleChangeSelectorsSaved = () => setIsSelectorsSaved(!isSelectorsSaved);
    const handleChangeFederationSelected = () => setIsFederationSelected(!isFederationSelected);
    const handleChangeLang = (values: string[]) => setSelectedLang(values[0]);
    const handleChangeTheme = (values: string[]) => setSelectedTheme(values[0]);

    const handleShareClick = async () => {
        if (navigator && typeof navigator.share === 'function') {
            await navigator.share({url: getLink(), text: PRODUCT_NAME});
            return;
        }
        // if Web Share API is not supported
        await navigator.clipboard.writeText(getLink());
    };

    const selectSize = DL.IS_MOBILE ? MOBILE_SIZE.SELECT : 'm';
    const checkboxSize = DL.IS_MOBILE ? MOBILE_SIZE.CHECKBOX : 'm';

    const {MarkupShareLink} = registry.common.components.getAll();

    return (
        <AdaptiveDialog
            onClose={onClose}
            visible={visible}
            title={i18n('title_share')}
            dialogProps={{className: b()}}
            sheetContentClassName={b({mobile: DL.IS_MOBILE})}
            id={SHEET_IDS.DIALOG_SHARE}
            {...(showCopyAndExitBtn && {
                dialogFooterProps: {
                    textButtonApply: i18n('button_copy-and-exit'),
                    onClickButtonApply: () => {
                        handleShareClick();
                        onClose();
                    },
                },
            })}
        >
            <div className={b('body')} data-qa={ChartkitMenuDialogsQA.chartMenuShareModalBody}>
                <div className={b('params')}>
                    <div className={b('subheader')}>{i18n('label_params')}</div>
                    {!DL.IS_MOBILE && (
                        <div className={b('description')}>{i18n('label_params-description')}</div>
                    )}
                    <div className={b('checkboxes')}>
                        {showSelectorsCheckbox && (
                            <Checkbox
                                checked={isSelectorsSaved}
                                onChange={handleChangeSelectorsSaved}
                                size={checkboxSize}
                                disabled={!queryState}
                            >
                                {i18n('value_selectors-saved')}
                            </Checkbox>
                        )}
                        {showFederation && (
                            <Checkbox
                                checked={isFederationSelected}
                                onChange={handleChangeFederationSelected}
                                size={checkboxSize}
                            >
                                {i18n('value_federation-selected')}: {DL.USER.federationId}
                            </Checkbox>
                        )}
                        {showHideMenu && (
                            <Checkbox
                                checked={hideMenu}
                                onChange={handleChangeMenuParam}
                                size={checkboxSize}
                            >
                                {i18n('value_hide-menu')}
                            </Checkbox>
                        )}
                        {showHideComments && (
                            <Checkbox
                                checked={hideComments}
                                onChange={handleChangeCommentsParam}
                                size={checkboxSize}
                            >
                                {i18n('value_hide-comments')}
                            </Checkbox>
                        )}
                    </div>
                    <div className={b('selects')}>
                        <Select
                            value={[selectedLang]}
                            onUpdate={handleChangeLang}
                            options={languageOptions}
                            label={i18n('field_language')}
                            size={selectSize}
                        />
                        <Select
                            value={[selectedTheme]}
                            onUpdate={handleChangeTheme}
                            options={themeOptions}
                            label={i18n('field_theme')}
                            size={selectSize}
                        />
                    </div>
                    {DL.IS_MOBILE && (
                        <Button
                            size="xl"
                            width="max"
                            view="action"
                            onClick={handleShareClick}
                            className={b('share-button')}
                        >
                            {i18n('button_share')}
                        </Button>
                    )}
                </div>
                {!DL.IS_MOBILE && (
                    <div className={b('links')}>
                        <ShareLink
                            title={i18n('label_link')}
                            description={i18n('label_link-description')}
                            text={getLink()}
                            showDescription={showLinkDescription}
                        />
                        {showMarkupLink && (
                            <MarkupShareLink
                                getLink={getLink}
                                showDescription={showLinkDescription}
                                defaultSize={defaultSize}
                            />
                        )}
                        {showEmbedLink && (
                            <ShareLink
                                title={i18n('label_iframe')}
                                description={i18n('label_iframe-description')}
                                text={getHTML()}
                                showDescription={showLinkDescription}
                            />
                        )}
                    </div>
                )}
            </div>
        </AdaptiveDialog>
    );
};

DialogManager.registerDialog(DIALOG_SHARE, DialogShare);
