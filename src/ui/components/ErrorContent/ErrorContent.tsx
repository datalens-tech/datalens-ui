import React from 'react';

import type {ButtonButtonProps, ButtonWidth} from '@gravity-ui/uikit';
import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {ValueOf} from 'shared';
import {ErrorContentTypes, Feature} from 'shared';
import {DL} from 'ui/constants/common';
import {type DataLensApiError, type ParsedError, isParsedError} from 'ui/typings';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {MOBILE_SIZE} from 'ui/utils/mobile';
import Utils from 'ui/utils/utils';

import logger from '../../libs/logger';
import {sdk} from '../../libs/sdk';
import MarkdownProvider from '../../modules/markdownProvider';
import {EntryDialogName, EntryDialogues} from '../EntryDialogues';
import type {IllustrationName} from '../Illustration/types';
import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';
import {YfmWrapper} from '../YfmWrapper/YfmWrapper';

import {DebugInfo} from './DebugInfo/DebugInfo';

import './ErrorContent.scss';

const i18n = I18n.keyset('component.error-content.view');
const b = block('error-content');

interface ErrorContentProps {
    className?: string;
    title?: string;
    isHtmlInTitle?: boolean;
    isHtmlInDescription?: boolean;
    description?: React.ReactNode;
    type?: ValueOf<typeof ErrorContentTypes>;
    action?: {
        text?: string;
        content?: React.ReactNode;
        handler?: ButtonButtonProps['onClick'];
        buttonProps?: Omit<ButtonButtonProps, 'onClick' | 'width' | 'size'>;
    };
    reqId?: string;
    traceId?: string;
    error?: DataLensApiError | ParsedError | null;
    /** @deprecated
     * this props is passed from some other components, but is not used in ErrorContent component
     */
    entryId?: string | null;
    entryMeta?: {
        entryId: string;
        scope: string;
        key: string;
        type: string;
        workbookId?: string;
    };
    noControls?: boolean;
    showDebugInfo?: boolean;
    noActions?: boolean;
    size?: 's' | 'm' | 'l' | 'promo';
    direction?: 'row' | 'column';
    accessDescription?: string;
    hideTitle?: boolean;
    style?: React.CSSProperties;
    containerClassName?: string;
}

class ErrorContent extends React.PureComponent<ErrorContentProps> {
    static defaultProps = {
        type: ErrorContentTypes.ERROR,
        showDebugInfo: true,
        noActions: false,
    };

    state = {
        showButtonConsole: false,
        accessDescriptionMd: '',
    };

    entryDialoguesRef = React.createRef<EntryDialogues>();
    buttonSize = DL.IS_MOBILE ? MOBILE_SIZE.BUTTON : 'm';
    buttonWidth: ButtonWidth = DL.IS_MOBILE ? 'max' : 'auto';

    async componentDidMount() {
        await this.getAccessDescriptionMD();
    }

    async getAccessDescriptionMD() {
        const customText = this.getAccessDescription();

        if (customText) {
            try {
                const {result} = await MarkdownProvider.getMarkdown({text: customText});
                this.setState({accessDescriptionMd: result});
            } catch (error) {
                logger.logError('ErrorContent: getMarkdown custom text failed', error);
            }
        }
    }

    getAccessDescription() {
        if (!isEnabledFeature(Feature.DashBoardAccessDescription)) {
            return '';
        }

        const pageEntryMeta = DL.LANDING_PAGE_ENTRY_META;
        return this.props.accessDescription || pageEntryMeta?.accessDescription || '';
    }

    hasAccessDescription() {
        return Boolean(this.getAccessDescription());
    }

    renderTitle() {
        const {title = i18n('label_error-general'), isHtmlInTitle = false, hideTitle} = this.props;

        if (hideTitle) {
            return null;
        }

        if (isHtmlInTitle) {
            return <div className={b('title')} dangerouslySetInnerHTML={{__html: title}}></div>;
        } else {
            return <div className={b('title')}>{title}</div>;
        }
    }

    renderDescription() {
        const {description, hideTitle, isHtmlInDescription} = this.props;
        if (this.state.accessDescriptionMd) {
            return (
                <YfmWrapper
                    className={b('yfm', {'without-title': hideTitle})}
                    content={this.state.accessDescriptionMd}
                    setByInnerHtml={true}
                />
            );
        }

        if (!description) {
            return null;
        }

        if (isHtmlInDescription) {
            return (
                <div
                    className={b('description')}
                    // @ts-expect-error string type of description is expected
                    dangerouslySetInnerHTML={{__html: description}}
                ></div>
            );
        }

        return <div className={b('description')}>{description}</div>;
    }

