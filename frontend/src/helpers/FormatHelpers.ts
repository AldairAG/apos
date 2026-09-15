import { MovimientoDto } from "@/features/movimiento/domain/types/Movimiento.types";

export function formatMoney(value: number): string {
    return value.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    });
}



export const formatCurrency = (n: number) =>
  `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;


export const buildPieData = (items: MovimientoDto[], paleta: string[]) => {
  const total = items.reduce((sum, m) => sum + m.monto, 0);
  const porCategoria = items.reduce<Record<string, number>>((acc, m) => {
    acc[m.categoria] = (acc[m.categoria] ?? 0) + m.monto;
    return acc;
  }, {});

  return Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .map(([categoria, monto], i) => ({
      value: monto,
      color: paleta[i % paleta.length],
      categoria,
      monto,
      porcentaje: total > 0 ? Math.round((monto / total) * 100) : 0,
    }));
};
