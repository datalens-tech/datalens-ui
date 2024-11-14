import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ParamsSettingsQA} from 'shared';
import {setSelectorDialogItem} from 'ui/store/actions/controlDialog';

import {SectionWrapper} from '../../../../../../../components/SectionWrapper/SectionWrapper';
import {ParamsSettings} from '../../../../../components/ParamsSettings/ParamsSettings';
import {
    clearEmptyParams,
    removeParam,
    updateParamTitle,
    updateParamValue,
    validateParamTitleOnlyUnderscore,
} from '../../../../../components/ParamsSettings/helpers';
import {selectSelectorDialog} from '../../../../../store/selectors/dashTypedSelectors';

import './ParametersSection.scss';

const b = block('parameters-section');

export const ParametersSection = () => {
    const dispatch = useDispatch();
    const {selectorParameters = {}, selectorParametersGroup} = useSelector(selectSelectorDialog);

    const localParams = React.useMemo(
        () => clearEmptyParams(selectorParameters),
        [selectorParameters],
    );

    const handleParamTitleUpdate = React.useCallback(
        (old: string, updated: string) => {
            dispatch(
                setSelectorDialogItem({
                    selectorParameters: updateParamTitle(localParams, old, updated),
                }),
            );
        },
        [dispatch, localParams],
    );

    const handleParamValueUpdate = React.useCallback(
        (title: string, value: string[]) => {
            dispatch(
                setSelectorDialogItem({
                    selectorParameters: updateParamValue(localParams, title, value),
                }),
            );
        },
        [dispatch, localParams],
    );

    const handleRemoveParam = React.useCallback(
        (title: string) => {
            dispatch(
                setSelectorDialogItem({
                    selectorParameters: removeParam(localParams, title),
                }),
            );
        },
        [dispatch, localParams],
    );

    const handleRemoveAllParams = React.useCallback(() => {
        dispatch(
            setSelectorDialogItem({
                selectorParameters: {},
            }),
        );
    }, [dispatch]);

    const handleValidateParamTitle = React.useCallback((paramTitle: string) => {
        const errorCode = validateParamTitleOnlyUnderscore(paramTitle);

        if (errorCode) {
            return new Error(i18n('dash.params-button-dialog.view', `context_${errorCode}`));
        }

        return null;
    }, []);

    return (
        <SectionWrapper
            withCollapse={true}
            arrowPosition="left"
            defaultIsExpanded={false}
            arrowQa={ParamsSettingsQA.Open}
            title={
                <div className={b('title')}>{i18n('dash.control-dialog.edit', 'field_params')}</div>
            }
        >
            <div className={b()}>
                <ParamsSettings
                    data={selectorParameters}
                    group={selectorParametersGroup}
                    tagLabelClassName={b('tag')}
                    onEditParamTitle={handleParamTitleUpdate}
                    onEditParamValue={handleParamValueUpdate}
                    onRemoveParam={handleRemoveParam}
                    onRemoveAllParams={handleRemoveAllParams}
                    validator={{title: handleValidateParamTitle}}
                />
            </div>
        </SectionWrapper>
    );
};
