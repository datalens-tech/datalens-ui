import React from 'react';

import {ViewError} from 'components/ViewError/ViewError';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {useHistory, useLocation, useParams} from 'react-router-dom';

import {load as loadDash} from '../../store/actions/dash';

function Error(props) {
    const location = useLocation();
    const history = useHistory();
    const params = useParams();

    return (
        <ViewError error={props.error} retry={() => props.loadDash({location, history, params})} />
    );
}

Error.propTypes = {
    error: PropTypes.object.isRequired,
    loadDash: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    error: state.dash.error,
});

const mapDispatchToProps = {
    loadDash,
};

export default connect(mapStateToProps, mapDispatchToProps)(Error);
