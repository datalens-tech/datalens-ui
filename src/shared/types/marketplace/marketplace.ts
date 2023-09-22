interface Link {
    url: string;
    title: string;
}

enum PublisherState {
    Unspecified = 'STATE_UNSPECIFIED',
    Pending = 'PENDING',
    Active = 'ACTIVE',
    Suspended = 'SUSPENDED',
    Error = 'ERROR',
}

interface PublisherInfo {
    name: string;
    description: string;
    shortDescription: string;
    url: string;
    phoneNumber: string;
    logo: string;
    links: Link[];
    address: string;
}

interface Publisher {
    id: string;
    name: string;
    state: PublisherState;
    createdAt: number;
    updatedAt: number;
    marketingInfo: PublisherInfo;
    versionId: string;
}

enum ProductState {
    Unspecified = 'STATE_UNSPECIFIED',
    Reviewing = 'REVIEWING',
    Active = 'ACTIVE',
    Deprecated = 'DEPRECATED',
    Error = 'ERROR',
}

export enum ProductType {
    DatalensConnector = 'DATALENS_CONNECTOR',
    DatalensTemplate = 'DATALENS_TEMPLATE',
    DatalensDataset = 'DATALENS_DATASET',
    DatalensGeolayers = 'DATALENS_GEOLAYER',
}

enum TermType {
    Unspecified = 'TOS_TYPE_UNSPECIFIED',
    Default = 'DEFAULT_TOS',
    AdditionalFirstParty = 'ADDITIONAL_FIRST_PARTY_TOS',
    AdditionalThirdParty = 'ADDITIONAL_THIRD_PARTY_TOS',
}

interface ProductTerms {
    title: string;
    url: string;
    type: TermType;
}

export enum PricingType {
    Unspecified = 'PRICING_TYPE_UNSPECIFIED',
    Free = 'FREE',
    Byol = 'BYOL',
    Hourly = 'HOURLY',
    Monthly = 'MONTHLY',
}

interface Sku {
    id: string;
    checkFormula: string;
}

interface Pricing {
    skus: Sku[];
    type: {
        title: string;
        value: PricingType;
    };
}

interface ProductInfo {
    name: string;
    description: string;
    shortDescription: string;
    logo: string;
    support: string;
    useCases: string;
    links: Link[];
    tutorial?: string;
    yaSupport?: string;
}

export interface ConnectorProductPayload {
    datalensConnector: {
        deployType: 'CONNECTOR';
        subProducts: {
            connectorName: string;
            subProductId: string;
            variables: unknown;
        }[];
        subject: {
            title: string;
            value: string;
        };
        variables: unknown[];
    };
}

export interface TemplateProductPayload {
    datalensTemplate: {
        deployType: 'TEMPLATE';
        subProducts: {
            templateName: string;
            subProductId: string;
            variables: unknown;
        }[];
        subject: {
            title: string;
            value: string;
        };
        variables: unknown[];
    };
}

export interface DatasetProductPayload {
    datalensDataset: {
        deployType: 'TEMPLATE';
        refreshable: boolean;
        subProducts: {
            templateName: string;
            subProductId: string;
            variables: unknown;
        }[];
        variables: unknown[];
    };
}

export interface GeolayerProductPayload {
    datalensGeolayer: {
        deployType: 'TEMPLATE';
        granularity: {
            title: string;
            value: string;
        };
        subProducts: {
            templateName: string;
            subProductId: string;
            variables: Record<string, string | number>;
        }[];
        variables: {
            kind: string;
            name: string;
            title: string;
            properties: {
                selector: {
                    values: {
                        title: string;
                        value: string;
                    }[];
                };
            };
        }[];
    };
}

export type ProductPayload =
    | ConnectorProductPayload
    | TemplateProductPayload
    | DatasetProductPayload
    | GeolayerProductPayload;

interface ProductLabels {
    isNew: boolean;
}

export interface Product {
    id: string;
    name: string;
    state: ProductState;
    labels: ProductLabels;
    versionId: string;
    publisher: Publisher;
    type: ProductType;
    createdAt: number;
    updatedAt: number;
    categories: {
        name: string;
        title: string;
    }[];
    marketingInfo: ProductInfo;
    termsOfService: ProductTerms[];
    pricing: Pricing;
    payload: ProductPayload;
}

export interface FilterSelectorItem {
    count: number;
    title: string;
    value: string;
}

export interface FilterSelector {
    items: FilterSelectorItem[];
    name: string;
    selectorType: 'MULTIPLE' | 'SINGLE';
    title: string;
    tooltip?: string;
}

export enum SortBy {
    Default = 'default',
    Newest = 'newest',
    NameAZ = 'name-a-z',
    NameZA = 'name-z-a',
    Popularity = 'popularity',
    CategoryRank = 'category-rank',
}
