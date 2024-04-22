import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';
import {ErrorContentTypes, Feature} from 'shared';
import {DL, Utils} from 'ui';
import {MOBILE_SIZE, isMobileView} from 'ui/utils/mobile';

import logger from '../../libs/logger';
import {sdk} from '../../libs/sdk';
import MarkdownProvider from '../../modules/markdownProvider';
import {EntryDialogName, EntryDialogues} from '../EntryDialogues';
import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';
import {YfmWrapper} from '../YfmWrapper/YfmWrapper';

import {DebugInfo} from './DebugInfo/DebugInfo';

import './ErrorContent.scss';

const i18n = I18n.keyset('component.error-content.view');
const b = block('error-content');

class ErrorContent extends React.PureComponent {
    static propTypes = {
        className: PropTypes.string,
        title: PropTypes.string,
        isHtmlInTitle: PropTypes.bool,
        description: PropTypes.node,
        type: PropTypes.oneOf(Object.values(ErrorContentTypes)),
        action: PropTypes.shape({
            text: PropTypes.string,
            content: PropTypes.node,
            handler: PropTypes.func,
            buttonProps: PropTypes.object,
        }),
        reqId: PropTypes.string,
        traceId: PropTypes.string,
        error: PropTypes.object,
        entryMeta: PropTypes.shape({
            entryId: PropTypes.string.isRequired,
            scope: PropTypes.string.isRequired,
            key: PropTypes.string.isRequired,
            type: PropTypes.string,
        }),
        noControls: PropTypes.bool,
        showDebugInfo: PropTypes.bool,
        noActions: PropTypes.bool,
        size: PropTypes.oneOf(['s', 'm', 'l', 'promo']),
        direction: PropTypes.oneOf(['row', 'column']),
        accessDescription: PropTypes.string,
        hideTitle: PropTypes.bool,
    };

    static defaultProps = {
        type: ErrorContentTypes.ERROR,
        showDebugInfo: true,
        noActions: false,
    };

    state = {
        showButtonConsole: false,
        accessDescriptionMd: '',
    };

    async componentDidMount() {
        await this.getAccessDescriptionMD();
    }

    entryDialoguesRef = React.createRef();
    buttonSize = isMobileView ? MOBILE_SIZE.BUTTON : 'm';
    buttonWidth = isMobileView ? 'max' : 'auto';

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
        if (!Utils.isEnabledFeature(Feature.DashBoardAccessDescription)) {
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
        const {description, hideTitle} = this.props;
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

        return <div className={b('description')}>{description}</div>;
    }

    renderDebugInfo() {
        const {error, noControls} = this.props;
        const {requestId, traceId: traceIdFromResponse} = Utils.parseErrorResponse(error);

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

        if (type === ErrorContentTypes.NO_ENTRY_ACCESS && entryMeta) {
            return (
                <React.Fragment>
                    <Button
                        className={b('action-btn')}
                        view="action"
                        size={isMobileView ? MOBILE_SIZE.BUTTON : 'l'}
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
        const showDebugActions = showDebugInfo && !isMobileView;

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
        if (isMobileView) {
            return null;
        }
        return this.renderActions();
    };

    render() {
        const {noControls, className, size, direction, showDebugInfo} = this.props;

        const showDebugActions = showDebugInfo && isMobileView;

        const {type} = this.props;
        let imageName = '';

        switch (type) {
            case ErrorContentTypes.NOT_FOUND:
            case ErrorContentTypes.NOT_FOUND_CURRENT_CLOUD_FOLDER:
            case ErrorContentTypes.NOT_FOUND_BY_RESOLVE_TENANT:
                imageName = 'notFound';
                break;
            case ErrorContentTypes.NO_ACCESS:
            case ErrorContentTypes.CLOUD_FOLDER_ACCESS_DENIED:
            case ErrorContentTypes.NO_ENTRY_ACCESS:
            case ErrorContentTypes.AUTH_DENIED:
            case ErrorContentTypes.FORBIDDEN_SSO:
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
                imageName = 'project';
                break;
            default:
                imageName = 'error';
        }

        return (
            <div className={b({'no-controls': noControls, mobile: DL.IS_MOBILE, size}, className)}>
                <div className={b('illustration-container')}>
                    <PlaceholderIllustration
                        name={imageName}
                        title={this.renderTitle()}
                        description={this.renderDescription()}
                        renderAction={this.renderAction}
                        size={size}
                        direction={direction}
                    />
                    {isMobileView && this.renderActions()}
                </div>
                {showDebugActions && this.renderDebugInfo()}
            </div>
        );
    }
}

export default ErrorContent;