    renderDebugInfo() {
        const {error, noControls = false} = this.props;

        let parsedError: ParsedError | undefined;
        if (error) {
            parsedError = isParsedError(error) ? error : Utils.parseErrorResponse(error);
        }
        const {requestId, traceId: traceIdFromResponse} = parsedError || {};

        const reqId = this.props.reqId || requestId;
        const traceId = this.props.traceId || traceIdFromResponse;

        return (
            <React.Fragment>
                {reqId && <DebugInfo name="Request ID" id={reqId} noControls={noControls} />}
                {traceId && <DebugInfo name="Trace ID" id={traceId} noControls={noControls} />}
            </React.Fragment>
        );
    }

    renderConsoleAction() {
        if (this.state.showButtonConsole) {
            return (
                <Button
                    className={b('action-btn')}
                    view="action"
                    size={this.buttonSize}
                    width={this.buttonWidth}
                    onClick={() => window.location.assign(window.DL.endpoints.console)}
                >
                    {i18n('button_console')}
                </Button>
            );
        }
        return null;
    }

    renderPropsAction() {
        const {action} = this.props;

        if (!action) {
            return null;
        }

        const {text, content, handler, buttonProps} = action;

        return (
            content || (
                <Button
                    className={b('action-btn')}
                    view="action"
                    onClick={handler}
                    size={this.buttonSize}
                    width={this.buttonWidth}
                    {...buttonProps}
                >
                    {text}
                </Button>
            )
        );
    }

    renderUnlock() {
        const {entryMeta, type} = this.props;

        if (type === ErrorContentTypes.NO_ENTRY_ACCESS && entryMeta && !entryMeta.workbookId) {
            return (
                <React.Fragment>
                    <Button
                        className={b('action-btn')}
                        view="action"
                        size={DL.IS_MOBILE ? MOBILE_SIZE.BUTTON : 'l'}
                        width={this.buttonWidth}
                        onClick={() => {
                            if (this.entryDialoguesRef.current) {
                                this.entryDialoguesRef.current.open({
                                    dialog: EntryDialogName.Unlock,
                                    dialogProps: {entry: entryMeta},
                                });
                            }
                        }}
                    >
                        {i18n('button_access-rights')}
                    </Button>
                    <EntryDialogues ref={this.entryDialoguesRef} sdk={sdk} />
                </React.Fragment>
            );
        }

        return null;
    }

    renderActions() {
        const {noControls, showDebugInfo, noActions} = this.props;
        const hasAccessDescription = this.hasAccessDescription();
        const showActions = !hasAccessDescription;
        const showDebugActions = showDebugInfo && !DL.IS_MOBILE;

        return (
            <div className={b('content')}>
                {!noActions && showActions && (
                    <React.Fragment>
                        {this.renderUnlock()}
                        {!noControls && this.renderConsoleAction()}
                        {!noControls && this.renderPropsAction()}
                    </React.Fragment>
                )}
                {showDebugActions && this.renderDebugInfo()}
            </div>
        );
    }

    renderAction = () => {
        if (DL.IS_MOBILE) {
            return null;
        }
        return this.renderActions();
    };

    render() {
        const {noControls, className, size, direction, showDebugInfo, style, containerClassName} =
            this.props;

        const showDebugActions = showDebugInfo && DL.IS_MOBILE;

        const {type} = this.props;
        let imageName: IllustrationName = 'error';

        switch (type) {
            case ErrorContentTypes.NOT_FOUND:
            case ErrorContentTypes.NOT_FOUND_CURRENT_CLOUD_FOLDER:
            case ErrorContentTypes.NOT_FOUND_BY_RESOLVE_TENANT:
                imageName = 'notFoundError';
                break;
            case ErrorContentTypes.NO_ACCESS:
            case ErrorContentTypes.CLOUD_FOLDER_ACCESS_DENIED:
            case ErrorContentTypes.NO_ENTRY_ACCESS:
            case ErrorContentTypes.AUTH_DENIED:
                imageName = 'noAccess';
                break;
            case ErrorContentTypes.ERROR:
            case ErrorContentTypes.AUTH_FAILED:
                imageName = 'error';
                break;
            case ErrorContentTypes.CREDENTIALS:
                imageName = 'identity';
                break;
            case ErrorContentTypes.INACCESSIBLE_ON_MOBILE:
            case ErrorContentTypes.FORBIDDEN_BY_PLAN:
            case ErrorContentTypes.FORBIDDEN_AUTH:
                imageName = 'project';
                break;
            default:
                imageName = 'error';
        }

        return (
            <div
                className={b({'no-controls': noControls, mobile: DL.IS_MOBILE, size}, className)}
                style={style}
            >
                <div className={b('illustration-container')} data-qa={`type-${type}`}>
                    <PlaceholderIllustration
                        name={imageName}
                        // @ts-expect-error string type is expected
                        title={this.renderTitle()}
                        description={this.renderDescription()}
                        renderAction={this.renderAction}
                        size={size}
                        direction={direction}
                        className={containerClassName}
                    />
                    {DL.IS_MOBILE && this.renderActions()}
                </div>
                {showDebugActions && this.renderDebugInfo()}
            </div>
        );
    }
}

export default ErrorContent;
