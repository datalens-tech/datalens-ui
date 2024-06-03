import React from 'react';

import type {ConnectableElement} from 'react-dnd';

import {ParametersContainer} from './ParametersContainer/ParametersContainer';

export type CommonContainerProps = {
    wrapTo: (props: any) => ConnectableElement;
    appliedSearchPhrase: string;
};

type FieldsContainerProps = CommonContainerProps;

export const FieldsContainer: React.FC<FieldsContainerProps> = (props: FieldsContainerProps) => {
    const {wrapTo, appliedSearchPhrase} = props;
    return <ParametersContainer appliedSearchPhrase={appliedSearchPhrase} wrapTo={wrapTo} />;
};
