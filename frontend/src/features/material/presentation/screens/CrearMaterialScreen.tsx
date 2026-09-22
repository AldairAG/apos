import UnidadMedidaSelector from "@/components/UnidadMedidaSelector";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as Yup from "yup";
import { MaterialDto, UNIDAD_MEDIDA_LABELS, UnidadMedida } from "../../domain/types/material.types";
import { useMaterial } from "../hook/useMaterial";

interface MaterialForm {
    nombre: string;
    proveedor: string;
    unidad: UnidadMedida | "";
    cantidad: string;
    precio: string;
    descripcion: string;
}

const initialValues: MaterialForm = {
    nombre: "",
    proveedor: "",
    unidad: "",
    cantidad: "",
    precio: "",
    descripcion: "",
};

function parseNumero(texto: string): number {
    const n = Number(texto.replace(",", "."));
    return isNaN(n) ? 0 : n;
}

const validationSchema = Yup.object({
    nombre: Yup.string()
        .trim()
        .required("El nombre del material es obligatorio")
        .min(2, "Debe tener al menos 2 caracteres")
        .max(100, "No puede superar los 100 caracteres"),
    proveedor: Yup.string().max(100, "No puede superar los 100 caracteres"),
    unidad: Yup.string().required("Selecciona una unidad de medida"),
    cantidad: Yup.string()
        .required("Indica la cantidad")
        .test("valido", "Debe ser mayor o igual a 0", (v) => {
            if (!v) return false;
            const n = Number(v.replace(",", "."));
            return !isNaN(n) && n >= 0;
        }),
    precio: Yup.string()
        .required("Indica el precio")
        .test("valido", "Debe ser mayor o igual a 0", (v) => {
            if (!v) return false;
            const n = Number(v.replace(",", "."));
            return !isNaN(n) && n >= 0;
        }),
    descripcion: Yup.string().max(500, "Máximo 500 caracteres"),
});

/**
 * Formulario de creación de material. El envío se delega al hook
 * `useMaterial`, que despacha el thunk correspondiente — la pantalla no
 * realiza llamadas HTTP directamente.
 */
