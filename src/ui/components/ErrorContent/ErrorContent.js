import React from 'react';

import {Button, CopyToClipboard} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import PropTypes from 'prop-types';
import {ErrorContentTypes, Feature} from 'shared';
import {DL, Utils} from 'ui';

import logger from '../../libs/logger';
import {sdk} from '../../libs/sdk';
import MarkdownProvider from '../../modules/markdownProvider';
import {EntryDialogName, EntryDialogues} from '../EntryDialogues';
import {PlaceholderIllustration} from '../PlaceholderIllustration/PlaceholderIllustration';
import {YfmWrapper} from '../YfmWrapper/YfmWrapper';

import './ErrorContent.scss';

const i18n = I18n.keyset('component.error-content.view');
const b = block('error-content');

class ErrorContent extends React.PureComponent {
    static propTypes = {
        className: PropTypes.string,
        title: PropTypes.string,
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
        size: PropTypes.oneOf('s', 'm', 'l', 'promo'),
        direction: PropTypes.oneOf('row', 'column'),
    };

    static defaultProps = {
        type: ErrorContentTypes.ERROR,
        showDebugInfo: true,
        noActions: false,
        size: 'l',
        direction: 'row',
    };

    state = {
        showButtonConsole: false,
        accessDescriptionMd: '',
    };

    async componentDidMount() {
        await this.getAccessDescriptionMD();
    }

    entryDialoguesRef = React.createRef();

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
        return pageEntryMeta?.accessDescription || '';
    }

    hasAccessDescription() {
        return Boolean(this.getAccessDescription());
    }

    renderTitle() {
        const {title = i18n('label_error-general')} = this.props;
        return <div className={b('title')}>{title}</div>;
    }

    renderDescription() {
        const {description} = this.props;
        if (this.state.accessDescriptionMd) {
            return (
                <YfmWrapper
                    className={b('yfm')}
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
                {reqId && (
                    <div className={b('debug-info')}>
                        <span className={b('debug-info-label')}>Request ID: </span>
                        <span>{reqId}</span>
                        {!noControls && (
                            <CopyToClipboard text={reqId} timeout={1000}>
                                {() => (
                                    <Button className={b('copy-btn')} view="flat-secondary">
                                        {i18n('button_copy')}
                                    </Button>
                                )}
                            </CopyToClipboard>
                        )}
                    </div>
                )}
                {traceId && (
                    <div className={b('debug-info')}>
                        <span className={b('debug-info-label')}>Trace ID: </span>
                        <span>{traceId}</span>
                        {!noControls && (
                            <CopyToClipboard text={traceId} timeout={1000}>
                                {() => (
                                    <Button className={b('copy-btn')} view="flat-secondary">
                                        {i18n('button_copy')}
                                    </Button>
                                )}
                            </CopyToClipboard>
                        )}
                    </div>
                )}
            </React.Fragment>
        );
    }

    renderAction() {
        if (this.state.showButtonConsole) {
            return (
                <Button
                    className={b('action-btn')}
                    view="action"
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
                        size="l"
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

        return (
            <div className={b('content')}>
                {!noActions && showActions && (
                    <React.Fragment>
                        {this.renderUnlock()}
                        {!noControls && this.renderAction()}
                        {!noControls && this.renderPropsAction()}
                    </React.Fragment>
                )}
                {showDebugInfo && this.renderDebugInfo()}
            </div>
        );
    }

    render() {
        const {noControls, className, size, direction} = this.props;

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
            <div
                className={b(
                    {'no-controls': noControls, 'is-mobile': DL.IS_MOBILE, size},
                    className,
                )}
            >
                <PlaceholderIllustration
                    name={imageName}
                    title={this.renderTitle()}
                    description={this.renderDescription()}
                    renderAction={() => this.renderActions()}
                    size={size}
                    direction={direction}
                />
            </div>
        );
    }
}

export default ErrorContent;
