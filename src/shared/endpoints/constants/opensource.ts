export const opensourceEndpoints = {
    development: {
        api: {
            us: process.env.US_ENDPOINT || 'http://localhost:8083',
            bi: process.env.BI_API_ENDPOINT || 'http://localhost:8081',
            biData: process.env.BI_DATA_ENDPOINT || 'http://localhost:8082',
            biConverter: process.env.BI_FILE_UPLOADER_ENDPOINT || 'http://localhost:8084',
            csvConverter: process.env.BI_FILE_UPLOADER_ENDPOINT || 'http://localhost:8084',

            charts: process.env.CHARTS_ENDPOINT || '/',
            uploader: process.env.UI_UPLOADER_ENDPOINT || '/uploader',

            auth: process.env.AUTH_ENDPOINT || 'http://localhost:8088',
        },
        ui: {
            gateway: process.env.UI_GATEWAY_ENDPOINT || '/gateway',
            charts: process.env.UI_CHARTS_ENDPOINT || '/',
            connections: process.env.UI_CONNECTIONS_ENDPOINT || '/connections',
            dataset: process.env.UI_DATASET_ENDPOINT || '/datasets',
            wizard: process.env.UI_WIZARD_ENDPOINT || '/wizard',
            ql: process.env.UI_QL_ENDPOINT || '/ql',
            dash: process.env.UI_DASH_ENDPOINT || '/dashboards',
            uploader: process.env.UI_UPLOADER_ENDPOINT || '/uploader',
            uploaderV2: process.env.UI_UPLOADER_ENDPOINT_2 || '/uploader2',
            navigation: process.env.UI_NAVIGATION_ENDPOINT || '/navigation',
            widgets: process.env.UI_WIDGETS_ENDPOINT || '/widgets',
            preview: process.env.UI_PREVIEW_ENDPOINT || '/preview',
            serviceSettings: '/settings',
            editor: '/editor',
        },
    },
    production: {
        api: {
            us: process.env.US_ENDPOINT || 'http://us:8083',
            bi: process.env.BI_API_ENDPOINT || 'http://control-api:8080',
            biData: process.env.BI_DATA_ENDPOINT || 'http://data-api:8080',
            biConverter: process.env.BI_FILE_UPLOADER_ENDPOINT || 'http://file-uploader-api:8080',
            csvConverter: process.env.BI_FILE_UPLOADER_ENDPOINT || 'http://file-uploader-api:8080',

            charts: process.env.CHARTS_ENDPOINT || '/',
            uploader: process.env.UI_UPLOADER_ENDPOINT || '/uploader',

            auth: process.env.AUTH_ENDPOINT || 'http://auth:8088',
        },
        ui: {
            gateway: process.env.UI_GATEWAY_ENDPOINT || '/gateway',
            charts: process.env.UI_CHARTS_ENDPOINT || '/',
            connections: process.env.UI_CONNECTIONS_ENDPOINT || '/connections',
            dataset: process.env.UI_DATASET_ENDPOINT || '/datasets',
            wizard: process.env.UI_WIZARD_ENDPOINT || '/wizard',
            ql: process.env.UI_QL_ENDPOINT || '/ql',
            dash: process.env.UI_DASH_ENDPOINT || '/dashboards',
            uploader: process.env.UI_UPLOADER_ENDPOINT || '/uploader',
            uploaderV2: process.env.UI_UPLOADER_ENDPOINT_2 || '/uploader2',
            navigation: process.env.UI_NAVIGATION_ENDPOINT || '/navigation',
            widgets: process.env.UI_WIDGETS_ENDPOINT || '/widgets',
            preview: process.env.UI_PREVIEW_ENDPOINT || '/preview',
            serviceSettings: '/settings',
            editor: '/editor',
        },
    },
} as const;
