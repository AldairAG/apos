import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import type { MetodoPago } from "@/features/pos/domain/types/pos.types";

interface SplitPaymentItem {
    metodo: MetodoPago;
    monto: number;
}

interface SplitPaymentProps {
    totalOrden: number;
    metodoPagos: SplitPaymentItem[];
    onAgregarMetodo: (metodo: MetodoPago, monto: number) => void;
    onEliminarMetodo: (metodo: MetodoPago) => void;
    onActualizarMonto: (metodo: MetodoPago, monto: number) => void;
    metodosDisponibles: MetodoPago[];
}

const METHOD_LABELS: Record<MetodoPago, string> = {
    EFECTIVO: "Efectivo",
    DIGITAL: "Digital",
    TARJETA_DEBITO: "Débito",
    TARJETA_CREDITO: "Crédito",
    TRANSFERENCIA_BANCARIA: "Transferencia",
    MIXTO: "Mixto",
    GRATIS: "Gratis",
};

const moneda = (monto: number) =>
    `$${(monto || 0).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function SplitPayment({
    totalOrden,
    metodoPagos,
    onAgregarMetodo,
    onEliminarMetodo,
    onActualizarMonto,
    metodosDisponibles,
}: SplitPaymentProps) {
    const totalPagado = metodoPagos.reduce((sum, item) => sum + item.monto, 0);
    const restante = Math.max(0, totalOrden - totalPagado);
    const excedente = Math.max(0, totalPagado - totalOrden);
    const pagadoCompleto = totalPagado >= totalOrden;

    const metodosNoSeleccionados = metodosDisponibles.filter(
        (metodo) => !metodoPagos.some((pago) => pago.metodo === metodo)
    );

    return (
        <View className="gap-4">
            <View className="rounded-xl border border-[#E7E0EC] bg-[#F9F7FA] p-4">
                <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-sm font-semibold text-[#49454F]">Resumen de pago</Text>
                    {pagadoCompleto && (
                        <View className="flex-row items-center gap-1 rounded-full bg-[#2E7D32] px-2 py-1">
                            <Ionicons name="checkmark-circle" size={14} color="white" />
                            <Text className="text-xs font-medium text-white">Pagado</Text>
                        </View>
                    )}
                </View>

                <View className="mb-3 gap-2 border-t border-[#E7E0EC] pt-3">
                    <View className="flex-row justify-between">
                        <Text className="text-xs text-[#79747E]">Total de orden</Text>
                        <Text className="text-xs font-semibold text-[#1C1B1F]">{moneda(totalOrden)}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-xs text-[#79747E]">Total pagado</Text>
                        <Text
                            className={`text-xs font-semibold ${
                                pagadoCompleto ? "text-[#2E7D32]" : "text-[#1857B6]"
                            }`}
                        >
                            {moneda(totalPagado)}
                        </Text>
                    </View>
                    {restante > 0 && (
                        <View className="flex-row justify-between">
                            <Text className="text-xs text-[#79747E]">Restante</Text>
                            <Text className="text-xs font-semibold text-[#B3261E]">{moneda(restante)}</Text>
                        </View>
                    )}
                    {excedente > 0 && (
                        <View className="flex-row justify-between">
                            <Text className="text-xs text-[#79747E]">Excedente</Text>
                            <Text className="text-xs font-semibold text-[#8B6914]">{moneda(excedente)}</Text>
                        </View>
                    )}
                </View>
            </View>

            <View className="gap-3">
                <Text className="text-sm font-semibold text-[#49454F]">Métodos de pago</Text>
                {metodoPagos.length === 0 ? (
                    <Text className="text-xs text-[#79747E] text-center py-3">
                        Selecciona un método de pago
                    </Text>
                ) : (
                    metodoPagos.map((pago) => (
                        <View
                            key={pago.metodo}
                            className="flex-row items-center gap-3 rounded-lg border border-[#D8D2DC] bg-white p-3"
                        >
                            <View className="flex-1">
                                <Text className="text-xs text-[#79747E]">{METHOD_LABELS[pago.metodo]}</Text>
                                <TextInput
                                    value={pago.monto === 0 ? "" : moneda(pago.monto)}
                                    onChangeText={(text) => {
                                        const num = parseFloat(text.replace(/[^0-9.]/g, "")) || 0;
                                        onActualizarMonto(pago.metodo, num);
                                    }}
                                    placeholder={moneda(restante > 0 ? restante : 0)}
                                    keyboardType="decimal-pad"
                                    className="mt-1 text-sm font-semibold text-[#1C1B1F]"
                                />
                            </View>
                            <Pressable onPress={() => onEliminarMetodo(pago.metodo)}>
                                <Ionicons name="close-circle" size={24} color="#B3261E" />
                            </Pressable>
                        </View>
                    ))
                )}
            </View>

            {metodosNoSeleccionados.length > 0 && (
                <View className="gap-2">
                    <Text className="text-xs text-[#79747E]">Agregar otro método</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {metodosNoSeleccionados.map((metodo) => (
                            <Pressable
                                key={metodo}
                                onPress={() => onAgregarMetodo(metodo, 0)}
                                className="flex-1 min-w-[100px] rounded-lg border-2 border-[#1857B6] bg-[#EAF1FC] px-3 py-2"
                            >
                                <Text className="text-xs font-semibold text-center text-[#1857B6]">
                                    + {METHOD_LABELS[metodo]}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}
