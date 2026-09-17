import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Formik, FieldArray, FormikHelpers } from "formik";
import { useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as Yup from "yup";

/**
 * CrearEditarRecetaScreen — Formulario único reutilizado para crear y editar
 * una receta. El modo se determina por el param `id` de la ruta:
 *   /recetas/crear          -> modo crear
 *   /recetas/[id]/editar    -> modo editar (precarga datos)
 *
 * `precioVenta` y `porcentajeGananciaEsperado` están conectados: editar uno
 * recalcula el otro en función del costo de materiales + el % adicional
 * sobre costos. Ver `handleChangePorcentajeGanancia` / `handleChangePrecioVenta`.
 *
 * UI autocontenida con datos mock y estado local. NO está conectada a
 * Redux/use cases reales — cada punto de integración está marcado con
 * // TODO.
 */

// =====================================================================
// Tipos, enums y datos mock — TODO: reemplazar por los reales del dominio
// =====================================================================

enum UnidadMedida {
    PZ = "pz",
    OZ = "oz",
    ML = "ml",
    L = "l",
    G = "g",
    KG = "kg",
    LB = "lb",
}

const UNIDAD_LABELS: Record<UnidadMedida, string> = {
    [UnidadMedida.PZ]: "pz",
    [UnidadMedida.OZ]: "oz",
    [UnidadMedida.ML]: "ml",
    [UnidadMedida.L]: "l",
    [UnidadMedida.G]: "g",
    [UnidadMedida.KG]: "kg",
    [UnidadMedida.LB]: "lb",
};

const UNIDADES: UnidadMedida[] = [
    UnidadMedida.PZ,
    UnidadMedida.OZ,
    UnidadMedida.ML,
    UnidadMedida.L,
    UnidadMedida.G,
    UnidadMedida.KG,
    UnidadMedida.LB,
];

// Catálogo de materiales disponibles para agregar a la receta.
// TODO: reemplazar por el query use case / selector real de materiales/insumos.
interface MaterialDisponible {
    id: number;
    nombre: string;
    costoUnitario: number; // costo por 1 unidad de `unidadBase`
    unidadBase: UnidadMedida;
}

const MATERIALES_DISPONIBLES: MaterialDisponible[] = [
    { id: 1, nombre: "Café en grano", costoUnitario: 0.45, unidadBase: UnidadMedida.G },
    { id: 2, nombre: "Leche entera", costoUnitario: 0.02, unidadBase: UnidadMedida.ML },
    { id: 3, nombre: "Jarabe de vainilla", costoUnitario: 0.08, unidadBase: UnidadMedida.ML },
    { id: 4, nombre: "Vaso desechable 16oz", costoUnitario: 1.5, unidadBase: UnidadMedida.PZ },
    { id: 5, nombre: "Chocolate en polvo", costoUnitario: 0.35, unidadBase: UnidadMedida.G },
    { id: 6, nombre: "Crema batida", costoUnitario: 0.06, unidadBase: UnidadMedida.ML },
    { id: 7, nombre: "Azúcar", costoUnitario: 0.015, unidadBase: UnidadMedida.G },
];

interface MaterialItemForm {
    materialId: number;
    nombre: string;
    cantidad: string;
    unidadMedida: UnidadMedida | "";
    costoUnitario: number;
}

interface RecetaForm {
    nombre: string;
    materiales: MaterialItemForm[];
    unidadesQueRinde: string;
    porcentajeAdicionalCostos: string;
    porcentajeGananciaEsperado: string;
    precioVenta: string;
    instrucciones: string;
}

// TODO: reemplazar por el query use case real "obtenerRecetaPorId".
// Este mock solo simula una receta existente cuando id === "1", para poder
// probar el modo edición sin backend.
const RECETA_MOCK_DETALLE: Record<string, RecetaForm> = {
    "1": {
        nombre: "Café americano",
        materiales: [
            { materialId: 1, nombre: "Café en grano", cantidad: "18", unidadMedida: UnidadMedida.G, costoUnitario: 0.45 },
            { materialId: 4, nombre: "Vaso desechable 16oz", cantidad: "1", unidadMedida: UnidadMedida.PZ, costoUnitario: 1.5 },
        ],
        unidadesQueRinde: "1",
        porcentajeAdicionalCostos: "10",
        porcentajeGananciaEsperado: "65",
        precioVenta: "17.42",
        instrucciones: "Moler 18g de café, extraer con la máquina de espresso y diluir con agua caliente.",
    },
};

function formatMoney(value: number): string {
    return value.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN",
        minimumFractionDigits: 2,
    });
}

