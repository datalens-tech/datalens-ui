import React from 'react';

import block from 'bem-cn-lite';
import {isEmpty} from 'lodash';
import PropTypes from 'prop-types';

import {Error, Widget} from './components';
import {getRandomCKId} from './helpers/getRandomCKId';

import './ChartKit.scss';

const b = block('chartkit');

export class ChartKit extends React.Component {
    constructor(props) {
        super(props);

        if (!this.isInit) {
            this.isInit = true;
        }

        this.state = {error: null};
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentDidCatch(error) {
        if (this.props.onError) {
            this.props.onError({error});
        } else {
            this.setState({error: error});
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    mounted = false;
    // dynamic id will force Widget to be re-rendered and then Component/Graph
    isInit = false;
    id = getRandomCKId();

    onLoad = ({widget = null, widgetRendering = null, yandexMapAPIWaiting = null} = {}) => {
        this.setState({widget});

        if (this.props.onLoad) {
            this.props.onLoad({
                widget,
                widgetRendering,
                yandexMapAPIWaiting,
            });
        }
    };

    reflow = () => {
        if (this.state.widget && this.mounted) {
            const hasWidgetData = !isEmpty(this.props.loadedData?.data);
            if (
                hasWidgetData &&
                this.state.widget.reflow &&
                typeof this.state.widget.reflow === 'function'
            ) {
                this.state.widget.reflow();
            }
            // for tables with sticky header
            if (this.state.widget.resize && typeof this.state.widget.resize === 'function') {
                this.state.widget.resize();
            }

            // for yagr charts
            if (this.state.widget.uplot) {
                const height = this.state.widget.root.offsetHeight;
                const width = this.state.widget.root.offsetWidth;
                this.state.widget.uplot.setSize({width, height});
                this.state.widget.uplot.redraw();
            }
        }
    };

    render() {
        if (this.state.error) {
            return <Error error={this.state.error} />;
        }

        return (
            <div className={b({mobile: this.props.isMobile}, 'chartkit-theme_common')}>
                <Widget
                    id={this.id}
                    data={this.props.loadedData}
                    splitTooltip={this.props.splitTooltip}
                    nonBodyScroll={this.props.nonBodyScroll}
                    isMobile={this.props.isMobile}
                    lang={this.props.lang}
                    onLoad={this.onLoad}
                    onChartLoad={this.props.onChartLoad}
                    onRender={this.props.onRender}
                    onError={this.props.onError}
                    onChange={this.props.onChange}
                    runAction={this.props.runAction}
                    onAction={this.props.onAction}
                />
            </div>
        );
    }
}

ChartKit.propTypes = {
    loadedData: PropTypes.object,
    splitTooltip: PropTypes.bool,
    nonBodyScroll: PropTypes.bool,
    isMobile: PropTypes.bool,
    lang: PropTypes.oneOf(['ru', 'en']),
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    onChange: PropTypes.func,
    runAction: PropTypes.func,
    onAction: PropTypes.func,
};
