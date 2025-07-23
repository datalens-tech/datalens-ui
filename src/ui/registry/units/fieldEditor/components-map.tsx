import {makeDefaultEmpty} from '../../components/DefaultEmpty';

interface AdditionalButtonsProps {
    toggleAdditionalPanel: () => void;
}

interface AdditionalPanelProps {
    visible: boolean;
    onClose: () => void;
}

export const fieldEditorComponentsMap = {
    AdditionalButtons: makeDefaultEmpty<AdditionalButtonsProps>(),
    AdditionalPanel: makeDefaultEmpty<AdditionalPanelProps>(),
} as const;
