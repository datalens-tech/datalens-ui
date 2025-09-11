export const getRebrandingIllustrationStore = () => ({
    light: {
        notFound: () => import('assets/images/new-illustrations/light/nothing_found.svg'),
        notFoundError: () => import('assets/images/new-illustrations/light/404.svg'),
        noAccess: () => import('assets/images/new-illustrations/light/403.svg'),
        error: () => import('assets/images/new-illustrations/light/500.svg'),
        identity: () => import('assets/images/new-illustrations/light/no_permission.svg'),
        project: () => import('assets/images/new-illustrations/light/project.svg'),
        template: () => import('assets/images/new-illustrations/light/empty_state.svg'),
        emptyDirectory: () => import('assets/images/new-illustrations/light/empty_directory.svg'),
        successOperation: () =>
            import('assets/images/new-illustrations/light/success_operation.svg'),
        badRequest: () => import('assets/images/new-illustrations/light/bad_request.svg'),
        noAccounts: () => import('assets/images/new-illustrations/light/no_accounts.svg'),
    },
    dark: {
        notFound: () => import('assets/images/new-illustrations/dark/nothing_found.svg'),
        notFoundError: () => import('assets/images/new-illustrations/dark/404.svg'),
        noAccess: () => import('assets/images/new-illustrations/dark/403.svg'),
        error: () => import('assets/images/new-illustrations/dark/500.svg'),
        identity: () => import('assets/images/new-illustrations/dark/no_permission.svg'),
        project: () => import('assets/images/new-illustrations/dark/project.svg'),
        template: () => import('assets/images/new-illustrations/dark/empty_state.svg'),
        emptyDirectory: () => import('assets/images/new-illustrations/dark/empty_directory.svg'),
        successOperation: () =>
            import('assets/images/new-illustrations/dark/success_operation.svg'),
        badRequest: () => import('assets/images/new-illustrations/dark/bad_request.svg'),
        noAccounts: () => import('assets/images/new-illustrations/dark/no_accounts.svg'),
    },
});
