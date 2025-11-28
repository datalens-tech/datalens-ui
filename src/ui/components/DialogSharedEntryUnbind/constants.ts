import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

export const AlertEntryTitles = {
    connection: getSharedEntryMockText('label-shared-connection'),
    dataset: getSharedEntryMockText('label-shared-dataset'),
};

export const AlertEntryPluralizedTitles = {
    connection: getSharedEntryMockText('entries-list-title-connection').toLowerCase(),
    dataset: getSharedEntryMockText('label-of-shared-dataset').toLowerCase(),
};

export const AlertRelationsText = {
    dataset: getSharedEntryMockText('message-relation-alert-unbind-dialog'),
    workbook: getSharedEntryMockText('message-relations-alert-unbind-dialog'),
};

export const AlertRelationTitles = {
    dataset: getSharedEntryMockText('label-relation-dataset'),
    workbook: getSharedEntryMockText('label-relation-workbook'),
};

export const EntityTitles = {
    dataset: getSharedEntryMockText('label-shared-dataset').toLowerCase(),
    workbook: getSharedEntryMockText('label-workbook').toLowerCase(),
    connection: getSharedEntryMockText('label-shared-connection').toLowerCase(),
};
