import {DatasetsListData} from '../../../../types';

/**
 * Check if new alias is in current aliases row,
 * ex: newAlias = ['City_ds_1', 'City_ds_3'] and currentAliasRow = ['City_ds_1', 'City_ds_2', 'City_ds_3']
 * in such case currentAliasRow contains newAlias fully
 * @param currentAliasRow
 * @param newAlias
 */
export const isAddingAliasExists = (currentAliasRow: string[], newAlias: string[]) => {
    if (currentAliasRow.length < newAlias.length) {
        return false;
    }

    const currentAliasDict: Record<string, string> = {};
    currentAliasRow.forEach((item) => {
        currentAliasDict[item] = item;
    });

    let counter = 0;
    newAlias.forEach((item) => {
        if (item in currentAliasDict) {
            counter++;
        }
    });

    return counter === newAlias.length;
};

/**
 * We prevent adding new alias in selected fields in the same dataset, no need check it again,
 * but we still need to check if we add alias that connection already added separate aliases for the same dataset
 * ex. old aliases = [['City1', 'City2'], ['Year1', 'Year3']], dataset1 contains City1 and Year1,
 * and when add alias ['City2', 'Year3'] we receive resulted addedAliases = ['City1', 'City2', 'Year1', 'Year3'],
 * but there is no sense to add different fields of one dataset, so we throw error
 * @param addedAliases
 * @param datasets
 */
export const isAddingAliasSameDataset = (
    addedAliases: string[][],
    datasets: DatasetsListData | null,
) => {
    if (!datasets) {
        return false;
    }
    const datasetsFields: Record<string, Record<string, string>> = {};
    for (const [datasetId, datasetData] of Object.entries(datasets)) {
        datasetsFields[datasetId] = datasetData.fields.reduce((previousValue, currentValue) => {
            return {...previousValue, [currentValue.guid]: currentValue.guid};
        }, {});
    }

    for (const datasetFields of Object.values(datasetsFields)) {
        let counter = 0;
        for (let i = 0; i < addedAliases.length; i++) {
            // no need to check aliases contains of 2 fields (already checked the, earlier)
            if (addedAliases[i].length < 3) {
                continue;
            }
            for (let j = 0; j < addedAliases[i].length; j++) {
                if (addedAliases[i][j] in datasetFields) {
                    counter++;
                }
                if (counter > 1) {
                    return true;
                }
            }
        }
    }

    return false;
};
