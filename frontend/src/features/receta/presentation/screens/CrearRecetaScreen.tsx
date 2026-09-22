import MaterialSelector from "@/components/MaterialSelector";
import ModalHeader from "@/components/modal/ModalHeader";
import UnidadMedidaSelector from "@/components/UnidadMedidaSelector";
import { MaterialDto, UNIDAD_MEDIDA_LABELS, UnidadMedida } from "@/features/material/domain/types/material.types";
import { useMaterial } from "@/features/material/presentation/hook/useMaterial";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik, FormikHelpers } from "formik";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as Yup from "yup";
import { RecetaDetalleDto, RecetaDto } from "../../domain/types/receta.types";
import { useReceta } from "../hook/useReceta";

interface RecetaForm {
    nombre: string;
    rendimiento: string;
    tiempoPreparacion: string;
    porcentajeSobreCostos: string;
    notas: string;
    instrucciones: string[];
    recetaDetalles: RecetaDetalleDto[];
}

const initialValues: RecetaForm = {
    nombre: "",
    rendimiento: "",
    tiempoPreparacion: "",
    porcentajeSobreCostos: "",
    notas: "",
    instrucciones: [],
    recetaDetalles: [],
};

function parseNumero(texto: string): number {
    const n = Number(texto.replace(",", "."));
    return isNaN(n) ? 0 : n;
}

const validationSchema = Yup.object({
    nombre: Yup.string()
        .trim()
        .required("El nombre de la receta es obligatorio")
        .min(2, "Debe tener al menos 2 caracteres")
        .max(100, "No puede superar los 100 caracteres"),
    rendimiento: Yup.string()
        .required("Indica el rendimiento")
        .test("valido", "Debe ser mayor a 0", (v) => {
            if (!v) return false;
            const n = Number(v.replace(",", "."));
            return !isNaN(n) && n > 0;
        }),
    tiempoPreparacion: Yup.string().test("valido", "Debe ser mayor o igual a 0", (v) => {
        if (!v) return true;
        const n = Number(v.replace(",", "."));
        return !isNaN(n) && n >= 0;
    }),
    porcentajeSobreCostos: Yup.string().test("valido", "Debe estar entre 0 y 100", (v) => {
        if (!v) return true;
        const n = Number(v.replace(",", "."));
        return !isNaN(n) && n >= 0 && n <= 100;
    }),
    notas: Yup.string().max(500, "Máximo 500 caracteres"),
});

/**
 * Formulario de creación de receta. El envío se delega al hook `useReceta`,
 * que despacha el thunk correspondiente — la pantalla no realiza llamadas
 * HTTP directamente.
 */
