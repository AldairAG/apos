import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { EstadoOrden, OrdenResponseDTO, TipoOrden } from '@/features/pos/pos.types';
import usePos from '@/features/pos/usePos';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DetalleOrdenScreen() {
  const { ordenId } = useLocalSearchParams<{ ordenId: string }>();
  const { ordenes } = usePos();
  const [orden, setOrden] = useState<OrdenResponseDTO | null>(null);
  const [mostrarAcciones, setMostrarAcciones] = useState(false);

  useEffect(() => {
    loadOrden();
  }, [ordenId]);

  const loadOrden = async () => {
    try {
      const ordenEncontrada = ordenes.find((o: OrdenResponseDTO) => o.id === Number(ordenId));
      setOrden(ordenEncontrada || null);
    } catch (error) {
      console.error('Error al cargar orden:', error);
    }
  };

  if (!orden) {
    return (
      <View style={styles.loadingContainer}>
        <POSIcon name="hourglass-outline" size={60} color={COLORS.textSecondary} />
        <Text style={styles.loadingText}>Cargando orden...</Text>
      </View>
    );
  }

  const formatearFecha = (fecha: Date) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { 
      weekday: 'long',
      day: '2-digit', 
      month: 'long',
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calcularTiempoTranscurrido = () => {
    const ahora = new Date();
    const inicio = new Date(orden.createdAt);
    const diffMs = ahora.getTime() - inicio.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  const enviarACocina = () => {
    console.log('Enviar a cocina:', orden.folio);
    Alert.alert('Enviar a Cocina', `¿Deseas enviar la orden ${orden.folio} a cocina?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Enviar', onPress: () => console.log('Enviado') }
    ]);
  };

  const cobrarOrden = () => {
    console.log('Cobrar orden:', orden.folio);
    router.push(`/pos/cobro?ordenId=${orden.id}` as any);
  };

  const cancelarOrden = () => {
    Alert.alert(
      'Cancelar Orden',
      `¿Estás seguro de cancelar la orden ${orden.folio}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, Cancelar', style: 'destructive', onPress: () => console.log('Cancelado') }
      ]
    );
  };

  const continuarOrden = () => {
    router.push(`/pos/crear-orden?ordenId=${orden.id}`);
  };

  const imprimirOrden = () => {
    console.log('Imprimir orden:', orden.folio);
  };

  const tiempoTranscurrido = calcularTiempoTranscurrido();
  const puedeEditar = orden.estado === EstadoOrden.PENDIENTE || orden.estado === EstadoOrden.EN_PREPARACION;
  const puedeCobrar = orden.estado === EstadoOrden.LISTA;
  const puedeEnviarCocina = orden.estado === EstadoOrden.PENDIENTE;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <POSIcon name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Orden {orden.folio}</Text>
          <POSBadge
            label={orden.estado.replace('_', ' ')}
            variant={
              orden.estado === EstadoOrden.PENDIENTE ? 'warning' :
              orden.estado === EstadoOrden.EN_PREPARACION ? 'info' :
              orden.estado === EstadoOrden.LISTA ? 'success' :
              orden.estado === EstadoOrden.ENTREGADA ? 'default' :
              'danger'
            }
          />
        </View>

        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => setMostrarAcciones(true)}
        >
          <POSIcon name="ellipsis-vertical" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información General */}
        <POSCard variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Información General</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <POSIcon name="calendar-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fecha de Creación</Text>
                <Text style={styles.infoValue}>{formatearFecha(orden.createdAt)}</Text>
              </View>
            </View>

            {orden.tipo === TipoOrden.EN_MESA && orden.mesa && (
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <POSIcon name="restaurant" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Mesa</Text>
                  <Text style={styles.infoValue}>{orden.mesa.nombre}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <POSIcon name="bag-handle-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tipo de Orden</Text>
                <Text style={styles.infoValue}>
                  {orden.tipo === TipoOrden.EN_MESA ? 'En Mesa' :
                   orden.tipo === TipoOrden.PARA_LLEVAR ? 'Para Llevar' :
                   orden.tipo === TipoOrden.DELIVERY ? 'Delivery' : 'Recoger'}
                </Text>
              </View>
            </View>

            {orden.numeroPersonas > 0 && (
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <POSIcon name="people-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Número de Personas</Text>
                  <Text style={styles.infoValue}>{orden.numeroPersonas}</Text>
                </View>
              </View>
            )}

            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <POSIcon name="time-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Tiempo Transcurrido</Text>
                <Text style={styles.infoValue}>
                  {tiempoTranscurrido < 60 
                    ? `${tiempoTranscurrido} minutos` 
                    : `${Math.floor(tiempoTranscurrido / 60)}h ${tiempoTranscurrido % 60}m`
                  }
                </Text>
              </View>
            </View>

            {orden.tiempoPreparacion > 0 && (
              <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                  <POSIcon name="flame-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tiempo de Preparación</Text>
                  <Text style={styles.infoValue}>{orden.tiempoPreparacion} min</Text>
                </View>
              </View>
            )}
          </View>

          {orden.observaciones && (
            <View style={styles.observacionesContainer}>
              <View style={styles.observacionesHeader}>
                <POSIcon name="chatbox-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.observacionesLabel}>Observaciones</Text>
              </View>
              <Text style={styles.observacionesText}>{orden.observaciones}</Text>
            </View>
          )}
        </POSCard>

        {/* Productos */}
        <POSCard variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos</Text>
            <POSBadge 
              label={`${orden.detalles?.length || 0}`} 
              variant="info" 
              size="small"
            />
          </View>

          <View style={styles.productosContainer}>
            {orden.detalles?.map((detalle, index) => (
              <View key={index} style={styles.productoItem}>
                <View style={styles.productoHeader}>
                  <View style={styles.productoInfo}>
                    <View style={styles.productoCantidad}>
                      <Text style={styles.productoCantidadText}>{detalle.cantidad}x</Text>
                    </View>
                    <View style={styles.productoTexto}>
                      <Text style={styles.productoNombre}>Producto {detalle.id}</Text>
                      <Text style={styles.productoPrecio}>
                        ${detalle.precioUnitario.toFixed(2)} c/u
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.productoTotal}>${detalle.total.toFixed(2)}</Text>
                </View>

                {/* Extras */}
                {detalle.extras && detalle.extras.length > 0 && (
                  <View style={styles.extrasContainer}>
                    {detalle.extras.map((extra, extraIndex) => (
                      <View key={extraIndex} style={styles.extraItem}>
                        <POSIcon name="add-circle-outline" size={14} color={COLORS.info} />
                        <Text style={styles.extraNombre}>
                          {extra.nombreExtra || `Extra ${extra.id}`}
                        </Text>
                        <Text style={styles.extraCantidad}>x{extra.cantidad}</Text>
                        <Text style={styles.extraPrecio}>
                          +${extra.total.toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {index < (orden.detalles?.length || 0) - 1 && (
                  <View style={styles.productoDivider} />
                )}
              </View>
            ))}
          </View>
        </POSCard>

        {/* Resumen de Cobro */}
        <POSCard variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen de Cobro</Text>

          <View style={styles.resumenContainer}>
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Subtotal</Text>
              <Text style={styles.resumenValue}>${orden.subtotal.toFixed(2)}</Text>
            </View>

            {orden.descuento > 0 && (
              <View style={styles.resumenRow}>
                <Text style={[styles.resumenLabel, { color: COLORS.danger }]}>Descuento</Text>
                <Text style={[styles.resumenValue, { color: COLORS.danger }]}>
                  -${orden.descuento.toFixed(2)}
                </Text>
              </View>
            )}

            {orden.propina > 0 && (
              <View style={styles.resumenRow}>
                <Text style={styles.resumenLabel}>Propina</Text>
                <Text style={styles.resumenValue}>${orden.propina.toFixed(2)}</Text>
              </View>
            )}

            <View style={styles.resumenDivider} />

            <View style={styles.resumenRow}>
              <Text style={styles.resumenTotalLabel}>Total</Text>
              <Text style={styles.resumenTotalValue}>${orden.total.toFixed(2)}</Text>
            </View>
          </View>
        </POSCard>
      </ScrollView>

      {/* Acciones Fijas en el Bottom */}
      <View style={styles.bottomActions}>
        {puedeEnviarCocina && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.info, flex: 1 }]}
            onPress={enviarACocina}
          >
            <POSIcon name="send" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Enviar a Cocina</Text>
          </TouchableOpacity>
        )}

        {puedeEditar && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.primary, flex: 1 }]}
            onPress={continuarOrden}
          >
            <POSIcon name="pencil" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Editar Orden</Text>
          </TouchableOpacity>
        )}

        {puedeCobrar && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.success, flex: 1 }]}
            onPress={cobrarOrden}
          >
            <POSIcon name="cash" size={20} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Cobrar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal Acciones */}
      <Modal
        visible={mostrarAcciones}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMostrarAcciones(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMostrarAcciones(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <Text style={styles.modalTitle}>Acciones</Text>

            <TouchableOpacity
              style={styles.modalAction}
              onPress={() => {
                setMostrarAcciones(false);
                imprimirOrden();
              }}
            >
              <POSIcon name="print-outline" size={24} color={COLORS.text} />
              <Text style={styles.modalActionText}>Imprimir Orden</Text>
            </TouchableOpacity>

            {orden.estado !== EstadoOrden.CANCELADA && orden.estado !== EstadoOrden.ENTREGADA && (
              <TouchableOpacity
                style={styles.modalAction}
                onPress={() => {
                  setMostrarAcciones(false);
                  cancelarOrden();
                }}
              >
                <POSIcon name="close-circle-outline" size={24} color={COLORS.danger} />
                <Text style={[styles.modalActionText, { color: COLORS.danger }]}>
                  Cancelar Orden
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalAction, styles.modalActionCancel]}
              onPress={() => setMostrarAcciones(false)}
            >
              <Text style={styles.modalActionCancelText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },

  // Section
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },

  // Info Grid
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
  },

  // Observaciones
  observacionesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    gap: 8,
  },
  observacionesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  observacionesLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  observacionesText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },

  // Productos
  productosContainer: {
    gap: 0,
  },
  productoItem: {
    paddingVertical: 12,
  },
  productoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productoInfo: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  productoCantidad: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productoCantidadText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  productoTexto: {
    flex: 1,
    gap: 4,
  },
  productoNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  productoPrecio: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  productoTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  productoDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 12,
  },

  // Extras
  extrasContainer: {
    marginTop: 8,
    marginLeft: 52,
    gap: 6,
  },
  extraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  extraNombre: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  extraCantidad: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  extraPrecio: {
    fontSize: 13,
    color: COLORS.info,
    fontWeight: '600',
  },

  // Resumen
  resumenContainer: {
    gap: 12,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resumenLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  resumenValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  resumenDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  resumenTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resumenTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
  },

  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalActionText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  modalActionCancel: {
    borderBottomWidth: 0,
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    justifyContent: 'center',
  },
  modalActionCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});
