export type GetDatalensOperationArgs = {
    operationId: string;
};

export type GetDatalensOperationResponse = {
    id: string;
    description: string;
    createdBy: string;
    createdAt: {
        seconds: string;
        nanos?: number;
    };
    modifiedAt: {
        seconds: string;
        nanos?: number;
    };
    metadata: {};
    done: boolean;
};
