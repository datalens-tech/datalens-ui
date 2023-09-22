import React from 'react';

import PropTypes from 'prop-types';

import {
    ChartKitCustomError,
    ERROR_CODE,
} from '../../modules/chartkit-custom-error/chartkit-custom-error';

import {AlertWidget, Markdown, Table} from './components';

export const CHARTKIT_WIDGET_TYPE = {
    TABLE: 'table',
    MARKDOWN: 'markdown',
    ALERT: 'alert',
    GRAPH: 'graph',
};

const WidgetComponents = {
    [CHARTKIT_WIDGET_TYPE.TABLE]: Table,
    [CHARTKIT_WIDGET_TYPE.MARKDOWN]: Markdown,
    [CHARTKIT_WIDGET_TYPE.ALERT]: AlertWidget,
};

const getWidgetComponent = (type) => {
    return WidgetComponents[type];
};

export class Widget extends React.PureComponent {
    render() {
        const WidgetComponent = getWidgetComponent(this.props.data.type);
        if (!WidgetComponent) {
            throw new ChartKitCustomError(null, {
                code: ERROR_CODE.UNKNOWN_EXTENSION,
                details: {key: this.props.data.type},
            });
        }

        return (
            <WidgetComponent
                id={this.props.id}
                data={this.props.data}
                splitTooltip={this.props.splitTooltip}
                nonBodyScroll={this.props.nonBodyScroll}
                isMobile={this.props.isMobile}
                lang={this.props.lang}
                onLoad={this.props.onLoad}
                onChartLoad={this.props.onChartLoad}
                onRender={this.props.onRender}
                onError={this.props.onError}
                onChange={this.props.onChange}
            />
        );
    }
}

Widget.propTypes = {
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    data: PropTypes.object,
    splitTooltip: PropTypes.bool,
    nonBodyScroll: PropTypes.bool,
    isMobile: PropTypes.bool,
    lang: PropTypes.oneOf(['ru', 'en']),
    onLoad: PropTypes.func,
    onChartLoad: PropTypes.func,
    onRender: PropTypes.func,
    onError: PropTypes.func,
    onChange: PropTypes.func,
};
