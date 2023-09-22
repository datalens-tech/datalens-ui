export interface CreateLockResponse {
    lockToken: string;
}
export interface CreateLockArgs {
    entryId: string;
    data: {
        duration: number;
        force?: boolean;
    };
}

export interface ExtendLockResponse {
    entryId: string;
    lockId: string;
    lockToken: string;
    expiryDate: string;
    login: string;
}
export interface ExtendLockArgs {
    entryId: string;
    data: {
        lockToken: string;
        duration: number;
        force?: boolean;
    };
}

export interface DeleteLockResponse extends ExtendLockResponse {}
export interface DeleteLockArgs {
    entryId: string;
    params: {
        lockToken: string;
        force?: boolean;
    };
}
