export const downloadObjectAsJSON = (obj: Record<string, unknown>, name: string) => {
    const jsonString = JSON.stringify(obj);
    const blob = new Blob([jsonString], {type: 'application/json'});

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.json`;

    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
