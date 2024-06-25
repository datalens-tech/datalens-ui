import React from 'react';

import {LayoutRows3, TriangleExclamation} from '@gravity-ui/icons';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {Field, Shared} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {selectAvailable, selectDataConflict} from 'units/wizard/selectors/visualization';

import {updateAvailable} from '../../../../../actions/placeholder';
import PlaceholderComponent from '../Placeholder/Placeholder';
import type {CommonPlaceholderProps} from '../PlaceholdersContainer';

type PropsState = ReturnType<typeof mapStateToProps>;
type PropsDispatch = ReturnType<typeof mapDispatchToProps>;

type Props = {
    globalVisualization?: Shared['visualization'];
} & CommonPlaceholderProps &
    PropsState &
    PropsDispatch;

class AvailablePlaceholder extends React.Component<Props> {
    render() {
        const {available, dataConflict, wrapTo, datasetError} = this.props;

        return (
            <PlaceholderComponent
                key="available"
                qa="placeholder-available"
                id="available"
                iconProps={{data: LayoutRows3}}
                title="section_available"
                placeholderTooltipText={
                    dataConflict ? i18n('sql', 'hint_available-warning') : undefined
                }
                placeholderTooltipIcon={TriangleExclamation}
                hasSettings={false}
                onActionIconClick={() => {}}
                items={available}
                checkAllowed={() => true}
                onUpdate={this.onAvailableUpdate}
                wrapTo={wrapTo}
                noRemove={true}
                noSwap={true}
                disabled={Boolean(datasetError)}
                disableAddField={true}
                onAfterUpdate={this.props.onUpdate}
            />
        );
    }

    private onAvailableUpdate = (items: Field[]) => {
        this.props.updateAvailable({items});
        if (this.props.onUpdate) {
            this.props.onUpdate();
        }
    };
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            updateAvailable,
        },
        dispatch,
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        available: selectAvailable(state),
        dataConflict: selectDataConflict(state),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AvailablePlaceholder);
