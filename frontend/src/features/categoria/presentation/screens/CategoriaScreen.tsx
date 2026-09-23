import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Formik, type FormikHelpers } from "formik";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import * as Yup from "yup";
import type { CategoriaDto } from "../../domain/types/categoria.types";
import { useCategoria } from "../hook/useCategoria";

interface CategoriaForm {
    nombre: string;
}

const initialValues: CategoriaForm = { nombre: "" };

const validationSchema = Yup.object({
    nombre: Yup.string()
        .trim()
        .required("El nombre de la categoría es obligatorio")
        .min(2, "Debe tener al menos 2 caracteres")
        .max(100, "No puede superar los 100 caracteres"),
});

export default function CategoriaScreen() {
    const { sucursalId } = useLocalSearchParams<{ sucursalId: string }>();
    const { categorias, loading, error, findCategoriasBySucursal, crearCategoria } = useCategoria();
    const [formularioVisible, setFormularioVisible] = useState(false);
    const idSucursal = Number(sucursalId);

    useEffect(() => {
        if (Number.isInteger(idSucursal) && idSucursal > 0) {
            findCategoriasBySucursal(idSucursal);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idSucursal]);

    const handleSubmit = async (values: CategoriaForm, helpers: FormikHelpers<CategoriaForm>) => {
        const categoria: CategoriaDto = {
            nombre: values.nombre.trim(),
            sucursalId: idSucursal,
        };
        const result = await crearCategoria(categoria);
        helpers.setSubmitting(false);
        if (result.meta.requestStatus === "fulfilled") {
            helpers.resetForm();
            setFormularioVisible(false);
        }
    };

    return (
        <View className="flex-1 bg-[#FAF9FC]">
            <View className="flex-row items-center justify-between px-4 py-5 bg-white border-b border-[#E7E0EC]">
                <View>
                    <Text className="text-2xl font-bold text-[#1C1B1F]">Categorías</Text>
                    <Text className="text-sm text-[#79747E] mt-1">Organiza los productos de esta sucursal</Text>
                </View>
                <Pressable
                    onPress={() => setFormularioVisible(true)}
                    disabled={!idSucursal}
                    className="flex-row items-center gap-1.5 bg-[#1857B6] rounded-full px-4 py-2.5 active:opacity-90"
                >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text className="text-sm font-medium text-white">Nueva</Text>
                </Pressable>
            </View>

            {error && <Text className="px-4 pt-3 text-xs text-[#B3261E]">{error}</Text>}

            {loading && categorias.length === 0 ? (
                <View className="items-center justify-center py-16">
                    <ActivityIndicator color="#1857B6" />
                </View>
            ) : (
                <FlatList
                    data={categorias}
                    keyExtractor={(item, index) => String(item.id ?? `${item.nombre}-${index}`)}
                    contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-16">
                            <Ionicons name="pricetags-outline" size={32} color="#79747E" />
                            <Text className="text-sm text-[#79747E] mt-3 text-center">
                                Aún no hay categorías registradas.
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View className="flex-row items-center bg-white rounded-2xl border border-[#E7E0EC] px-4 py-4">
                            <View className="w-10 h-10 rounded-xl bg-[#E7F0FF] items-center justify-center mr-3">
                                <Ionicons name="pricetag-outline" size={20} color="#1857B6" />
                            </View>
                            <Text className="flex-1 text-base font-semibold text-[#1C1B1F]" numberOfLines={1}>
                                {item.nombre}
                            </Text>
                        </View>
                    )}
                />
            )}

            <Modal visible={formularioVisible} animationType="slide" transparent onRequestClose={() => setFormularioVisible(false)}>
                <View className="flex-1 justify-end bg-black/30">
                    <View className="bg-white rounded-t-3xl px-4 pt-5 pb-8">
                        <View className="flex-row items-center justify-between mb-5">
                            <Text className="text-lg font-semibold text-[#1C1B1F]">Nueva categoría</Text>
                            <Pressable onPress={() => setFormularioVisible(false)} className="w-8 h-8 items-center justify-center rounded-full active:bg-[#F1EEF4]">
                                <Ionicons name="close" size={20} color="#1C1B1F" />
                            </Pressable>
                        </View>

                        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                            {({ values, errors, touched, handleChange, handleBlur, handleSubmit: submit, isSubmitting }) => (
                                <View>
                                    <Text className="text-sm font-medium text-[#1C1B1F] mb-1">Nombre</Text>
                                    <TextInput
                                        className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] ${touched.nombre && errors.nombre ? "border-[#B3261E]" : "border-[#E7E0EC]"}`}
                                        placeholder="Ej. Bebidas"
                                        placeholderTextColor="#79747E"
                                        value={values.nombre}
                                        onChangeText={handleChange("nombre")}
                                        onBlur={handleBlur("nombre")}
                                        autoFocus
                                    />
                                    {touched.nombre && errors.nombre && <Text className="text-[#B3261E] text-xs mt-1">{errors.nombre}</Text>}
                                    <Pressable
                                        onPress={() => submit()}
                                        disabled={isSubmitting || !idSucursal}
                                        className={`rounded-xl py-4 items-center mt-5 ${isSubmitting ? "bg-[#9EB7DE]" : "bg-[#1857B6]"}`}
                                    >
                                        <Text className="text-white text-base font-semibold">{isSubmitting ? "Creando..." : "Crear categoría"}</Text>
                                    </Pressable>
                                </View>
                            )}
                        </Formik>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