function parseNumero(texto: string): number {
    const n = Number(texto.replace(",", "."));
    return isNaN(n) ? 0 : n;
}

const initialValuesVacio: RecetaForm = {
    nombre: "",
    materiales: [],
    unidadesQueRinde: "1",
    porcentajeAdicionalCostos: "",
    porcentajeGananciaEsperado: "",
    precioVenta: "",
    instrucciones: "",
};

const validationSchema = Yup.object({
    nombre: Yup.string()
        .trim()
        .required("El nombre de la receta es obligatorio")
        .min(3, "Debe tener al menos 3 caracteres")
        .max(100, "No puede superar los 100 caracteres"),

    materiales: Yup.array()
        .of(
            Yup.object({
                cantidad: Yup.string()
                    .required("Cantidad obligatoria")
                    .test("valido", "Debe ser mayor que 0", (v) => {
                        if (!v) return false;
                        const n = Number(v.replace(",", "."));
                        return !isNaN(n) && n > 0;
                    }),
                unidadMedida: Yup.string().required("Selecciona una unidad"),
            })
        )
        .min(1, "Agrega al menos un material a la receta"),

    unidadesQueRinde: Yup.string()
        .required("Indica cuántas unidades rinde la receta")
        .test("valido", "Debe ser mayor que 0", (v) => {
            if (!v) return false;
            const n = Number(v.replace(",", "."));
            return !isNaN(n) && n > 0;
        }),

    porcentajeAdicionalCostos: Yup.string()
        .required("Indica el porcentaje adicional sobre costos")
        .test("valido", "Debe ser 0 o mayor", (v) => {
            if (v === undefined) return false;
            const n = Number(v.replace(",", "."));
            return !isNaN(n) && n >= 0;
        }),

    porcentajeGananciaEsperado: Yup.string()
        .required("Indica el porcentaje de ganancia esperado")
        .test("valido", "Debe ser 0 o mayor", (v) => {
            if (v === undefined) return false;
            const n = Number(v.replace(",", "."));
            return !isNaN(n) && n >= 0;
        }),

    precioVenta: Yup.string()
        .required("Indica el precio de venta")
        .test("valido", "Debe ser mayor que 0", (v) => {
            if (!v) return false;
            const n = Number(v.replace(",", "."));
            return !isNaN(n) && n > 0;
        }),

    instrucciones: Yup.string().max(2000, "Máximo 2000 caracteres"),
});

