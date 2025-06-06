import React from 'react';

import {ArrowsRotateRight, Plus} from '@gravity-ui/icons';
import {
    Button,
    HelpMark,
    Icon,
    SegmentedRadioGroup as RadioButton,
    TextInput,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {connect, useDispatch} from 'react-redux';
import type {DatasetOptions} from 'shared';
import {DatasetPanelQA} from 'shared';
import type {DatalensGlobalState} from 'ui';

import type {DatasetTab} from '../../constants';
import {TAB_DATASET, TAB_SOURCES} from '../../constants';
import {editorSetFilter} from '../../store/actions/creators';
import {UISelector, optionsSelector} from '../../store/selectors';

import {getDatasetTabs} from './helpers';

import './DatasetPanel.scss';

const b = block('dataset-panel');
const i18n = I18n.keyset('dataset.dataset-editor.modify');

type TabSwitchProps = Pick<DatasetPanelProps, 'isCreationProcess' | 'tab' | 'switchTab'>;

function TabSwitch(props: TabSwitchProps) {
    const {tab, switchTab, isCreationProcess} = props;

    const tabs = getDatasetTabs(isCreationProcess);

    return (
        <RadioButton
            qa={DatasetPanelQA.TabRadio}
            value={tab}
            onChange={(e) => switchTab(e.target.value)}
        >
            {tabs.map(({value, label, disabled}) => (
                <RadioButton.Option
                    key={value}
                    content={i18n(label)}
                    value={value}
                    disabled={disabled}
                />
            ))}
        </RadioButton>
    );
}

type StateProps = ReturnType<typeof mapStateToProps>;
type DatasetPanelProps = StateProps & {
    isCreationProcess: boolean;
    previewEnabled: boolean;
    tab: DatasetTab;
    switchTab: (tab: string) => void;
    refreshSources: () => void;
    openDialogFieldEditor: () => void;
    togglePreview: () => void;
};

const DatasetPanel = (props: DatasetPanelProps) => {
    const {
        tab,
        options,
        filter,
        previewEnabled,
        isCreationProcess,
        ui: {isFieldEditorModuleLoading},
        switchTab,
        openDialogFieldEditor,
        togglePreview,
        refreshSources,
    } = props;
    const dispatch = useDispatch();

    const handleFilterUpdate = React.useCallback(
        (nextFilter: string) => {
            dispatch(editorSetFilter(nextFilter));
        },
        [dispatch],
    );

    const isDatasetTab = tab === TAB_DATASET;
    const isSourceTab = tab === TAB_SOURCES;

    return (
        <div className={b()}>
            <TabSwitch tab={tab} switchTab={switchTab} isCreationProcess={isCreationProcess} />
            <React.Fragment>
                {isDatasetTab && (
                    <Button
                        className={b('btn-update-fields')}
                        disabled={!(options as DatasetOptions).schema_update_enabled}
                        onClick={refreshSources}
                    >
                        <Icon
                            className={b('ic-sync')}
                            data={ArrowsRotateRight}
                            width="16"
                            height="16"
                        />
                        <span>{i18n('button_update-fields')}</span>
                    </Button>
                )}
                {(isDatasetTab || isSourceTab) && (
                    <div className={b('preview-btn', {tab}, b('item'))}>
                        <Button disabled={!previewEnabled} onClick={togglePreview}>
                            <span>{i18n('button_preview')}</span>
                            {/* Omit the empty div in order to reserve a place for the tooltip icon */}
                            {previewEnabled ? null : (
                                <div className={b('preview-btn-tooltip-margin')} />
                            )}
                        </Button>
                        {!previewEnabled && (
                            <div className={b('preview-btn-tooltip')}>
                                <HelpMark
                                    popoverProps={{
                                        placement: ['right', 'left'],
                                    }}
                                >
                                    <div className={b('preview-btn-tooltip-content')}>
                                        <span>{i18n('label_preview-not-supported')}</span>
                                    </div>
                                </HelpMark>
                            </div>
                        )}
                    </div>
                )}
                {isDatasetTab && (
                    <Button
                        className={b('add-field-btn', b('item'))}
                        loading={isFieldEditorModuleLoading}
                        onClick={openDialogFieldEditor}
                    >
                        <Icon
                            className={b('add-field-btn-ic')}
                            data={Plus}
                            width="18"
                            height="18"
                        />
                        <span>{i18n('button_add-field')}</span>
                    </Button>
                )}
                {isDatasetTab && (
                    <TextInput
                        className={b('find-field', b('item'))}
                        placeholder={i18n('field_find-field')}
                        value={filter}
                        hasClear={true}
                        onUpdate={handleFilterUpdate}
                    />
                )}
            </React.Fragment>
        </div>
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        ui: UISelector(state), // eslint-disable-line new-cap
        options: optionsSelector(state),
        filter: state.dataset.editor.filter,
    };
};

export default connect(mapStateToProps)(DatasetPanel);
