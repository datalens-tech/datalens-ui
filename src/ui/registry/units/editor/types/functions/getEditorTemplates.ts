export type GetEditorTemplatesArgs = {
    connectionId?: string;
};

export type GetEditorTemplatesResponse = Array<{
    qa: string;
    type: string;
    name: string;
    data: Record<string, unknown>;
}>;
