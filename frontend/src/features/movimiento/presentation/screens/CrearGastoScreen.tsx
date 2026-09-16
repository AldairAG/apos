import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Modal, FlatList } from "react-native";
import { Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { CategoriaMovimiento } from "../../domain/enum/CategoriaMovimiento";
import { useUsuario } from "@/features/usuario/usuario/hook/useUsuario";
import { useMovimientos } from "../hook/useMovimientos";
import { dateStringToLocateDateTime } from "@/helpers/TimeHelpers";
import { useLocalSearchParams, usePathname } from "expo-router";
import useCaja from "@/features/caja/presentation/hook/useCaja";


const CATEGORIA_LABELS: Partial<Record<CategoriaMovimiento, string>> = {
  [CategoriaMovimiento.SERVICIOS]: "Servicios",
  [CategoriaMovimiento.NOMINA]: "Nómina",
  [CategoriaMovimiento.RENTA]: "Renta",
  [CategoriaMovimiento.EQUIPO]: "Otro gasto",
  [CategoriaMovimiento.MANTENIMIENTO]: "Mantenimiento",
  [CategoriaMovimiento.PUBLICIDAD]: "Publicidad",
  [CategoriaMovimiento.IMPUESTOS]: "Impuestos",
  [CategoriaMovimiento.OTROS]: "Otros",
  [CategoriaMovimiento.TRANSPORTE]: "Transporte",
};

const CATEGORIAS: CategoriaMovimiento[] = [
  CategoriaMovimiento.SERVICIOS,
  CategoriaMovimiento.NOMINA,
  CategoriaMovimiento.RENTA,
  CategoriaMovimiento.EQUIPO,
  CategoriaMovimiento.MANTENIMIENTO,
  CategoriaMovimiento.PUBLICIDAD,
  CategoriaMovimiento.IMPUESTOS,
  CategoriaMovimiento.OTROS,
  CategoriaMovimiento.TRANSPORTE,
];

interface CrearGastoForm {
  monto: string;
  descripcion: string;
  categoria: CategoriaMovimiento | "";
  fecha: string; // formato ISO "yyyy-MM-dd"
  cuentaId: number | null;
  cajaId: number | null;
}

// --- Helpers de fecha (últimos 4 días: hoy + 3 anteriores) ---

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildQuickDateOptions(): { iso: string; label: string; sublabel: string }[] {
  const hoy = new Date();
  const opciones = [];

  for (let i = 0; i < 4; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);

    const label =
      i === 0
        ? "Hoy"
        : i === 1
          ? "Ayer"
          : fecha.toLocaleDateString("es-MX", { weekday: "short" });

    const sublabel = fecha.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
    });

    opciones.push({ iso: toIsoDate(fecha), label, sublabel });
  }

  return opciones;
}

const todayIso = toIsoDate(new Date());

