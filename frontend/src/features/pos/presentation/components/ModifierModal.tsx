import ModalHeader from "@/components/modal/ModalHeader";
import { Ionicons } from "@expo/vector-icons";
import { Modal as RNModal, Pressable, ScrollView, Text, View } from "react-native";
import useCart from "../hook/useCart";
import { moneda } from "@/helpers/FormatHelpers";

export default function ModifierModal() {

    const { productoSeleccionado: producto, opcionesModificador: opcionesCantidad, onChangeOpcion, confirmarModificadores: onConfirm, clearProductoSeleccionado, } = useCart();

    const modificadoresConOpciones = (producto?.modificadores ?? []).filter(
        (mod) => mod.opciones && mod.opciones.length > 0
    );

    const totalExtra = producto
        ? (producto.modificadores ?? [])
              .flatMap((mod) => mod.opciones)
              .filter((op) => op.id !== undefined && (opcionesCantidad[op.id] ?? 0) > 0)
              .reduce((sum, op) => sum + op.precio * (opcionesCantidad[op.id!] ?? 0), 0)
        : 0;

    return (
        <RNModal visible={producto !== null} animationType="slide" transparent onRequestClose={clearProductoSeleccionado}>
            <View className="flex-1 justify-end bg-black/40">
                <View className="max-h-[80%] rounded-t-3xl bg-white">
                    <ModalHeader
                        title={producto ? `Modificadores: ${producto.nombre}` : "Modificadores"}
                        onClose={clearProductoSeleccionado}
                    />

                    <ScrollView className="px-4 py-4" contentContainerStyle={{ paddingBottom: 24 }}>
                        {modificadoresConOpciones.length === 0 ? (
                            <View className="items-center py-8">
                                <Ionicons name="checkmark-circle" size={32} color="#2E7D32" />
                                <Text className="mt-3 text-sm text-[#79747E]">
                                    Este producto no tiene modificadores.
                                </Text>
                            </View>
                        ) : (
                            <View className="gap-4">
                                {modificadoresConOpciones.map((modificador) => (
                                    <View
                                        key={modificador.id ?? modificador.nombre}
                                        className="gap-3 rounded-xl border border-[#E7E0EC] bg-[#F9F7FA] p-4"
                                    >
                                        <View>
                                            <Text className="text-sm font-semibold text-[#1C1B1F]">
                                                {modificador.nombre}
                                            </Text>
                                            <Text className="mt-1 text-xs text-[#79747E]">
                                                Selecciona las opciones
                                            </Text>
                                        </View>

                                        <View className="gap-2">
                                            {modificador.opciones.map((opcion) => {
                                                const cantidad = opcion.id ? opcionesCantidad[opcion.id] ?? 0 : 0;
                                                return (
                                                    <View
                                                        key={opcion.id ?? opcion.nombre}
                                                        className={`flex-row items-center justify-between rounded-lg px-3 py-3 border ${
                                                            cantidad > 0
                                                                ? "border-[#1857B6] bg-[#EAF1FC]"
                                                                : "border-[#D8D2DC] bg-white"
                                                        }`}
                                                    >
                                                        <View className="flex-1">
                                                            <Text
                                                                className={`text-sm font-medium ${
                                                                    cantidad > 0
                                                                        ? "text-[#1857B6]"
                                                                        : "text-[#1C1B1F]"
                                                                }`}
                                                            >
                                                                {opcion.nombre}
                                                            </Text>
                                                            <Text className="mt-1 text-xs text-[#79747E]">
                                                                +{moneda(opcion.precio)}
                                                            </Text>
                                                        </View>
                                                        <View className="flex-row items-center gap-2">
                                                            {cantidad > 0 && (
                                                                <Pressable
                                                                    onPress={() =>
                                                                        opcion.id &&
                                                                        onChangeOpcion(opcion.id, -1)
                                                                    }
                                                                    accessibilityLabel={`Quitar ${opcion.nombre}`}
                                                                >
                                                                    <Ionicons
                                                                        name="remove-circle"
                                                                        size={24}
                                                                        color="#1857B6"
                                                                    />
                                                                </Pressable>
                                                            )}
                                                            {cantidad > 0 && (
                                                                <Text className="min-w-[24px] text-center text-sm font-semibold text-[#1C1B1F]">
                                                                    {cantidad}
                                                                </Text>
                                                            )}
                                                            <Pressable
                                                                onPress={() =>
                                                                    opcion.id && onChangeOpcion(opcion.id, 1)
                                                                }
                                                                accessibilityLabel={`Agregar ${opcion.nombre}`}
                                                            >
                                                                <Ionicons
                                                                    name="add-circle"
                                                                    size={24}
                                                                    color={
                                                                        cantidad > 0 ? "#1857B6" : "#1857B6"
                                                                    }
                                                                />
                                                            </Pressable>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
                                ))}

                                {totalExtra > 0 && (
                                    <View className="rounded-lg border border-[#1857B6] bg-[#EAF1FC] p-3">
                                        <Text className="text-xs text-[#79747E]">Total adicional</Text>
                                        <Text className="mt-1 text-lg font-bold text-[#1857B6]">
                                            {moneda(totalExtra)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>

                    <View className="border-t border-[#E7E0EC] px-4 py-4">
                        <Pressable
                            onPress={onConfirm}
                            className="rounded-lg bg-[#1857B6] px-4 py-3"
                        >
                            <Text className="text-center font-semibold text-white">
                                Confirmar{totalExtra > 0 ? ` +${moneda(totalExtra)}` : ""}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </RNModal>
    );
}
