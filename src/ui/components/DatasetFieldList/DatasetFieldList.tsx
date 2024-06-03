import React from 'react';

import {Function} from '@gravity-ui/icons';
import {Icon, List} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {I18n} from '../../../i18n';
import type {DatasetField} from '../../../shared';
import {DatasetFieldType, isParameter} from '../../../shared';
import DataTypeIcon from '../DataTypeIcon/DataTypeIcon';

import './DatasetFieldList.scss';

const b = block('dl-dataset-field-list');
const i18n = I18n.keyset('component.dl-dataset-field-list.view');

interface DatasetFieldListProps {
    onFiledItemClick: (item: DatasetField) => void;
    fields: DatasetField[];
    itemHeight?: number;
    filterPlaceholder?: string;
}

const DatasetFieldList: React.FC<DatasetFieldListProps> = (props) => {
    const {fields, itemHeight, filterPlaceholder, onFiledItemClick} = props;

    const renderField = (field: DatasetField) => {
        const {title, type, calc_mode: calcMode, data_type: dataType} = field;

        const fieldType = isParameter(field) ? DatasetFieldType.Parameter : type;

        return (
            <div className={b('field')}>
                <DataTypeIcon
                    className={b('field-icon')}
                    fieldType={fieldType}
                    dataType={dataType}
                />
                <div className={b('field-title')} title={title}>
                    {title}
                </div>
                {calcMode === 'formula' && (
                    <Icon className={b('formula-icon')} data={Function} size={14} />
                )}
            </div>
        );
    };

    const filterFields = (filter: string) => {
        return (field: DatasetField): boolean =>
            field.title.toLowerCase().includes(filter.toLowerCase());
    };

    const items = React.useMemo(() => {
        const parameters = fields.filter(isParameter);
        const otherFields = fields.filter((field) => !isParameter(field));
        return [...otherFields, ...parameters];
    }, [fields]);

    return (
        <div className={b()}>
            <List
                items={items}
                itemHeight={itemHeight}
                filterPlaceholder={filterPlaceholder || i18n('label_filter-placeholder')}
                filterable={true}
                renderItem={renderField}
                filterItem={filterFields}
                onItemClick={onFiledItemClick}
            />
        </div>
    );
};

export default DatasetFieldList;
