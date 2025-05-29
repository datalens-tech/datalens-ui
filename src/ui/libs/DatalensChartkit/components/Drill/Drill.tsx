import React from 'react';

import {Breadcrumbs} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {IS_NULL_FILTER_TEMPLATE, PRINT_HIDDEN_ATTR} from 'shared';

import type {OnChangeData} from '../../types';
import ChartKitIcon from '../ChartKitIcon/ChartKitIcon';

import iconArrowRight from 'ui/assets/icons/arrow-right.svg';

import './Drill.scss';

const b = block('chartkit-drill');

export interface Props {
    onChange: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
    ) => void;
    breadcrumbs: string[];
    filters: string[];
    level: number;
}

class Drill extends React.Component<Props> {
    componentDidUpdate(prevProps: Props) {
        const breadcrumbsHasChanged =
            prevProps.breadcrumbs.length !== this.props.breadcrumbs.length ||
            prevProps.breadcrumbs.some(
                (oldBreadcrumb, index) => oldBreadcrumb !== this.props.breadcrumbs[index],
            );

        if (breadcrumbsHasChanged) {
            this.changeParams('', '');
        }
    }

    componentWillUnmount() {
        this.changeParams('', '');
    }

    render() {
        const {breadcrumbs, level} = this.props;

        return (
            <div className={b()}>
                <div className={b('controls')} {...{[PRINT_HIDDEN_ATTR]: true}}>
                    <ChartKitIcon
                        className={b('drill-action', {
                            disabled: level === 0,
                            left: true,
                        })}
                        onClick={this.onDrillUp}
                        viewBoxSize="16"
                        data={iconArrowRight}
                    />
                    <ChartKitIcon
                        className={b('drill-action', {
                            disabled: level === breadcrumbs.length - 1,
                            right: true,
                        })}
                        onClick={this.onDrillDown}
                        viewBoxSize="16"
                        data={iconArrowRight}
                    />
                </div>
                <div className={b('separator')} {...{[PRINT_HIDDEN_ATTR]: true}} />
                <Breadcrumbs
                    className={b('breadcrumbs')}
                    popupPlacement={['bottom', 'top', 'bottom-start']}
                >
                    {this.getItems().map((item, index) => {
                        return (
                            <Breadcrumbs.Item key={index} onClick={item.action}>
                                {item.text}
                            </Breadcrumbs.Item>
                        );
                    })}
                </Breadcrumbs>
            </div>
        );
    }

    getItems() {
        const {filters, level} = this.props;
        return this.props.breadcrumbs.slice(0, level + 1).map((breadcrumb, index) => {
            let text = `${breadcrumb}`;

            const filterValue = filters[index];

            if (filterValue) {
                if (filterValue === IS_NULL_FILTER_TEMPLATE) {
                    text += ': null';
                } else {
                    text += `: ${filterValue}`;
                }
            }

            return {
                text,
                action: () => {
                    this.changeDrillDownLevel(index);
                },
            };
        });
    }

    private onDrillUp = () => {
        const newDrillDownLevel = this.props.level - 1;

        if (newDrillDownLevel >= 0) {
            this.changeDrillDownLevel(newDrillDownLevel);
        }
    };

    private onDrillDown = () => {
        const newDrillDownLevel = this.props.level + 1;

        if (newDrillDownLevel < this.props.breadcrumbs.length) {
            this.changeDrillDownLevel(newDrillDownLevel);
        }
    };

    private changeDrillDownLevel(newDrillDownLevel: number) {
        const drillDownLevel = String(newDrillDownLevel);
        const drillDownFilters = this.props.filters.map((filter, index) =>
            index >= newDrillDownLevel ? '' : filter,
        );

        this.changeParams(drillDownLevel, drillDownFilters);
    }

    private changeParams(drillDownLevel: string, drillDownFilters: string | string[]) {
        const data: OnChangeData = {
            type: 'PARAMS_CHANGED',
            data: {
                params: {
                    drillDownLevel,
                    drillDownFilters,
                },
            },
        };

        this.props.onChange(data, {forceUpdate: true});
    }
}

export default Drill;
