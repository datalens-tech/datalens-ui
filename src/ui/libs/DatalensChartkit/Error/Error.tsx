import React from 'react';

import {Button, Icon, Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n, i18n} from 'i18n';
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';
import {useDispatch} from 'react-redux';
import {ChartkitMenuDialogsQA, ErrorCode, Feature} from 'shared';

import {DL, Interpolate, Utils} from '../../..';
import {CHARTKIT_ERROR_NODE_CLASSNAME} from '../../../libs/DatalensChartkit/ChartKit/helpers/constants';
import {CHARTS_ERROR_CODE} from '../../../libs/DatalensChartkit/modules/data-provider/charts';
import dlLogger, {CHARTKIT_LOGGER} from '../../../libs/logger';
import {openDialogErrorWithTabs} from '../../../store/actions/dialog';
import {
    ERROR_CODE,
    ExtraParams,
} from '../modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import {getEndpointForNavigation} from '../modules/navigation';

import errorCharts from '../../../assets/icons/error-chart.svg';
import errorClose from '../../../assets/icons/error-close.svg';
import errorDatabase from '../../../assets/icons/error-database.svg';
import errorLock from '../../../assets/icons/error-lock.svg';

import './Error.scss';

const b = block(CHARTKIT_ERROR_NODE_CLASSNAME);
const logger = dlLogger.get(CHARTKIT_LOGGER);

function getEndpointForScope(scopeName: string): string | null {
    if (scopeName === 'dataset') {
        return DL.ENDPOINTS.dataset;
    } else if (scopeName === 'connection') {
        return DL.ENDPOINTS.connections;
    } else {
        return null;
    }
}

type InterpolatedErrorMessageProps = {
    text: string;
    href: string;
};

const InterpolatedErrorMessage: React.FC<InterpolatedErrorMessageProps> = (
    props: InterpolatedErrorMessageProps,
) => {
    const {text, href} = props;
    return (
        <span>
            <Interpolate
                text={text}
                matches={{
                    link(match) {
                        return (
                            <Link href={href} target="_blank" rel="noopener noreferrer">
                                {match}
                            </Link>
                        );
                    },
                }}
            />
        </span>
    );
};

// interface DatasetSourceError {
//     message: string;
//     code: DSAPIErrorCode;
//     details: unknown;
//     debug: unknown;
// }

// interface ChartKitErrorProps {
//     error: ChartKitCustomError & {
//         code: 'CHARTS_ERROR_CODE.DATA_FETCHING_ERROR';
//         details: DatasetSourceError;
//     };
//     onAction: (data: object) => void;
// }