export default function CrearGastoScreen() {
  const { usuario } = useUsuario();
  const { cajas, cajaSeleccionadaId } = useCaja();
  const { crearEgreso, error, loading } = useMovimientos();
  const [categoriaModalVisible, setCategoriaModalVisible] = useState(false);
  const [cuentaModalVisible, setCuentaModalVisible] = useState(false);
  const [cajaModalVisible, setCajaModalVisible] = useState(false);

  const { modulo } = useLocalSearchParams();

  const esContextoCaja = modulo === "caja";

  // `cajaId` toma por defecto la caja seleccionada actualmente en el hook
  // de Caja. Si esa caja aún no ha cargado (ej. primer render antes de que
  // el hook resuelva), `cajaSeleccionadaId` será null y el campo queda vacío
  // hasta que `enableReinitialize` lo actualice.
  const initialValues: CrearGastoForm = useMemo(
    () => ({
      monto: "",
      descripcion: "",
      categoria: "",
      fecha: todayIso,
      cuentaId: null,
      cajaId: cajaSeleccionadaId ?? null,
    }),
    [cajaSeleccionadaId]
  );

  const validationSchema = useMemo(
    () =>
      Yup.object({
        monto: Yup.string()
          .required("El monto es obligatorio")
          .test("monto-valido", "El monto debe ser mayor que 0", (value) => {
            if (!value) return false;
            const monto = Number(value.replace(",", "."));
            return !isNaN(monto) && monto > 0;
          }),

        descripcion: Yup.string()
          .trim()
          .min(3, "La descripción debe tener al menos 3 caracteres")
          .max(255, "La descripción no puede superar los 255 caracteres"),

        categoria: Yup.string().required("Debes seleccionar una categoría"),

        fecha: Yup.string().required("Debes seleccionar una fecha"),

        cuentaId: esContextoCaja
          ? Yup.number().nullable().notRequired()
          : Yup.number()
              .nullable()
              .typeError("Debes seleccionar una cuenta")
              .required("Debes seleccionar una cuenta"),

        cajaId: esContextoCaja
          ? Yup.number()
              .nullable()
              .typeError("Debes seleccionar una caja")
              .required("Debes seleccionar una caja")
          : Yup.number().nullable().notRequired(),
      }),
    [esContextoCaja]
  );

  const quickDates = useMemo(buildQuickDateOptions, []);

  // TODO: implementar el envío real (armar el payload, castear monto a number,
  // llamar al service/thunk de movimientos con tipo: "GASTO" y manejar
  // loading/errores).
  const handleSubmit = (
    values: CrearGastoForm,
    helpers: FormikHelpers<CrearGastoForm>
  ) => {
    const { monto, descripcion, categoria, fecha, cuentaId, cajaId } = values;
    const payload = {
      monto: Number(monto.replace(",", ".")),
      descripcion,
      categoria,
      fecha: dateStringToLocateDateTime(fecha),
      cuentaId,
      cajaId,
    };
    crearEgreso(payload);
    helpers.setSubmitting(false);
    helpers.resetForm();
    navigation.back();
  };

  return (
    <View className="flex-1 bg-white px-4 pt-6">
      <Text className="text-2xl font-bold text-gray-900 mb-6">
        Registrar gasto
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
          const categoriaLabel = values.categoria
            ? CATEGORIA_LABELS[values.categoria as CategoriaMovimiento]
            : "";

          const cuentaLabel =
            usuario?.empresa?.cuentas.find((c) => c.id === values.cuentaId)?.nombre ?? "";

          const cajaLabel =
            cajas.find((c) => c.id === values.cajaId)?.nombre ?? "";

          return (
            <View className="gap-1">
              {/* Fecha */}
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Fecha
              </Text>
              <View className="flex-row gap-2 mb-1">
                {quickDates.map((opcion) => {
                  const seleccionada = values.fecha === opcion.iso;
                  return (
                    <Pressable
                      key={opcion.iso}
                      onPress={() => setFieldValue("fecha", opcion.iso)}
                      className={`flex-1 rounded-xl py-2 items-center border ${seleccionada
                        ? "bg-red-600 border-red-600"
                        : "bg-white border-gray-300"
                        }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${seleccionada ? "text-white" : "text-gray-700"
                          }`}
                      >
                        {opcion.label}
                      </Text>
                      <Text
                        className={`text-xs ${seleccionada ? "text-red-100" : "text-gray-400"
                          }`}
                      >
                        {opcion.sublabel}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {touched.fecha && errors.fecha ? (
                <Text className="text-red-500 text-xs mb-2">
                  {errors.fecha}
                </Text>
              ) : (
                <View className="mb-2" />
              )}

              {/* Monto */}
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Monto
              </Text>
              <TextInput
                className={`border rounded-xl px-4 py-3 text-base text-gray-900 mb-1 ${touched.monto && errors.monto
                  ? "border-red-500"
                  : "border-gray-300"
                  }`}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                value={values.monto}
                onChangeText={handleChange("monto")}
                onBlur={handleBlur("monto")}
              />
              {touched.monto && errors.monto ? (
                <Text className="text-red-500 text-xs mb-2">
                  {errors.monto}
                </Text>
              ) : (
                <View className="mb-2" />
              )}

              {/* Cuenta / Caja (Select) */}
              {esContextoCaja ? (
                <>
                  {/* Caja (Select) */}
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Caja
                  </Text>
                  <Pressable
                    onPress={() => setCajaModalVisible(true)}
                    className={`border rounded-xl px-4 py-3 mb-1 flex-row items-center justify-between ${touched.cajaId && errors.cajaId
                      ? "border-red-500"
                      : "border-gray-300"
                      }`}
                  >
                    <Text
                      className={`text-base ${cajaLabel ? "text-gray-900" : "text-gray-400"
                        }`}
                    >
                      {cajaLabel || "Selecciona una caja"}
                    </Text>
                    <Text className="text-gray-400">▾</Text>
                  </Pressable>
                  {touched.cajaId && errors.cajaId ? (
                    <Text className="text-red-500 text-xs mb-2">
                      {errors.cajaId}
                    </Text>
                  ) : (
                    <View className="mb-2" />
                  )}
                </>
              ) : (
                <>
                  {/* Cuenta (Select) */}
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Cuenta
                  </Text>
                  <Pressable
                    onPress={() => setCuentaModalVisible(true)}
                    className={`border rounded-xl px-4 py-3 mb-1 flex-row items-center justify-between ${touched.cuentaId && errors.cuentaId
                      ? "border-red-500"
                      : "border-gray-300"
                      }`}
                  >
                    <Text
                      className={`text-base ${cuentaLabel ? "text-gray-900" : "text-gray-400"
                        }`}
                    >
                      {cuentaLabel || "Selecciona una cuenta"}
                    </Text>
                    <Text className="text-gray-400">▾</Text>
                  </Pressable>
                  {touched.cuentaId && errors.cuentaId ? (
                    <Text className="text-red-500 text-xs mb-2">
                      {errors.cuentaId}
                    </Text>
                  ) : (
                    <View className="mb-2" />
                  )}
                </>
              )}

              <Modal
                visible={cuentaModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCuentaModalVisible(false)}
              >
                <Pressable
                  className="flex-1 bg-black/40 justify-end"
                  onPress={() => setCuentaModalVisible(false)}
                >
                  <View className="bg-white rounded-t-2xl p-4">
                    <Text className="text-base font-semibold text-gray-900 mb-2">
                      Selecciona una cuenta
                    </Text>
                    <FlatList
                      data={usuario?.empresa?.cuentas ?? []}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <Pressable
                          className="py-3 border-b border-gray-100"
                          onPress={() => {
                            setFieldValue("cuentaId", item.id);
                            setCuentaModalVisible(false);
                          }}
                        >
                          <Text className="text-base text-gray-900">
                            {item.nombre}
                          </Text>
                        </Pressable>
                      )}
                    />
                  </View>
                </Pressable>
              </Modal>

              <Modal
                visible={cajaModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCajaModalVisible(false)}
              >
                <Pressable
                  className="flex-1 bg-black/40 justify-end"
                  onPress={() => setCajaModalVisible(false)}
                >
                  <View className="bg-white rounded-t-2xl p-4">
                    <Text className="text-base font-semibold text-gray-900 mb-2">
                      Selecciona una caja
                    </Text>
                    <FlatList
                      data={cajas}
                      keyExtractor={(item) => item.id.toString()}
                      renderItem={({ item }) => (
                        <Pressable
                          className="py-3 border-b border-gray-100"
                          onPress={() => {
                            setFieldValue("cajaId", item.id);
                            setCajaModalVisible(false);
                          }}
                        >
                          <Text className="text-base text-gray-900">{item.nombre}</Text>
                        </Pressable>
                      )}
                    />
                  </View>
                </Pressable>
              </Modal>

              {/* Descripción */}
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Descripción
              </Text>
              <TextInput
                className={`border rounded-xl px-4 py-3 text-base text-gray-900 mb-1 ${touched.descripcion && errors.descripcion
                  ? "border-red-500"
                  : "border-gray-300"
                  }`}
                placeholder="Ej. Pago de luz"
                placeholderTextColor="#9CA3AF"
                multiline
                value={values.descripcion}
                onChangeText={handleChange("descripcion")}
                onBlur={handleBlur("descripcion")}
              />
              {touched.descripcion && errors.descripcion ? (
                <Text className="text-red-500 text-xs mb-2">
                  {errors.descripcion}
                </Text>
              ) : (
                <View className="mb-2" />
              )}

              {/* Categoría (Select) */}
              <Text className="text-sm font-medium text-gray-700 mb-1">
                Categoría
              </Text>
              <Pressable
                onPress={() => setCategoriaModalVisible(true)}
                className={`border rounded-xl px-4 py-3 mb-1 flex-row items-center justify-between ${touched.categoria && errors.categoria
                  ? "border-red-500"
                  : "border-gray-300"
                  }`}
              >
                <Text
                  className={`text-base ${categoriaLabel ? "text-gray-900" : "text-gray-400"
                    }`}
                >
                  {categoriaLabel || "Selecciona una categoría"}
                </Text>
                <Text className="text-gray-400">▾</Text>
              </Pressable>
              {touched.categoria && errors.categoria ? (
                <Text className="text-red-500 text-xs mb-2">
                  {errors.categoria}
                </Text>
              ) : (
                <View className="mb-2" />
              )}

              <Modal
                visible={categoriaModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setCategoriaModalVisible(false)}
              >
                <Pressable
                  className="flex-1 bg-black/40 justify-end"
                  onPress={() => setCategoriaModalVisible(false)}
                >
                  <View className="bg-white rounded-t-2xl p-4">
                    <Text className="text-base font-semibold text-gray-900 mb-2">
                      Selecciona una categoría
                    </Text>
                    <FlatList
                      data={CATEGORIAS}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <Pressable
                          className="py-3 border-b border-gray-100"
                          onPress={() => {
                            setFieldValue("categoria", item);
                            setCategoriaModalVisible(false);
                          }}
                        >
                          <Text className="text-base text-gray-900">
                            {CATEGORIA_LABELS[item]}
                          </Text>
                        </Pressable>
                      )}
                    />
                  </View>
                </Pressable>
              </Modal>

              {/* Botón submit */}
              <Pressable
                onPress={() => formikSubmit()}
                disabled={isSubmitting}
                className={`rounded-xl py-4 items-center mt-4 ${isSubmitting ? "bg-red-300" : "bg-red-600"
                  }`}
              >
                <Text className="text-white text-base font-semibold">
                  {isSubmitting ? "Registrando..." : "Registrar gasto"}
                </Text>
              </Pressable>
            </View>
          );
        }}
      </Formik>
    </View>
  );
}