export async function waitForContent(node: Element) {
    const imgs = [...node.querySelectorAll('img')];

    if (imgs.length > 0) {
        return Promise.all([
            // Waiting for all image files to load
            ...imgs.map((img) => {
                return new Promise((resolve) => {
                    // if image load is alredy complete
                    if (img.complete) {
                        resolve(true);
                        return;
                    }

                    const handler = () => {
                        img.removeEventListener('load', handler);
                        img.removeEventListener('error', handler);
                        resolve(true);
                    };

                    // handling error as complete result anyway
                    img.addEventListener('load', handler);
                    img.addEventListener('error', handler);
                });
            }),
            // Waiting for fonts to load as well
            document.fonts.ready,
        ]);
    }

    // if not img waiting only for fonts
    return document.fonts.ready;
}
