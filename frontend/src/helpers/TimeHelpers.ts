export const dateStringToLocateDateTime = (date: string): string => {
    const ahora = new Date();

    const fecha = `${date}T${String(ahora.getHours()).padStart(2, "0")}:${String(
        ahora.getMinutes()
    ).padStart(2, "0")}:${String(ahora.getSeconds()).padStart(2, "0")}`;
    return fecha;
}