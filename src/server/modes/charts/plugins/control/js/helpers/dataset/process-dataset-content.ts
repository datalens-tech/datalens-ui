import type {ApiV2ResultData, ApiV2ResultDataRow} from '../../../../../../../../shared';
import {DashTabItemControlElementType} from '../../../../../../../../shared';
import type {ControlShared} from '../../../types';

type ProcessDistinctsContentArgs = {
    shared: ControlShared;
    distincts: ApiV2ResultData;
};

const processDistinctsContent = ({
    shared,
    distincts,
}: ProcessDistinctsContentArgs): ControlShared['content'] => {
    // https://stackoverflow.com/questions/40107588 numeric collation doesn't work correctly with float type
    const needCollator = shared.source.fieldType !== 'float';

    const collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: 'base',
    });

    const mappedDistincts = distincts.result_data[0].rows.map((row: ApiV2ResultDataRow) => {
        const value = row.data[0];
        return {title: value, value};
    });

    mappedDistincts.sort((a: {title: string}, b: {title: string}) => {
        return needCollator
            ? collator.compare(a.title, b.title)
            : Number(a.title) - Number(b.title);
    });

    return mappedDistincts;
};

const processAcceptableValuesContent = (shared: ControlShared) =>
    shared.source.acceptableValues as ControlShared['content'];

const processEmptyContent = (): ControlShared['content'] => [];

type ProcessDatasetSourceTypeContentArgs = {
    shared: ControlShared;
    distincts: ApiV2ResultData | undefined;
};

export const processDatasetSourceTypeContent = ({
    shared,
    distincts,
}: ProcessDatasetSourceTypeContentArgs): ControlShared['content'] => {
    const {elementType} = shared.source;

    if (distincts && elementType !== DashTabItemControlElementType.Date) {
        return processDistinctsContent({shared, distincts});
    }

    if (elementType === DashTabItemControlElementType.Input) {
        return processAcceptableValuesContent(shared);
    }

    return processEmptyContent();
};
