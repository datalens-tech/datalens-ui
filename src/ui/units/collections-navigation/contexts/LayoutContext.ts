import {createContext} from 'react';

export type LayoutBlock = {
    isLoading?: boolean;
    content?: React.ReactNode;
} | null;

export type Layout = {
    actionsPanelLeftBlock: LayoutBlock;
    actionsPanelRightBlock: LayoutBlock;
    title: LayoutBlock;
    titleActionsBlock: LayoutBlock;
    titleBeforeActionsBlock: LayoutBlock;
    titleRightBlock: LayoutBlock;
    description: LayoutBlock;
};

export type SkeletonSettings = {
    width: string;
    height: string;
};

export type SkeletonsSettings = {
    actionsPanelLeftBlock?: SkeletonSettings;
    actionsPanelRightBlock?: SkeletonSettings;
    title?: SkeletonSettings;
    titleActionsBlock?: SkeletonSettings;
    titleRightBlock?: SkeletonSettings;
    description?: SkeletonSettings;
};

export type LayoutContextProps = {
    setLayout: (layoutPatch: Partial<Layout>) => void;
    setSkeletonsSettings: (skeletons: SkeletonsSettings) => void;
};

export const LayoutContext = createContext<LayoutContextProps>({
    setLayout: () => {},
    setSkeletonsSettings: () => {},
});
