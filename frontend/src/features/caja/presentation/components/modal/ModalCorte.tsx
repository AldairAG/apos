// --- Modal: corte de caja (con calculadora de billetes) ---

import ModalHeader from "@/components/modal/ModalHeader";
import { formatMoney } from "@/helpers/FormatHelpers";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import ResumenLinea from "../ResumenLinea";

const DENOMINACIONES = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

export default function ModalCorte({
    visible,
    onClose,
    saldoInicial,
    ventas,
    ingresos,
    gastos,
    egresos,
    saldoEsperado,
    onCerrarCaja,
}: {
    visible: boolean;
    onClose: () => void;
    saldoInicial: number;
    ventas: number;
    ingresos: number;
    gastos: number;
    egresos: number;
    saldoEsperado: number;
    onCerrarCaja: () => void;
}) {
    const [conteo, setConteo] = useState<Record<number, string>>({});
    const [confirmarConDiferencia, setConfirmarConDiferencia] = useState(false);

    const efectivoContado = DENOMINACIONES.reduce((acc, d) => {
        const cantidad = Number(conteo[d] ?? 0);
        return acc + d * (isNaN(cantidad) ? 0 : cantidad);
    }, 0);

    const diferencia = efectivoContado - saldoEsperado;
    const cuadra = Math.abs(diferencia) < 0.01;

    const actualizarCantidad = (denominacion: number, delta: number) => {
        setConteo((prev) => {
            const actual = Number(prev[denominacion] ?? 0);
            const nuevo = Math.max(0, actual + delta);
            return { ...prev, [denominacion]: String(nuevo) };
        });
    };

    const handleCerrar = () => {
        if (!cuadra && !confirmarConDiferencia) {
            setConfirmarConDiferencia(true);
            return;
        }
        onCerrarCaja();
        setConteo({});
        setConfirmarConDiferencia(false);
    };

    const handleClose = () => {
        setConteo({});
        setConfirmarConDiferencia(false);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <View className="flex-1 justify-end bg-black/40">
                <View className="bg-white rounded-t-3xl max-h-[92%]">
                    <ModalHeader title="Corte de caja" onClose={handleClose} />
                    <ScrollView className="px-4 pt-4" contentContainerStyle={{ paddingBottom: 24 }}>
                        {/* Resumen calculado por el sistema */}
                        <View className="bg-[#F1EEF4] rounded-2xl p-4 mb-4">
                            <ResumenLinea label="Saldo inicial" value={saldoInicial} />
                            <ResumenLinea label="Ventas" value={ventas} />
                            <ResumenLinea label="Ingresos" value={ingresos} />
                            <ResumenLinea label="Gastos" value={gastos} negativo />
                            <ResumenLinea label="Egresos" value={egresos} negativo />
                            <View className="h-px bg-[#E7E0EC] my-2" />
                            <ResumenLinea label="Saldo esperado" value={saldoEsperado} destacado />
                        </View>

                        {/* Calculadora de billetes y monedas */}
                        <Text className="text-sm font-semibold text-[#1C1B1F] mb-2">Contar efectivo</Text>
                        <View className="gap-2">
                            {DENOMINACIONES.map((denominacion) => {
                                const cantidad = Number(conteo[denominacion] ?? 0);
                                return (
                                    <View
                                        key={denominacion}
                                        className="flex-row items-center justify-between bg-white border border-[#E7E0EC] rounded-xl px-3 py-2"
                                    >
                                        <Text className="text-sm text-[#1C1B1F] w-16">
                                            {formatMoney(denominacion)}
                                        </Text>
                                        <View className="flex-row items-center gap-3">
                                            <Pressable
                                                onPress={() => actualizarCantidad(denominacion, -1)}
                                                className="w-8 h-8 rounded-full bg-[#F1EEF4] items-center justify-center"
                                            >
                                                <Ionicons name="remove" size={16} color="#1C1B1F" />
                                            </Pressable>
                                            <TextInput
                                                className="w-12 text-center text-sm text-[#1C1B1F] border border-[#E7E0EC] rounded-lg py-1"
                                                keyboardType="number-pad"
                                                value={conteo[denominacion] ?? "0"}
                                                onChangeText={(v) =>
                                                    setConteo((prev) => ({
                                                        ...prev,
                                                        [denominacion]: v.replace(/[^0-9]/g, ""),
                                                    }))
                                                }
                                            />
                                            <Pressable
                                                onPress={() => actualizarCantidad(denominacion, 1)}
                                                className="w-8 h-8 rounded-full bg-[#F1EEF4] items-center justify-center"
                                            >
                                                <Ionicons name="add" size={16} color="#1C1B1F" />
                                            </Pressable>
                                        </View>
                                        <Text className="text-sm font-semibold text-[#1C1B1F] w-20 text-right">
                                            {formatMoney(denominacion * cantidad)}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>

                        <View className="flex-row items-center justify-between mt-4 px-1">
                            <Text className="text-sm font-medium text-[#79747E]">EFECTIVO CONTADO</Text>
                            <Text className="text-xl font-bold text-[#1C1B1F]">{formatMoney(efectivoContado)}</Text>
                        </View>

                        {/* Verificación */}
                        <View
                            className={`rounded-2xl p-4 mt-4 border ${cuadra ? "bg-[#E4F5E9] border-[#1C7C3F]" : "bg-[#FDECEA] border-[#B3261E]"
                                }`}
                        >
                            <View className="flex-row items-center gap-2 mb-2">
                                <Ionicons
                                    name={cuadra ? "checkmark-circle" : "warning"}
                                    size={18}
                                    color={cuadra ? "#1C7C3F" : "#B3261E"}
                                />
                                <Text
                                    className={`text-sm font-semibold ${cuadra ? "text-[#1C7C3F]" : "text-[#B3261E]"
                                        }`}
                                >
                                    {cuadra ? "Caja cuadrada" : "Diferencia en caja"}
                                </Text>
                            </View>
                            <ResumenLinea label="Esperado" value={saldoEsperado} />
                            <ResumenLinea label="Contado" value={efectivoContado} />
                            <ResumenLinea
                                label="Diferencia"
                                value={diferencia}
                                negativo={diferencia < 0}
                                destacado
                            />
                        </View>

                        {!cuadra && confirmarConDiferencia && (
                            <View className="bg-[#FDECEA] border border-[#B3261E] rounded-2xl p-4 mt-3">
                                <Text className="text-sm text-[#B3261E] mb-3">
                                    Existe una diferencia de {formatMoney(diferencia)}. ¿Deseas cerrar la caja de
                                    todas formas?
                                </Text>
                                <View className="flex-row gap-3">
                                    <Pressable
                                        onPress={() => setConfirmarConDiferencia(false)}
                                        className="flex-1 border border-[#B3261E] rounded-xl py-2.5 items-center"
                                    >
                                        <Text className="text-sm font-medium text-[#B3261E]">Volver al conteo</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={handleCerrar}
                                        className="flex-1 bg-[#B3261E] rounded-xl py-2.5 items-center"
                                    >
                                        <Text className="text-sm font-semibold text-white">Cerrar caja</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}

                        {!confirmarConDiferencia && (
                            <View className="flex-row gap-3 mt-5">
                                <Pressable
                                    onPress={handleClose}
                                    className="flex-1 border border-[#E7E0EC] rounded-xl py-3 items-center"
                                >
                                    <Text className="text-sm font-medium text-[#1C1B1F]">Cancelar</Text>
                                </Pressable>
                                <Pressable
                                    onPress={handleCerrar}
                                    className={`flex-1 rounded-xl py-3 items-center ${cuadra ? "bg-[#1857B6]" : "bg-[#B3261E]"
                                        }`}
                                >
                                    <Text className="text-sm font-semibold text-white">Cerrar caja</Text>
                                </Pressable>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}