import logger from 'ui/libs/logger';
import type {AppDispatch} from 'ui/store';

import type {GalleryItem} from '../types';

import {gallerySlice} from './reducer';

export const actions = gallerySlice.actions;

const MOCKED_GALLERY_ITEMS: GalleryItem[] = [
    // Education
    {
        id: 'education-1',
        title: {
            en: 'Student Performance Dashboard',
            ru: 'Панель успеваемости студентов',
        },
        description: {
            en: 'Track student grades and attendance',
            ru: 'Отслеживание оценок и посещаемости студентов',
        },
        shortDescription: {
            en: 'Comprehensive student analytics',
            ru: 'Комплексная аналитика студентов',
        },
        createdBy: 'Anna Smith',
        createdAt: Date.now(),
        labels: ['education', 'editor'],
        images: {
            light: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1_3.png',
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1_4.png',
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1_5.png',
            ],
            dark: [
                'https://storage.yandexcloud.net/gravity-ui-assets/datalens.yandex_9fms9uae7ip02__embedded%3D1.png',
            ],
        },
        publicUrl: 'https://datalens.yandex/9fms9uae7ip02',
    },
    {
        id: 'education-2',
        title: {
            en: 'Course Analytics',
            ru: 'Аналитика курсов',
        },
        description: {
            en: 'Course completion and engagement metrics',
            ru: 'Метрики завершения и вовлеченности в курсах',
        },
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
        title: {
            en: 'Investment Portfolio',
            ru: 'Инвестиционный портфель',
        },
        description: {
            en: 'Asset allocation and returns',
            ru: 'Распределение активов и доходность',
        },
        shortDescription: {
            en: 'Track your investments',
            ru: 'Отслеживайте свои инвестиции',
        },
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
        publicUrl: 'https://datalens.yandex.ru/finance-1',
    },
    // HR
    {
        id: 'hr-1',
        title: {
            en: 'Employee Satisfaction',
            ru: 'Удовлетворенность сотрудников',
        },
        description: {
            en: 'Survey results and trends',
            ru: 'Результаты опросов и тренды',
        },
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
        publicUrl: 'https://datalens.yandex.ru/hr-1',
    },
    {
        id: 'hr-2',
        title: {
            en: 'Recruitment Metrics',
            ru: 'Метрики найма',
        },
        description: {
            en: 'Hiring funnel analysis',
            ru: 'Анализ воронки найма',
        },
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
        title: {
            en: 'System Performance',
            ru: 'Производительность системы',
        },
        description: {
            en: 'Server metrics dashboard',
            ru: 'Панель метрик серверов',
        },
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
        publicUrl: 'https://datalens.yandex.ru/it-1',
    },
    {
        id: 'it-2',
        title: {
            en: 'Security Overview',
            ru: 'Обзор безопасности',
        },
        description: {
            en: 'Security incidents tracking',
            ru: 'Отслеживание инцидентов безопасности',
        },
        shortDescription: {
            en: 'Monitor security threats',
            ru: 'Мониторинг угроз безопасности',
        },
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
        title: {
            en: 'Network Traffic Analysis',
            ru: 'Анализ сетевого трафика',
        },
        description: {
            en: 'Real-time network monitoring',
            ru: 'Мониторинг сети в реальном времени',
        },
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
        title: {
            en: 'Sales Performance',
            ru: 'Продажи',
        },
        description: {
            en: 'Daily sales tracking',
            ru: 'Ежедневный учет продаж',
        },
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
        publicUrl: 'https://datalens.yandex.ru/retail-1',
    },
    {
        id: 'retail-2',
        title: {
            en: 'Inventory Management',
            ru: 'Управление запасами',
        },
        description: {
            en: 'Stock levels and turnover',
            ru: 'Уровни запасов и оборот',
        },
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
        title: {
            en: 'Team Statistics',
            ru: 'Статистика команды',
        },
        description: {
            en: 'Player performance metrics',
            ru: 'Метрики производительности игроков',
        },
        shortDescription: {
            en: 'Track team performance',
            ru: 'Отслеживайте производительность команды',
        },
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
        publicUrl: 'https://datalens.yandex.ru/sports-1',
    },
];

function fetchGalleryItems(): Promise<GalleryItem[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCKED_GALLERY_ITEMS);
        }, 500);
    });
}

export const loadGalleryItems = () => {
    return async function (dispatch: AppDispatch) {
        try {
            dispatch(actions.setEntriesLoadingStatus({status: 'loading'}));

            const items = await fetchGalleryItems();
            dispatch(actions.setEntries({entries: items}));
            dispatch(actions.setEntriesLoadingStatus({status: 'success'}));
        } catch (error) {
            logger.logError('gallery: loadGalleryItems failed', error);
            dispatch(actions.setEntriesLoadingStatus({status: 'failed'}));
        }
    };
};
