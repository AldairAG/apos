import { Modal, View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useCart from "../hook/useCart";
import { moneda } from "@/helpers/FormatHelpers";

interface ModalCartProps {
    mostrarCarrito: boolean;
    setMostrarCarrito: (mostrar: boolean) => void;
}

const ModalCart = ({ mostrarCarrito, setMostrarCarrito }: ModalCartProps) => {

    const { carrito, cambiarCantidad, cambiarCantidadOpcion, subtotal, agregarNota } = useCart();

    return (
        <Modal
            visible={mostrarCarrito && carrito.length > 0}
            transparent
            animationType="slide"
            onRequestClose={() => setMostrarCarrito(false)}
        >
            <View className="flex-1 justify-end bg-black/40">
                <View className="max-h-[90%] rounded-t-3xl bg-white">
                    <View className="flex-row items-center justify-between border-b border-[#E7E0EC] px-4 py-4">
                        <Text className="text-lg font-semibold text-[#1C1B1F]">
                            Carrito ({carrito.length})
                        </Text>
                        <Pressable onPress={() => setMostrarCarrito(false)}>
                            <Ionicons name="close" size={24} color="#49454F" />
                        </Pressable>
                    </View>
                    <ScrollView className="flex-1 px-4 py-4">
                        {carrito.map((linea) => (
                            <View key={linea.itemId} className="border-b border-[#EEEAF0] py-4">
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-1">
                                        <Text className="text-sm font-semibold text-[#1C1B1F]">
                                            {linea.producto.nombre}
                                        </Text>
                                        <Text className="mt-1 text-xs text-[#79747E]">
                                            {moneda(linea.producto.precio)} c/u
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                        <Pressable onPress={() => cambiarCantidad(linea.itemId, -1)}>
                                            <Ionicons
                                                name="remove-circle"
                                                size={24}
                                                color="#49454F"
                                            />
                                        </Pressable>
                                        <Text className="min-w-[24px] text-center text-sm font-semibold text-[#1C1B1F]">
                                            {linea.cantidad}
                                        </Text>
                                        <Pressable onPress={() => cambiarCantidad(linea.itemId, 1)}>
                                            <Ionicons
                                                name="add-circle"
                                                size={24}
                                                color="#1857B6"
                                            />
                                        </Pressable>
                                    </View>
                                </View>

                                {linea.producto.modificadores?.map((modificador) => (
                                    <View key={modificador.id ?? modificador.nombre} className="mt-3">
                                        <Text className="mb-2 text-xs text-[#79747E]">
                                            {modificador.nombre}
                                        </Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {modificador.opciones
                                                .filter((opcion) => opcion.id !== undefined)
                                                .map((opcion) => {
                                                    const cantidad = linea.opcionesCantidad[opcion.id!] ?? 0;
                                                    return (
                                                        <View
                                                            key={opcion.id}
                                                            className={`flex-row items-center rounded-md border px-2 py-1 ${cantidad > 0
                                                                ? "border-[#1857B6] bg-[#EAF1FC]"
                                                                : "border-[#D8D2DC]"
                                                                }`}
                                                        >
                                                            <Text
                                                                className={`mr-2 text-xs ${cantidad > 0
                                                                    ? "text-[#1857B6]"
                                                                    : "text-[#49454F]"
                                                                    }`}
                                                            >
                                                                {opcion.nombre} +{moneda(opcion.precio)}
                                                            </Text>
                                                            <Pressable
                                                                onPress={() =>
                                                                    cambiarCantidadOpcion(
                                                                        linea.itemId,
                                                                        opcion.id!,
                                                                        -1
                                                                    )
                                                                }
                                                            >
                                                                <Ionicons
                                                                    name="remove-circle-outline"
                                                                    size={18}
                                                                    color={
                                                                        cantidad > 0 ? "#1857B6" : "#B8B3BC"
                                                                    }
                                                                />
                                                            </Pressable>
                                                            <Text className="mx-1 min-w-[14px] text-center text-xs font-semibold text-[#1C1B1F]">
                                                                {cantidad}
                                                            </Text>
                                                            <Pressable
                                                                onPress={() =>
                                                                    cambiarCantidadOpcion(
                                                                        linea.itemId,
                                                                        opcion.id!,
                                                                        1
                                                                    )
                                                                }
                                                            >
                                                                <Ionicons
                                                                    name="add-circle-outline"
                                                                    size={18}
                                                                    color="#1857B6"
                                                                />
                                                            </Pressable>
                                                        </View>
                                                    );
                                                })}
                                        </View>
                                    </View>
                                ))}

                                <TextInput
                                    value={linea.notas}
                                    onChangeText={(nota) => agregarNota(linea.itemId, nota)}
                                    placeholder="Nota para cocina"
                                    className="mt-3 rounded-md border border-[#E7E0EC] px-2 py-2 text-xs text-[#1C1B1F]"
                                />
                            </View>
                        ))}
                    </ScrollView>
                    <View className="border-t border-[#E7E0EC] px-4 py-4">
                        <View className="mb-4 flex-row items-center justify-between">
                            <Text className="text-sm font-semibold text-[#1C1B1F]">Total</Text>
                            <Text className="text-lg font-bold text-[#1857B6]">{moneda(subtotal)}</Text>
                        </View>
                        <Pressable
                            onPress={() => setMostrarCarrito(false)}
                            className="rounded-lg bg-[#1857B6] px-4 py-3"
                        >
                            <Text className="text-center font-semibold text-white">
                                Continuar comprando
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ModalCart;