export default function CrearEditarRecetaScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const esEdicion = !!id;

    // TODO: si es edición, reemplazar por fetch real (thunk/query use case)
    // en vez de leer directo del mock. Idealmente con su propio loading/error.
    const initialValues: RecetaForm = useMemo(() => {
        if (id && RECETA_MOCK_DETALLE[id]) {
            return RECETA_MOCK_DETALLE[id];
        }
        return initialValuesVacio;
    }, [id]);

    const [selectorMaterialVisible, setSelectorMaterialVisible] = useState(false);
    const [unidadModal, setUnidadModal] = useState<{ visible: boolean; index: number | null }>({
        visible: false,
        index: null,
    });

    const handleSubmit = (values: RecetaForm, helpers: FormikHelpers<RecetaForm>) => {
        const payload = {
            nombre: values.nombre.trim(),
            unidadesQueRinde: parseNumero(values.unidadesQueRinde),
            porcentajeAdicionalCostos: parseNumero(values.porcentajeAdicionalCostos),
            porcentajeGananciaEsperado: parseNumero(values.porcentajeGananciaEsperado),
            precioVenta: parseNumero(values.precioVenta),
            instrucciones: values.instrucciones.trim() || null,
            materiales: values.materiales.map((m) => ({
                materialId: m.materialId,
                cantidad: parseNumero(m.cantidad),
                unidadMedida: m.unidadMedida,
            })),
        };

        // TODO: implementar el envío real:
        // if (esEdicion) dispatch(actualizarRecetaThunk({ id, ...payload }));
        // else dispatch(crearRecetaThunk(payload));
        // manejar loading/error y refrescar el panel al volver.

        helpers.setSubmitting(false);
        router.back();
    };

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View className="flex-1 bg-white px-4 pt-6">
                <Text className="text-2xl font-bold text-gray-900 mb-6">
                    {esEdicion ? "Editar receta" : "Nueva receta"}
                </Text>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        setFieldValue,
                        handleSubmit: formikSubmit,
                        isSubmitting,
                    }) => {
                        const costoTotalMateriales = values.materiales.reduce((acc, m) => {
                            const cantidad = parseNumero(m.cantidad);
                            return acc + cantidad * m.costoUnitario;
                        }, 0);

                        const porcentajeAdicional = parseNumero(values.porcentajeAdicionalCostos);
                        // Base sobre la que se calcula el % de ganancia y el precio de venta:
                        // costo de materiales + el % adicional sobre costos.
                        const costoBase = costoTotalMateriales * (1 + porcentajeAdicional / 100);
                        const hayCostoBase = costoBase > 0;

                        // --- Campos conectados: precio de venta <-> % de ganancia ---
                        // Editar el % de ganancia recalcula el precio de venta.
                        const handleChangePorcentajeGanancia = (texto: string) => {
                            setFieldValue("porcentajeGananciaEsperado", texto);
                            if (!hayCostoBase) return; // sin materiales aún no hay base para calcular
                            const porcentaje = parseNumero(texto);
                            const nuevoPrecio = costoBase * (1 + porcentaje / 100);
                            setFieldValue("precioVenta", nuevoPrecio.toFixed(2));
                        };

                        // Editar el precio de venta recalcula el % de ganancia.
                        const handleChangePrecioVenta = (texto: string) => {
                            setFieldValue("precioVenta", texto);
                            if (!hayCostoBase) return;
                            const precio = parseNumero(texto);
                            const nuevoPorcentaje = (precio / costoBase - 1) * 100;
                            setFieldValue("porcentajeGananciaEsperado", nuevoPorcentaje.toFixed(2));
                        };

                        return (
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 40 }}
                            >
                                {/* Nombre de la receta */}
                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    Nombre de la receta
                                </Text>
                                <TextInput
                                    className={`border rounded-xl px-4 py-3 text-base text-gray-900 mb-1 ${
                                        touched.nombre && errors.nombre ? "border-red-500" : "border-gray-300"
                                    }`}
                                    placeholder="Ej. Latte vainilla"
                                    placeholderTextColor="#9CA3AF"
                                    value={values.nombre}
                                    onChangeText={handleChange("nombre")}
                                    onBlur={handleBlur("nombre")}
                                />
                                {touched.nombre && errors.nombre ? (
                                    <Text className="text-red-500 text-xs mb-2">{errors.nombre}</Text>
                                ) : (
                                    <View className="mb-2" />
                                )}

                                {/* Materiales */}
                                <FieldArray name="materiales">
                                    {(arrayHelpers) => (
                                        <View className="mt-4">
                                            <View className="flex-row items-center justify-between mb-2">
                                                <Text className="text-base font-semibold text-gray-900">
                                                    Materiales
                                                </Text>
                                                <Pressable
                                                    onPress={() => setSelectorMaterialVisible(true)}
                                                    className="flex-row items-center gap-1 bg-blue-50 rounded-full px-3 py-1.5"
                                                >
                                                    <Ionicons name="add" size={16} color="#2563EB" />
                                                    <Text className="text-xs font-medium text-blue-600">
                                                        Agregar material
                                                    </Text>
                                                </Pressable>
                                            </View>

                                            {typeof errors.materiales === "string" && (
                                                <Text className="text-red-500 text-xs mb-2">{errors.materiales}</Text>
                                            )}

                                            {values.materiales.length === 0 ? (
                                                <View className="border border-dashed border-gray-300 rounded-xl py-6 items-center mb-2">
                                                    <Text className="text-sm text-gray-400">
                                                        Aún no has agregado materiales.
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View className="gap-2 mb-2">
                                                    {values.materiales.map((material, index) => {
                                                        const cantidadNum = parseNumero(material.cantidad);
                                                        const costoTotal = cantidadNum * material.costoUnitario;

                                                        const errorItem = Array.isArray(errors.materiales)
                                                            ? (errors.materiales[index] as any)
                                                            : undefined;
                                                        const touchedItem = Array.isArray(touched.materiales)
                                                            ? (touched.materiales[index] as any)
                                                            : undefined;

                                                        return (
                                                            <View
                                                                key={`${material.materialId}-${index}`}
                                                                className="border border-gray-200 rounded-xl p-3"
                                                            >
                                                                <View className="flex-row items-center justify-between mb-2">
                                                                    <Text
                                                                        className="text-sm font-medium text-gray-900 flex-1 pr-2"
                                                                        numberOfLines={1}
                                                                    >
                                                                        {material.nombre}
                                                                    </Text>
                                                                    <Pressable
                                                                        onPress={() => arrayHelpers.remove(index)}
                                                                        hitSlop={8}
                                                                    >
                                                                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                                                    </Pressable>
                                                                </View>

                                                                <View className="flex-row items-center gap-2">
                                                                    {/* Cantidad */}
                                                                    <View className="flex-1">
                                                                        <TextInput
                                                                            className={`border rounded-lg px-3 py-2 text-sm text-gray-900 ${
                                                                                touchedItem?.cantidad && errorItem?.cantidad
                                                                                    ? "border-red-500"
                                                                                    : "border-gray-300"
                                                                            }`}
                                                                            placeholder="Cantidad"
                                                                            placeholderTextColor="#9CA3AF"
                                                                            keyboardType="decimal-pad"
                                                                            value={material.cantidad}
                                                                            onChangeText={handleChange(
                                                                                `materiales.${index}.cantidad`
                                                                            )}
                                                                            onBlur={handleBlur(
                                                                                `materiales.${index}.cantidad`
                                                                            )}
                                                                        />
                                                                    </View>

                                                                    {/* Unidad de medida */}
                                                                    <Pressable
                                                                        onPress={() =>
                                                                            setUnidadModal({ visible: true, index })
                                                                        }
                                                                        className="border border-gray-300 rounded-lg px-3 py-2 flex-row items-center gap-1"
                                                                    >
                                                                        <Text className="text-sm text-gray-900">
                                                                            {material.unidadMedida
                                                                                ? UNIDAD_LABELS[material.unidadMedida as UnidadMedida]
                                                                                : "Unidad"}
                                                                        </Text>
                                                                        <Ionicons name="chevron-down" size={14} color="#79747E" />
                                                                    </Pressable>

                                                                    {/* Costo total del material */}
                                                                    <Text className="text-sm font-semibold text-gray-900 min-w-[72px] text-right">
                                                                        {formatMoney(costoTotal)}
                                                                    </Text>
                                                                </View>

                                                                {touchedItem?.cantidad && errorItem?.cantidad ? (
                                                                    <Text className="text-red-500 text-xs mt-1">
                                                                        {errorItem.cantidad}
                                                                    </Text>
                                                                ) : null}
                                                                {touchedItem?.unidadMedida && errorItem?.unidadMedida ? (
                                                                    <Text className="text-red-500 text-xs mt-1">
                                                                        {errorItem.unidadMedida}
                                                                    </Text>
                                                                ) : null}
                                                            </View>
                                                        );
                                                    })}
                                                </View>
                                            )}

                                            {values.materiales.length > 0 && (
                                                <View className="flex-row items-center justify-between px-1 mb-4">
                                                    <Text className="text-xs font-medium text-gray-500">
                                                        Costo total de materiales
                                                    </Text>
                                                    <Text className="text-sm font-bold text-gray-900">
                                                        {formatMoney(costoTotalMateriales)}
                                                    </Text>
                                                </View>
                                            )}

                                            {/* Modal: seleccionar material a agregar */}
                                            <Modal
                                                visible={selectorMaterialVisible}
                                                transparent
                                                animationType="fade"
                                                onRequestClose={() => setSelectorMaterialVisible(false)}
                                            >
                                                <Pressable
                                                    className="flex-1 bg-black/40 justify-end"
                                                    onPress={() => setSelectorMaterialVisible(false)}
                                                >
                                                    <View className="bg-white rounded-t-2xl p-4 max-h-[70%]">
                                                        <Text className="text-base font-semibold text-gray-900 mb-2">
                                                            Selecciona un material
                                                        </Text>
                                                        <FlatList
                                                            data={MATERIALES_DISPONIBLES}
                                                            keyExtractor={(item) => String(item.id)}
                                                            renderItem={({ item }) => (
                                                                <Pressable
                                                                    className="py-3 border-b border-gray-100 flex-row items-center justify-between"
                                                                    onPress={() => {
                                                                        arrayHelpers.push({
                                                                            materialId: item.id,
                                                                            nombre: item.nombre,
                                                                            cantidad: "1",
                                                                            unidadMedida: item.unidadBase,
                                                                            costoUnitario: item.costoUnitario,
                                                                        } as MaterialItemForm);
                                                                        setSelectorMaterialVisible(false);
                                                                    }}
                                                                >
                                                                    <Text className="text-base text-gray-900">
                                                                        {item.nombre}
                                                                    </Text>
                                                                    <Text className="text-xs text-gray-400">
                                                                        {formatMoney(item.costoUnitario)}/
                                                                        {UNIDAD_LABELS[item.unidadBase]}
                                                                    </Text>
                                                                </Pressable>
                                                            )}
                                                        />
                                                    </View>
                                                </Pressable>
                                            </Modal>

                                            {/* Modal: seleccionar unidad de medida de un material */}
                                            <Modal
                                                visible={unidadModal.visible}
                                                transparent
                                                animationType="fade"
                                                onRequestClose={() => setUnidadModal({ visible: false, index: null })}
                                            >
                                                <Pressable
                                                    className="flex-1 bg-black/40 justify-end"
                                                    onPress={() => setUnidadModal({ visible: false, index: null })}
                                                >
                                                    <View className="bg-white rounded-t-2xl p-4">
                                                        <Text className="text-base font-semibold text-gray-900 mb-2">
                                                            Unidad de medida
                                                        </Text>
                                                        {UNIDADES.map((u) => (
                                                            <Pressable
                                                                key={u}
                                                                className="py-3 border-b border-gray-100"
                                                                onPress={() => {
                                                                    if (unidadModal.index !== null) {
                                                                        setFieldValue(
                                                                            `materiales.${unidadModal.index}.unidadMedida`,
                                                                            u
                                                                        );
                                                                    }
                                                                    setUnidadModal({ visible: false, index: null });
                                                                }}
                                                            >
                                                                <Text className="text-base text-gray-900">
                                                                    {UNIDAD_LABELS[u]}
                                                                </Text>
                                                            </Pressable>
                                                        ))}
                                                    </View>
                                                </Pressable>
                                            </Modal>
                                        </View>
                                    )}
                                </FieldArray>

                                {/* Rendimiento y porcentajes */}
                                <Text className="text-base font-semibold text-gray-900 mb-2 mt-2">
                                    Rendimiento y costos
                                </Text>

                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    Unidades que rinde la receta
                                </Text>
                                <TextInput
                                    className={`border rounded-xl px-4 py-3 text-base text-gray-900 mb-1 ${
                                        touched.unidadesQueRinde && errors.unidadesQueRinde
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Ej. 1"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="decimal-pad"
                                    value={values.unidadesQueRinde}
                                    onChangeText={handleChange("unidadesQueRinde")}
                                    onBlur={handleBlur("unidadesQueRinde")}
                                />
                                {touched.unidadesQueRinde && errors.unidadesQueRinde ? (
                                    <Text className="text-red-500 text-xs mb-2">{errors.unidadesQueRinde}</Text>
                                ) : (
                                    <View className="mb-2" />
                                )}

                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    Porcentaje adicional sobre costos
                                </Text>
                                <TextInput
                                    className={`border rounded-xl px-4 py-3 text-base text-gray-900 mb-1 ${
                                        touched.porcentajeAdicionalCostos && errors.porcentajeAdicionalCostos
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Ej. 10"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="decimal-pad"
                                    value={values.porcentajeAdicionalCostos}
                                    onChangeText={handleChange("porcentajeAdicionalCostos")}
                                    onBlur={handleBlur("porcentajeAdicionalCostos")}
                                />
                                {touched.porcentajeAdicionalCostos && errors.porcentajeAdicionalCostos ? (
                                    <Text className="text-red-500 text-xs mb-2">
                                        {errors.porcentajeAdicionalCostos}
                                    </Text>
                                ) : (
                                    <View className="mb-2" />
                                )}

                                {!hayCostoBase && (
                                    <Text className="text-xs text-amber-600 mb-2">
                                        Agrega materiales para poder calcular precio ↔ % de ganancia automáticamente.
                                    </Text>
                                )}

                                {/* Precio de venta <-> % de ganancia — conectados */}
                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <Text className="text-sm font-medium text-gray-700 mb-1">
                                            Precio de venta
                                        </Text>
                                        <TextInput
                                            className={`border rounded-xl px-4 py-3 text-base text-gray-900 mb-1 ${
                                                touched.precioVenta && errors.precioVenta
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="Ej. 17.42"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="decimal-pad"
                                            value={values.precioVenta}
                                            onChangeText={handleChangePrecioVenta}
                                            onBlur={handleBlur("precioVenta")}
                                        />
                                        {touched.precioVenta && errors.precioVenta ? (
                                            <Text className="text-red-500 text-xs mb-2">{errors.precioVenta}</Text>
                                        ) : (
                                            <View className="mb-2" />
                                        )}
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-sm font-medium text-gray-700 mb-1">
                                            % de ganancia
                                        </Text>
                                        <TextInput
                                            className={`border rounded-xl px-4 py-3 text-base text-gray-900 mb-1 ${
                                                touched.porcentajeGananciaEsperado && errors.porcentajeGananciaEsperado
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder="Ej. 65"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="decimal-pad"
                                            value={values.porcentajeGananciaEsperado}
                                            onChangeText={handleChangePorcentajeGanancia}
                                            onBlur={handleBlur("porcentajeGananciaEsperado")}
                                        />
                                        {touched.porcentajeGananciaEsperado && errors.porcentajeGananciaEsperado ? (
                                            <Text className="text-red-500 text-xs mb-2">
                                                {errors.porcentajeGananciaEsperado}
                                            </Text>
                                        ) : (
                                            <View className="mb-2" />
                                        )}
                                    </View>
                                </View>
                                <Text className="text-xs text-gray-400 -mt-1 mb-3">
                                    Estos dos campos están conectados: cambiar uno recalcula el otro
                                    tomando como base el costo de materiales + el % adicional.
                                </Text>

                                {/* Resumen calculado — informativo */}
                                {values.materiales.length > 0 && (
                                    <View className="bg-gray-50 rounded-xl p-3 mb-4">
                                        <View className="flex-row items-center justify-between py-0.5">
                                            <Text className="text-xs text-gray-500">Costo materiales</Text>
                                            <Text className="text-xs text-gray-900">
                                                {formatMoney(costoTotalMateriales)}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center justify-between py-0.5">
                                            <Text className="text-xs text-gray-500">
                                                + {porcentajeAdicional}% adicional
                                            </Text>
                                            <Text className="text-xs text-gray-900">{formatMoney(costoBase)}</Text>
                                        </View>
                                    </View>
                                )}

                                {/* Instrucciones (opcional) */}
                                <Text className="text-sm font-medium text-gray-700 mb-1">
                                    Instrucciones (opcional)
                                </Text>
                                <TextInput
                                    className={`border rounded-xl px-4 py-3 text-base text-gray-900 mb-1 ${
                                        touched.instrucciones && errors.instrucciones
                                            ? "border-red-500"
                                            : "border-gray-300"
                                    }`}
                                    placeholder="Describe la preparación paso a paso..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                    style={{ minHeight: 120 }}
                                    value={values.instrucciones}
                                    onChangeText={handleChange("instrucciones")}
                                    onBlur={handleBlur("instrucciones")}
                                />
                                {touched.instrucciones && errors.instrucciones ? (
                                    <Text className="text-red-500 text-xs mb-2">{errors.instrucciones}</Text>
                                ) : (
                                    <View className="mb-2" />
                                )}

                                {/* Botón submit */}
                                <Pressable
                                    onPress={() => formikSubmit()}
                                    disabled={isSubmitting}
                                    className={`rounded-xl py-4 items-center mt-4 ${
                                        isSubmitting ? "bg-blue-300" : "bg-blue-600"
                                    }`}
                                >
                                    <Text className="text-white text-base font-semibold">
                                        {isSubmitting
                                            ? "Guardando..."
                                            : esEdicion
                                              ? "Guardar cambios"
                                              : "Crear receta"}
                                    </Text>
                                </Pressable>
                            </ScrollView>
                        );
                    }}
                </Formik>
            </View>
        </KeyboardAvoidingView>
    );
}