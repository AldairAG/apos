import { COLORS, POSIcon } from '@/components/pos';
import { useCategoria } from '@/features/producto/categoria/useCategoria';
import { useExtra } from '@/features/producto/grupoExtra/useExtra';
import { createProductoDTO, Producto } from '@/features/producto/producto/producto.types';
import { useProducto } from '@/features/producto/producto/useProducto';
import { Receta } from '@/features/producto/receta/receta.types';
import { useRecetas } from '@/features/producto/receta/useReceta';
import { useSucursal } from '@/features/sucursal/useSucursal';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

// ── Design tokens: MD3 + Neo-Brutalismo Funcional (mismos que el resto de la app) ──
const INK = '#0D0D0D';
const BORDER_W = 3;
const RADIUS = 16;
const RIPPLE = { color: 'rgba(0,0,0,0.18)', borderless: false };

const hardShadow = (pressed: boolean) => ({
  shadowColor: INK,
  shadowOffset: { width: pressed ? 0 : 4, height: pressed ? 0 : 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: pressed ? 0 : 5,
  transform: [{ translateX: pressed ? 3 : 0 }, { translateY: pressed ? 3 : 0 }],
});

type FiltroTipo = 'todos' | 'activos' | 'inactivos' | 'destacados';

// Psicología del color por filtro: verde = disponible/afirmativo, gris cálido =
// neutral/pausado (no rojo, para no leer "inactivo" como un error), ámbar = destacado.
const FILTRO_COLOR: Record<FiltroTipo, string> = {
  todos: COLORS.primary,
  activos: COLORS.success,
  inactivos: '#B8B6AB',
  destacados: COLORS.warning,
};

export default function ProductosScreen() {
  const { productos, loading, saveProducto, cargarProductos } = useProducto();
  const { categorias, cargarCategorias } = useCategoria();
  const { recetas, cargarRecetas } = useRecetas();
  const { grupos, cargarGrupos } = useExtra();
  const { sucursalActual } = useSucursal();

  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<FiltroTipo>('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [modalRecetaVisible, setModalRecetaVisible] = useState(false);
  const [modalExtrasVisible, setModalExtrasVisible] = useState(false);

  const [formData, setFormData] = useState<createProductoDTO>({
    nombre: '',
    descripcion: '',
    precioVenta: 0,
    costo: 0,
    margen: 0,
    tiempoPreparacion: 0,
    activo: true,
    destacado: false,
    categoriaId: 0,
    recetaId: 0,
    gruposExtra: undefined,
    sucursalId: sucursalActual?.id ?? 0,
  });

  const [costoPersonalizado, setCostoPersonalizado] = useState(false);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
    cargarRecetas();
    cargarGrupos();
  }, []);

  useEffect(() => {
    if (productoEditando) {
      setFormData({
        nombre: productoEditando.nombre,
        descripcion: productoEditando.descripcion,
        precioVenta: productoEditando.precioVenta,
        costo: productoEditando.costo,
        margen: productoEditando.margen,
        tiempoPreparacion: productoEditando.tiempoPreparacion,
        activo: productoEditando.activo,
        destacado: productoEditando.destacado,
        categoriaId: productoEditando.categoria.id,
        recetaId: 0,
        gruposExtra: undefined,
        sucursalId: sucursalActual?.id ?? 0,
      });
      setExtrasSeleccionados(productoEditando.gruposExtra.map((ge) => ge.id));
    } else {
      resetFormData();
    }
  }, [productoEditando]);

  const resetFormData = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precioVenta: 0,
      costo: 0,
      margen: 0,
      tiempoPreparacion: 0,
      activo: true,
      destacado: false,
      categoriaId: 0,
      recetaId: 0,
      gruposExtra: undefined,
      sucursalId: sucursalActual?.id ?? 0,
    });
    setCostoPersonalizado(false);
    setExtrasSeleccionados([]);
  };

  // Receta seleccionada
  const recetaSeleccionada = useMemo(() => {
    return recetas.find((r: Receta) => r.id === formData.recetaId);
  }, [formData.recetaId, recetas]);

  // Calcular valores financieros
  const valoresFinancieros = useMemo(() => {
    const costo = formData.costo;
    const precioVenta = formData.precioVenta;

    if (precioVenta > 0 && costo >= 0) {
      const utilidad = precioVenta - costo;
      const margenCalculado = costo > 0 ? ((utilidad / costo) * 100) : 0;

      return {
        costo,
        precioVenta,
        utilidad,
        margen: margenCalculado,
      };
    }

    return {
      costo: 0,
      precioVenta: 0,
      utilidad: 0,
      margen: 0,
    };
  }, [formData.costo, formData.precioVenta, formData.margen]);

  // Actualizar precio de venta desde margen
  const actualizarPrecioPorMargen = (nuevoMargen: number) => {
    const nuevoPrecio = formData.costo * (1 + nuevoMargen / 100);
    setFormData({
      ...formData,
      margen: nuevoMargen,
      precioVenta: parseFloat(nuevoPrecio.toFixed(2)),
    });
  };

  // Actualizar margen desde precio de venta
  const actualizarMargenPorPrecio = (nuevoPrecio: number) => {
    const nuevoMargen = formData.costo > 0 ? (((nuevoPrecio - formData.costo) / formData.costo) * 100) : 0;
    setFormData({
      ...formData,
      precioVenta: nuevoPrecio,
      margen: parseFloat(nuevoMargen.toFixed(2)),
    });
  };

  // Seleccionar receta
  const handleSeleccionarReceta = (recetaId: number) => {
    const receta = recetas.find((r: Receta) => r.id === recetaId);
    if (receta && !costoPersonalizado) {
      const costoTotal = receta.costoTotal || 0;
      const rendimiento = receta.rendimiento || 1;
      const costoPorUnidad = costoTotal / rendimiento;

      setFormData({
        ...formData,
        recetaId: recetaId,
        costo: parseFloat(costoPorUnidad.toFixed(2)),
      });
    } else {
      setFormData({
        ...formData,
        recetaId: recetaId,
      });
    }
    setModalRecetaVisible(false);
  };

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    let resultado = productos;

    if (busqueda) {
      resultado = resultado.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    switch (filtroActivo) {
      case 'activos':
        resultado = resultado.filter((p) => p.activo);
        break;
      case 'inactivos':
        resultado = resultado.filter((p) => !p.activo);
        break;
      case 'destacados':
        resultado = resultado.filter((p) => p.destacado);
        break;
      default:
        break;
    }

    return resultado;
  }, [productos, busqueda, filtroActivo]);

  const handleNuevo = () => {
    resetFormData();
    setProductoEditando(null);
    setModalVisible(true);
  };

  const handleEditar = (producto: Producto) => {
    setProductoEditando(producto);
    setModalVisible(true);
  };

  const handleEliminar = (producto: Producto) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de eliminar "${producto.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => console.log('Eliminar:', producto.id) }
      ]
    );
  };

  const handleCerrarModal = () => {
    setModalVisible(false);
    setProductoEditando(null);
    setModalRecetaVisible(false);
    setModalExtrasVisible(false);
  };

  const handleGuardar = async () => {
    if (isSaving) {
      return;
    }

    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre del producto es requerido');
      return;
    }

    if (!formData.categoriaId) {
      Alert.alert('Error', 'Debe seleccionar una categoría');
      return;
    }

    if (formData.precioVenta <= 0) {
      Alert.alert('Error', 'El precio de venta debe ser mayor a 0');
      return;
    }

    setIsSaving(true);

    const dataToSave: createProductoDTO = {
      ...formData,
      gruposExtra: undefined,
    };

    const creado = await saveProducto(dataToSave);
    setIsSaving(false);

    if (creado) {
      handleCerrarModal();
      await cargarProductos();
    } else {
      Alert.alert('Error', 'No se pudo crear el producto. Revisa los datos e intenta nuevamente.');
    }
  };

  const handleToggleExtra = (grupoId: number) => {
    if (extrasSeleccionados.includes(grupoId)) {
      setExtrasSeleccionados(extrasSeleccionados.filter((id) => id !== grupoId));
    } else {
      setExtrasSeleccionados([...extrasSeleccionados, grupoId]);
    }
  };

  const renderFiltro = (tipo: FiltroTipo, label: string, icono: string) => {
    const isActive = filtroActivo === tipo;
    const color = FILTRO_COLOR[tipo];
    return (
      <Pressable
        key={tipo}
        style={({ pressed }) => [
          styles.filtroChip,
          isActive && { backgroundColor: color },
          hardShadow(pressed),
        ]}
        onPress={() => setFiltroActivo(tipo)}
        android_ripple={RIPPLE}
      >
        <POSIcon name={icono as any} size={16} color={INK} />
        <Text style={styles.filtroChipTexto}>{label.toUpperCase()}</Text>
      </Pressable>
    );
  };

  const renderProductoItem = ({ item }: { item: Producto }) => {
    return (
      <View style={styles.productoCard}>
        <View style={styles.productoHeader}>
          <View style={styles.productoHeaderLeft}>
            <Text style={styles.productoNombre} numberOfLines={1}>{item.nombre}</Text>
            <View style={styles.productoBadges}>
              {item.destacado && (
                <View style={[styles.estadoBadge, { backgroundColor: COLORS.warning }]}>
                  <Text style={styles.estadoBadgeTexto}>DESTACADO</Text>
                </View>
              )}
              <View
                style={[
                  styles.estadoBadge,
                  { backgroundColor: item.activo ? COLORS.success : '#D9D9D0' },
                ]}
              >
                <Text style={styles.estadoBadgeTexto}>{item.activo ? 'ACTIVO' : 'INACTIVO'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.productoCategoriaRow}>
          <POSIcon name="pricetag-outline" size={14} color={INK} />
          <Text style={styles.productoCategoria}>{item.categoria.nombre}</Text>
        </View>

        {item.descripcion && (
          <Text style={styles.productoDescripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}

        {/* Grid de Información Financiera */}
        <View style={styles.productoInfoGrid}>
          <View style={styles.productoInfoItem}>
            <Text style={styles.productoInfoLabel}>PRECIO</Text>
            <Text style={[styles.productoInfoValue, { color: COLORS.success }]}>
              ${item.precioVenta.toFixed(2)}
            </Text>
          </View>

          <View style={styles.productoInfoItem}>
            <Text style={styles.productoInfoLabel}>COSTO</Text>
            <Text style={styles.productoInfoValue}>
              ${item.costo.toFixed(2)}
            </Text>
          </View>

          <View style={styles.productoInfoItem}>
            <Text style={styles.productoInfoLabel}>MARGEN</Text>
            <Text style={[styles.productoInfoValue, { color: '#9C6F19' }]}>
              {item.margen.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Indicadores */}
        <View style={styles.productoIndicadores}>
          {item.gruposExtra && item.gruposExtra.length > 0 && (
            <View style={styles.indicadorChip}>
              <POSIcon name="add-circle-outline" size={13} color={INK} />
              <Text style={styles.indicadorChipTexto}>
                {item.gruposExtra.length} extra{item.gruposExtra.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}

          <View style={styles.indicadorChip}>
            <POSIcon name="time-outline" size={13} color={INK} />
            <Text style={styles.indicadorChipTexto}>
              {item.tiempoPreparacion} min
            </Text>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.productoAcciones}>
          <Pressable
            style={({ pressed }) => [styles.botonAccion, styles.botonEditar, hardShadow(pressed)]}
            onPress={() => handleEditar(item)}
            android_ripple={RIPPLE}
          >
            <POSIcon name="create-outline" size={18} color={INK} />
            <Text style={styles.botonAccionTexto}>EDITAR</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.botonAccion, styles.botonEliminar, hardShadow(pressed)]}
            onPress={() => handleEliminar(item)}
            android_ripple={RIPPLE}
          >
            <POSIcon name="trash-outline" size={18} color={INK} />
            <Text style={styles.botonAccionTexto}>ELIMINAR</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>PRODUCTOS</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{productosFiltrados.length}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>Administra tu catálogo de productos</Text>
      </View>

      {/* Buscador */}
      <View style={styles.busquedaContainer}>
        <POSIcon name="search" size={20} color={INK} />
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar producto..."
          placeholderTextColor={COLORS.textSecondary}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <Pressable onPress={() => setBusqueda('')} hitSlop={8}>
            <POSIcon name="close-circle" size={20} color={INK} />
          </Pressable>
        )}
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosContainer}
        contentContainerStyle={styles.filtrosContent}
      >
        {renderFiltro('todos', 'Todos', 'apps-outline')}
        {renderFiltro('activos', 'Activos', 'checkmark-circle-outline')}
        {renderFiltro('inactivos', 'Inactivos', 'pause-circle-outline')}
        {renderFiltro('destacados', 'Destacados', 'star-outline')}
      </ScrollView>

      {/* Lista de Productos */}
      <FlatList
        data={productosFiltrados}
        renderItem={renderProductoItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBadge}>
              <POSIcon name="fast-food-outline" size={44} color={INK} />
            </View>
            <Text style={styles.emptyTexto}>
              {busqueda ? 'SIN RESULTADOS' : 'AÚN NO HAY PRODUCTOS'}
            </Text>
            <Text style={styles.emptySubtexto}>
              {busqueda ? 'Intenta con otra búsqueda' : 'Toca "+" para crear el primero'}
            </Text>
          </View>
        }
      />

      {/* FAB Button */}
      <Pressable
        style={({ pressed }) => [styles.fabButton, hardShadow(pressed)]}
        onPress={handleNuevo}
        android_ripple={RIPPLE}
      >
        <POSIcon name="add" size={28} color={INK} />
      </Pressable>

      {/* Modal Crear/Editar Producto */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>
                {productoEditando ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.modalCloseButton, hardShadow(pressed)]}
                onPress={handleCerrarModal}
                hitSlop={6}
              >
                <POSIcon name="close" size={20} color={INK} />
              </Pressable>
            </View>

            {/* Contenido del Formulario */}
            <ScrollView style={styles.modalContenido} showsVerticalScrollIndicator={false}>
              {/* Sección: Información General */}
              <View style={styles.seccionFormulario}>
                <Text style={styles.seccionTitulo}>INFORMACIÓN GENERAL</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>NOMBRE *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ej: Hamburguesa Clásica"
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.nombre}
                    onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>DESCRIPCIÓN</Text>
                  <TextInput
                    style={[styles.formInput, styles.formInputMultiline]}
                    placeholder="Describe el producto"
                    placeholderTextColor={COLORS.textSecondary}
                    multiline
                    numberOfLines={3}
                    value={formData.descripcion}
                    onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>CATEGORÍA *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {categorias.map((cat) => {
                      const activa = formData.categoriaId === cat.id;
                      return (
                        <Pressable
                          key={cat.id}
                          style={({ pressed }) => [
                            styles.chipCategoria,
                            activa && styles.chipCategoriaActiva,
                            hardShadow(pressed),
                          ]}
                          onPress={() => setFormData({ ...formData, categoriaId: cat.id })}
                          android_ripple={RIPPLE}
                        >
                          <Text style={styles.chipCategoriaTexto}>{cat.nombre}</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.switchBox}>
                    <View style={styles.switchLabel}>
                      <POSIcon name="power" size={18} color={INK} />
                      <Text style={styles.switchTextSmall}>ACTIVO</Text>
                    </View>
                    <Switch
                      value={formData.activo}
                      onValueChange={(value) => setFormData({ ...formData, activo: value })}
                      trackColor={{ false: '#D9D9D0', true: COLORS.success }}
                      thumbColor={COLORS.white}
                    />
                  </View>

                  <View style={styles.switchBox}>
                    <View style={styles.switchLabel}>
                      <POSIcon name="star" size={18} color={INK} />
                      <Text style={styles.switchTextSmall}>DESTACADO</Text>
                    </View>
                    <Switch
                      value={formData.destacado}
                      onValueChange={(value) => setFormData({ ...formData, destacado: value })}
                      trackColor={{ false: '#D9D9D0', true: COLORS.warning }}
                      thumbColor={COLORS.white}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>TIEMPO DE PREPARACIÓN (MIN)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="0"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="numeric"
                    value={formData.tiempoPreparacion.toString()}
                    onChangeText={(text) => setFormData({ ...formData, tiempoPreparacion: parseFloat(text) || 0 })}
                  />
                </View>
              </View>

              {/* Sección: Receta Asociada */}
              <View style={styles.seccionFormulario}>
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionTitulo}>RECETA ASOCIADA</Text>
                  {recetaSeleccionada && (
                    <View style={[styles.estadoBadge, { backgroundColor: COLORS.success }]}>
                      <Text style={styles.estadoBadgeTexto}>VINCULADA</Text>
                    </View>
                  )}
                </View>

                <Pressable
                  style={({ pressed }) => [styles.selectorReceta, hardShadow(pressed)]}
                  onPress={() => setModalRecetaVisible(true)}
                  android_ripple={RIPPLE}
                >
                  {recetaSeleccionada ? (
                    <>
                      <POSIcon name="checkmark-circle" size={20} color={COLORS.success} />
                      <Text style={styles.selectorRecetaTexto} numberOfLines={1}>{recetaSeleccionada.nombre}</Text>
                    </>
                  ) : (
                    <>
                      <POSIcon name="document-text-outline" size={20} color={INK} />
                      <Text style={[styles.selectorRecetaTexto, styles.selectorRecetaPlaceholder]}>
                        Seleccionar receta (opcional)
                      </Text>
                    </>
                  )}
                  <POSIcon name="chevron-forward" size={20} color={INK} />
                </Pressable>

                {recetaSeleccionada && (
                  <View style={styles.resumenReceta}>
                    <View style={styles.resumenRecetaHeader}>
                      <POSIcon name="restaurant-outline" size={22} color={INK} />
                      <Text style={styles.resumenRecetaTitulo}>RESUMEN DE RECETA</Text>
                    </View>

                    <View style={styles.resumenRecetaGrid}>
                      <View style={styles.resumenRecetaItem}>
                        <Text style={styles.resumenRecetaLabel}>RENDIMIENTO</Text>
                        <Text style={styles.resumenRecetaValor}>
                          {recetaSeleccionada.rendimiento} {recetaSeleccionada.unidadRendimiento}
                        </Text>
                      </View>

                      <View style={styles.resumenRecetaItem}>
                        <Text style={styles.resumenRecetaLabel}>INGREDIENTES</Text>
                        <Text style={styles.resumenRecetaValor}>
                          {recetaSeleccionada.detalles?.length || 0}
                        </Text>
                      </View>

                      <View style={styles.resumenRecetaItem}>
                        <Text style={styles.resumenRecetaLabel}>COSTO TOTAL</Text>
                        <Text style={styles.resumenRecetaValor}>
                          ${recetaSeleccionada.costoTotal.toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.resumenRecetaItem}>
                        <Text style={styles.resumenRecetaLabel}>COSTO x UNIDAD</Text>
                        <Text style={[styles.resumenRecetaValor, { color: COLORS.success }]}>
                          ${(recetaSeleccionada.costoTotal / (recetaSeleccionada.rendimiento || 1)).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.switchBox}>
                      <Text style={styles.switchTextSmall}>COSTO PERSONALIZADO</Text>
                      <Switch
                        value={costoPersonalizado}
                        onValueChange={setCostoPersonalizado}
                        trackColor={{ false: '#D9D9D0', true: COLORS.primary }}
                        thumbColor={COLORS.white}
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Sección: Configuración Comercial */}
              <View style={styles.seccionFormulario}>
                <Text style={styles.seccionTitulo}>CONFIGURACIÓN COMERCIAL</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>
                    COSTO {recetaSeleccionada && !costoPersonalizado ? '(DE RECETA)' : ''}
                  </Text>
                  <View style={styles.precioContainer}>
                    <Text style={styles.precioSimbolo}>$</Text>
                    <TextInput
                      style={styles.precioInput}
                      placeholder="0.00"
                      placeholderTextColor={COLORS.textSecondary}
                      keyboardType="decimal-pad"
                      value={formData.costo.toString()}
                      onChangeText={(text) => setFormData({ ...formData, costo: parseFloat(text) || 0 })}
                      editable={!recetaSeleccionada || costoPersonalizado}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>MARGEN DE GANANCIA (%)</Text>
                  <View style={styles.precioContainer}>
                    <Text style={[styles.precioSimbolo, { color: '#9C6F19' }]}>%</Text>
                    <TextInput
                      style={styles.precioInput}
                      placeholder="0"
                      placeholderTextColor={COLORS.textSecondary}
                      keyboardType="decimal-pad"
                      value={formData.margen.toString()}
                      onChangeText={(text) => actualizarPrecioPorMargen(parseFloat(text) || 0)}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>PRECIO DE VENTA *</Text>
                  <View style={styles.precioContainer}>
                    <Text style={[styles.precioSimbolo, { color: COLORS.success }]}>$</Text>
                    <TextInput
                      style={styles.precioInput}
                      placeholder="0.00"
                      placeholderTextColor={COLORS.textSecondary}
                      keyboardType="decimal-pad"
                      value={formData.precioVenta.toString()}
                      onChangeText={(text) => actualizarMargenPorPrecio(parseFloat(text) || 0)}
                    />
                  </View>
                </View>

                {/* Panel Financiero Destacado — Trust Design: siempre legible, sin colores de alarma */}
                <View style={styles.panelFinanciero}>
                  <View style={styles.panelFinancieroHeader}>
                    <POSIcon name="trending-up-outline" size={24} color={INK} />
                    <Text style={styles.panelFinancieroTitulo}>ANÁLISIS FINANCIERO</Text>
                  </View>

                  <View style={styles.panelFinancieroGrid}>
                    <View style={styles.panelFinancieroItem}>
                      <Text style={styles.panelFinancieroLabel}>COSTO</Text>
                      <Text style={styles.panelFinancieroValor}>
                        ${valoresFinancieros.costo.toFixed(2)}
                      </Text>
                    </View>

                    <View style={[styles.panelFinancieroItem, styles.panelFinancieroItemDestacado]}>
                      <Text style={styles.panelFinancieroLabel}>UTILIDAD</Text>
                      <Text style={[styles.panelFinancieroValor, { color: COLORS.success }]}>
                        ${valoresFinancieros.utilidad.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.panelFinancieroItem}>
                      <Text style={styles.panelFinancieroLabel}>MARGEN</Text>
                      <Text style={[styles.panelFinancieroValor, { color: '#9C6F19' }]}>
                        {valoresFinancieros.margen.toFixed(1)}%
                      </Text>
                    </View>

                    <View style={[styles.panelFinancieroItem, styles.panelFinancieroItemDestacado]}>
                      <Text style={styles.panelFinancieroLabel}>PRECIO VENTA</Text>
                      <Text style={[styles.panelFinancieroValor, styles.panelFinancieroValorGrande]}>
                        ${valoresFinancieros.precioVenta.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.panelFinancieroFormula}>
                    <Text style={styles.panelFinancieroFormulaTexto}>
                      PRECIO = COSTO × (1 + MARGEN%)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Sección: Grupos de Extras */}
              <View style={[styles.seccionFormulario, styles.ultimaSeccion]}>
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionTitulo}>GRUPOS DE EXTRAS</Text>
                  <View style={styles.contadorExtras}>
                    <POSIcon name="add-circle-outline" size={15} color={INK} />
                    <Text style={styles.contadorExtrasTexto}>
                      {extrasSeleccionados.length} SELECCIONADOS
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.botonSeleccionarExtras, hardShadow(pressed)]}
                  onPress={() => setModalExtrasVisible(true)}
                  android_ripple={RIPPLE}
                >
                  <POSIcon name="list-outline" size={20} color={INK} />
                  <Text style={styles.botonSeleccionarExtrasTexto}>
                    SELECCIONAR GRUPOS DE EXTRAS
                  </Text>
                  <POSIcon name="chevron-forward" size={20} color={INK} />
                </Pressable>

                {extrasSeleccionados.length > 0 && (
                  <View style={styles.extrasSeleccionadosLista}>
                    {extrasSeleccionados.map((grupoId) => {
                      const grupo = grupos.find((g) => g.id === grupoId);
                      return grupo ? (
                        <View key={grupoId} style={styles.chipExtra}>
                          <Text style={styles.chipExtraTexto} numberOfLines={1}>{grupo.nombre}</Text>
                          <Text style={styles.chipExtraOpciones}>
                            {grupo.opciones.length} opciones
                          </Text>
                          <Pressable onPress={() => handleToggleExtra(grupoId)} hitSlop={8}>
                            <POSIcon name="close" size={16} color={INK} />
                          </Pressable>
                        </View>
                      ) : null;
                    })}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Botones de Acción */}
            <View style={styles.modalAcciones}>
              <Pressable
                style={({ pressed }) => [styles.botonModal, styles.botonCancelar, hardShadow(pressed)]}
                onPress={handleCerrarModal}
                android_ripple={RIPPLE}
              >
                <Text style={styles.botonCancelarTexto}>CANCELAR</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.botonModal,
                  styles.botonGuardar,
                  isSaving && styles.botonGuardarDisabled,
                  hardShadow(pressed),
                ]}
                onPress={handleGuardar}
                android_ripple={RIPPLE}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={INK} />
                ) : (
                  <Text style={styles.botonGuardarTexto}>
                    {productoEditando ? 'ACTUALIZAR' : 'CREAR PRODUCTO'}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Seleccionar Receta */}
      <Modal
        visible={modalRecetaVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalRecetaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSecundarioContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>SELECCIONAR RECETA</Text>
              <Pressable
                style={({ pressed }) => [styles.modalCloseButton, hardShadow(pressed)]}
                onPress={() => setModalRecetaVisible(false)}
                hitSlop={6}
              >
                <POSIcon name="close" size={20} color={INK} />
              </Pressable>
            </View>

            <ScrollView style={styles.listaRecetas}>
              <Pressable
                style={({ pressed }) => [
                  styles.recetaItem,
                  formData.recetaId === 0 && styles.recetaItemSeleccionada,
                  hardShadow(pressed),
                ]}
                onPress={() => {
                  setFormData({ ...formData, recetaId: 0 });
                  setModalRecetaVisible(false);
                }}
                android_ripple={RIPPLE}
              >
                <View style={styles.recetaItemInfo}>
                  <Text style={styles.recetaItemNombre}>SIN RECETA</Text>
                  <Text style={styles.recetaItemDetalle}>No vincular con receta</Text>
                </View>
                {formData.recetaId === 0 && (
                  <POSIcon name="checkmark-circle" size={26} color={COLORS.success} />
                )}
              </Pressable>

              {recetas.map((receta: Receta) => {
                const seleccionada = formData.recetaId === receta.id;
                return (
                  <Pressable
                    key={receta.id}
                    style={({ pressed }) => [
                      styles.recetaItem,
                      seleccionada && styles.recetaItemSeleccionada,
                      hardShadow(pressed),
                    ]}
                    onPress={() => handleSeleccionarReceta(receta.id)}
                    android_ripple={RIPPLE}
                  >
                    <View style={styles.recetaItemInfo}>
                      <Text style={styles.recetaItemNombre} numberOfLines={1}>{receta.nombre}</Text>
                      <Text style={styles.recetaItemDetalle}>
                        Rendimiento: {receta.rendimiento} {receta.unidadRendimiento}
                      </Text>
                    </View>
                    {seleccionada && (
                      <POSIcon name="checkmark-circle" size={26} color={COLORS.success} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Seleccionar Extras */}
      <Modal
        visible={modalExtrasVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalExtrasVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSecundarioContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitulo}>SELECCIONAR EXTRAS</Text>
              <Pressable
                style={({ pressed }) => [styles.modalCloseButton, hardShadow(pressed)]}
                onPress={() => setModalExtrasVisible(false)}
                hitSlop={6}
              >
                <POSIcon name="close" size={20} color={INK} />
              </Pressable>
            </View>

            <ScrollView style={styles.listaExtras}>
              {grupos.map((grupo) => {
                const isSeleccionado = extrasSeleccionados.includes(grupo.id);

                return (
                  <Pressable
                    key={grupo.id}
                    style={({ pressed }) => [
                      styles.extraItem,
                      isSeleccionado && styles.extraItemSeleccionado,
                      hardShadow(pressed),
                    ]}
                    onPress={() => handleToggleExtra(grupo.id)}
                    android_ripple={RIPPLE}
                  >
                    <View style={styles.extraItemInfo}>
                      <Text style={styles.extraItemNombre} numberOfLines={1}>{grupo.nombre}</Text>
                      <Text style={styles.extraItemDetalle}>
                        {grupo.opciones.length} opciones disponibles
                      </Text>
                    </View>
                    {isSeleccionado ? (
                      <POSIcon name="checkmark-circle" size={26} color={COLORS.success} />
                    ) : (
                      <View style={styles.extraItemCirculo} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.modalAcciones}>
              <Pressable
                style={({ pressed }) => [styles.botonModal, styles.botonGuardar, { flex: 1 }, hardShadow(pressed)]}
                onPress={() => setModalExtrasVisible(false)}
                android_ripple={RIPPLE}
              >
                <Text style={styles.botonGuardarTexto}>
                  CONFIRMAR ({extrasSeleccionados.length})
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1EC',
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: BORDER_W,
    borderBottomColor: INK,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },
  countBadge: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: COLORS.info,
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // ── Buscador ─────────────────────────────────────────────────────────────
  busquedaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 14,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
    height: 52,
    gap: 10,
  },
  busquedaInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: INK,
  },

  // ── Filtros ──────────────────────────────────────────────────────────────
  filtrosContainer: {
    marginTop: 14,
  },
  filtrosContent: {
    gap: 10,
    paddingHorizontal: 16,
  },
  filtroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    gap: 6,
    borderWidth: 2,
    borderColor: INK,
  },
  filtroChipTexto: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: INK,
  },

  // ── Lista ────────────────────────────────────────────────────────────────
  listContainer: {
    padding: 16,
    paddingBottom: 110,
  },

  // ── Tarjeta Producto ────────────────────────────────────────────────────
  productoCard: {
    backgroundColor: COLORS.white,
    marginBottom: 16,
    padding: 16,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
  },
  productoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productoHeaderLeft: {
    flex: 1,
  },
  productoNombre: {
    fontSize: 19,
    fontWeight: '800',
    color: INK,
    marginBottom: 8,
  },
  productoBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: INK,
  },
  estadoBadgeTexto: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  productoCategoriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  productoCategoria: {
    fontSize: 13,
    color: INK,
    fontWeight: '700',
  },
  productoDescripcion: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },

  // ── Grid de información financiera ─────────────────────────────────────
  productoInfoGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  productoInfoItem: {
    flex: 1,
    backgroundColor: '#F1F1EC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: INK,
    alignItems: 'center',
    gap: 4,
  },
  productoInfoLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  productoInfoValue: {
    fontSize: 17,
    fontWeight: '800',
    color: INK,
    textAlign: 'center',
  },

  // ── Indicadores ─────────────────────────────────────────────────────────
  productoIndicadores: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  indicadorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1EC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: INK,
    gap: 4,
  },
  indicadorChipTexto: {
    fontSize: 11,
    color: INK,
    fontWeight: '700',
  },

  // ── Acciones ─────────────────────────────────────────────────────────────
  productoAcciones: {
    flexDirection: 'row',
    gap: 10,
  },
  botonAccion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: INK,
    gap: 6,
  },
  botonEditar: {
    backgroundColor: COLORS.info,
  },
  botonEliminar: {
    backgroundColor: '#FF9494',
  },
  botonAccionTexto: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },

  // ── FAB Button ──────────────────────────────────────────────────────────
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.primary,
    borderWidth: BORDER_W,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Empty State ─────────────────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyIconBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.white,
    borderWidth: BORDER_W,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  emptyTexto: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },
  emptySubtexto: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },

  // ── Modal ────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 13, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: BORDER_W,
    borderColor: INK,
    borderBottomWidth: 0,
    maxHeight: '95%',
  },
  modalSecundarioContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: BORDER_W,
    borderColor: INK,
    borderBottomWidth: 0,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: BORDER_W,
    borderBottomColor: INK,
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: '#F1F1EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContenido: {
    maxHeight: '75%',
  },

  // ── Formulario ──────────────────────────────────────────────────────────
  seccionFormulario: {
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#EDEDE6',
  },
  ultimaSeccion: {
    borderBottomWidth: 0,
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seccionTitulo: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
    color: INK,
    borderWidth: 2,
    borderColor: INK,
  },
  formInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // ── Chips de Categoría ──────────────────────────────────────────────────
  chipScroll: {
    flexDirection: 'row',
  },
  chipCategoria: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 10,
    borderWidth: 2,
    borderColor: INK,
  },
  chipCategoriaActiva: {
    backgroundColor: COLORS.primary,
  },
  chipCategoriaTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
  },

  // ── Switch ──────────────────────────────────────────────────────────────
  switchBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    flex: 1,
    backgroundColor: '#F1F1EC',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchTextSmall: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: INK,
  },

  // ── Selector de Receta ──────────────────────────────────────────────────
  selectorReceta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: INK,
    gap: 12,
  },
  selectorRecetaTexto: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: INK,
  },
  selectorRecetaPlaceholder: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // ── Resumen de Receta ───────────────────────────────────────────────────
  resumenReceta: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
  },
  resumenRecetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  resumenRecetaTitulo: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  resumenRecetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  resumenRecetaItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F1F1EC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: INK,
  },
  resumenRecetaLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  resumenRecetaValor: {
    fontSize: 16,
    fontWeight: '800',
    color: INK,
  },

  // ── Precio ──────────────────────────────────────────────────────────────
  precioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
    paddingHorizontal: 16,
  },
  precioSimbolo: {
    fontSize: 18,
    fontWeight: '800',
    color: INK,
    marginRight: 8,
  },
  precioInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '700',
    color: INK,
  },

  // ── Panel Financiero ────────────────────────────────────────────────────
  panelFinanciero: {
    marginTop: 16,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
  },
  panelFinancieroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  panelFinancieroTitulo: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  panelFinancieroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  panelFinancieroItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F1F1EC',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: INK,
    alignItems: 'center',
  },
  panelFinancieroItemDestacado: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  panelFinancieroLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: COLORS.textSecondary,
    marginBottom: 6,
    textAlign: 'center',
  },
  panelFinancieroValor: {
    fontSize: 19,
    fontWeight: '800',
    color: INK,
    textAlign: 'center',
  },
  panelFinancieroValorGrande: {
    fontSize: 23,
    color: COLORS.success,
  },
  panelFinancieroFormula: {
    backgroundColor: '#F1F1EC',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: INK,
  },
  panelFinancieroFormulaTexto: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: INK,
  },

  // ── Extras ──────────────────────────────────────────────────────────────
  contadorExtras: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: INK,
    gap: 5,
  },
  contadorExtrasTexto: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: INK,
  },
  botonSeleccionarExtras: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: INK,
    gap: 10,
  },
  botonSeleccionarExtrasTexto: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: INK,
  },
  extrasSeleccionadosLista: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 16,
  },
  chipExtra: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: INK,
    gap: 8,
  },
  chipExtraTexto: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: INK,
  },
  chipExtraOpciones: {
    fontSize: 12,
    fontWeight: '600',
    color: INK,
    opacity: 0.75,
  },

  // ── Botones Modal ────────────────────────────────────────────────────────
  modalAcciones: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: BORDER_W,
    borderTopColor: INK,
  },
  botonModal: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: BORDER_W,
    borderColor: INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonCancelar: {
    backgroundColor: '#F1F1EC',
  },
  botonCancelarTexto: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  botonGuardar: {
    backgroundColor: COLORS.primary,
  },
  botonGuardarDisabled: {
    backgroundColor: '#B8B6AB',
  },
  botonGuardarTexto: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },

  // ── Lista de Recetas ────────────────────────────────────────────────────
  listaRecetas: {
    padding: 20,
  },
  recetaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: INK,
  },
  recetaItemSeleccionada: {
    backgroundColor: '#EAF7EF',
    borderWidth: BORDER_W,
  },
  recetaItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  recetaItemNombre: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    marginBottom: 4,
  },
  recetaItemDetalle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },

  // ── Lista de Extras ─────────────────────────────────────────────────────
  listaExtras: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  extraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: INK,
  },
  extraItemSeleccionado: {
    backgroundColor: '#EAF7EF',
    borderWidth: BORDER_W,
  },
  extraItemInfo: {
    flex: 1,
    marginRight: 10,
  },
  extraItemNombre: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    marginBottom: 4,
  },
  extraItemDetalle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  extraItemCirculo: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: INK,
    backgroundColor: '#F1F1EC',
  },
});