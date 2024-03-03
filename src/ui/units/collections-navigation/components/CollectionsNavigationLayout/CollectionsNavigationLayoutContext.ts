import {createContext} from 'react';

type Block = {
    isLoading: boolean;
    content?: React.ReactNode;
};

type SetBlock = (block: Block) => void;

export type CollectionsNavigationLayoutContextProps = {
    actionsPanelLeftBlock: Block;
    setActionsPanelLeftBlock: SetBlock;
    actionsPanelRightBlock: Block;
    setActionsPanelRightBlock: SetBlock;
    title: Block;
    setTitle: SetBlock;
    titleActionsBlock: Block;
    setTitleActionsBlock: SetBlock;
    titleRightBlock: Block;
    setTitleRightBlock: SetBlock;
    description: Block;
    setDescription: SetBlock;
};

export const CollectionsNavigationLayoutContext =
    createContext<CollectionsNavigationLayoutContextProps>({
        actionsPanelLeftBlock: {isLoading: true},
        setActionsPanelLeftBlock: () => {},
        actionsPanelRightBlock: {isLoading: true},
        setActionsPanelRightBlock: () => {},
        title: {isLoading: true},
        setTitle: () => {},
        titleActionsBlock: {isLoading: true},
        setTitleActionsBlock: () => {},
        titleRightBlock: {isLoading: true},
        setTitleRightBlock: () => {},
        description: {isLoading: true},
        setDescription: () => {},
    });
