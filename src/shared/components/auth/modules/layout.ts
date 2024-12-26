export interface AuthLayoutSettings {
    page: 'reload' | 'signin' | 'logout';
}

export interface AuthPageSettings extends AuthLayoutSettings {
    isAuthPage: true;
}
