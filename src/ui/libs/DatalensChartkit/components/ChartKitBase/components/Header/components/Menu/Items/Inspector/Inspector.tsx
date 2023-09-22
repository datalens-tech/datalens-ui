import React from 'react';

import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import {Magnifier} from '@gravity-ui/icons';
import {ClipboardButton, Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {MenuItemsIds} from 'shared';
import ChartKitIcon from 'ui/libs/DatalensChartkit/components/ChartKitIcon/ChartKitIcon';
import {registry} from 'ui/registry';

import {ChartWidgetDataRef} from '../../../../../../../../../../components/Widgets/Chart/types';
import {
    ICONS_MENU_DEFAULT_CLASSNAME,
    type MenuItemArgs,
} from '../../../../../../../../menu/MenuItems';
import {
    ChartsData,
    ChartsDataProvider,
    ChartsProps,
    ResponseSourcesError,
    ResponseSourcesSuccess,
} from '../../../../../../../../modules/data-provider/charts';
import type DatalensChartkitCustomError from '../../../../../../../../modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import {Widget as TWidget} from '../../../../../../../../types';
import type {MenuItemActionArgs} from '../../../../../../../../types/menu';

import Sources from './Sources/Sources';

import './Inspector.scss';

const b = block('chartkit-inspector');

const Inspector: React.FC<{
    data: (TWidget & ChartsData) | null;
    error: DatalensChartkitCustomError | null;
    requestId: string;
    widget: Highcharts.Chart | null;
    widgetDataRef?: ChartWidgetDataRef | null;
    widgetRendering: number | null;
    yandexMapAPIWaiting: number | null;
    onClose: () => void;
}> = (props) => {
    const {
        data,
        error,
        // Result from settings.requestIdGenerator
        requestId: staticReqId,
        widget,
        widgetDataRef,
        widgetRendering,
        yandexMapAPIWaiting,
        onClose,
    } = props;
    const dataSources: ResponseSourcesSuccess | object | null =
        (data && (data.sources as ResponseSourcesSuccess)) ||
        (error && (error.extra.sources as ResponseSourcesSuccess));
    const errorSources = error && (error.debug.sources as ResponseSourcesError);
    // Result from dataProvider.getWidget
    const responseReqId = data?.requestId;
    const requestId = responseReqId || staticReqId;
    const stats = data
        ? ChartsDataProvider.gatherStats({
              loadedData: data,
              widget: widgetDataRef?.current || widget,
              widgetRendering,
              yandexMapAPIWaiting,
              requestId,
          })
        : null;
    const {Timings} = registry.common.components.getAll();

    return (
        <Dialog onClose={onClose} open={true} size="m">
            <Dialog.Header caption={i18n('chartkit.menu.inspector', 'label_caption')} />
            <Dialog.Body className={b('body')}>
                {stats && <Timings {...stats} />}
                {stats && <Dialog.Divider className={b('divider')} />}
                <div className={b('request-id')}>
                    <span>Request ID</span>
                    <span className={b('request-id-value')}>
                        {requestId}
                        <span className={b('request-id-copy')}>
                            <ClipboardButton text={requestId} size={14} />
                        </span>
                    </span>
                </div>
                {data?.traceId && (
                    <div className={b('request-id')}>
                        <span>Trace ID</span>
                        <span className={b('request-id-value')}>
                            {data.traceId}
                            <span className={b('request-id-copy')}>
                                <ClipboardButton text={data.traceId} size={14} />
                            </span>
                        </span>
                    </div>
                )}
                <Sources dataSources={dataSources} errorSources={errorSources} />
            </Dialog.Body>
            <Dialog.Footer
                textButtonCancel={i18n('chartkit.menu.inspector', 'button_close')}
                onClickButtonCancel={onClose}
            />
        </Dialog>
    );
};

const getInspectorMenuitem = () => ({
    id: MenuItemsIds.INSPECTOR,
    title: () => i18n('chartkit.menu.inspector', 'label_caption'),
    icon: <ChartKitIcon data={Magnifier} className={ICONS_MENU_DEFAULT_CLASSNAME} />,
    isVisible: (params: MenuItemArgs) => {
        if (!params) {
            return false;
        }
        const {loadedData, error} = params;
        return Boolean(
            !params.loadedData?.isOldWizard &&
                (loadedData?.timings ||
                    loadedData?.sources ||
                    error?.extra?.sources ||
                    error?.debug?.sources),
        );
    },
    action: ({
        loadedData,
        error,
        requestId,
        widget,
        widgetDataRef,
        widgetRendering,
        widgetRenderTimeRef,
        yandexMapAPIWaiting,
    }: MenuItemActionArgs<ChartsData, ChartsProps>) => {
        const renderTime = widgetRenderTimeRef?.current || widgetRendering || null;

        return (props: {onClose: () => void}) => (
            <Inspector
                data={loadedData}
                error={error}
                widget={widget}
                widgetDataRef={widgetDataRef}
                requestId={requestId}
                widgetRendering={renderTime}
                yandexMapAPIWaiting={yandexMapAPIWaiting || null}
                onClose={props.onClose}
            />
        );
    },
});

export default getInspectorMenuitem;
