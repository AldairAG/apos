import { COLORS, POSBadge, POSButton, POSCard, POSIcon } from '@/components/pos';
import { MOCK_CATEGORIAS, MOCK_PRODUCTOS } from '@/data/posMockData';
import { Categoria } from '@/features/producto/categoria/categoria.types';
import { Producto } from '@/features/producto/producto/producto.types';
import { useProducto } from '@/features/producto/producto/useProducto';
import { Extra, ItemOrden } from '@/types/pos.types';

import { useEffect, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CrearOrdenScreen() {
  const {productos,cargarProductos, obtenerCategoriasDeProductos}=useProducto(); 

  useEffect(() => {
    cargarProductos();
  }, []);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number>(1);
  const [itemsOrden, setItemsOrden] = useState<ItemOrden[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [modalProductoVisible, setModalProductoVisible] = useState(false);
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<Extra[]>([]);
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState('');
  const [paraLlevar, setParaLlevar] = useState(false);

  const productosFiltrados = productos.filter(
    p => p.categoria.id === categoriaSeleccionada && p.disponible
  );

  const agregarProducto = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setExtrasSeleccionados([]);
    setCantidad(1);
    setNotas('');
    setModalProductoVisible(true);
  };

  const confirmarAgregarProducto = () => {
    if (!productoSeleccionado) return;

    const precioExtras = extrasSeleccionados.reduce((sum, e) => sum + e.precio, 0);
    const precioTotal = (productoSeleccionado.precioVenta + precioExtras) * cantidad;

    /*const nuevoItem: ItemOrden = {
      id: `${Date.now()}-${Math.random()}`,
      productoId: productoSeleccionado.id,
      producto: productoSeleccionado,
      cantidad,
      precio: productoSeleccionado.precioVenta + precioExtras,
      extras: extrasSeleccionados,
      notas: notas.trim() || undefined,
      subtotal: precioTotal,
    };

    setItemsOrden([...itemsOrden, nuevoItem]);
    setModalProductoVisible(false);
    setProductoSeleccionado(null); */
  };

  const eliminarItem = (itemId: string) => {
    setItemsOrden(itemsOrden.filter(item => item.id !== itemId));
  };

  const toggleExtra = (extra: Extra) => {
    if (extrasSeleccionados.find(e => e.id === extra.id)) {
      setExtrasSeleccionados(extrasSeleccionados.filter(e => e.id !== extra.id));
    } else {
      setExtrasSeleccionados([...extrasSeleccionados, extra]);
    }
  };

  const calcularSubtotal = () => {
    return itemsOrden.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal();
  };

  const finalizarOrden = () => {
    if (itemsOrden.length === 0) return;
    console.log('Orden creada:', {
      items: itemsOrden,
      paraLlevar,
      total: calcularTotal(),
    });
    // Reiniciar
    setItemsOrden([]);
    setParaLlevar(false);
  };

  const renderCategoriaChip = (categoria: Categoria) => (
    <TouchableOpacity
      key={categoria.id}
      style={[
        styles.categoriaChip,
        categoriaSeleccionada === categoria.id && styles.categoriaChipActivo,
      ]}
      onPress={() => setCategoriaSeleccionada(categoria.id)}
    >
      <Text
        style={[
          styles.categoriaChipText,
          categoriaSeleccionada === categoria.id && styles.categoriaChipTextoActivo,
        ]}
      >
        {categoria.nombre}
      </Text>
    </TouchableOpacity>
  );

  const renderProductoCard = (producto: Producto) => (
    <TouchableOpacity
      key={producto.id}
      style={styles.productoCard}
      onPress={() => agregarProducto(producto)}
      activeOpacity={0.7}
    >
      <View style={styles.productoInfo}>
        <Text style={styles.productoNombre} numberOfLines={2}>
          {producto.nombre}
        </Text>
        <Text style={styles.productoDescripcion} numberOfLines={1}>
          {producto.descripcion}
        </Text>
        <Text style={styles.productoPrecio}>${producto.precioVenta}</Text>
      </View>
      <View style={styles.productoIconContainer}>
        <POSIcon name="add-circle" size={32} color={COLORS.success} />
      </View>
    </TouchableOpacity>
  );

  const renderItemOrden = ({ item }: { item: ItemOrden }) => (
    <POSCard style={styles.itemOrdenCard}>
      <View style={styles.itemOrdenHeader}>
        <View style={styles.itemOrdenInfo}>
          <Text style={styles.itemOrdenCantidad}>{item.cantidad}x</Text>
          <View style={styles.itemOrdenDetalles}>
            <Text style={styles.itemOrdenNombre}>{item.producto.nombre}</Text>
            {item.extras.length > 0 && (
              <Text style={styles.itemOrdenExtras}>
                + {item.extras.map(e => e.nombre).join(', ')}
              </Text>
            )}
            {item.notas && (
              <Text style={styles.itemOrdenNotas}>Nota: {item.notas}</Text>
            )}
          </View>
        </View>
        <View style={styles.itemOrdenActions}>
          <Text style={styles.itemOrdenPrecio}>${item.subtotal.toFixed(2)}</Text>
          <TouchableOpacity onPress={() => eliminarItem(item.id)}>
            <POSIcon name="trash" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </POSCard>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Nueva Orden</Text>
        <TouchableOpacity
          style={[styles.paraLlevarButton, paraLlevar && styles.paraLlevarButtonActivo]}
          onPress={() => setParaLlevar(!paraLlevar)}
        >
          <POSIcon 
            name="bag-handle" 
            size={20} 
            color={paraLlevar ? COLORS.white : COLORS.primary} 
          />
          <Text style={[
            styles.paraLlevarButtonText,
            paraLlevar && styles.paraLlevarButtonTextoActivo
          ]}>
            Para llevar
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Categorías */}
        <View style={styles.categoriasContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categorias}
          >
            {obtenerCategoriasDeProductos().map(renderCategoriaChip)}
          </ScrollView>
        </View>

        {/* Productos */}
        <ScrollView style={styles.productosContainer}>
          <View style={styles.productosGrid}>
            {productosFiltrados.map(renderProductoCard)}
          </View>
        </ScrollView>

        {/* Resumen de Orden */}
        {itemsOrden.length > 0 && (
          <View style={styles.resumenContainer}>
            <View style={styles.resumenHeader}>
              <Text style={styles.resumenTitle}>Orden Actual</Text>
              <POSBadge 
                label={`${itemsOrden.length} item${itemsOrden.length > 1 ? 's' : ''}`} 
                variant="info"
                size="small"
              />
            </View>

            <FlatList
              data={itemsOrden}
              renderItem={renderItemOrden}
              keyExtractor={(item) => item.id}
              style={styles.itemsLista}
              contentContainerStyle={styles.itemsListaContent}
            />

            <View style={styles.resumenTotales}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>${calcularSubtotal().toFixed(2)}</Text>
              </View>
              <View style={[styles.totalRow, styles.totalRowFinal]}>
                <Text style={styles.totalLabelFinal}>Total:</Text>
                <Text style={styles.totalValueFinal}>${calcularTotal().toFixed(2)}</Text>
              </View>
            </View>

            <POSButton
              title="Finalizar Orden"
              onPress={finalizarOrden}
              variant="success"
              size="large"
              fullWidth
            />
          </View>
        )}
      </View>

      {/* Modal de Producto */}
      <Modal
        visible={modalProductoVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalProductoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{productoSeleccionado?.nombre}</Text>
              <TouchableOpacity onPress={() => setModalProductoVisible(false)}>
                <POSIcon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalDescripcion}>
                {productoSeleccionado?.descripcion}
              </Text>
              <Text style={styles.modalPrecio}>
                ${productoSeleccionado?.precioVenta}
              </Text>

              {/* Cantidad */}
              <View style={styles.cantidadContainer}>
                <Text style={styles.cantidadLabel}>Cantidad:</Text>
                <View style={styles.cantidadControles}>
                  <TouchableOpacity
                    style={styles.cantidadButton}
                    onPress={() => setCantidad(Math.max(1, cantidad - 1))}
                  >
                    <POSIcon name="remove" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                  <Text style={styles.cantidadValor}>{cantidad}</Text>
                  <TouchableOpacity
                    style={styles.cantidadButton}
                    onPress={() => setCantidad(cantidad + 1)}
                  >
                    <POSIcon name="add" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Extras */}
{/*               {productoSeleccionado?.extras && productoSeleccionado.extras.length > 0 && (
                <View style={styles.extrasContainer}>
                  <Text style={styles.extrasTitle}>Extras:</Text>
                  {productoSeleccionado.extras.map(extra => {
                    const seleccionado = extrasSeleccionados.find(e => e.id === extra.id);
                    return (
                      <TouchableOpacity
                        key={extra.id}
                        style={[
                          styles.extraItem,
                          seleccionado && styles.extraItemSeleccionado,
                        ]}
                        onPress={() => toggleExtra(extra)}
                      >
                        <View style={styles.extraCheckbox}>
                          {seleccionado && (
                            <POSIcon name="checkmark" size={18} color={COLORS.white} />
                          )}
                        </View>
                        <Text style={styles.extraNombre}>{extra.nombre}</Text>
                        {extra.precio > 0 && (
                          <Text style={styles.extraPrecio}>+${extra.precio}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )} */}

              {/* Notas */}
              <View style={styles.notasContainer}>
                <Text style={styles.notasLabel}>Notas especiales:</Text>
                <TextInput
                  style={styles.notasInput}
                  value={notas}
                  onChangeText={setNotas}
                  placeholder="Ej: Sin cebolla, término medio..."
                  placeholderTextColor={COLORS.textSecondary}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <POSButton
                title="Cancelar"
                onPress={() => setModalProductoVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <POSButton
                title="Agregar"
                onPress={confirmarAgregarProducto}
                variant="success"
                style={styles.modalButton}
              />
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
  header: {
    backgroundColor: COLORS.white,
    padding: 16,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  paraLlevarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  paraLlevarButtonActivo: {
    backgroundColor: COLORS.primary,
  },
  paraLlevarButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  paraLlevarButtonTextoActivo: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  categoriasContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categorias: {
    padding: 16,
    gap: 8,
  },
  categoriaChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
  },
  categoriaChipActivo: {
    backgroundColor: COLORS.primary,
  },
  categoriaChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoriaChipTextoActivo: {
    color: COLORS.white,
  },
  productosContainer: {
    flex: 1,
  },
  productosGrid: {
    padding: 16,
    gap: 12,
  },
  productoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productoInfo: {
    flex: 1,
    gap: 4,
  },
  productoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  productoDescripcion: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  productoPrecio: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
    marginTop: 4,
  },
  productoIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 12,
  },
  resumenContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    maxHeight: '50%',
  },
  resumenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resumenTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  itemsLista: {
    maxHeight: 200,
  },
  itemsListaContent: {
    padding: 16,
    gap: 8,
  },
  itemOrdenCard: {
    padding: 12,
  },
  itemOrdenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemOrdenInfo: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  itemOrdenCantidad: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  itemOrdenDetalles: {
    flex: 1,
    gap: 2,
  },
  itemOrdenNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemOrdenExtras: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  itemOrdenNotas: {
    fontSize: 12,
    color: COLORS.info,
    fontStyle: 'italic',
  },
  itemOrdenActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  itemOrdenPrecio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  resumenTotales: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: 16,
    color: COLORS.text,
  },
  totalRowFinal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabelFinal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValueFinal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  modalBody: {
    padding: 20,
  },
  modalDescripcion: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  modalPrecio: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 20,
  },
  cantidadContainer: {
    marginBottom: 20,
  },
  cantidadLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  cantidadControles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  cantidadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cantidadValor: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 40,
    textAlign: 'center',
  },
  extrasContainer: {
    marginBottom: 20,
  },
  extrasTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  extraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    marginBottom: 8,
  },
  extraItemSeleccionado: {
    backgroundColor: '#E3F2FD',
  },
  extraCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  extraNombre: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  extraPrecio: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  notasContainer: {
    marginBottom: 20,
  },
  notasLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  notasInput: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  modalButton: {
    flex: 1,
  },
});
