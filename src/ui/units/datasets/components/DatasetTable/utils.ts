import type {SortedDataItem} from '@gravity-ui/react-data-table';
import get from 'lodash/get';
import type {
    DatasetField,
    DatasetFieldAggregation,
    DatasetOptionFieldItem,
    DatasetOptions,
    DatasetRls,
    DatasetSelectionMap,
    DatasetSourceAvatar,
} from 'shared';
import {DATASET_FIELD_TYPES, Feature} from 'shared';
import type {Permissions} from 'shared/types/permissions';
import {getDatasetLabelValue} from 'ui/utils/helpers';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {
    getAggregationColumn,
    getCastColumn,
    getDescriptionColumn,
    getHiddenColumn,
    getIdColumn,
    getIndexColumn,
    getMoreColumn,
    getRlsColumn,
    getSourceColumn,
    getTitleColumn,
} from './columns';
import {getFieldSettingsColumn} from './columns/FieldSettings';
import type {FieldAction} from './constants';
import {FORMULA_CALC_MODE} from './constants';
import type {ColumnItem} from './types';

const WIDTH_15 = '15%';
const WIDTH_20 = '20%';

type GetColumnsArgs = {
    selectedRows: DatasetSelectionMap;
    fieldsCount: number;
    fields: DatasetOptionFieldItem[];
    showFieldsId: boolean;
    avatars?: DatasetSourceAvatar[];
    setActiveRow: ColumnItem['setActiveRow'];
    openDialogFieldEditor: (field: DatasetField) => void;
    handleTitleUpdate: (field: DatasetField, value: string) => void;
    handleIdUpdate: (field: DatasetField, value: string) => void;
    handleHiddenUpdate: (field: DatasetField) => void;
    handleUpdateFieldSettings: (field: DatasetField) => void;
    handleRlsUpdate: (field: DatasetField) => void;
    rls: DatasetRls;
    permissions?: Permissions;
    handleTypeSelectUpdate: (field: DatasetField, cast: DATASET_FIELD_TYPES) => void;
    handleAggregationSelectUpdate: (
        field: DatasetField,
        aggregation: DatasetFieldAggregation,
    ) => void;
    handleDescriptionUpdate: (field: DatasetField, value: string) => void;
    handleMoreActionClick: (args: {action: FieldAction; field: DatasetField}) => void;
    onSelectChange: (
        isSelected: boolean,
        fields: (keyof DatasetSelectionMap)[],
        clickedIndex?: number,
        modifier?: {shiftKey: boolean},
    ) => void;
};

export const getAggregationSwitchTo = (
    options: DatasetOptions,
    currentAggregation: DatasetFieldAggregation,
    selectedCast: DATASET_FIELD_TYPES,
) => {
    const {aggregations: availableAggregations = []} =
        options.data_types.items.find(({type}) => type === selectedCast) || {};

    const isCurrentAggregationAvailableForCast = availableAggregations.includes(currentAggregation);

    return (
        isCurrentAggregationAvailableForCast ? currentAggregation : 'none'
    ) as DatasetFieldAggregation;
};

const getAvatarTitleLastPart = (avatarId: string, avatars?: DatasetSourceAvatar[]) => {
    const avatar = avatars?.find(({id}) => id === avatarId);

    if (!avatar) {
        return '';
    }

    const splittedAvatarTitle = avatar.title.split('.').filter(Boolean);
    return splittedAvatarTitle[splittedAvatarTitle.length - 1];
};

export const getFieldSourceTitle = (field: DatasetField, avatars?: DatasetSourceAvatar[]) => {
    const avatarTitleLastPart = getAvatarTitleLastPart(field.avatar_id, avatars);
    return avatarTitleLastPart ? `${avatarTitleLastPart}.${field.source}` : field.source;
};

