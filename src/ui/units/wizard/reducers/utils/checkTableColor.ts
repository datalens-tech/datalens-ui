import type {Field} from 'shared';
import {DatasetFieldType, isFieldHierarchy} from 'shared';

export const isTableColorValid = (color: Field) =>
    !isFieldHierarchy(color) && color.type !== DatasetFieldType.Pseudo;
