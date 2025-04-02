export type GetEditorTemplatesArgs = {
    connectionId?: string;
    apiConnectionId?: string | null;
};

export type GetEditorTemplatesResponse = Array<{
    qa: string;
    type: string;
    name: string;
    data: Record<string, unknown>;
}>;
