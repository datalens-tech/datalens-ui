import React from 'react';

import type {ConnectedComponent} from 'react-redux';

import type {FieldEditorProps} from './FieldEditor';

interface ChunkedFieldEditorProps extends FieldEditorProps {
    onLoadStart?: () => void;
    onLoadComplete?: () => void;
}

interface ChunkedFieldEditorState {
    module: ConnectedComponent<any, any> | null;
}

class ChunkedFieldEditor extends React.Component<ChunkedFieldEditorProps, ChunkedFieldEditorState> {
    constructor(props: ChunkedFieldEditorProps) {
        super(props);

        this.state = {
            module: null,
        };
    }

    componentDidMount() {
        this.getFieldEditor();
    }

    render() {
        const {module} = this.state;

        if (!module) {
            return null;
        }

        const FieldEditor = module;

        return <FieldEditor {...this.props} />;
    }

    async getFieldEditor() {
        const {onLoadStart, onLoadComplete} = this.props;

        if (onLoadStart) {
            onLoadStart();
        }

        const module = (await import(/* webpackChunkName: "field-editor" */ './FieldEditor'))
            .default;

        this.setState({module});

        if (onLoadComplete) {
            onLoadComplete();
        }
    }
}

export default ChunkedFieldEditor;
