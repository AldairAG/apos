export const dateStringToLocateDateTime = (date: string): string => {
    const ahora = new Date();

    const fecha = `${date}T${String(ahora.getHours()).padStart(2, "0")}:${String(
        ahora.getMinutes()
    ).padStart(2, "0")}:${String(ahora.getSeconds()).padStart(2, "0")}`;
    return fecha;
}

export function formatFecha(date: Date): string {
    return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

export function formatHora(date: Date): string {
    return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}