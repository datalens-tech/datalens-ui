import React from 'react';
import App from 'units/editor/components/App/App';
import {reducerRegistry} from '../../../store';
import {editor, components} from 'units/editor/store/reducers';

import 'ui/styles/dl-monaco.scss';

reducerRegistry.register({
    editor,
    components,
});

const EditorPage = () => <App />;

export default EditorPage;
