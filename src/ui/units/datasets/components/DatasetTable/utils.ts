import {SortedDataItem} from '@gravity-ui/react-data-table';
import {i18n} from 'i18n';
import {get} from 'lodash';
import {
    AvailableFieldType,
    DATASET_FIELD_TYPES,
    DatasetField,
    DatasetFieldAggregation,
    DatasetOptionFieldItem,
    DatasetOptions,
    DatasetRls,
    DatasetSourceAvatar,
    Feature,
} from 'shared';
import {Permissions} from 'shared/types/dls';
import Utils from 'ui/utils';

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
import {FORMULA_CALC_MODE, FieldAction} from './constants';
import {ColumnItem} from './types';

const WIDTH_15 = '15%';
const WIDTH_20 = '20%';

type GetColumnsArgs = {
    fields: DatasetOptionFieldItem[];
    showFieldsId: boolean;
    avatars?: DatasetSourceAvatar[];
    setActiveRow: ColumnItem['setActiveRow'];
    openDialogFieldEditor: (field: DatasetField) => void;
    handleTitleUpdate: (field: DatasetField, value: string) => void;
    handleIdUpdate: (field: DatasetField, value: string) => void;
    handleHiddenUpdate: (field: DatasetField) => void;
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
};

export const getLabelValue = (key: string) => {
    return i18n('dataset.dataset-editor.modify', `value_${key as AvailableFieldType}`);
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
        avatars,
        fields,
        showFieldsId,
        setActiveRow,
        openDialogFieldEditor,
        handleTitleUpdate,
        handleIdUpdate,
        handleHiddenUpdate,
        handleTypeSelectUpdate,
        handleAggregationSelectUpdate,
        handleDescriptionUpdate,
        handleMoreActionClick,
        handleRlsUpdate,
        rls,
        permissions,
    } = args;
    const width = showFieldsId ? WIDTH_15 : WIDTH_20;
    const index = getIndexColumn();
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

    const columns = [index, title, source, hidden, cast, aggregation, description, more];

    if (Utils.isEnabledFeature(Feature.DatasetsRLS) && (permissions?.admin || permissions?.edit)) {
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
    const castText1 = getLabelValue(castValue1);
    const castText2 = getLabelValue(castValue2);

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
    const aggregationText1 = getLabelValue(aggregationValue1);
    const aggregationText2 = getLabelValue(aggregationValue2);

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
