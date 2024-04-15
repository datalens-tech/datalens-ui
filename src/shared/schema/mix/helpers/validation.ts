export const isValidPublishLink = (link?: string) => {
    const validLinkRe = /^(http(s)?:\/\/|tel:|mailto:)/g;

    if (link) {
        return validLinkRe.test(link);
    }

    return true;
};
