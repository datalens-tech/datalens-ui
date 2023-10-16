import React from 'react';

import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';
import {DatasetField, Field} from 'shared';
import {DatalensGlobalState} from 'ui';
import {selectDashboardParameters} from 'units/wizard/selectors/visualization';

import {openDialogParameter} from '../../../../../../../store/actions/dialog';
import {PlaceholderAction} from '../../../../../actions/dndItems';
import {updateDashboardParameters} from '../../../../../actions/placeholder';
import {updatePreviewAndClientChartsConfig} from '../../../../../actions/preview';
import {setDashboardParameters} from '../../../../../actions/visualization';
import {ITEM_TYPES} from '../../../../../constants';
import {updateUrlParameter} from '../../../../../utils/wizard';
import PlaceholderComponent from '../Placeholder/Placeholder';
import {CommonPlaceholderProps} from '../PlaceholdersContainer';

import iconFilter from 'ui/assets/icons/parameter-section.svg';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = CommonPlaceholderProps & StateProps & DispatchProps;

class DashboardParametersPlaceholder extends React.Component<Props> {
    render() {
        const {datasetError, dashboardParameters} = this.props;
        return (
            <PlaceholderComponent
                id="dashboard-parameters"
                key="dashboard-parameters"
                qa="placeholder-dashboard-parameters"
                title="section_parameters_from_dashboard"
                iconProps={{data: iconFilter, width: '24'}}
                items={[...dashboardParameters]}
                onUpdate={this.handleOnUpdate}
                noSwap={true}
                allowedTypes={ITEM_TYPES.NIL}
                wrapTo={this.props.wrapTo}
                disabled={Boolean(datasetError)}
                onBeforeRemoveItem={this.props.onBeforeRemoveItem}
                hasSettings={false}
                checkAllowed={() => false}
                isDashboardPlaceholder={true}
                onItemClick={this.handleOnItemClick}
            />
        );
    }

    handleOnApplyDialogParameter = (field: DatasetField) => {
        const {dashboardParameters} = this.props;
        const updatedDashboardParameters = dashboardParameters.map((dashboardParameter) => {
            if (dashboardParameter.guid === field.guid) {
                return {
                    ...dashboardParameter,
                    default_value: field.default_value,
                };
            }

            return dashboardParameter;
        });

        updateUrlParameter({
            key: field.guid || field.title || '',
            value: String(field.default_value),
        });

        this.props.setDashboardParameters({dashboardParameters: updatedDashboardParameters});
        this.props.updatePreviewAndClientChartsConfig({});
    };

    handleOnItemClick = (_e: any, item: Field) => {
        this.props.openDialogParameter({
            type: 'edit-default-value',
            onApply: this.handleOnApplyDialogParameter,
            field: item,
        });
    };

    handleOnUpdate = (items: Field[], parameterItem: Field, action?: string) => {
        this.props.updateDashboardParameters({
            items,
            options: {item: parameterItem, action: action as PlaceholderAction},
        });
        this.props.updatePreviewAndClientChartsConfig({});
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        dashboardParameters: selectDashboardParameters(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            setDashboardParameters,
            updatePreviewAndClientChartsConfig,
            openDialogParameter,
            updateDashboardParameters,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardParametersPlaceholder);
