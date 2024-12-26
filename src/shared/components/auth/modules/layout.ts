export interface AuthLayoutSettings {
    page: 'reload' | 'signin';
}

export interface AuthPageSettings extends AuthLayoutSettings {
    isAuthPage: true;
}
