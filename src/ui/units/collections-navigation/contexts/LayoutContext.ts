import {createContext} from 'react';

export type LayoutBlock = {
    isLoading?: boolean;
    content?: React.ReactNode;
} | null;

type SetLayoutBlock = (block: LayoutBlock | null) => void;

export type LayoutContextProps = {
    actionsPanelLeftBlock: LayoutBlock;
    setActionsPanelLeftBlock: SetLayoutBlock;
    actionsPanelRightBlock: LayoutBlock;
    setActionsPanelRightBlock: SetLayoutBlock;
    title: LayoutBlock;
    setTitle: SetLayoutBlock;
    titleActionsBlock: LayoutBlock;
    setTitleActionsBlock: SetLayoutBlock;
    titleRightBlock: LayoutBlock;
    setTitleRightBlock: SetLayoutBlock;
    description: LayoutBlock;
    setDescription: SetLayoutBlock;
};

export const LayoutContext = createContext<LayoutContextProps>({
    actionsPanelLeftBlock: {isLoading: false},
    setActionsPanelLeftBlock: () => {},
    actionsPanelRightBlock: {isLoading: false},
    setActionsPanelRightBlock: () => {},
    title: {isLoading: false},
    setTitle: () => {},
    titleActionsBlock: {isLoading: false},
    setTitleActionsBlock: () => {},
    titleRightBlock: {isLoading: false},
    setTitleRightBlock: () => {},
    description: {isLoading: false},
    setDescription: () => {},
});
