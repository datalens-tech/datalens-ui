import type {FreeformSource, StandaloneSource} from '../../store/types';

export type EditedSource = FreeformSource | StandaloneSource;

export type OnSourceUpdate = (updates: {[k: string]: string}) => void;
