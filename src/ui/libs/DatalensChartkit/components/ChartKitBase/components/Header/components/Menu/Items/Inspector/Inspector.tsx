import React from 'react';

import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import {Magnifier} from '@gravity-ui/icons';
import {Dialog, Label} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {MenuItemsIds} from 'shared';
import {DL} from 'ui/constants/common';
import ChartKitIcon from 'ui/libs/DatalensChartkit/components/ChartKitIcon/ChartKitIcon';
import {registry} from 'ui/registry';

import type {ChartWidgetDataRef} from '../../../../../../../../../../components/Widgets/Chart/types';
import {type MenuItemArgs} from '../../../../../../../../menu/MenuItems';
import type {
    ChartsData,
    ChartsProps,
    ResponseSourcesError,
    ResponseSourcesSuccess,
} from '../../../../../../../../modules/data-provider/charts';
import {ChartsDataProvider} from '../../../../../../../../modules/data-provider/charts';
import type DatalensChartkitCustomError from '../../../../../../../../modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import type {Widget as TWidget} from '../../../../../../../../types';
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
        <Dialog onClose={onClose} open={true} size="m" disableHeightTransition={true}>
            <Dialog.Header caption={i18n('chartkit.menu.inspector', 'label_caption')} />
            <Dialog.Body className={b('body')}>
                {stats && <Timings {...stats} />}
                {stats && <Dialog.Divider className={b('divider')} />}
                <div className={b('row')}>
                    <span>Request ID</span>
                    <Label
                        className={b('label')}
                        type="copy"
                        theme="unknown"
                        size="s"
                        copyText={requestId}
                    >
                        {requestId}
                    </Label>
                </div>
                {data?.traceId && (
                    <div className={b('row')}>
                        <span>Trace ID</span>
                        <Label
                            className={b('label')}
                            type="copy"
                            theme="unknown"
                            size="s"
                            copyText={data.traceId}
                        >
                            {data.traceId}
                        </Label>
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
    icon: <ChartKitIcon data={Magnifier} />,
    isVisible: (params: MenuItemArgs) => {
        if (!params || DL.IS_MOBILE) {
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