export const getColumns = (args: GetColumnsArgs) => {
    const {
        selectedRows,
        fieldsCount,
        avatars,
        fields,
        showFieldsId,
        onSelectChange,
        setActiveRow,
        openDialogFieldEditor,
        handleTitleUpdate,
        handleIdUpdate,
        handleHiddenUpdate,
        handleUpdateFieldSettings,
        handleTypeSelectUpdate,
        handleAggregationSelectUpdate,
        handleDescriptionUpdate,
        handleMoreActionClick,
        handleRlsUpdate,
        rls,
        permissions,
    } = args;
    const width = showFieldsId ? WIDTH_15 : WIDTH_20;
    const selectedCount = Object.keys(selectedRows).length;

    const index = getIndexColumn({
        selectedRows,
        isAllSelected: fieldsCount > 0 ? selectedCount === fieldsCount : false,
        indeterminate: fieldsCount > 0 && selectedCount > 0 ? selectedCount !== fieldsCount : false,
        onSelectChange,
        onSelectAllChange: (state: boolean) =>
            onSelectChange(
                state,
                fields.map(({guid}) => guid),
            ),
    });

    const title = getTitleColumn({
        width,
        setActiveRow,
        onUpdate: (row, value) => handleTitleUpdate(row, value),
    });
    const source = getSourceColumn({width, avatars, openDialogFieldEditor});
    const hidden = getHiddenColumn({onUpdate: handleHiddenUpdate});
    const cast = getCastColumn({fields, onUpdate: handleTypeSelectUpdate});
    const aggregation = getAggregationColumn({
        fields,
        onUpdate: handleAggregationSelectUpdate,
    });
    const description = getDescriptionColumn({
        setActiveRow,
        onUpdate: (row, value) => handleDescriptionUpdate(row, value),
    });
    const more = getMoreColumn({setActiveRow, onItemClick: handleMoreActionClick});

    const columns = [index, title, source];

    if (isEnabledFeature(Feature.StoreFieldSettingsAtDataset)) {
        const fieldSettingsColumn = getFieldSettingsColumn({onUpdate: handleUpdateFieldSettings});
        columns.push(fieldSettingsColumn);
    }

    columns.push(...[hidden, cast, aggregation, description, more]);

    if (isEnabledFeature(Feature.DatasetsRLS) && (permissions?.admin || permissions?.edit)) {
        const rlsColumn = getRlsColumn({onUpdate: handleRlsUpdate, rls});

        columns.splice(4, 0, rlsColumn);
    }

    if (showFieldsId) {
        const id = getIdColumn({
            width: WIDTH_15,
            setActiveRow,
            onUpdate: (row, value) => handleIdUpdate(row, value),
        });
        columns.splice(2, 0, id);
    }

    return columns;
};

export const sortTitleColumn = (
    row1: SortedDataItem<DatasetField>,
    row2: SortedDataItem<DatasetField>,
) => {
    const title1 = get(row1, ['row', 'title']);
    const title2 = get(row2, ['row', 'title']);

    return title1.localeCompare(title2, undefined, {numeric: true});
};

export const sortIdColumn = (
    row1: SortedDataItem<DatasetField>,
    row2: SortedDataItem<DatasetField>,
) => {
    const guid1 = get(row1, ['row', 'guid']);
    const guid2 = get(row2, ['row', 'guid']);

    return guid1.localeCompare(guid2, undefined, {numeric: true});
};

export const sortSourceColumn = (
    row1: SortedDataItem<DatasetField>,
    row2: SortedDataItem<DatasetField>,
    avatars?: DatasetSourceAvatar[],
) => {
    const calcModeRow1 = get(row1, ['row', 'calc_mode']);
    const calcModeRow2 = get(row2, ['row', 'calc_mode']);
    const sourceRow1 = getFieldSourceTitle(get(row1, 'row'), avatars);
    const sourceRow2 = getFieldSourceTitle(get(row2, 'row'), avatars);
    let sortComparisonValue = 0;

    if (calcModeRow1 === FORMULA_CALC_MODE && calcModeRow2 !== FORMULA_CALC_MODE) {
        sortComparisonValue = 1;
    } else if (calcModeRow1 !== FORMULA_CALC_MODE && calcModeRow2 === FORMULA_CALC_MODE) {
        sortComparisonValue = -1;
    } else {
        sortComparisonValue = sourceRow2.localeCompare(sourceRow1, undefined, {
            numeric: true,
        });
    }

    return sortComparisonValue;
};

export const sortCastColumn = (
    row1: SortedDataItem<DatasetField>,
    row2: SortedDataItem<DatasetField>,
) => {
    const castValue1 = get(row1, ['row', 'cast']);
    const castValue2 = get(row2, ['row', 'cast']);
    const castText1 = getDatasetLabelValue(castValue1);
    const castText2 = getDatasetLabelValue(castValue2);

    return castText1.localeCompare(castText2, undefined, {numeric: true});
};

export const sortRslColumn = (
    row1: SortedDataItem<DatasetField>,
    row2: SortedDataItem<DatasetField>,
    rls: DatasetRls,
) => {
    const guidRow1 = get(row1, ['row', 'guid']);
    const guidRow2 = get(row2, ['row', 'guid']);
    const isRlsRow1 = Boolean(get(rls, guidRow1));
    const isRlsRow2 = Boolean(get(rls, guidRow2));

    return Number(isRlsRow1) - Number(isRlsRow2);
};

export const sortAggregationColumn = (
    row1: SortedDataItem<DatasetField>,
    row2: SortedDataItem<DatasetField>,
) => {
    const aggregationValue1 = get(row1, ['row', 'aggregation']);
    const aggregationValue2 = get(row2, ['row', 'aggregation']);
    const aggregationText1 = getDatasetLabelValue(aggregationValue1);
    const aggregationText2 = getDatasetLabelValue(aggregationValue2);

    return aggregationText1.localeCompare(aggregationText2, undefined, {
        numeric: true,
    });
};

export const sortDescriptionColumn = (
    row1: SortedDataItem<DatasetField>,
    row2: SortedDataItem<DatasetField>,
) => {
    const description1 = get(row1, ['row', 'description']);
    const description2 = get(row2, ['row', 'description']);

    return description1.localeCompare(description2, undefined, {numeric: true});
};

export const isHiddenSupported = (row: DatasetField) => {
    return row.initial_data_type !== DATASET_FIELD_TYPES.UNSUPPORTED;
};
