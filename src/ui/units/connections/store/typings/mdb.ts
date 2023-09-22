export type MdbBaseEntry = {
    name: string;
};

export type MdbEntryWithId = MdbBaseEntry & {
    id: string;
};

export type MdbClusterEntry = MdbEntryWithId & {
    config: {
        sqlDatabaseManagement?: {value: boolean};
        sqlUserManagement?: {value: boolean};
    };
};

export type MdbHostEntry = MdbBaseEntry & {
    type?: string;
};
