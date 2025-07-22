import {makeDefaultEmpty} from '../../components/DefaultEmpty';

interface AdditionalButtonsProps {
    toggleAdditionalPanel: () => void;
}

export const fieldEditorComponentsMap = {
    AdditionalButtons: makeDefaultEmpty<AdditionalButtonsProps>(),
} as const;
