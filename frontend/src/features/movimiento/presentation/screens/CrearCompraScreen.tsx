import useCaja from "@/features/caja/presentation/hook/useCaja";
import { useInventario } from "@/features/inventario/presentation/hook/useInventario";
import { CategoriaMovimiento } from "@/features/movimiento/domain/enum/CategoriaMovimiento";
import { useMovimientos } from "@/features/movimiento/presentation/hook/useMovimientos";
import { useSucursal } from "@/features/sucursal/presentation/hook/useSucursal";
import { useUsuario } from "@/features/usuario/usuario/hook/useUsuario";
import { dateStringToLocateDateTime } from "@/helpers/TimeHelpers";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

function getParamNumber(value?: string | string[]): number | null {
	const parsed = Number(Array.isArray(value) ? value[0] : value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function todayIso(): string {
	const date = new Date();
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toIsoDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function buildQuickDateOptions(): { iso: string; label: string; sublabel: string }[] {
	const today = new Date();
	return Array.from({ length: 4 }, (_, index) => {
		const date = new Date(today);
		date.setDate(today.getDate() - index);
		return {
			iso: toIsoDate(date),
			label: index === 0 ? "Hoy" : index === 1 ? "Ayer" : date.toLocaleDateString("es-MX", { weekday: "short" }),
			sublabel: date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
		};
	});
}

const CrearCompraScreen = () => {
	const params = useLocalSearchParams<{ modulo?: string; sucursalId?: string; cajaId?: string; cuentaId?: string }>();
	const { sucursales, sucursalSeleccionadaId, findSucursalesByEmpresa } = useSucursal();
	const { existencias, loading: inventarioLoading, error: inventarioError, cargarInventario } = useInventario();
	const { cajas, cajaSeleccionadaId } = useCaja();
	const { usuario } = useUsuario();
	const { crearCompra, loading, error } = useMovimientos();
	const esContextoCaja = params.modulo === "caja";
	const sucursalInicial = getParamNumber(params.sucursalId) ?? sucursalSeleccionadaId ?? null;
	const [sucursalId, setSucursalId] = useState<number | null>(sucursalInicial);
	const [materialId, setMaterialId] = useState<number | null>(null);
	const [cantidadCompra, setCantidadCompra] = useState("");
	const [monto, setMonto] = useState("");
	const [descripcion, setDescripcion] = useState("");
	const [fecha, setFecha] = useState(todayIso);
	const [cuentaId, setCuentaId] = useState<number | null>(getParamNumber(params.cuentaId));
	const [cajaId, setCajaId] = useState<number | null>(getParamNumber(params.cajaId) ?? cajaSeleccionadaId ?? null);
	const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
	const [materialModalVisible, setMaterialModalVisible] = useState(false);
	const [cuentaModalVisible, setCuentaModalVisible] = useState(false);
	const [busquedaMaterial, setBusquedaMaterial] = useState("");
	const [busquedaCuenta, setBusquedaCuenta] = useState("");
	const quickDates = useMemo(buildQuickDateOptions, []);

	useEffect(() => {
		if (sucursalId === null) findSucursalesByEmpresa();
	}, [findSucursalesByEmpresa, sucursalId]);

	useEffect(() => {
		if (sucursalId !== null) cargarInventario(sucursalId);
	}, [cargarInventario, sucursalId]);

	useEffect(() => {
		const routeSucursalId = getParamNumber(params.sucursalId);
		if (routeSucursalId !== null && routeSucursalId !== sucursalId) {
			setSucursalId(routeSucursalId);
			setMaterialId(null);
		}
	}, [params.sucursalId, sucursalId]);

	useEffect(() => {
		const routeCuentaId = getParamNumber(params.cuentaId);
		if (routeCuentaId !== null) setCuentaId(routeCuentaId);
	}, [params.cuentaId]);

	const materialesDisponibles = useMemo(
		() => existencias.filter((existencia) =>
			existencia.sucursalId === sucursalId
			&& existencia.cantidadActual > 0
			&& existencia.estado !== "SIN_STOCK"
		),
		[existencias, sucursalId]
	);
	const materialesFiltrados = useMemo(() => {
		const query = busquedaMaterial.trim().toLocaleLowerCase("es-MX");
		return materialesDisponibles.filter((existencia) =>
			existencia.material.nombre.toLocaleLowerCase("es-MX").includes(query)
		);
	}, [busquedaMaterial, materialesDisponibles]);
	const materialSeleccionado = materialesDisponibles.find((item) => item.materialId === materialId);
	const cuentas = usuario?.empresa?.cuentas ?? [];
	const cuentasFiltradas = useMemo(() => {
		const query = busquedaCuenta.trim().toLocaleLowerCase("es-MX");
		return cuentas.filter((cuenta) => cuenta.nombre.toLocaleLowerCase("es-MX").includes(query));
	}, [busquedaCuenta, cuentas]);
	const sucursalSeleccionada = sucursales.find((item) => item.id === sucursalId);
	const cajaSeleccionada = cajas.find((item) => item.id === cajaId);
	const montoNumero = Number(monto.replace(",", "."));
	const cantidadNumero = Number(cantidadCompra.replace(",", "."));
	const origenValido = esContextoCaja ? cajaId !== null : cuentaId !== null;
	const formularioValido = Boolean(
		sucursalId
		&& materialId
		&& Number.isFinite(montoNumero)
		&& montoNumero > 0
		&& Number.isFinite(cantidadNumero)
		&& cantidadNumero > 0
		&& descripcion.trim().length >= 3
		&& fecha
		&& origenValido
	);

	const seleccionarSucursal = (id: number) => {
		setSucursalId(id);
		setMaterialId(null);
	};

	const registrarCompra = async () => {
		if (!formularioValido || sucursalId === null || materialId === null) {
			setErrorFormulario("Completa los datos de la compra.");
			return;
		}

		setErrorFormulario(null);
		try {
			await crearCompra({
				descripcion: descripcion.trim(),
				monto: montoNumero,
				categoria: CategoriaMovimiento.INSUMOS,
				fecha: dateStringToLocateDateTime(fecha),
				cuentaId: esContextoCaja ? null : cuentaId,
				cajaId: esContextoCaja ? cajaId : null,
				materialId,
				cantidadCompra: cantidadNumero,
				sucursalId,
			});
			cargarInventario(sucursalId);
			router.back();
		} catch (cause: unknown) {
			setErrorFormulario(typeof cause === "string" ? cause : "No se pudo registrar la compra.");
		}
	};

	return (
		<View className="flex-1 bg-[#FAF9FC]">
			<View className="flex-row items-center border-b border-[#E7E0EC] bg-white px-4 py-3">
				<Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Cerrar compra" className="mr-3 h-10 w-10 items-center justify-center rounded-full">
					<Ionicons name="close" size={22} color="#1C1B1F" />
				</Pressable>
				<View>
					<Text className="text-lg font-bold text-[#1C1B1F]">Comprar material</Text>
					<Text className="text-xs text-[#79747E]">Registro de compra e inventario</Text>
				</View>
			</View>

			<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
				<Text className="mb-2 text-xs font-semibold uppercase text-[#79747E]">Sucursal</Text>
				{sucursalId === null ? (
					sucursales.length === 0 ? (
						<Text className="mb-4 rounded-xl border border-[#E7E0EC] bg-white px-3 py-4 text-sm text-[#79747E]">
							No hay sucursales disponibles.
						</Text>
					) : (
						<View className="mb-4">
							{sucursales.map((sucursal) => (
								<Pressable key={sucursal.id} onPress={() => seleccionarSucursal(sucursal.id!)} className="mb-2 flex-row items-center justify-between rounded-xl border border-[#E7E0EC] bg-white px-3 py-3">
									<Text className="text-sm font-medium text-[#1C1B1F]">{sucursal.nombre}</Text>
									<Ionicons name="chevron-forward" size={18} color="#79747E" />
								</Pressable>
							))}
						</View>
					)
				) : (
					<View className="mb-4 flex-row items-center justify-between rounded-xl border border-[#E7E0EC] bg-white px-3 py-3">
						<View className="flex-row items-center gap-2">
							<Ionicons name="business-outline" size={18} color="#1857B6" />
							<Text className="text-sm font-medium text-[#1C1B1F]">{sucursalSeleccionada?.nombre ?? `Sucursal ${sucursalId}`}</Text>
						</View>
						{sucursales.length > 1 && (
							<Pressable onPress={() => { setSucursalId(null); setMaterialId(null); }}>
								<Text className="text-sm font-semibold text-[#1857B6]">Cambiar</Text>
							</Pressable>
						)}
					</View>
				)}

				{sucursalId !== null && (
					<>
						<Text className="mb-2 text-xs font-semibold uppercase text-[#79747E]">Material con existencia</Text>
						{inventarioLoading ? (
							<ActivityIndicator className="mb-4 py-6" color="#1857B6" />
						) : materialesDisponibles.length === 0 ? (
							<Text className="mb-4 rounded-xl border border-[#E7E0EC] bg-white px-3 py-4 text-sm text-[#79747E]">
								{inventarioError ?? "No hay materiales con existencia en esta sucursal."}
							</Text>
						) : (
							<Pressable
								onPress={() => setMaterialModalVisible(true)}
								className="mb-4 flex-row items-center justify-between rounded-xl border border-[#E7E0EC] bg-white px-3 py-3"
							>
								<View className="flex-1 pr-3">
									<Text className={`text-sm ${materialSeleccionado ? "font-medium text-[#1C1B1F]" : "text-[#79747E]"}`}>
										{materialSeleccionado?.material.nombre ?? "Selecciona un material"}
									</Text>
									{materialSeleccionado && <Text className="mt-1 text-xs text-[#79747E]">Existencia: {materialSeleccionado.cantidadActual} {materialSeleccionado.unidadMedida}</Text>}
								</View>
								<Ionicons name="search" size={18} color="#79747E" />
							</Pressable>
						)}

						<Text className="mb-1 text-xs font-semibold uppercase text-[#79747E]">Cantidad comprada</Text>
						<TextInput
							value={cantidadCompra}
							onChangeText={setCantidadCompra}
							keyboardType="decimal-pad"
							placeholder="Ej. 5"
							className="mb-4 rounded-xl border border-[#E7E0EC] bg-white px-3 py-3 text-base text-[#1C1B1F]"
						/>

						<Text className="mb-1 text-xs font-semibold uppercase text-[#79747E]">Monto total</Text>
						<TextInput
							value={monto}
							onChangeText={setMonto}
							keyboardType="decimal-pad"
							placeholder="0.00"
							className="mb-4 rounded-xl border border-[#E7E0EC] bg-white px-3 py-3 text-base text-[#1C1B1F]"
						/>

						<Text className="mb-1 text-xs font-semibold uppercase text-[#79747E]">Fecha</Text>
						<View className="mb-1 flex-row gap-2">
							{quickDates.map((opcion) => {
								const seleccionada = fecha === opcion.iso;
								return (
									<Pressable
										key={opcion.iso}
										onPress={() => setFecha(opcion.iso)}
										className={`flex-1 items-center rounded-xl border py-2 ${seleccionada ? "border-red-600 bg-red-600" : "border-gray-300 bg-white"}`}
									>
										<Text className={`text-sm font-semibold ${seleccionada ? "text-white" : "text-gray-700"}`}>{opcion.label}</Text>
										<Text className={`text-xs ${seleccionada ? "text-red-100" : "text-gray-400"}`}>{opcion.sublabel}</Text>
									</Pressable>
								);
							})}
						</View>

						<Text className="mb-1 text-xs font-semibold uppercase text-[#79747E]">Descripción</Text>
						<TextInput
							value={descripcion}
							onChangeText={setDescripcion}
							placeholder="Ej. Reposición de harina"
							maxLength={255}
							className="mb-4 rounded-xl border border-[#E7E0EC] bg-white px-3 py-3 text-base text-[#1C1B1F]"
						/>

						{esContextoCaja ? (
							<>
								<Text className="mb-2 text-xs font-semibold uppercase text-[#79747E]">Caja de cargo</Text>
								{cajaSeleccionada ? (
									<View className="mb-4 flex-row items-center gap-2 rounded-xl border border-[#E7E0EC] bg-white px-3 py-3">
										<Ionicons name="cash-outline" size={18} color="#1857B6" />
										<Text className="text-sm font-medium text-[#1C1B1F]">{cajaSeleccionada.nombre}</Text>
									</View>
								) : (
									<View className="mb-4">
										{cajas.map((caja) => (
											<Pressable key={caja.id} onPress={() => setCajaId(caja.id)} className="mb-2 rounded-xl border border-[#E7E0EC] bg-white px-3 py-3">
												<Text className="text-sm font-medium text-[#1C1B1F]">{caja.nombre}</Text>
											</Pressable>
										))}
									</View>
								)}
							</>
						) : (
							<>
								<Text className="mb-2 text-xs font-semibold uppercase text-[#79747E]">Cuenta de cargo</Text>
								<Pressable
									onPress={() => setCuentaModalVisible(true)}
									className="mb-4 flex-row items-center justify-between rounded-xl border border-[#E7E0EC] bg-white px-3 py-3"
								>
									<Text className={`text-sm ${cuentaId ? "font-medium text-[#1C1B1F]" : "text-[#79747E]"}`}>
										{cuentas.find((cuenta) => cuenta.id === cuentaId)?.nombre ?? "Selecciona una cuenta"}
									</Text>
									<Ionicons name="chevron-down" size={18} color="#79747E" />
								</Pressable>
							</>
						)}
					</>
				)}

				{(errorFormulario || error) && <Text className="mb-3 text-sm text-[#B3261E]">{errorFormulario ?? error}</Text>}
				<Pressable
					onPress={registrarCompra}
					disabled={!formularioValido || loading}
					className={`mt-2 flex-row items-center justify-center gap-2 rounded-xl py-4 ${formularioValido && !loading ? "bg-[#1857B6]" : "bg-[#A8B9D3]"}`}
				>
					{loading && <ActivityIndicator color="#FFFFFF" />}
					<Text className="text-sm font-semibold text-white">{loading ? "Registrando compra..." : "Registrar compra"}</Text>
				</Pressable>
			</ScrollView>

			<Modal visible={materialModalVisible} transparent animationType="slide" onRequestClose={() => setMaterialModalVisible(false)}>
				<Pressable className="flex-1 justify-end bg-black/40" onPress={() => setMaterialModalVisible(false)}>
					<View className="max-h-[85%] rounded-t-2xl bg-white p-4">
						<Text className="mb-3 text-base font-semibold text-[#1C1B1F]">Selecciona un material</Text>
						<View className="mb-3 flex-row items-center rounded-xl border border-[#E7E0EC] px-3">
							<Ionicons name="search" size={18} color="#79747E" />
							<TextInput value={busquedaMaterial} onChangeText={setBusquedaMaterial} placeholder="Buscar material" className="flex-1 px-2 py-3 text-sm text-[#1C1B1F]" />
						</View>
						<ScrollView keyboardShouldPersistTaps="handled">
							{materialesFiltrados.length === 0 ? (
								<Text className="py-8 text-center text-sm text-[#79747E]">No hay materiales que coincidan con la búsqueda.</Text>
							) : materialesFiltrados.map((existencia) => (
								<Pressable
									key={`${existencia.sucursalId}-${existencia.materialId}`}
									onPress={() => {
										setMaterialId(existencia.materialId);
										setBusquedaMaterial("");
										setMaterialModalVisible(false);
									}}
									className="flex-row items-center justify-between border-b border-[#E7E0EC] py-3"
								>
									<View>
										<Text className="text-sm font-medium text-[#1C1B1F]">{existencia.material.nombre}</Text>
										<Text className="mt-1 text-xs text-[#79747E]">Existencia: {existencia.cantidadActual} {existencia.unidadMedida}</Text>
									</View>
									{materialId === existencia.materialId && <Ionicons name="checkmark" size={18} color="#1857B6" />}
								</Pressable>
							))}
						</ScrollView>
					</View>
				</Pressable>
			</Modal>

			<Modal visible={cuentaModalVisible} transparent animationType="slide" onRequestClose={() => setCuentaModalVisible(false)}>
				<Pressable className="flex-1 justify-end bg-black/40" onPress={() => setCuentaModalVisible(false)}>
					<View className="max-h-[85%] rounded-t-2xl bg-white p-4">
						<Text className="mb-3 text-base font-semibold text-[#1C1B1F]">Selecciona una cuenta</Text>
						<View className="mb-3 flex-row items-center rounded-xl border border-[#E7E0EC] px-3">
							<Ionicons name="search" size={18} color="#79747E" />
							<TextInput value={busquedaCuenta} onChangeText={setBusquedaCuenta} placeholder="Buscar cuenta" className="flex-1 px-2 py-3 text-sm text-[#1C1B1F]" />
						</View>
						<ScrollView keyboardShouldPersistTaps="handled">
							{cuentasFiltradas.length === 0 ? (
								<Text className="py-8 text-center text-sm text-[#79747E]">No hay cuentas que coincidan con la búsqueda.</Text>
							) : cuentasFiltradas.map((cuenta) => (
								<Pressable
									key={cuenta.id}
									onPress={() => {
										setCuentaId(cuenta.id);
										setBusquedaCuenta("");
										setCuentaModalVisible(false);
									}}
									className="flex-row items-center justify-between border-b border-[#E7E0EC] py-3"
								>
									<Text className="text-sm font-medium text-[#1C1B1F]">{cuenta.nombre}</Text>
									{cuentaId === cuenta.id && <Ionicons name="checkmark" size={18} color="#1857B6" />}
								</Pressable>
							))}
						</ScrollView>
					</View>
				</Pressable>
			</Modal>
		</View>
	);
};

export default CrearCompraScreen;
