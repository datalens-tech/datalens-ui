export const downloadObjectAsJSON = ({
    obj,
    name,
    dialogRef,
}: {
    obj: Record<string, unknown>;
    name: string;
    // to prevent dialog from close on outside click
    dialogRef: React.RefObject<HTMLDivElement>;
}) => {
    const jsonString = JSON.stringify(obj);
    const blob = new Blob([jsonString], {type: 'application/json'});

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.json`;

    dialogRef.current?.appendChild(a);
    a.click();

    dialogRef.current?.removeChild(a);
    URL.revokeObjectURL(url);
};
