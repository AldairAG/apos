export function formatMoney(value: number): string {
    return value.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    });
}
