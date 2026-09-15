export const dateStringToLocateDateTime = (date: string): string => {
    const ahora = new Date();

    const fecha = `${date}T${String(ahora.getHours()).padStart(2, "0")}:${String(
        ahora.getMinutes()
    ).padStart(2, "0")}:${String(ahora.getSeconds()).padStart(2, "0")}`;
    return fecha;
}

export function formatFecha(date: string | Date): string {
    const parsedDate = date instanceof Date ? date : new Date(date);

    return parsedDate.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
    });
}

export function formatHora(date: string | Date): string {
    const parsedDate = date instanceof Date ? date : new Date(date);

    return parsedDate.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
    });
}