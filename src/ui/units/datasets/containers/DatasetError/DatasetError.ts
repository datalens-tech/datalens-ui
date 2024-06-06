import React from 'react';

import {I18n} from 'i18n';
import _isEmpty from 'lodash/isEmpty';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import {showToast} from 'store/actions/toaster';
import type {DatalensGlobalState} from 'ui';
import {BI_ERRORS, Utils} from 'ui';
import {setDatasetRevisionMismatch} from 'units/datasets/store/actions/creators';

import {TOASTERS_NAMES} from '../../constants';
import {getToastTitle} from '../../helpers/dataset-error-helpers';
import {
    componentErrorsSelector,
    datasetSavingErrorSelector,
    datasetValidationErrorSelector,
} from '../../store/selectors/dataset';

const i18n = I18n.keyset('dataset.notifications.view');

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type Props = StateProps & DispatchProps;

class DatasetError extends React.Component<Props> {
    componentDidMount() {
        const {validationError} = this.props;

        if (validationError) {
            this.displayValidationError();
        }
    }

    componentDidUpdate(prevProps: Props) {
        const {savingError: prevSavingError, validationError: prevValidationError} = prevProps;
        const {savingError, validationError} = this.props;

        if (savingError && prevSavingError !== savingError) {
            this.displaySavingError();
        }

        if (validationError && prevValidationError !== validationError) {
            const errorDetails = Utils.getErrorDetails(validationError);

            if (errorDetails && errorDetails.code === BI_ERRORS.DATASET_REVISION_MISMATCH) {
                this.props.setDatasetRevisionMismatch();
            }

            this.displayValidationError();
        }
    }

    render() {
        return null;
    }

    displaySavingError() {
        const {savingError} = this.props;

        const title = i18n('toast_dataset-save-msgs-failure');

        this.props.showToast({
            name: TOASTERS_NAMES.ERROR_SAVE_DATASET,
            title,
            type: 'danger',
            error: savingError,
            withReport: true,
        });
    }

    displayValidationError() {
        const error = this.props.validationError;

        const validationData = error.details && error.details.data;
        let customError = this.props.validationError;
        if (validationData) {
            const errors = validationData?.dataset?.component_errors;
            const items = errors?.items;
            const componentItem = items?.[0];
            const errorDetails = componentItem?.errors?.[0];
            if (errorDetails) {
                customError = {
                    details: items,
                    debug: {
                        requestId: error?.requestId,
                        traceId: error?.traceId,
                        message: error?.message,
                        code: error?.code,
                    },
                    isCustomError: true,
                };
            }
        }

        this.props.showToast({
            name: TOASTERS_NAMES.ERROR_VALIDATE_DATASET,
            title: getToastTitle('NOTIFICATION_FAILURE', 'validate'),
            type: 'danger',
            error: customError,
            withReport: true,
        });
    }

    shapeErrors = (errors = []) => {
        return errors.length ? errors : undefined;
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        savingError: datasetSavingErrorSelector(state),
        validationError: datasetValidationErrorSelector(state),
        componentErrors: componentErrorsSelector(state),
    };
};

const mapDispatchToProps = {
    setDatasetRevisionMismatch,
    showToast,
};

export default connect(mapStateToProps, mapDispatchToProps)(DatasetError);
