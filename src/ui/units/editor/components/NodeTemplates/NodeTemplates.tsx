import React from 'react';

import block from 'bem-cn-lite';

import {registry} from '../../../../registry';

import List from './List/List';

import './NodeTemplates.scss';

const b = block('node-templates');

type NodeTemplatesProps = {
    onClick: (val: string) => void;
    workbookId: string;
};

export function NodeTemplates({onClick}: NodeTemplatesProps) {
    const getEditorTemplates = registry.editor.functions.get('getEditorTemplates');

    const templates = getEditorTemplates();

    return (
        <div className={b()}>
            <List items={templates} onClick={onClick} />
        </div>
    );
}
