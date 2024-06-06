const DATETIME_FORMAT = 'DD.MM.YYYY HH:mm:ss';

const ROW_HEIGHT = 48;
const MOBILE_ROW_HEIGHT = 44;
const defaultRowStyle: React.CSSProperties = {
    height: ROW_HEIGHT,
};

const mobileRowStyle: React.CSSProperties = {
    height: MOBILE_ROW_HEIGHT,
};

const options = {
    rootMargin: '200% 0px',
};

export {DATETIME_FORMAT, ROW_HEIGHT, defaultRowStyle, options, mobileRowStyle};
