import React from 'react';

import {i18n} from 'i18n';
import {connect} from 'react-redux';
import {SectionVisualizationAddItemQa, isMeasureName, isMeasureValue} from 'shared';
import {addFieldContainerFieldsSelector} from 'units/wizard/selectors';

import {
    DATASET_FIELD_TYPES,
    DatasetFieldType,
    Field,
    HierarchyField,
} from '../../../../../../../shared/types';
import AddField from '../../../../components/AddField/AddField';
import {getIconForDataType} from '../../../../utils/helpers';
import {isFieldVisible} from '../../../../utils/wizard';

export type AddableField = HierarchyField | Field;

interface StateProps {
    fields: AddableField[];
}

interface Props extends StateProps {
    className?: string;
    capacity?: number;
    capacityError?: string;
    capacityErrorQa?: string;
    onUpdate: (items: AddableField[]) => void;
    checkAllowed: (item: AddableField) => boolean;
    items: AddableField[];
    transform?: (item: AddableField) => Promise<AddableField>;
}

class AddFieldContainer extends React.Component<Props> {
    render() {
        const {items, className, capacity, capacityError, capacityErrorQa} = this.props;
        const fields = this.getFields();
        const disabled =
            fields.length === 0 || (Number.isInteger(capacity) ? capacity! <= items.length : false);
        const disabledText =
            fields.length === 0 ? i18n('wizard', 'tooltip_no-available-fields') : capacityError;
        const disabledTextQa =
            fields.length === 0
                ? SectionVisualizationAddItemQa.NoFieldsErrorTooltip
                : capacityErrorQa;

        return (
            <AddField
                className={className}
                onAdd={this.onAdd}
                items={fields}
                disabled={disabled}
                disabledTextQa={disabledTextQa}
                disabledText={disabledText}
            />
        );
    }

    private getFields() {
        return this.props.fields.filter(this.isItemAllowed).map((el) => {
            let iconType = el.type;

            if (isMeasureValue(el)) {
                iconType = DatasetFieldType.Measure;
            } else if (isMeasureName(el)) {
                iconType = DatasetFieldType.Dimension;
            } else if (el.data_type === DATASET_FIELD_TYPES.HIERARCHY) {
                iconType = DatasetFieldType.Dimension;
            }

            return {
                icon: getIconForDataType(el.data_type),
                title: el.title,
                value: el.title,
                iconType,
            };
        });
    }

    private isItemAllowed = (field: AddableField) => {
        return isFieldVisible(field) && this.props.checkAllowed(field);
    };

    private onAdd = ([value]: string[]) => {
        const {items, fields, onUpdate, transform} = this.props;

        const item = {...fields.find((el) => el.title === value)!};

        (transform ? transform(item) : Promise.resolve(item)).then((transformedItem) => {
            onUpdate([...items, transformedItem]);
        });
    };
}

const mapStateToProps = (state: any) => {
    return {
        fields: addFieldContainerFieldsSelector(state),
    };
};

export default connect(mapStateToProps)(AddFieldContainer);
