import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import {
    ColorMode,
    ColorsConfig,
    DATASET_FIELD_TYPES,
    DatasetField,
    MarkupItem,
    TIMEOUT_90_SEC,
    getDistinctValue,
    getFieldsApiV2RequestSection,
    getParametersApiV2RequestSection,
    markupToRawString,
} from 'shared';
import {DialogColor} from 'ui/components/DialogColor/DialogColor';
import DialogManager from 'ui/components/DialogManager/DialogManager';
import {getSdk} from 'ui/libs/schematic-sdk';
import {closeDialog} from 'ui/store/actions/dialog';
import {
    filteredDatasetParametersSelector,
    workbookIdSelector,
} from 'ui/units/datasets/store/selectors';

export const DIALOG_DS_FIELD_COLORS = Symbol('DIALOG_DS_FIELD_COLORS');

type Props = {
    datasetId?: string;
    field: DatasetField;
};

export type OpenDialogDatasetFieldColorsArgs = {
    id: typeof DIALOG_DS_FIELD_COLORS;
    props: Props;
};

const VALUES_LOAD_LIMIT = 1000;

export const DialogFieldColors = (props: Props) => {
    const {field, datasetId} = props;
    const parameters = useSelector(filteredDatasetParametersSelector);
    const workbookId = useSelector(workbookIdSelector);
    const [distincts, setDistincts] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);

    const getDistincts = async () => {
        if (!datasetId) {
            return;
        }

        setLoading(true);
        getSdk().cancelRequest('getDistincts');

        const fields = getFieldsApiV2RequestSection([field], 'distinct');
        const parameter_values = getParametersApiV2RequestSection({
            parameters,
            dashboardParameters: [],
        });

        const distinctApiResult = await getSdk().bi.getDistinctsApiV2(
            {
                datasetId,
                workbookId,
                limit: VALUES_LOAD_LIMIT,
                fields: fields,
                parameter_values,
            },
            {concurrentId: 'getDistincts', timeout: TIMEOUT_90_SEC},
        );

        const items = distinctApiResult.result.data.Data.reduce(
            (acc: string[], cur: (string | MarkupItem)[]) => {
                const rawDistinctValue = cur[0];
                let distinctValue: string;

                if (field.data_type === DATASET_FIELD_TYPES.MARKUP && rawDistinctValue) {
                    distinctValue = markupToRawString(rawDistinctValue as MarkupItem);
                } else {
                    distinctValue = getDistinctValue(rawDistinctValue);
                }

                return acc.concat(distinctValue);
            },
            [],
        );
        setDistincts(items);
        setLoading(false);
    };

    React.useEffect(() => {
        if (!loading && !distincts.length) {
            getDistincts();
        }
        // eslint-disable-next-line
    }, []);

    const dispatch = useDispatch();
    const handleCloseDialog = () => {
        dispatch(closeDialog());
    };

    const handleApplyChanges = (_config: ColorsConfig) => {
        // ToDo: save color config in field settings
    };

    const colorConfig: ColorsConfig = {};

    return (
        <DialogColor
            colorsConfig={colorConfig}
            onClose={handleCloseDialog}
            onApply={handleApplyChanges}
            colorModes={[ColorMode.PALETTE, ColorMode.GRADIENT]}
            loading={loading}
            values={distincts}
        />
    );
};

DialogManager.registerDialog(DIALOG_DS_FIELD_COLORS, DialogFieldColors);
