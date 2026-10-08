import { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal } from "react-native";
import { usePos } from "../hook/usePos";
import useCart from "../hook/useCart";
import { moneda } from "@/helpers/FormatHelpers";

const ProductosSelector = () => {

    const { categoriasProductos, catalogoLoading } = usePos();
    const { agregarProducto, mesaSeleccionada, tipoOrden } = useCart();
    // const [visible, setVisible] = useState(false);

    const visible = mesaSeleccionada !== null && tipoOrden !== null;

    const [categoriaActiva, setCategoriaActiva] = useState<string | null>(null);

    const productosFiltrados = categoriasProductos
        .filter((grupo) => !categoriaActiva || grupo.categoria === categoriaActiva)
        .flatMap((grupo) => grupo.productos.filter((producto) => producto.disponible));


    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View className="flex-1 bg-black/30 w-full h-full">
                <View className="rounded-lg border border-[#E7E0EC] bg-white p-4">
                    <Text className="mb-3 text-base font-semibold text-[#1C1B1F]">Productos</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                        <Pressable
                            onPress={() => setCategoriaActiva(null)}
                            className={`mr-2 rounded-full px-3 py-2 ${categoriaActiva === null ? "bg-[#1857B6]" : "bg-[#F1EEF4]"
                                }`}
                        >
                            <Text
                                className={`text-xs font-medium ${categoriaActiva === null ? "text-white" : "text-[#49454F]"
                                    }`}
                            >
                                Todos
                            </Text>
                        </Pressable>
                        {categoriasProductos.map((grupo) => (
                            <Pressable
                                key={grupo.categoria}
                                onPress={() => setCategoriaActiva(grupo.categoria)}
                                className={`mr-2 rounded-full px-3 py-2 ${categoriaActiva === grupo.categoria
                                    ? "bg-[#1857B6]"
                                    : "bg-[#F1EEF4]"
                                    }`}
                            >
                                <Text
                                    className={`text-xs font-medium ${categoriaActiva === grupo.categoria
                                        ? "text-white"
                                        : "text-[#49454F]"
                                        }`}
                                >
                                    {grupo.categoria}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>

                    {catalogoLoading ? (
                        <Text className="py-4 text-sm text-[#79747E]">Cargando cat�logo...</Text>
                    ) : null}
                    {!catalogoLoading && productosFiltrados.length === 0 ? (
                        <Text className="py-4 text-sm text-[#79747E]">
                            No hay productos disponibles en esta categor�a.
                        </Text>
                    ) : null}
                    <View className="flex-row flex-wrap gap-2">
                        {productosFiltrados.map((producto) => (
                            <Pressable
                                key={producto.id}
                                onPress={() => agregarProducto(producto)}
                                className="min-w-[145px] flex-1 rounded-lg border border-[#D8D2DC] p-3 active:bg-[#F1EEF4]"
                            >
                                <Text className="text-sm font-semibold text-[#1C1B1F]">
                                    {producto.nombre}
                                </Text>
                                <Text className="mt-1 text-sm text-[#1857B6]">
                                    {moneda(producto.precio)}
                                </Text>
                                <Text className="mt-2 text-xs font-medium text-[#79747E]">
                                    Agregar +
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ProductosSelector;