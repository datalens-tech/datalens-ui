export type AIChatSupportFormProps = {
    open: boolean;
    onClose: () => void;
    getFileContent?: () => string;
    typeOfProblem: string;
    fileName?: string;
    dialogTitle: string;
    dialogDescription: string;
};
