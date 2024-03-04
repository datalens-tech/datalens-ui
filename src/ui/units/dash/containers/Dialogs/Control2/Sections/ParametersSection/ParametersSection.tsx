import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {SectionWrapper} from '../../../../../../../components/SectionWrapper/SectionWrapper';
import {ParamsSettings} from '../../../../../components/ParamsSettings/ParamsSettings';
import {
    removeParam,
    updateParamTitle,
    updateParamValue,
} from '../../../../../components/ParamsSettings/helpers';
import {setSelectorDialogItem} from '../../../../../store/actions/dashTyped';
import {selectSelectorDialog} from '../../../../../store/selectors/dashTypedSelectors';

const i18n = I18n.keyset('dash.control-dialog.edit');

export const ParametersSection = () => {
    const dispatch = useDispatch();
    const {selectorParameters = {}} = useSelector(selectSelectorDialog);

    const handleParamTitleUpdate = React.useCallback(
        (old: string, updated: string) => {
            dispatch(
                setSelectorDialogItem({
                    selectorParameters: updateParamTitle(selectorParameters, old, updated),
                }),
            );
        },
        [dispatch, selectorParameters],
    );

    const handleParamValueUpdate = React.useCallback(
        (title: string, value: string[]) => {
            dispatch(
                setSelectorDialogItem({
                    selectorParameters: updateParamValue(selectorParameters, title, value),
                }),
            );
        },
        [dispatch, selectorParameters],
    );

    const handleRemoveParam = React.useCallback(
        (title: string) => {
            dispatch(
                setSelectorDialogItem({
                    selectorParameters: removeParam(selectorParameters, title),
                }),
            );
        },
        [dispatch, selectorParameters],
    );

    const handleRemoveAllParams = React.useCallback(() => {
        dispatch(
            setSelectorDialogItem({
                selectorParameters: {},
            }),
        );
    }, []);

    return (
        <SectionWrapper withCollapse={true} title={i18n('field_params')}>
            <ParamsSettings
                data={selectorParameters}
                onEditParamTitle={handleParamTitleUpdate}
                onEditParamValue={handleParamValueUpdate}
                onRemoveParam={handleRemoveParam}
                onRemoveAllParams={handleRemoveAllParams}
            />
        </SectionWrapper>
    );
};
