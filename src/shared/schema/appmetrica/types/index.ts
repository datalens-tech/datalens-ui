export interface Application {
    create_date: string;
    id: string;
    name?: string;
}

export interface GetApplicationsResponse {
    applications: Application[];
}

export interface GetApplicationsArgs {
    token: string;
}