export default function CrearEditarRecetaScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const esEdicion = !!id;

    const { crearReceta } = useReceta();
    const { materiales, findMateriales } = useMaterial();

    const [pasoTexto, setPasoTexto] = useState("");
    const [selectorMaterialVisible, setSelectorMaterialVisible] = useState(false);
    const [selectorUnidadIndex, setSelectorUnidadIndex] = useState<number | null>(null);

    useEffect(() => {
        findMateriales();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = (values: RecetaForm, helpers: FormikHelpers<RecetaForm>) => {
        const costoTotal = values.recetaDetalles.reduce((acc, d) => acc + d.costo, 0);

        const nuevaReceta: RecetaDto = {
            nombre: values.nombre.trim(),
            rendimiento: parseNumero(values.rendimiento),
            tiempoPreparacion: values.tiempoPreparacion ? parseNumero(values.tiempoPreparacion) : undefined,
            porcentajeSobreCostos: values.porcentajeSobreCostos
                ? parseNumero(values.porcentajeSobreCostos)
                : undefined,
            notas: values.notas.trim() || undefined,
            costoTotal,
            instrucciones: values.instrucciones,
            recetaDetalles: values.recetaDetalles,
        };

        crearReceta(nuevaReceta);
        helpers.setSubmitting(false);
        router.back();
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-white"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ModalHeader
                title={esEdicion ? "Editar receta" : "Nueva receta"}
                onClose={() => router.back()}
            />

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
                }) => {
                    const costoTotal = values.recetaDetalles.reduce((acc, d) => acc + d.costo, 0);

                    const agregarPaso = () => {
                        const texto = pasoTexto.trim();
                        if (!texto) return;
                        setFieldValue("instrucciones", [...values.instrucciones, texto]);
                        setPasoTexto("");
                    };

                    const quitarPaso = (index: number) => {
                        setFieldValue(
                            "instrucciones",
                            values.instrucciones.filter((_, i) => i !== index)
                        );
                    };

                    const agregarMaterial = (material: MaterialDto) => {
                        const nuevoDetalle: RecetaDetalleDto = {
                            materialId: material.id!,
                            nombreMaterial: material.nombre,
                            cantidad: 0,
                            unidadMedida: material.unidad,
                            costo: 0,
                        };
                        setFieldValue("recetaDetalles", [...values.recetaDetalles, nuevoDetalle]);
                    };

                    const actualizarDetalle = (index: number, cambios: Partial<RecetaDetalleDto>) => {
                        const detalles = values.recetaDetalles.map((d, i) =>
                            i === index ? { ...d, ...cambios } : d
                        );
                        setFieldValue("recetaDetalles", detalles);
                    };

                    const quitarDetalle = (index: number) => {
                        setFieldValue(
                            "recetaDetalles",
                            values.recetaDetalles.filter((_, i) => i !== index)
                        );
                    };

                    return (
                        <ScrollView className="px-4 pt-6" contentContainerStyle={{ paddingBottom: 24 }}>
                            <Text className="text-sm font-medium text-[#1C1B1F] mb-1">
                                Nombre de la receta
                            </Text>
                            <TextInput
                                className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                    touched.nombre && errors.nombre ? "border-[#B3261E]" : "border-[#E7E0EC]"
                                }`}
                                placeholder="Ej. Capuchino"
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

                            <View className="flex-row gap-3">
                                <View className="flex-1">
                                    <Text className="text-sm font-medium text-[#1C1B1F] mb-1">
                                        Rendimiento
                                    </Text>
                                    <TextInput
                                        className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                            touched.rendimiento && errors.rendimiento
                                                ? "border-[#B3261E]"
                                                : "border-[#E7E0EC]"
                                        }`}
                                        placeholder="Ej. 1"
                                        placeholderTextColor="#79747E"
                                        keyboardType="decimal-pad"
                                        value={values.rendimiento}
                                        onChangeText={handleChange("rendimiento")}
                                        onBlur={handleBlur("rendimiento")}
                                    />
                                    {touched.rendimiento && errors.rendimiento ? (
                                        <Text className="text-[#B3261E] text-xs mb-2">{errors.rendimiento}</Text>
                                    ) : (
                                        <View className="mb-2" />
                                    )}
                                </View>

                                <View className="flex-1">
                                    <Text className="text-sm font-medium text-[#1C1B1F] mb-1">
                                        Tiempo de preparación (min)
                                    </Text>
                                    <TextInput
                                        className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                            touched.tiempoPreparacion && errors.tiempoPreparacion
                                                ? "border-[#B3261E]"
                                                : "border-[#E7E0EC]"
                                        }`}
                                        placeholder="Ej. 10"
                                        placeholderTextColor="#79747E"
                                        keyboardType="number-pad"
                                        value={values.tiempoPreparacion}
                                        onChangeText={handleChange("tiempoPreparacion")}
                                        onBlur={handleBlur("tiempoPreparacion")}
                                    />
                                    {touched.tiempoPreparacion && errors.tiempoPreparacion ? (
                                        <Text className="text-[#B3261E] text-xs mb-2">
                                            {errors.tiempoPreparacion}
                                        </Text>
                                    ) : (
                                        <View className="mb-2" />
                                    )}
                                </View>
                            </View>

                            <Text className="text-sm font-medium text-[#1C1B1F] mb-1">
                                Porcentaje sobre costos (%)
                            </Text>
                            <TextInput
                                className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                    touched.porcentajeSobreCostos && errors.porcentajeSobreCostos
                                        ? "border-[#B3261E]"
                                        : "border-[#E7E0EC]"
                                }`}
                                placeholder="Ej. 60"
                                placeholderTextColor="#79747E"
                                keyboardType="decimal-pad"
                                value={values.porcentajeSobreCostos}
                                onChangeText={handleChange("porcentajeSobreCostos")}
                                onBlur={handleBlur("porcentajeSobreCostos")}
                            />
                            {touched.porcentajeSobreCostos && errors.porcentajeSobreCostos ? (
                                <Text className="text-[#B3261E] text-xs mb-2">
                                    {errors.porcentajeSobreCostos}
                                </Text>
                            ) : (
                                <View className="mb-2" />
                            )}

                            <Text className="text-sm font-medium text-[#1C1B1F] mb-1">Notas</Text>
                            <TextInput
                                className={`border rounded-xl px-4 py-3 text-base text-[#1C1B1F] mb-1 ${
                                    touched.notas && errors.notas ? "border-[#B3261E]" : "border-[#E7E0EC]"
                                }`}
                                placeholder="Notas adicionales (opcional)"
                                placeholderTextColor="#79747E"
                                multiline
                                numberOfLines={3}
                                value={values.notas}
                                onChangeText={handleChange("notas")}
                                onBlur={handleBlur("notas")}
                            />
                            {touched.notas && errors.notas ? (
                                <Text className="text-[#B3261E] text-xs mb-2">{errors.notas}</Text>
                            ) : (
                                <View className="mb-2" />
                            )}

                            {/* Instrucciones */}
                            <Text className="text-sm font-medium text-[#1C1B1F] mb-1 mt-2">
                                Instrucciones
                            </Text>
                            <View className="gap-2 mb-2">
                                {values.instrucciones.map((paso, index) => (
                                    <View
                                        key={index}
                                        className="flex-row items-center justify-between border border-[#E7E0EC] rounded-xl px-4 py-3"
                                    >
                                        <Text className="flex-1 text-sm text-[#1C1B1F] pr-2">
                                            {index + 1}. {paso}
                                        </Text>
                                        <Pressable onPress={() => quitarPaso(index)} hitSlop={8}>
                                            <Ionicons name="close" size={18} color="#B3261E" />
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                            <View className="flex-row gap-2 mb-2">
                                <TextInput
                                    className="flex-1 border border-[#E7E0EC] rounded-xl px-4 py-3 text-base text-[#1C1B1F]"
                                    placeholder="Ej. Vaporizar la leche"
                                    placeholderTextColor="#79747E"
                                    value={pasoTexto}
                                    onChangeText={setPasoTexto}
                                    onSubmitEditing={agregarPaso}
                                />
                                <Pressable
                                    onPress={agregarPaso}
                                    className="w-12 h-12 rounded-xl bg-[#1857B6] items-center justify-center"
                                >
                                    <Ionicons name="add" size={20} color="#FFFFFF" />
                                </Pressable>
                            </View>

                            {/* Detalles (materiales) */}
                            <Text className="text-sm font-medium text-[#1C1B1F] mb-1 mt-2">
                                Materiales
                            </Text>
                            <View className="gap-3 mb-2">
                                {values.recetaDetalles.map((detalle, index) => (
                                    <View
                                        key={index}
                                        className="border border-[#E7E0EC] rounded-xl p-3"
                                    >
                                        <View className="flex-row items-center justify-between mb-2">
                                            <Text className="text-sm font-semibold text-[#1C1B1F]">
                                                {detalle.nombreMaterial}
                                            </Text>
                                            <Pressable onPress={() => quitarDetalle(index)} hitSlop={8}>
                                                <Ionicons name="trash" size={16} color="#B3261E" />
                                            </Pressable>
                                        </View>
                                        <View className="flex-row gap-2">
                                            <TextInput
                                                className="flex-1 border border-[#E7E0EC] rounded-xl px-3 py-2 text-sm text-[#1C1B1F]"
                                                placeholder="Cantidad"
                                                placeholderTextColor="#79747E"
                                                keyboardType="decimal-pad"
                                                value={detalle.cantidad ? String(detalle.cantidad) : ""}
                                                onChangeText={(t) =>
                                                    actualizarDetalle(index, { cantidad: parseNumero(t) })
                                                }
                                            />
                                            <Pressable
                                                onPress={() => setSelectorUnidadIndex(index)}
                                                className="flex-1 border border-[#E7E0EC] rounded-xl px-3 py-2 justify-center"
                                            >
                                                <Text className="text-sm text-[#1C1B1F]" numberOfLines={1}>
                                                    {UNIDAD_MEDIDA_LABELS[detalle.unidadMedida]}
                                                </Text>
                                            </Pressable>
                                            <TextInput
                                                className="flex-1 border border-[#E7E0EC] rounded-xl px-3 py-2 text-sm text-[#1C1B1F]"
                                                placeholder="Costo"
                                                placeholderTextColor="#79747E"
                                                keyboardType="decimal-pad"
                                                value={detalle.costo ? String(detalle.costo) : ""}
                                                onChangeText={(t) =>
                                                    actualizarDetalle(index, { costo: parseNumero(t) })
                                                }
                                            />
                                        </View>
                                    </View>
                                ))}
                            </View>
                            <Pressable
                                onPress={() => setSelectorMaterialVisible(true)}
                                className="flex-row items-center justify-center gap-1.5 border border-dashed border-[#1857B6] rounded-xl py-3 mb-2"
                            >
                                <Ionicons name="add" size={18} color="#1857B6" />
                                <Text className="text-sm font-medium text-[#1857B6]">Agregar material</Text>
                            </Pressable>

                            {/* Resumen de costo */}
                            <View className="bg-[#F1EEF4] rounded-xl px-4 py-3 mt-4 flex-row items-center justify-between">
                                <Text className="text-sm font-medium text-[#1C1B1F]">Costo total</Text>
                                <Text className="text-base font-semibold text-[#1857B6]">
                                    {costoTotal.toLocaleString("es-MX", {
                                        style: "currency",
                                        currency: "MXN",
                                        minimumFractionDigits: 2,
                                    })}
                                </Text>
                            </View>

                            <Pressable
                                onPress={() => formikSubmit()}
                                disabled={isSubmitting}
                                className={`rounded-xl py-4 items-center mt-4 ${
                                    isSubmitting ? "bg-[#9EB7DE]" : "bg-[#1857B6]"
                                }`}
                            >
                                <Text className="text-white text-base font-semibold">
                                    {isSubmitting ? "Guardando..." : "Crear receta"}
                                </Text>
                            </Pressable>

                            <MaterialSelector
                                visible={selectorMaterialVisible}
                                materiales={materiales}
                                onSelect={agregarMaterial}
                                onClose={() => setSelectorMaterialVisible(false)}
                            />

                            <UnidadMedidaSelector
                                visible={selectorUnidadIndex !== null}
                                value={
                                    selectorUnidadIndex !== null
                                        ? values.recetaDetalles[selectorUnidadIndex].unidadMedida
                                        : ""
                                }
                                onChange={(u: UnidadMedida) => {
                                    if (selectorUnidadIndex !== null) {
                                        actualizarDetalle(selectorUnidadIndex, { unidadMedida: u });
                                    }
                                }}
                                onClose={() => setSelectorUnidadIndex(null)}
                            />
                        </ScrollView>
                    );
                }}
            </Formik>
        </KeyboardAvoidingView>
    );
}