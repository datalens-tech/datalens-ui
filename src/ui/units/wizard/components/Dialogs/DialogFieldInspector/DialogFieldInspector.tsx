import React from 'react';

import {
    ClipboardButton,
    Dialog,
    Label,
    Tab,
    TabList,
    TabProvider,
    TextArea,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DialogManager from 'components/DialogManager/DialogManager';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {Field} from 'shared';
import {closeDialog} from 'store/actions/dialog';
import type {DatalensGlobalState} from 'ui';
import {selectDimensions, selectMeasures} from 'units/wizard/selectors/dataset';
import {selectUpdates} from 'units/wizard/selectors/preview';

const b = block('dialog-field-inspector');

export const DIALOG_FIELD_INSPECTOR = Symbol('DIALOG_FIELD_INSPECTOR');

enum InspectorTabs {
    Field = 'Field',
    AllFields = 'AllFields',
}

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type OwnProps = {
    field: Field;
};

interface Props extends OwnProps, StateProps, DispatchProps {
    field: Field;
}

interface State {
    activeTab: InspectorTabs;
}

export type OpenDialogFieldInspectorArgs = {
    id: typeof DIALOG_FIELD_INSPECTOR;
    props: OwnProps;
};

class DialogFieldInspector extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            activeTab: InspectorTabs.Field,
        };
    }
    render() {
        return (
            <Dialog open={true} onClose={this.onClose} size="l">
                <div className={b()}>
                    <Dialog.Header caption={'Field Inspector'} />
                    <Dialog.Body>{this.renderModalBody()}</Dialog.Body>
                </div>
            </Dialog>
        );
    }

    private onClose = () => {
        this.props.closeDialog();
    };

    private renderModalBody = () => {
        const {activeTab} = this.state;

        const tabs = [
            {
                id: InspectorTabs.Field,
                title: 'SectionDataset - single field',
            },
            {
                id: InspectorTabs.AllFields,
                title: 'SectionDataset - all fields',
            },
        ];

        return (
            <div>
                <TabProvider
                    value={this.state.activeTab}
                    onUpdate={(nextActiveTab) => {
                        this.setState({
                            activeTab: nextActiveTab as InspectorTabs,
                        });
                    }}
                >
                    <TabList>
                        {tabs.map((item) => (
                            <Tab key={item.id} value={item.id}>
                                {item.title}
                            </Tab>
                        ))}
                    </TabList>
                </TabProvider>
                {activeTab === InspectorTabs.Field ? this.getFieldData() : this.getAllData()}
            </div>
        );
    };

    private getFieldData = () => {
        const {field, updates} = this.props;

        const fieldText = JSON.stringify(field, undefined, 4);
        const updatesText = JSON.stringify(
            updates.filter((update) => update.field.guid === field.guid),
            undefined,
            4,
        );

        return (
            <div>
                <div className={b('field')}>
                    <Label>field</Label>
                    <ClipboardButton text={fieldText} size="m" />
                    <TextArea value={fieldText} />
                </div>
                <div className={b('updates')}>
                    <Label>field updates</Label>
                    <ClipboardButton text={updatesText} size="m" />
                    <TextArea value={updatesText} />
                </div>
            </div>
        );
    };

    private getAllData = () => {
        const {dimensions, measures, updates} = this.props;

        const dimensionsText = JSON.stringify(dimensions, undefined, 4);
        const measuresText = JSON.stringify(measures, undefined, 4);
        const updatesText = JSON.stringify(updates, undefined, 4);

        return (
            <div>
                <div className={b('dimensions')}>
                    <Label>dimensions</Label>
                    <ClipboardButton text={dimensionsText} size="m" />
                    <TextArea value={dimensionsText} />
                </div>
                <div className={b('measures')}>
                    <Label>measures</Label>
                    <ClipboardButton text={measuresText} size="m" />
                    <TextArea value={measuresText} />
                </div>
                <div className={b('updates')}>
                    <Label>updates</Label>
                    <ClipboardButton text={updatesText} size="m" />
                    <TextArea value={updatesText} />
                </div>
            </div>
        );
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        updates: selectUpdates(state),
        dimensions: selectDimensions(state),
        measures: selectMeasures(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            closeDialog,
        },
        dispatch,
    );
};

DialogManager.registerDialog(
    DIALOG_FIELD_INSPECTOR,
    connect(mapStateToProps, mapDispatchToProps)(DialogFieldInspector),
);
