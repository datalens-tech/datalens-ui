import {MODULE_TYPE, PANE_VIEWS} from '../../constants/common';

import iconPane1 from '../../icons/pane-1.svg';
import iconPane20 from '../../icons/pane-2-0.svg';
import iconPane30 from '../../icons/pane-3-0.svg';
import iconPane31 from '../../icons/pane-3-1.svg';
import iconPane32 from '../../icons/pane-3-2.svg';
import iconPane40 from '../../icons/pane-4-0.svg';

type GridSchemeUnit = {
    name: 'child' | 'pane';
    childNodes?: GridSchemeUnit[];
    props?: {
        split?: 'vertical' | 'horizontal' | undefined;
        minSize?: string | number;
        maxSize?: string | number;
        defaultSize?: string | number;
        pane1Style?: object;
        resizerStyle?: object;
        pane2Style?: object;
    };
    index?: number;
};

type GridSchemes = {
    ids: string[];
    default: string;
    schemes: {
        [id in string]: {
            icon: string;
            panes: string[];
            scheme: GridSchemeUnit[];
        };
    };
};

export const getGridSchemes = ({type}: {type?: string} = {}): GridSchemes => {
    const isModule = type === MODULE_TYPE;
    return {
        ids: ['3-0', '3-1', '3-2', '4-0', '2-0', '1'],
        default: isModule ? '1' : '3-0',
        schemes: {
            '3-0': {
                icon: iconPane30,
                panes: isModule
                    ? [PANE_VIEWS.EDITOR, PANE_VIEWS.EDITOR, PANE_VIEWS.EDITOR]
                    : [PANE_VIEWS.EDITOR, PANE_VIEWS.CONSOLE, PANE_VIEWS.PREVIEW],
                scheme: [
                    {
                        name: 'pane',
                        props: {split: 'vertical', minSize: 150, maxSize: -150, defaultSize: '50%'},
                        childNodes: [
                            {
                                name: 'child',
                                index: 0,
                            },
                            {
                                name: 'pane',
                                props: {
                                    split: 'horizontal',
                                    defaultSize: '50%',
                                    minSize: 150,
                                    maxSize: -150,
                                },
                                childNodes: [
                                    {
                                        name: 'child',
                                        index: 1,
                                    },
                                    {
                                        name: 'child',
                                        index: 2,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            '3-1': {
                icon: iconPane31,
                panes: isModule
                    ? [PANE_VIEWS.EDITOR, PANE_VIEWS.EDITOR, PANE_VIEWS.EDITOR]
                    : [PANE_VIEWS.EDITOR, PANE_VIEWS.CONSOLE, PANE_VIEWS.PREVIEW],
                scheme: [
                    {
                        name: 'pane',
                        props: {
                            split: 'horizontal',
                            minSize: 150,
                            maxSize: -150,
                            defaultSize: '50%',
                        },
                        childNodes: [
                            {
                                name: 'child',
                                index: 0,
                            },
                            {
                                name: 'pane',
                                props: {
                                    split: 'vertical',
                                    defaultSize: '50%',
                                    minSize: 150,
                                    maxSize: -150,
                                },
                                childNodes: [
                                    {
                                        name: 'child',
                                        index: 1,
                                    },
                                    {
                                        name: 'child',
                                        index: 2,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            '3-2': {
                icon: iconPane32,
                panes: isModule
                    ? [PANE_VIEWS.EDITOR, PANE_VIEWS.EDITOR, PANE_VIEWS.EDITOR]
                    : [PANE_VIEWS.EDITOR, PANE_VIEWS.PREVIEW, PANE_VIEWS.CONSOLE],
                scheme: [
                    {
                        name: 'pane',
                        props: {
                            split: 'horizontal',
                            minSize: 150,
                            maxSize: -150,
                            defaultSize: '50%',
                        },
                        childNodes: [
                            {
                                name: 'pane',
                                props: {
                                    split: 'vertical',
                                    defaultSize: '50%',
                                    minSize: 150,
                                    maxSize: -150,
                                },
                                childNodes: [
                                    {
                                        name: 'child',
                                        index: 0,
                                    },
                                    {
                                        name: 'child',
                                        index: 1,
                                    },
                                ],
                            },
                            {
                                name: 'child',
                                index: 2,
                            },
                        ],
                    },
                ],
            },
            '4-0': {
                icon: iconPane40,
                panes: isModule
                    ? [PANE_VIEWS.EDITOR, PANE_VIEWS.EDITOR, PANE_VIEWS.EDITOR, PANE_VIEWS.EDITOR]
                    : [
                          PANE_VIEWS.EDITOR,
                          PANE_VIEWS.CONSOLE,
                          PANE_VIEWS.EDITOR,
                          PANE_VIEWS.PREVIEW,
                      ],
                scheme: [
                    {
                        name: 'pane',
                        props: {split: 'vertical', minSize: 150, maxSize: -150, defaultSize: '50%'},
                        childNodes: [
                            {
                                name: 'pane',
                                props: {
                                    split: 'horizontal',
                                    defaultSize: '50%',
                                    minSize: 150,
                                    maxSize: -150,
                                },
                                childNodes: [
                                    {
                                        name: 'child',
                                        index: 0,
                                    },
                                    {
                                        name: 'child',
                                        index: 1,
                                    },
                                ],
                            },
                            {
                                name: 'pane',
                                props: {
                                    split: 'horizontal',
                                    defaultSize: '50%',
                                    minSize: 150,
                                    maxSize: -150,
                                },
                                childNodes: [
                                    {
                                        name: 'child',
                                        index: 2,
                                    },
                                    {
                                        name: 'child',
                                        index: 3,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            '2-0': {
                icon: iconPane20,
                panes: isModule
                    ? [PANE_VIEWS.EDITOR, PANE_VIEWS.EDITOR]
                    : [PANE_VIEWS.EDITOR, PANE_VIEWS.PREVIEW],
                scheme: [
                    {
                        name: 'pane',
                        props: {split: 'vertical', minSize: 150, maxSize: -150, defaultSize: '50%'},
                        childNodes: [
                            {
                                name: 'child',
                                index: 0,
                            },
                            {
                                name: 'child',
                                index: 1,
                            },
                        ],
                    },
                ],
            },
            '1': {
                icon: iconPane1,
                panes: [PANE_VIEWS.EDITOR],
                scheme: [
                    {
                        name: 'child',
                        index: 0,
                    },
                ],
            },
        },
    };
};
