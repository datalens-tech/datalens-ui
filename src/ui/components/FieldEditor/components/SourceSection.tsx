import React from 'react';

import type {SelectOption, SelectProps} from '@gravity-ui/uikit';
import {HelpMark, Select, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {
    AvailableFieldType,
    DATASET_FIELD_TYPES,
    DatasetField,
    DatasetSource,
    DatasetSourceAvatar,
} from 'shared';
import {DatasetFieldAggregation} from 'shared';

import type {DataTypeConfig} from '../../../typings/common';
import Utils from '../../../utils';
import DataTypeIcon from '../../DataTypeIcon/DataTypeIcon';
import {EMPTY_SOURCE, INVALID_ID} from '../constants';
import type {FieldEditorErrors, ModifiedDatasetField, ModifyField} from '../typings';
import {getErrorMessageKey} from '../utils';

const b = block('dl-field-editor');
const i18n = I18n.keyset('component.dl-field-editor.view');

interface SourceSectionProps {
    modifyField: ModifyField;
    field: ModifiedDatasetField;
    errors: FieldEditorErrors;
    dataTypes: DataTypeConfig[];
    sources: DatasetSource[];
    sourceAvatars: DatasetSourceAvatar[];
}

const getSourceAvatarItems = (sourceAvatars: DatasetSourceAvatar[]) => {
    return sourceAvatars.filter(Utils.filterVirtual).map(({id, title}) => ({
        value: id,
        content: title,
    }));
};

const getSourceItems = (
    avatarId: string,
    sources: DatasetSource[],
    sourceAvatars: DatasetSourceAvatar[],
) => {
    if (!avatarId) {
        return [];
    }

    const {source_id: sourceId} = sourceAvatars.find(({id}) => id === avatarId) || {};

    return sources
        .filter(({id}) => id === sourceId)
        .reduce(
            (r, {raw_schema: rawSchema}) => r.concat(rawSchema || []),
            [] as DatasetSource['raw_schema'],
        )
        .map(({name, title}) => ({
            value: name,
            content: title || name,
        }));
};

const getCastItems = (dataTypes: DataTypeConfig[]) => {
    return dataTypes.map(({name}) => {
        const text = i18n(`value_${name as AvailableFieldType}`);
        return {
            value: name,
            content: (
                <div className={b('cast-option')}>
                    <DataTypeIcon
                        className={b('field-type-select-icon')}
                        dataType={name as DATASET_FIELD_TYPES}
                    />
                    <div className={b('cast-option-text')}>{text}</div>
                </div>
            ),
        };
    });
};

const getAggregationItems = (cast: DATASET_FIELD_TYPES, dataTypes: DataTypeConfig[]) => {
    const {aggregations = []} = dataTypes.find(({name}) => name === cast) || {};

    return aggregations.map((aggregation) => ({
        value: aggregation,
        content: i18n(`value_${aggregation as DatasetFieldAggregation}`),
    }));
};

const SourceSection: React.FC<SourceSectionProps> = (props) => {
    const {
        field: {cast, guid, new_id: newId, source, aggregation, avatar_id: avatarId},
        errors,
        dataTypes,
        sources,
        sourceAvatars,
        modifyField,
    } = props;
    const sourceAvatarItems = getSourceAvatarItems(sourceAvatars);
    const sourceItems = getSourceItems(avatarId, sources, sourceAvatars);
    const castItems = getCastItems(dataTypes);
    const aggregationItems = getAggregationItems(cast, dataTypes);
    const sourceErrorMessageKey = getErrorMessageKey(EMPTY_SOURCE, errors);
    const idErrorMessageKey = getErrorMessageKey(INVALID_ID, errors);

    const handleCastChange: SelectProps['onUpdate'] = ([newCast]) => {
        const updates: Partial<DatasetField> = {
            cast: newCast as DATASET_FIELD_TYPES,
        };

        const {aggregations = []} = dataTypes.find(({name}) => name === newCast) || {};
        const hasAggregation = aggregations.includes(aggregation);

        if (!hasAggregation) {
            updates.aggregation = DatasetFieldAggregation.None;
        }

        modifyField(updates);
    };

    const renderCastOption = (option: SelectOption) => option.content as React.ReactElement;

    const handleSourceChange: SelectProps['onUpdate'] = ([newSource]) => {
        const hasSourceError = Boolean(getErrorMessageKey(EMPTY_SOURCE, errors));
        let errorUpdates;

        if (hasSourceError) {
            errorUpdates = {
                [EMPTY_SOURCE]: false,
            };
        }

        modifyField({source: newSource}, errorUpdates);
    };

    const handleIdChange = (nextId: string) => {
        const hasIdError = Boolean(getErrorMessageKey(INVALID_ID, errors));
        let errorUpdates;

        if (hasIdError) {
            errorUpdates = {
                [INVALID_ID]: false,
            };
        }

        modifyField({new_id: nextId}, errorUpdates);
    };

    return (
        <div className={b('source-section')}>
            <div className={b('row')}>
                <div className={b('label')}>
                    {i18n('label_field-id')}
                    <HelpMark
                        popoverProps={{style: {maxWidth: 300}}}
                        className={b('source-section-hint')}
                    >
                        {i18n('label_field-id-hint')}
                    </HelpMark>
                </div>
                <TextInput
                    className={b('source-section-control')}
                    value={typeof newId === 'string' ? newId : guid}
                    error={idErrorMessageKey && i18n(idErrorMessageKey)}
                    onUpdate={handleIdChange}
                />
            </div>
            <div className={b('row')}>
                <div className={b('label')}>
                    <span>{i18n('label_source')}</span>
                </div>
                <Select
                    filterable={true}
                    className={b('source-section-control')}
                    options={sourceAvatarItems}
                    value={avatarId ? [avatarId] : []}
                    onUpdate={([newAvatarId]) => modifyField({avatar_id: newAvatarId})}
                />
            </div>
            <div className={b('row')}>
                <div className={b('label')}>
                    <span>{i18n('label_field-source')}</span>
                </div>
                <Select
                    error={sourceErrorMessageKey && i18n(sourceErrorMessageKey)}
                    className={b('source-section-control')}
                    filterable={true}
                    options={sourceItems}
                    value={source ? [source] : []}
                    disabled={!sourceItems.length}
                    onUpdate={handleSourceChange}
                />
            </div>
            <div className={b('row')}>
                <div className={b('label')}>
                    <span>{i18n('label_field-type')}</span>
                </div>
                <Select
                    className={b('source-section-control', {short: true})}
                    options={castItems}
                    value={cast ? [cast] : []}
                    onUpdate={handleCastChange}
                    renderOption={renderCastOption}
                    renderSelectedOption={renderCastOption}
                />
            </div>
            <div className={b('row')}>
                <div className={b('label')}>
                    <span>{i18n('label_aggregation')}</span>
                </div>
                <Select
                    className={b('source-section-control', {short: true})}
                    options={aggregationItems}
                    value={aggregation ? [aggregation] : []}
                    disabled={!aggregationItems.length}
                    onUpdate={([newAggregation]) => {
                        modifyField({aggregation: newAggregation as DatasetFieldAggregation});
                    }}
                />
            </div>
        </div>
    );
};

export default SourceSection;
