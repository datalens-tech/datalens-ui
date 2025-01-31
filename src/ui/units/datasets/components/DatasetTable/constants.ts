import type {DatasetFieldCalcMode} from 'shared';
import {Feature} from 'shared';
import {Utils} from 'ui';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {MenuItem} from './types';

export const FORMULA_CALC_MODE: DatasetFieldCalcMode = 'formula';

export enum FieldAction {
    CopyGuid = 'copyGuid',
    Duplicate = 'duplicate',
    Edit = 'edit',
    Inspect = 'inspect',
    Remove = 'remove',
    Rls = 'rls',
}

export enum BatchFieldAction {
    Remove = 'remove',
    Hide = 'hide',
    Show = 'show',
    Type = 'type',
    Aggregation = 'aggregation',
}

const DUPLICATE: MenuItem = {action: FieldAction.Duplicate, label: 'button_duplicate'};
const EDIT: MenuItem = {action: FieldAction.Edit, label: 'button_edit'};
const RLS: MenuItem = {action: FieldAction.Rls, label: 'button_row-level-security'};
const COPY_GUID: MenuItem = {action: FieldAction.CopyGuid, label: 'button_copy-id'};

export const getCommonMenuItemsData = () => {
    if (isEnabledFeature(Feature.DatasetsRLS)) {
        return [DUPLICATE, EDIT, RLS, COPY_GUID];
    }

    return [DUPLICATE, EDIT, COPY_GUID];
};

export const GROUPED_ITEMS: MenuItem[][] = [
    getCommonMenuItemsData(),
    [{action: FieldAction.Remove, label: 'button_remove', theme: 'danger'}],
    [{action: FieldAction.Inspect, label: 'button_inspect', hidden: !Utils.isSuperUser()}],
];
