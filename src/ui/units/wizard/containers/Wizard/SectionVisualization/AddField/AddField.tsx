import React from 'react';

import {i18n} from 'i18n';
import {connect} from 'react-redux';
import {SectionVisualizationAddItemQa, isMeasureName, isMeasureValue} from 'shared';
import {selectDebugMode} from 'ui/store/selectors/user';
import {addFieldContainerFieldsSelector} from 'units/wizard/selectors';

import type {Field, HierarchyField} from '../../../../../../../shared/types';
import {DATASET_FIELD_TYPES, DatasetFieldType} from '../../../../../../../shared/types';
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
    items: AddableField[];
    addableFields?: AddableField[];
    dlDebugMode?: boolean;

    onUpdate: (items: AddableField[]) => void;
    checkAllowed: (item: AddableField) => boolean;
    transform?: (item: AddableField) => Promise<AddableField>;
    disabledText?: string;
}

class AddFieldContainer extends React.Component<Props> {
    render() {
        const {
            items,
            className,
            capacity,
            capacityError,
            capacityErrorQa,
            dlDebugMode,
            disabledText: disabledTextOrigin,
        } = this.props;
        const addableFields = this.getAddableFields();
        const disabled =
            Boolean(disabledTextOrigin) ||
            addableFields.length === 0 ||
            (Number.isInteger(capacity) ? capacity! <= items.length : false);
        const disabledTextLocal =
            addableFields.length === 0
                ? i18n('wizard', 'tooltip_no-available-fields')
                : capacityError;

        const disabledText = disabledTextOrigin || disabledTextLocal;
        const disabledTextQa =
            addableFields.length === 0
                ? SectionVisualizationAddItemQa.NoFieldsErrorTooltip
                : capacityErrorQa;

        return (
            <AddField
                className={className}
                onAdd={this.onAdd}
                items={addableFields}
                disabled={disabled}
                disabledTextQa={disabledTextQa}
                disabledText={disabledText}
                dlDebugMode={dlDebugMode}
            />
        );
    }

    private getAddableFields() {
        const fields = this.props.addableFields || this.props.fields;

        return fields.filter(this.isItemAllowed).map((el) => {
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
                description: el.description,
                guid: el.guid,
                iconType,
            };
        });
    }

    private isItemAllowed = (field: AddableField) => {
        return isFieldVisible(field) && this.props.checkAllowed(field);
    };

    private onAdd = ([value]: string[]) => {
        const {items, onUpdate, transform} = this.props;

        const fields = this.props.addableFields || this.props.fields;

        const item = {...fields.find((el) => el.title === value)!};

        (transform ? transform(item) : Promise.resolve(item)).then((transformedItem) => {
            onUpdate([...items, transformedItem]);
        });
    };
}

const mapStateToProps = (state: any) => {
    return {
        fields: addFieldContainerFieldsSelector(state),
        dlDebugMode: selectDebugMode(state),
    };
};

export default connect(mapStateToProps)(AddFieldContainer);
