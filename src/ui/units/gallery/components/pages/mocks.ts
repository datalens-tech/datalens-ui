import type {GalleryItem} from '../../types';

export const EDITORS_CHOICE_ITEM_IDS = [
    'education-1',
    'finance-1',
    'hr-1',
    'it-1',
    'retail-1',
    'sports-1',
];

export const MOCKED_GALLERY_ITEMS: GalleryItem[] = [
    // Education
    {
        id: 'education-1',
        title: 'Student Performance Dashboard',
        description: 'Track student grades and attendance',
        createdBy: 'Anna Smith',
        createdAt: Date.now(),
        labels: ['education', 'editor'],
        images: {
            light: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
            dark: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
        },
    },
    {
        id: 'education-2',
        title: 'Course Analytics',
        description: 'Course completion and engagement metrics',
        createdBy: 'Mike Johnson',
        createdAt: Date.now(),
        labels: ['education'],
        images: {
            light: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
            dark: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
        },
    },
    // Finance
    {
        id: 'finance-1',
        title: 'Investment Portfolio',
        description: 'Asset allocation and returns',
        createdBy: 'John Doe',
        createdAt: Date.now(),
        labels: ['finance'],
        images: {
            light: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
            dark: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
        },
    },
    // HR
    {
        id: 'hr-1',
        title: 'Employee Satisfaction',
        description: 'Survey results and trends',
        createdBy: 'Emily Brown',
        createdAt: Date.now(),
        labels: ['hr'],
        images: {
            light: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
            dark: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
        },
    },
    {
        id: 'hr-2',
        title: 'Recruitment Metrics',
        description: 'Hiring funnel analysis',
        createdBy: 'David Lee',
        createdAt: Date.now(),
        labels: ['hr'],
        images: {
            light: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
            dark: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
        },
    },
    // IT
    {
        id: 'it-1',
        title: 'System Performance',
        description: 'Server metrics dashboard',
        createdBy: 'Alex Chen',
        createdAt: Date.now(),
        labels: ['it'],
        images: {
            light: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
            dark: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
        },
    },
    {
        id: 'it-2',
        title: 'Security Overview',
        description: 'Security incidents tracking',
        createdBy: 'Lisa Wang',
        createdAt: Date.now(),
        labels: ['it', 'editor'],
        images: {
            light: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
            dark: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
        },
    },
    {
        id: 'it-3',
        title: 'Network Traffic Analysis',
        description: 'Real-time network monitoring',
        createdBy: 'Michael Zhang',
        createdAt: Date.now(),
        labels: ['it'],
        images: {
            light: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
            dark: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
        },
    },
    // Retail
    {
        id: 'retail-1',
        title: 'Sales Performance',
        description: 'Daily sales tracking',
        createdBy: 'Robert Taylor',
        createdAt: Date.now(),
        labels: ['retail'],
        images: {
            light: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
            dark: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
        },
    },
    {
        id: 'retail-2',
        title: 'Inventory Management',
        description: 'Stock levels and turnover',
        createdBy: 'Karen White',
        createdAt: Date.now(),
        labels: ['retail'],
        images: {
            light: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
            dark: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
        },
    },
    // Sports
    {
        id: 'sports-1',
        title: 'Team Statistics',
        description: 'Player performance metrics',
        createdBy: 'James Miller',
        createdAt: Date.now(),
        labels: ['sports', 'editor'],
        images: {
            light: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
            dark: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
        },
    },
];
