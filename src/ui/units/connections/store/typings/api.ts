interface Timestamp {
    seconds: string;
    nanos?: number;
}

type CloudStatus = string;

interface CloudOrganization {
    id: string;
    name?: string;
    title?: string;
}

interface CommonFolderFields {
    cloudId: string;
    id: string;
    name: string;
    status: CloudStatus;
    description?: string;
}

interface GrpcFolder extends CommonFolderFields {
    createdAt: Timestamp;
}

interface CommonCloudFields {
    description: string;
    id: string;
    name: string;
    status: CloudStatus;
    organizationId: string;
}

interface GrpcCloud extends CommonCloudFields {
    createdAt: Timestamp;
}

interface CloudTreeRaw extends Omit<GrpcCloud, 'organizationId'> {
    folders: GrpcFolder[];
    organization: CloudOrganization | null;
    settingsJson: string;
}

export interface CloudTree extends Omit<CloudTreeRaw, 'settingsJson'> {
    settings: Record<string, string>;
}

export interface GrpcServiceAccount {
    id: string;
    name: string;
    description: string;
    folderId: string;
    createdAt: Timestamp;
}
