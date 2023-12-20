import {YadocsAddSectionState} from '../../../store';

export type AddYandexDoc = (url: string) => void;
export type UpdateAddSectionState = (updates: Partial<YadocsAddSectionState>) => void;
