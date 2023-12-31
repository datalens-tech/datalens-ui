export const getIllustrationStore = () => ({
    light: {
        notFound: () => import('assets/images/illustration/light/404.svg'),
        noAccess: () => import('assets/images/illustration/light/403.svg'),
        error: () => import('assets/images/illustration/light/500.svg'),
        identity: () => import('assets/images/illustration/light/identity.svg'),
        project: () => import('assets/images/illustration/light/project.svg'),
        template: () => import('assets/images/illustration/light/template.svg'),
        emptyDirectory: () => import('assets/images/illustration/light/folder.svg'),
        successOperation: () => import('assets/images/illustration/light/success_operation.svg'),
        badRequest: () => import('assets/images/illustration/light/bad_request.svg'),
    },
    dark: {
        notFound: () => import('assets/images/illustration/dark/404.svg'),
        noAccess: () => import('assets/images/illustration/dark/403.svg'),
        error: () => import('assets/images/illustration/dark/500.svg'),
        identity: () => import('assets/images/illustration/dark/identity.svg'),
        project: () => import('assets/images/illustration/dark/project.svg'),
        template: () => import('assets/images/illustration/dark/template.svg'),
        emptyDirectory: () => import('assets/images/illustration/dark/folder.svg'),
        successOperation: () => import('assets/images/illustration/dark/success_operation.svg'),
        badRequest: () => import('assets/images/illustration/light/bad_request.svg'),
    },
});