// eslint-disable-next-line complexity
const ChartKitError: React.FC<any> = (props) => {
    const dispatch = useDispatch();

    const {error, onAction} = props;
    React.useEffect(() => {
        logger.logError('ChartKitError', error);
    }, [error]);

    const {
        code,
        message: title,
        details = {},
        debug: {requestId = DL.REQUEST_ID, traceId = null} = {},
    } = error;

    const extraParams: ExtraParams = error.extra;

    const {hideDebugInfo, hideRetry, openedMore, actionText, actionData, showErrorMessage} =
        extraParams;

    const {noControls} = Utils.getOptionsFromSearch(window.location.search);

    const more = isEmpty(details) ? null : details;
    const showMore = more || extraParams.showMore;
    const showRetry = !hideRetry;
    const showControls = !noControls && (showMore || showRetry);

    const expandMore = more && (openedMore || noControls);

    let detailsString = '';

    const notEmptyDetails = !isEmpty(details);

    if (notEmptyDetails) {
        const values = Object.values(details);

        // for stackTrace
        // if the key is only one and the value is a string, then print without JSON.stringify
        if (values.length === 1 && typeof values[0] === 'string') {
            detailsString = values[0];
        } else {
            detailsString = JSON.stringify(details, null, 4);
        }
    }

    let iconData = errorClose;
    let detailedTitle = title;
    const sourceErrorDetails: {message?: string; code?: string}[] = [];

    const uniqDetails = uniqBy(Object.keys(details) || [], (key) => {
        const source = details[key];
        const errorCode = source.code || source.status;

        if (source.details) {
            return `${errorCode}-${source.details.entry_id}`;
        }

        return null;
    });

    uniqDetails.forEach((key) => {
        const source = details[key];

        if (source.message || source.code) {
            sourceErrorDetails.push({message: source.message, code: source.code});
        }
    });

    const iconModes = {
        'no-data': false,
    };

    switch (code) {
        case ERROR_CODE.NO_DATA:
            iconModes['no-data'] = true;
            break;
        case ERROR_CODE.TOO_MANY_LINES:
            iconData = errorCharts;
            break;
        case ERROR_CODE.DATA_PROVIDER_ERROR:
            iconData = errorDatabase;
            break;
        case CHARTS_ERROR_CODE.CONFIG_LOADING_ERROR:
            if (error?.debug?.code === 403) {
                iconData = errorLock;
                const entryId = error?.debug?.entryId;
                if (entryId) {
                    const endpoint = getEndpointForNavigation(
                        DL.ENDPOINTS,
                        Utils.isEnabledFeature(Feature.UseNavigation),
                    );
                    const text = i18n('component.chartkit-error.codes', code);
                    const href = `${endpoint}/${entryId}`;

                    const message = <InterpolatedErrorMessage text={text} href={href} />;

                    detailedTitle = [message];
                }
            }
            break;
        case CHARTS_ERROR_CODE.DATA_FETCHING_ERROR: {
            // details: {
            //     "report": {
            //         "message": "Report with name /Morda/Totals/Totals1 and scale - not found: no error",
            //         "reason": "missing_report",
            //         "name": "Morda/Totals/Totals1"
            //     },
            //     "dataset": {
            //         "debug": {},
            //         "message": "Wrong passed entryId (it can be in links)",
            //         "details": {},
            //         "code": "ERR.DS_API.US.BAD_REQUEST"
            //     }
            // }

            const errorDetails: React.ReactNode[] = [];

            uniqDetails.forEach((key) => {
                const source = details[key];
                const errorCode = source.code || source.status;

                if (
                    [
                        ErrorCode.UsAccessDenied,
                        ErrorCode.ReferencedEntryAccessDenied,
                        ErrorCode.WorkbookIsolationInterruptionDenied,
                    ].includes(errorCode) &&
                    source.details &&
                    source.details.scope
                ) {
                    const {scope} = source.details;

                    if (scope === 'dataset' || scope === 'connection') {
                        const endpoint = getEndpointForScope(scope);
                        const detailKey = `${errorCode}_${scope.toUpperCase()}`;

                        const text = i18n('component.chartkit-error.codes', detailKey);
                        const href = `${endpoint}/${source.details.entry_id}`;

                        const message = <InterpolatedErrorMessage text={text} href={href} />;

                        errorDetails.push(message);
                    }
                } else if (
                    [
                        ErrorCode.DBError,
                        ErrorCode.DBQueryError,
                        ErrorCode.DBSourceDoesntExist,
                    ].includes(errorCode) &&
                    source.debug &&
                    source.debug.db_message
                ) {
                    errorDetails.push(i18n('component.chartkit-error.codes', errorCode));
                    detailsString = source.debug.db_message;
                } else if (I18n.has('component.chartkit-error.codes', errorCode)) {
                    errorDetails.push(i18n('component.chartkit-error.codes', errorCode));
                    detailsString = '';
                }
            });

            detailedTitle = errorDetails.length ? errorDetails : detailedTitle;

            iconData = errorDatabase;
            break;
        }
        case 'ERR.CHARTS.WRONG_EMBED_TOKEN': {
            if (extraParams.message) {
                detailedTitle = extraParams.message;
            }
            break;
        }
    }

    return (
        <div className={b()} data-qa={ChartkitMenuDialogsQA.chartError}>
            <div data-qa={code} className={b('title', {mobile: DL.IS_MOBILE})}>
                <Icon data={iconData} className={b('icon', iconModes)} />
                {Array.isArray(detailedTitle) ? (
                    <div>
                        {detailedTitle.map((str) => (
                            <div key={str}>{str}</div>
                        ))}
                    </div>
                ) : (
                    detailedTitle
                )}
            </div>
            {sourceErrorDetails.map((sourceErrorDetail) => (
                <React.Fragment key={sourceErrorDetail.message}>
                    {showErrorMessage && sourceErrorDetail.message && (
                        <div className={b('message')}>{sourceErrorDetail.message}</div>
                    )}
                    {!sourceErrorDetail.message && sourceErrorDetail.code && (
                        <div className={b('code-block')}>{sourceErrorDetail.code}</div>
                    )}
                </React.Fragment>
            ))}
            {expandMore && detailsString && <div className={b('code-block')}>{detailsString}</div>}
            {showControls && (
                <div className={b('actions')}>
                    {showRetry && (
                        <Button
                            className={b('action')}
                            onClick={() => onAction(actionData)}
                            qa={ChartkitMenuDialogsQA.errorButtonRetry}
                        >
                            {actionText}
                        </Button>
                    )}
                    {showMore && (
                        <Button
                            view="flat"
                            className={b('action')}
                            onClick={() =>
                                dispatch(openDialogErrorWithTabs({error, title: error.message}))
                            }
                        >
                            {i18n('component.chartkit-error.view', 'button_details')}
                        </Button>
                    )}
                </div>
            )}
            {!hideDebugInfo && (
                <React.Fragment>
                    {requestId && (
                        <div className={b('request-id')}>{`Request-ID: ${requestId}`}</div>
                    )}
                    {traceId && <div className={b('request-id')}>{`Trace-ID: ${traceId}`}</div>}
                </React.Fragment>
            )}
        </div>
    );
};

export default React.memo(ChartKitError);
