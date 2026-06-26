import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { useCategoria } from '@/features/producto/categoria/useCategoria';
import { useExtra } from '@/features/producto/grupoExtra/useExtra';
import { createProductoDTO, Producto } from '@/features/producto/producto/producto.types';
import { useProducto } from '@/features/producto/producto/useProducto';
import { Receta } from '@/features/producto/receta/receta.types';
import { useRecetas } from '@/features/producto/receta/useReceta';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

type FiltroTipo = 'todos' | 'activos' | 'inactivos' | 'destacados';

export default function ProductosScreen() {
  const { productos, loading, saveProducto, cargarProductos } = useProducto();
  const { categorias, cargarCategorias } = useCategoria();
  const { recetas, cargarRecetas } = useRecetas();
  const { grupos, cargarGrupos } = useExtra();

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
  });

  const [costoPersonalizado, setCostoPersonalizado] = useState(false);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<number[]>([]);

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
    const margen = formData.margen;

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
      // Mock: calcular costo por unidad de receta
      const costoTotal = 50; // Mock
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

    // Filtrar por búsqueda
    if (busqueda) {
      resultado = resultado.filter((p) =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtrar por tipo
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
  };

  const handleGuardar = () => {
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

    const dataToSave: createProductoDTO = {
      ...formData,
      gruposExtra: undefined,
    };

    saveProducto(dataToSave);
    handleCerrarModal();
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
    return (
      <TouchableOpacity
        style={[styles.filtroChip, isActive && styles.filtroChipActive]}
        onPress={() => setFiltroActivo(tipo)}
      >
        <POSIcon 
          name={icono as any} 
          size={16} 
          color={isActive ? COLORS.white : COLORS.textSecondary} 
        />
        <Text style={[styles.filtroChipTexto, isActive && styles.filtroChipTextoActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProductoItem = ({ item }: { item: Producto }) => {
    return (
      <POSCard style={styles.productoCard} variant="elevated">
        <View style={styles.productoHeader}>
          <View style={styles.productoHeaderLeft}>
            <Text style={styles.productoNombre}>{item.nombre}</Text>
            <View style={styles.productoBadges}>
              {item.destacado && (
                <POSBadge label="DESTACADO" variant="warning" size="small" />
              )}
              <POSBadge 
                label={item.activo ? 'ACTIVO' : 'INACTIVO'} 
                variant={item.activo ? 'success' : 'default'}
                size="small"
              />
            </View>
          </View>
        </View>

        <Text style={styles.productoCategoria}>
          <POSIcon name="pricetag-outline" size={14} color={COLORS.primary} />
          {' '}{item.categoria.nombre}
        </Text>

        {item.descripcion && (
          <Text style={styles.productoDescripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}

        {/* Grid de Información Financiera */}
        <View style={styles.productoInfoGrid}>
          <View style={styles.productoInfoItem}>
            <Text style={styles.productoInfoLabel}>Precio</Text>
            <Text style={[styles.productoInfoValue, { color: COLORS.success }]}>
              ${item.precioVenta.toFixed(2)}
            </Text>
          </View>

          <View style={styles.productoInfoItem}>
            <Text style={styles.productoInfoLabel}>Costo</Text>
            <Text style={styles.productoInfoValue}>
              ${item.costo.toFixed(2)}
            </Text>
          </View>

          <View style={styles.productoInfoItem}>
            <Text style={styles.productoInfoLabel}>Margen</Text>
            <Text style={[styles.productoInfoValue, { color: COLORS.warning }]}>
              {item.margen.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Indicadores */}
        <View style={styles.productoIndicadores}>
          {item.gruposExtra && item.gruposExtra.length > 0 && (
            <View style={styles.indicadorChip}>
              <POSIcon name="add-circle-outline" size={14} color={COLORS.info} />
              <Text style={styles.indicadorChipTexto}>
                {item.gruposExtra.length} extra{item.gruposExtra.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
          
          <View style={styles.indicadorChip}>
            <POSIcon name="time-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.indicadorChipTexto}>
              {item.tiempoPreparacion} min
            </Text>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.productoAcciones}>
          <TouchableOpacity
            style={[styles.botonAccion, styles.botonEditar]}
            onPress={() => handleEditar(item)}
          >
            <POSIcon name="create-outline" size={20} color={COLORS.primary} />
            <Text style={styles.botonAccionTexto}>Editar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.botonAccion, styles.botonEliminar]}
            onPress={() => handleEliminar(item)}
          >
            <POSIcon name="trash-outline" size={20} color={COLORS.danger} />
            <Text style={[styles.botonAccionTexto, styles.botonEliminarTexto]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </POSCard>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Productos</Text>
          <POSBadge 
            label={`${productosFiltrados.length} productos`} 
            variant="info"
          />
        </View>
        <Text style={styles.subtitle}>
          Administra tu catálogo de productos
        </Text>
      </View>

      {/* Navegación por Tabs */}
      <View style={styles.navigationTabs}>
        <TouchableOpacity style={styles.tabActive}>
          <POSIcon name="restaurant-outline" size={20} color={COLORS.primary} />
          <Text style={styles.tabTextActive}>Productos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => router.push('/config/categorias')}
        >
          <POSIcon name="grid-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.tabText}>Categorías</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.tab}
          onPress={() => router.push('/productos/extras')}
        >
          <POSIcon name="add-circle-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.tabText}>Extras</Text>
        </TouchableOpacity>
      </View>

      {/* Buscador */}
      <View style={styles.busquedaContainer}>
        <POSIcon name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.busquedaInput}
          placeholder="Buscar producto..."
          placeholderTextColor={COLORS.textSecondary}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <POSIcon name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
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
        {renderFiltro('inactivos', 'Inactivos', 'close-circle-outline')}
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
            <POSIcon name="fast-food-outline" size={80} color={COLORS.border} />
            <Text style={styles.emptyTexto}>No hay productos</Text>
            <Text style={styles.emptySubtexto}>
              {busqueda ? 'Intenta con otra búsqueda' : 'Crea tu primer producto'}
            </Text>
          </View>
        }
      />

      {/* FAB Button */}
      <TouchableOpacity style={styles.fabButton} onPress={handleNuevo}>
        <POSIcon name="add" size={32} color={COLORS.white} />
      </TouchableOpacity>

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
                {productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
              </Text>
              <TouchableOpacity onPress={handleCerrarModal}>
                <POSIcon name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Contenido del Formulario */}
            <ScrollView style={styles.modalContenido} showsVerticalScrollIndicator={false}>
              {/* Sección: Información General */}
              <View style={styles.seccionFormulario}>
                <Text style={styles.seccionTitulo}>Información General</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nombre *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Ej: Hamburguesa Clásica"
                    placeholderTextColor={COLORS.textSecondary}
                    value={formData.nombre}
                    onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Descripción</Text>
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
                  <Text style={styles.formLabel}>Categoría *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                    {categorias.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.chipCategoria,
                          formData.categoriaId === cat.id && styles.chipCategoriaActiva,
                        ]}
                        onPress={() => setFormData({ ...formData, categoriaId: cat.id })}
                      >
                        <Text
                          style={[
                            styles.chipCategoriaTexto,
                            formData.categoriaId === cat.id && styles.chipCategoriaTextoActivo,
                          ]}
                        >
                          {cat.nombre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.switchContainer}>
                    <View style={styles.switchLabel}>
                      <POSIcon name="power" size={20} color={formData.activo ? COLORS.success : COLORS.textSecondary} />
                      <Text style={styles.switchTextSmall}>Activo</Text>
                    </View>
                    <Switch
                      value={formData.activo}
                      onValueChange={(value) => setFormData({ ...formData, activo: value })}
                      trackColor={{ false: COLORS.border, true: COLORS.success }}
                      thumbColor={COLORS.white}
                    />
                  </View>

                  <View style={styles.switchContainer}>
                    <View style={styles.switchLabel}>
                      <POSIcon name="star" size={20} color={formData.destacado ? COLORS.warning : COLORS.textSecondary} />
                      <Text style={styles.switchTextSmall}>Destacado</Text>
                    </View>
                    <Switch
                      value={formData.destacado}
                      onValueChange={(value) => setFormData({ ...formData, destacado: value })}
                      trackColor={{ false: COLORS.border, true: COLORS.warning }}
                      thumbColor={COLORS.white}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Tiempo de Preparación (min)</Text>
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
                  <Text style={styles.seccionTitulo}>Receta Asociada</Text>
                  {recetaSeleccionada && (
                    <POSBadge label="VINCULADA" variant="success" size="small" />
                  )}
                </View>

                <TouchableOpacity
                  style={styles.selectorReceta}
                  onPress={() => setModalRecetaVisible(true)}
                >
                  {recetaSeleccionada ? (
                    <>
                      <POSIcon name="checkmark-circle" size={20} color={COLORS.success} />
                      <Text style={styles.selectorRecetaTexto}>{recetaSeleccionada.nombre}</Text>
                    </>
                  ) : (
                    <>
                      <POSIcon name="document-text-outline" size={20} color={COLORS.textSecondary} />
                      <Text style={[styles.selectorRecetaTexto, styles.selectorRecetaPlaceholder]}>
                        Seleccionar receta (opcional)
                      </Text>
                    </>
                  )}
                  <POSIcon name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>

                {recetaSeleccionada && (
                  <POSCard style={styles.resumenReceta} variant="outlined">
                    <View style={styles.resumenRecetaHeader}>
                      <POSIcon name="restaurant-outline" size={24} color={COLORS.primary} />
                      <Text style={styles.resumenRecetaTitulo}>Resumen de Receta</Text>
                    </View>

                    <View style={styles.resumenRecetaGrid}>
                      <View style={styles.resumenRecetaItem}>
                        <Text style={styles.resumenRecetaLabel}>Rendimiento</Text>
                        <Text style={styles.resumenRecetaValor}>
                          {recetaSeleccionada.rendimiento} {recetaSeleccionada.unidadRendimiento}
                        </Text>
                      </View>

                      <View style={styles.resumenRecetaItem}>
                        <Text style={styles.resumenRecetaLabel}>Ingredientes</Text>
                        <Text style={styles.resumenRecetaValor}>
                          {recetaSeleccionada.detalles?.length || 0}
                        </Text>
                      </View>

                      <View style={styles.resumenRecetaItem}>
                        <Text style={styles.resumenRecetaLabel}>Costo Total</Text>
                        <Text style={[styles.resumenRecetaValor, { color: COLORS.danger }]}>
                          $50.00
                        </Text>
                      </View>

                      <View style={styles.resumenRecetaItem}>
                        <Text style={styles.resumenRecetaLabel}>Costo x Unidad</Text>
                        <Text style={[styles.resumenRecetaValor, { color: COLORS.success }]}>
                          ${(50 / (recetaSeleccionada.rendimiento || 1)).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.switchContainer}>
                      <Text style={styles.switchTextSmall}>Costo personalizado</Text>
                      <Switch
                        value={costoPersonalizado}
                        onValueChange={setCostoPersonalizado}
                        trackColor={{ false: COLORS.border, true: COLORS.primary }}
                        thumbColor={COLORS.white}
                      />
                    </View>
                  </POSCard>
                )}
              </View>

              {/* Sección: Configuración Comercial */}
              <View style={styles.seccionFormulario}>
                <Text style={styles.seccionTitulo}>Configuración Comercial</Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Costo {recetaSeleccionada && !costoPersonalizado ? '(de receta)' : ''}</Text>
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
                  <Text style={styles.formLabel}>Margen de Ganancia (%)</Text>
                  <View style={styles.precioContainer}>
                    <Text style={[styles.precioSimbolo, { color: COLORS.warning }]}>%</Text>
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
                  <Text style={styles.formLabel}>Precio de Venta *</Text>
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

                {/* Panel Financiero Destacado */}
                <POSCard style={styles.panelFinanciero} variant="elevated">
                  <View style={styles.panelFinancieroHeader}>
                    <POSIcon name="trending-up-outline" size={28} color={COLORS.success} />
                    <Text style={styles.panelFinancieroTitulo}>Análisis Financiero</Text>
                  </View>

                  <View style={styles.panelFinancieroGrid}>
                    <View style={styles.panelFinancieroItem}>
                      <Text style={styles.panelFinancieroLabel}>Costo</Text>
                      <Text style={styles.panelFinancieroValor}>
                        ${valoresFinancieros.costo.toFixed(2)}
                      </Text>
                    </View>

                    <View style={[styles.panelFinancieroItem, styles.panelFinancieroItemDestacado]}>
                      <Text style={styles.panelFinancieroLabel}>Utilidad</Text>
                      <Text style={[styles.panelFinancieroValor, { color: COLORS.success }]}>
                        ${valoresFinancieros.utilidad.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.panelFinancieroItem}>
                      <Text style={styles.panelFinancieroLabel}>Margen</Text>
                      <Text style={[styles.panelFinancieroValor, { color: COLORS.warning }]}>
                        {valoresFinancieros.margen.toFixed(1)}%
                      </Text>
                    </View>

                    <View style={[styles.panelFinancieroItem, styles.panelFinancieroItemDestacado]}>
                      <Text style={styles.panelFinancieroLabel}>Precio Venta</Text>
                      <Text style={[styles.panelFinancieroValor, styles.panelFinancieroValorGrande]}>
                        ${valoresFinancieros.precioVenta.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.panelFinancieroFormula}>
                    <Text style={styles.panelFinancieroFormulaTexto}>
                      Precio = Costo × (1 + Margen%)
                    </Text>
                  </View>
                </POSCard>
              </View>

              {/* Sección: Grupos de Extras */}
              <View style={styles.seccionFormulario}>
                <View style={styles.seccionHeader}>
                  <Text style={styles.seccionTitulo}>Grupos de Extras</Text>
                  <View style={styles.contadorExtras}>
                    <POSIcon name="add-circle-outline" size={16} color={COLORS.info} />
                    <Text style={styles.contadorExtrasTexto}>
                      {extrasSeleccionados.length} seleccionados
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.botonSeleccionarExtras}
                  onPress={() => setModalExtrasVisible(true)}
                >
                  <POSIcon name="list-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.botonSeleccionarExtrasTexto}>
                    Seleccionar Grupos de Extras
                  </Text>
                  <POSIcon name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>

                {extrasSeleccionados.length > 0 && (
                  <View style={styles.extrasSeleccionadosLista}>
                    {extrasSeleccionados.map((grupoId) => {
                      const grupo = grupos.find((g) => g.id === grupoId);
                      return grupo ? (
                        <View key={grupoId} style={styles.chipExtra}>
                          <Text style={styles.chipExtraTexto}>{grupo.nombre}</Text>
                          <Text style={styles.chipExtraOpciones}>
                            {grupo.opciones.length} opciones
                          </Text>
                          <TouchableOpacity onPress={() => handleToggleExtra(grupoId)}>
                            <POSIcon name="close" size={16} color={COLORS.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      ) : null;
                    })}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Botones de Acción */}
            <View style={styles.modalAcciones}>
              <TouchableOpacity
                style={[styles.botonModal, styles.botonCancelar]}
                onPress={handleCerrarModal}
              >
                <Text style={styles.botonCancelarTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botonModal, styles.botonGuardar]}
                onPress={handleGuardar}
              >
                <Text style={styles.botonGuardarTexto}>
                  {productoEditando ? 'Actualizar' : 'Crear Producto'}
                </Text>
              </TouchableOpacity>
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
              <Text style={styles.modalTitulo}>Seleccionar Receta</Text>
              <TouchableOpacity onPress={() => setModalRecetaVisible(false)}>
                <POSIcon name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.listaRecetas}>
              <TouchableOpacity
                style={styles.recetaItem}
                onPress={() => {
                  setFormData({ ...formData, recetaId: 0 });
                  setModalRecetaVisible(false);
                }}
              >
                <View style={styles.recetaItemInfo}>
                  <Text style={styles.recetaItemNombre}>Sin receta</Text>
                  <Text style={styles.recetaItemDetalle}>No vincular con receta</Text>
                </View>
                {formData.recetaId === 0 && (
                  <POSIcon name="checkmark-circle" size={28} color={COLORS.success} />
                )}
              </TouchableOpacity>

              {recetas.map((receta: Receta) => (
                <TouchableOpacity
                  key={receta.id}
                  style={styles.recetaItem}
                  onPress={() => handleSeleccionarReceta(receta.id)}
                >
                  <View style={styles.recetaItemInfo}>
                    <Text style={styles.recetaItemNombre}>{receta.nombre}</Text>
                    <Text style={styles.recetaItemDetalle}>
                      Rendimiento: {receta.rendimiento} {receta.unidadRendimiento}
                    </Text>
                  </View>
                  {formData.recetaId === receta.id && (
                    <POSIcon name="checkmark-circle" size={28} color={COLORS.success} />
                  )}
                </TouchableOpacity>
              ))}
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
              <Text style={styles.modalTitulo}>Seleccionar Extras</Text>
              <TouchableOpacity onPress={() => setModalExtrasVisible(false)}>
                <POSIcon name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.listaExtras}>
              {grupos.map((grupo) => {
                const isSeleccionado = extrasSeleccionados.includes(grupo.id);
                
                return (
                  <TouchableOpacity
                    key={grupo.id}
                    style={[
                      styles.extraItem,
                      isSeleccionado && styles.extraItemSeleccionado,
                    ]}
                    onPress={() => handleToggleExtra(grupo.id)}
                  >
                    <View style={styles.extraItemInfo}>
                      <Text style={styles.extraItemNombre}>{grupo.nombre}</Text>
                      <Text style={styles.extraItemDetalle}>
                        {grupo.opciones.length} opciones disponibles
                      </Text>
                    </View>
                    {isSeleccionado ? (
                      <POSIcon name="checkmark-circle" size={28} color={COLORS.success} />
                    ) : (
                      <POSIcon name="ellipse-outline" size={28} color={COLORS.border} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalAcciones}>
              <TouchableOpacity
                style={[styles.botonModal, styles.botonGuardar, { flex: 1 }]}
                onPress={() => setModalExtrasVisible(false)}
              >
                <Text style={styles.botonGuardarTexto}>
                  Confirmar ({extrasSeleccionados.length})
                </Text>
              </TouchableOpacity>
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
    backgroundColor: '#F5F5F5',
  },
  
  // Header
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Navegación por Tabs
  navigationTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Buscador
  busquedaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 50,
  },
  busquedaInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },

  // Filtros
  filtrosContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  filtrosContent: {
    gap: 8,
    paddingRight: 16,
  },
  filtroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filtroChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filtroChipTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filtroChipTextoActive: {
    color: COLORS.white,
  },

  // Lista
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  
  // Tarjeta Producto
  productoCard: {
    marginBottom: 16,
    padding: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  productoBadges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  productoCategoria: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 8,
    fontWeight: '600',
  },
  productoDescripcion: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  
  // Grid de información financiera
  productoInfoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  productoInfoItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  productoInfoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  productoInfoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },

  // Indicadores
  productoIndicadores: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  indicadorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  indicadorChipTexto: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Acciones
  productoAcciones: {
    flexDirection: 'row',
    gap: 8,
  },
  botonAccion: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  botonEditar: {
    backgroundColor: '#E3F2FD',
  },
  botonEliminar: {
    backgroundColor: '#FFEBEE',
  },
  botonAccionTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  botonEliminarTexto: {
    color: COLORS.danger,
  },

  // FAB Button
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTexto: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtexto: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '95%',
  },
  modalSecundarioContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalContenido: {
    maxHeight: '70%',
  },

  // Formulario
  seccionFormulario: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  seccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seccionTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
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
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Chips de Categoría
  chipScroll: {
    flexDirection: 'row',
  },
  chipCategoria: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipCategoriaActiva: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipCategoriaTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  chipCategoriaTextoActivo: {
    color: COLORS.white,
  },

  // Switch
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    flex: 1,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchTextSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Selector de Receta
  selectorReceta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  selectorRecetaTexto: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectorRecetaPlaceholder: {
    color: COLORS.textSecondary,
    fontWeight: 'normal',
  },

  // Resumen de Receta
  resumenReceta: {
    marginTop: 16,
    padding: 16,
  },
  resumenRecetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  resumenRecetaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
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
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  resumenRecetaLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  resumenRecetaValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  // Precio
  precioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  precioSimbolo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: 8,
  },
  precioInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },

  // Panel Financiero
  panelFinanciero: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#F0F9FF',
  },
  panelFinancieroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  panelFinancieroTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
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
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  panelFinancieroItemDestacado: {
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  panelFinancieroLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  panelFinancieroValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  panelFinancieroValorGrande: {
    fontSize: 24,
    color: COLORS.success,
  },
  panelFinancieroFormula: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  panelFinancieroFormulaTexto: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },

  // Extras
  contadorExtras: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  contadorExtrasTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.info,
  },
  botonSeleccionarExtras: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  botonSeleccionarExtrasTexto: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 12,
  },
  extrasSeleccionadosLista: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 16,
  },
  chipExtra: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  chipExtraTexto: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.info,
  },
  chipExtraOpciones: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // Botones Modal
  modalAcciones: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  botonModal: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCancelar: {
    backgroundColor: '#F9FAFB',
  },
  botonCancelarTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  botonGuardar: {
    backgroundColor: COLORS.primary,
  },
  botonGuardarTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // Lista de Recetas
  listaRecetas: {
    padding: 20,
  },
  recetaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recetaItemInfo: {
    flex: 1,
  },
  recetaItemNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  recetaItemDetalle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Lista de Extras
  listaExtras: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  extraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  extraItemSeleccionado: {
    backgroundColor: '#E8F5E9',
    borderColor: COLORS.success,
  },
  extraItemInfo: {
    flex: 1,
  },
  extraItemNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  extraItemDetalle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
