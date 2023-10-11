import React from 'react';

import {LayoutRows3} from '@gravity-ui/icons';
import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';
import {Field, Shared} from 'shared';
import {DatalensGlobalState} from 'ui';
import {selectAvailable} from 'units/wizard/selectors/visualization';

import {updateAvailable} from '../../../../../actions/placeholder';
import PlaceholderComponent from '../Placeholder/Placeholder';
import {CommonPlaceholderProps} from '../PlaceholdersContainer';

type PropsState = ReturnType<typeof mapStateToProps>;
type PropsDispatch = ReturnType<typeof mapDispatchToProps>;

type Props = {
    globalVisualization?: Shared['visualization'];
} & CommonPlaceholderProps &
    PropsState &
    PropsDispatch;

class AvailablePlaceholder extends React.Component<Props> {
    render() {
        const {available, wrapTo, datasetError} = this.props;

        return (
            <PlaceholderComponent
                key="available"
                qa="placeholder-available"
                id="available"
                iconProps={{data: LayoutRows3}}
                title="section_available"
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
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AvailablePlaceholder);