export default function CrearMaterialScreen() {
    const router = useRouter();
    const { crearMaterial } = useMaterial();
    const [selectorVisible, setSelectorVisible] = useState(false);

    const handleSubmit = (values: MaterialForm, helpers: FormikHelpers<MaterialForm>) => {
        const nuevoMaterial: MaterialDto = {
            nombre: values.nombre.trim(),
            proveedor: values.proveedor.trim() || undefined,
            unidad: values.unidad as UnidadMedida,
            cantidad: parseNumero(values.cantidad),
            precio: parseNumero(values.precio),
            descripcion: values.descripcion.trim() || undefined,
        };

        crearMaterial(nuevoMaterial);
        helpers.setSubmitting(false);
        router.back();
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header del modal */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-[#E7E0EC]">
                <Text className="text-base font-semibold text-[#1C1B1F]">
                    Nuevo material
                </Text>
                <Pressable
                    onPress={() => router.back()}
                    className="w-8 h-8 items-center justify-center rounded-full active:bg-[#F1EEF4]"
                >
                    <Ionicons name="close" size={20} color="#1C1B1F" />
                </Pressable>
            </View>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit: formikSubmit,
                    setFieldValue,
                    isSubmitting,
                }) => (
                    <ScrollView className="px-4 pt-6" contentContainerStyle={{ paddingBottom: 24 }}>
                        <Text className="text-sm font-medium text-[#1C1B1F] mb-1">
                            Nombre del material
                        </Text>
                        <TextInput
                            className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                touched.nombre && errors.nombre ? "border-[#B3261E]" : "border-[#E7E0EC]"
                            }`}
                            placeholder="Ej. Café en grano"
                            placeholderTextColor="#79747E"
                            value={values.nombre}
                            onChangeText={handleChange("nombre")}
                            onBlur={handleBlur("nombre")}
                            autoFocus
                        />
                        {touched.nombre && errors.nombre ? (
                            <Text className="text-[#B3261E] text-xs mb-2">{errors.nombre}</Text>
                        ) : (
                            <View className="mb-2" />
                        )}

                        <Text className="text-sm font-medium text-[#1C1B1F] mb-1">
                            Proveedor
                        </Text>
                        <TextInput
                            className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                touched.proveedor && errors.proveedor ? "border-[#B3261E]" : "border-[#E7E0EC]"
                            }`}
                            placeholder="Ej. Distribuidora del Valle"
                            placeholderTextColor="#79747E"
                            value={values.proveedor}
                            onChangeText={handleChange("proveedor")}
                            onBlur={handleBlur("proveedor")}
                        />
                        {touched.proveedor && errors.proveedor ? (
                            <Text className="text-[#B3261E] text-xs mb-2">{errors.proveedor}</Text>
                        ) : (
                            <View className="mb-2" />
                        )}

                        <Text className="text-sm font-medium text-[#1C1B1F] mb-1">
                            Unidad de medida
                        </Text>
                        <Pressable
                            onPress={() => setSelectorVisible(true)}
                            onBlur={handleBlur("unidad")}
                            className={`flex-row items-center justify-between border rounded-xl px-4 py-3 mb-1 ${
                                touched.unidad && errors.unidad ? "border-[#B3261E]" : "border-[#E7E0EC]"
                            }`}
                        >
                            <Text className={`text-base ${values.unidad ? "text-[#1C1B1F]" : "text-[#79747E]"}`}>
                                {values.unidad ? UNIDAD_MEDIDA_LABELS[values.unidad] : "Selecciona una unidad"}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color="#79747E" />
                        </Pressable>
                        {touched.unidad && errors.unidad ? (
                            <Text className="text-[#B3261E] text-xs mb-2">{errors.unidad}</Text>
                        ) : (
                            <View className="mb-2" />
                        )}
                        <UnidadMedidaSelector
                            visible={selectorVisible}
                            value={values.unidad}
                            onChange={(u) => setFieldValue("unidad", u)}
                            onClose={() => setSelectorVisible(false)}
                        />

                        <Text className="text-sm font-medium text-[#1C1B1F] mb-1">
                            Cantidad
                        </Text>
                        <TextInput
                            className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                touched.cantidad && errors.cantidad ? "border-[#B3261E]" : "border-[#E7E0EC]"
                            }`}
                            placeholder="Ej. 1000"
                            placeholderTextColor="#79747E"
                            keyboardType="decimal-pad"
                            value={values.cantidad}
                            onChangeText={handleChange("cantidad")}
                            onBlur={handleBlur("cantidad")}
                        />
                        {touched.cantidad && errors.cantidad ? (
                            <Text className="text-[#B3261E] text-xs mb-2">{errors.cantidad}</Text>
                        ) : (
                            <View className="mb-2" />
                        )}

                        <Text className="text-sm font-medium text-[#1C1B1F] mb-1">
                            Precio
                        </Text>
                        <TextInput
                            className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                touched.precio && errors.precio ? "border-[#B3261E]" : "border-[#E7E0EC]"
                            }`}
                            placeholder="Ej. 150.00"
                            placeholderTextColor="#79747E"
                            keyboardType="decimal-pad"
                            value={values.precio}
                            onChangeText={handleChange("precio")}
                            onBlur={handleBlur("precio")}
                        />
                        {touched.precio && errors.precio ? (
                            <Text className="text-[#B3261E] text-xs mb-2">{errors.precio}</Text>
                        ) : (
                            <View className="mb-2" />
                        )}

                        <Text className="text-sm font-medium text-[#1C1B1F] mb-1">
                            Descripción
                        </Text>
                        <TextInput
                            className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                touched.descripcion && errors.descripcion ? "border-[#B3261E]" : "border-[#E7E0EC]"
                            }`}
                            placeholder="Notas adicionales (opcional)"
                            placeholderTextColor="#79747E"
                            multiline
                            numberOfLines={3}
                            value={values.descripcion}
                            onChangeText={handleChange("descripcion")}
                            onBlur={handleBlur("descripcion")}
                        />
                        {touched.descripcion && errors.descripcion ? (
                            <Text className="text-[#B3261E] text-xs mb-2">{errors.descripcion}</Text>
                        ) : (
                            <View className="mb-2" />
                        )}

                        <Pressable
                            onPress={() => formikSubmit()}
                            disabled={isSubmitting}
                            className={`rounded-xl py-4 items-center mt-4 ${
                                isSubmitting ? "bg-[#9EB7DE]" : "bg-[#1857B6]"
                            }`}
                        >
                            <Text className="text-white text-base font-semibold">
                                {isSubmitting ? "Creando..." : "Crear material"}
                            </Text>
                        </Pressable>
                    </ScrollView>
                )}
            </Formik>
        </View>
    );
}
