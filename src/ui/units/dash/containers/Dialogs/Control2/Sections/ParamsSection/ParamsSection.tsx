import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ParamsSettingsQA} from 'shared';
import {setSelectorDialogItem} from 'units/dash/store/actions/dashTyped';
import {selectSelectorDialog} from 'units/dash/store/selectors/dashTypedSelectors';

import {Collapse} from '../../../../../../../components/Collapse/Collapse';
import {SectionWrapper} from '../../../../../../../components/SectionWrapper/SectionWrapper';
import {ParamsSettings} from '../../../../../../../units/dash/components/ParamsSettings/ParamsSettings';
import {
    clearEmptyParams,
    removeParam,
    updateParamTitle,
    updateParamValue,
    validateParamTitleOnlyUnderscore,
} from '../../../../../../../units/dash/components/ParamsSettings/helpers';

import './ParamsSection.scss';

const b = block('selector-params-section');

export const ParamsSection = () => {
    const dispatch = useDispatch();
    const {defaults} = useSelector(selectSelectorDialog);
    const localParams = React.useMemo(() => clearEmptyParams(defaults), [defaults]);
    const [externalChangedId] = React.useState(0);

    const handleEditParamTitle = React.useCallback(
        (paramTitleOld, paramTitle) => {
            dispatch(
                setSelectorDialogItem({
                    defaults: updateParamTitle(localParams, paramTitleOld, paramTitle),
                }),
            );
        },
        [dispatch, localParams],
    );

    const handleEditParamValue = React.useCallback(
        (paramTitle, paramValue) => {
            dispatch(
                setSelectorDialogItem({
                    defaults: updateParamValue(localParams, paramTitle, paramValue),
                }),
            );
        },
        [dispatch, localParams],
    );

    const handleRemoveParam = React.useCallback(
        (paramTitle) => {
            dispatch(
                setSelectorDialogItem({
                    defaults: removeParam(localParams, paramTitle),
                }),
            );
        },
        [dispatch, localParams],
    );

    const handleRemoveAllParams = () => {
        dispatch(
            setSelectorDialogItem({
                defaults: {},
            }),
        );
    };

    const handleValidateParamTitle = React.useCallback((paramTitle: string) => {
        const errorCode = validateParamTitleOnlyUnderscore(paramTitle);

        if (errorCode) {
            return new Error(i18n('dash.params-button-dialog.view', `context_${errorCode}`));
        }

        return null;
    }, []);

    return (
        <SectionWrapper className={b()}>
            <Collapse
                title={
                    <div className={b('params-title')}>
                        {i18n('dash.control-dialog.edit', 'field_params')}
                    </div>
                }
                arrowPosition="left"
                arrowQa={ParamsSettingsQA.Open}
            >
                <div className={b('params')}>
                    <ParamsSettings
                        group={externalChangedId}
                        tagLabelClassName={b('params-tag')}
                        data={defaults}
                        validator={{title: handleValidateParamTitle}}
                        onEditParamTitle={handleEditParamTitle}
                        onEditParamValue={handleEditParamValue}
                        onRemoveParam={handleRemoveParam}
                        onRemoveAllParams={handleRemoveAllParams}
                    />
                </div>
            </Collapse>
        </SectionWrapper>
    );
};
