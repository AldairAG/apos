import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { EstadoMesa } from '@/features/mesas/mesas.types';
import { EstadoOrden, MesaPosResponseDTO } from '@/features/pos/pos.types';
import usePos from '@/features/pos/usePos';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function VistaMesasScreen() {
  const { mesas, cargarMesas, seleccionarMesa, loading } = usePos();
  const [mesasSeleccionadas, setMesasSeleccionadas] = useState<number[]>([]);
  const [mostrarModalUnir, setMostrarModalUnir] = useState(false);
  const [modoSeleccion, setModoSeleccion] = useState(false);

  useEffect(() => {
    cargarMesas();
  }, []);

  const ordenesSinMesa = mesas.filter((m: MesaPosResponseDTO) => 
    m.ordenActualDTO && !m.id
  ).length;

  const toggleSeleccion = (mesaId: number) => {
    if (mesasSeleccionadas.includes(mesaId)) {
      setMesasSeleccionadas(mesasSeleccionadas.filter(id => id !== mesaId));
    } else {
      setMesasSeleccionadas([...mesasSeleccionadas, mesaId]);
    }
  };

  const handleUnirMesas = () => {
    if (mesasSeleccionadas.length < 2) {
      Alert.alert('Error', 'Selecciona al menos 2 mesas para unir');
      return;
    }
    setMostrarModalUnir(true);
  };

  const confirmarUnion = () => {
    console.log('Unir mesas:', mesasSeleccionadas);
    setMostrarModalUnir(false);
    setModoSeleccion(false);
    setMesasSeleccionadas([]);
    // Aquí iría la lógica de unión
  };

  const cancelarUnion = () => {
    setModoSeleccion(false);
    setMesasSeleccionadas([]);
  };

  const handleMesaPress = (mesa: MesaPosResponseDTO) => {
    if (modoSeleccion) {
      toggleSeleccion(mesa.id);
    } else {
      if (mesa.ordenActualDTO) {
        router.push(`/pos/detalle-orden?ordenId=${mesa.ordenActualDTO.id}`);
      } else {
        // Crear nueva orden en la mesa
        seleccionarMesa(mesa.id);
        router.push('/pos/crear-orden');
      }
    }
  };

  const getColorEstadoMesa = (estado: EstadoMesa) => {
    switch(estado) {
      case EstadoMesa.LIBRE:
        return COLORS.success;
      case EstadoMesa.OCUPADA:
        return COLORS.danger;
      case EstadoMesa.RESERVADA:
        return COLORS.warning;

      default:
        return COLORS.textSecondary;
    }
  };

  const getLabelEstado = (estado: EstadoMesa) => {
    switch(estado) {
      case EstadoMesa.LIBRE:
        return 'LIBRE';
      case EstadoMesa.OCUPADA:
        return 'OCUPADA';
      case EstadoMesa.RESERVADA:
        return 'RESERVADA';
      default:
        return 'DESCONOCIDO';
    }
  };

  const calcularTiempoOcupada = (mesa: MesaPosResponseDTO) => {
    if (!mesa.ordenActualDTO) return null;
    const ahora = new Date();
    const inicio = new Date(mesa.ordenActualDTO.createdAt);
    const diffMs = ahora.getTime() - inicio.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  const renderMesaCard = ({ item }: { item: MesaPosResponseDTO }) => {
    const isSeleccionada = mesasSeleccionadas.includes(item.id);
    const tiempoOcupada = calcularTiempoOcupada(item);
    const colorEstado = getColorEstadoMesa(item.estado);
    const cardStyle = isSeleccionada 
      ? { ...styles.mesaCardInner, ...styles.mesaSeleccionada } 
      : styles.mesaCardInner;

    return (
      <TouchableOpacity
        style={styles.mesaCard}
        onPress={() => handleMesaPress(item)}
        activeOpacity={0.8}
      >
        <POSCard
          variant="elevated"
          style={cardStyle}
        >
          {/* Header */}
          <View style={styles.mesaHeader}>
            <View style={styles.mesaNumero}>
              <POSIcon name="restaurant" size={20} color={colorEstado} />
              <Text style={styles.mesaNumeroText}>{item.nombre}</Text>
            </View>
            <View style={[styles.estadoIndicador, { backgroundColor: colorEstado }]} />
          </View>

          {/* Badge Estado */}
          <POSBadge
            label={getLabelEstado(item.estado)}
            variant={
              item.estado === EstadoMesa.LIBRE ? 'success' :
              item.estado === EstadoMesa.OCUPADA ? 'danger' :
              item.estado === EstadoMesa.RESERVADA ? 'warning' :
              'info'
            }
            size="small"
          />

          {/* Información de la mesa */}
          {item.ordenActualDTO && (
            <View style={styles.mesaInfo}>
              <View style={styles.mesaInfoRow}>
                <POSIcon name="people-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.mesaInfoText}>
                  {item.ordenActualDTO.numeroPersonas} personas
                </Text>
              </View>

              {tiempoOcupada !== null && (
                <View style={styles.mesaInfoRow}>
                  <POSIcon name="time-outline" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.mesaInfoText}>{tiempoOcupada} min</Text>
                </View>
              )}

              <View style={styles.mesaInfoRow}>
                <POSIcon name="receipt-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.mesaTotalText}>
                  ${item.ordenActualDTO.total.toFixed(2)}
                </Text>
              </View>
            </View>
          )}

          {/* Orden Actual */}
          {item.ordenActualDTO && (
            <View style={styles.ordenActual}>
              <Text style={styles.ordenActualText}>
                Orden {item.ordenActualDTO.folio}
              </Text>
              <POSBadge
                label={item.ordenActualDTO.estado.replace('_', ' ')}
                variant={
                  item.ordenActualDTO.estado === EstadoOrden.PENDIENTE ? 'warning' :
                  item.ordenActualDTO.estado === EstadoOrden.EN_PREPARACION ? 'info' :
                  'default'
                }
                size="small"
              />
            </View>
          )}

          {/* Checkbox para modo selección */}
          {modoSeleccion && (
            <View style={styles.checkboxContainer}>
              {isSeleccionada ? (
                <POSIcon name="checkmark-circle" size={28} color={COLORS.success} />
              ) : (
                <POSIcon name="ellipse-outline" size={28} color={COLORS.border} />
              )}
            </View>
          )}
        </POSCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Vista de Mesas</Text>
          {ordenesSinMesa > 0 && (
            <TouchableOpacity
              style={styles.ordenesSinMesaButton}
              onPress={() => router.push('/pos/ordenes?filtro=sin-mesa')}
            >
              <POSIcon name="bag-handle" size={20} color={COLORS.white} />
              <Text style={styles.ordenesSinMesaButtonText}>Para Llevar</Text>
              <View style={styles.badgeContador}>
                <Text style={styles.badgeContadorText}>{ordenesSinMesa}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Acciones Header */}
        <View style={styles.headerActions}>
          {!modoSeleccion ? (
            <TouchableOpacity
              style={styles.unirButton}
              onPress={() => setModoSeleccion(true)}
            >
              <POSIcon name="git-merge-outline" size={20} color={COLORS.primary} />
              <Text style={styles.unirButtonText}>Unir Mesas</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.unirActions}>
              <TouchableOpacity
                style={styles.cancelarButton}
                onPress={cancelarUnion}
              >
                <Text style={styles.cancelarButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmarButton,
                  mesasSeleccionadas.length < 2 && styles.buttonDisabled,
                ]}
                onPress={handleUnirMesas}
                disabled={mesasSeleccionadas.length < 2}
              >
                <Text style={styles.confirmarButtonText}>
                  Unir ({mesasSeleccionadas.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Leyenda de Estados */}
      <View style={styles.leyenda}>
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaColor, { backgroundColor: COLORS.success }]} />
          <Text style={styles.leyendaText}>Libre</Text>
        </View>
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaColor, { backgroundColor: COLORS.danger }]} />
          <Text style={styles.leyendaText}>Ocupada</Text>
        </View>
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaColor, { backgroundColor: COLORS.warning }]} />
          <Text style={styles.leyendaText}>Reservada</Text>
        </View>
        <View style={styles.leyendaItem}>
          <View style={[styles.leyendaColor, { backgroundColor: COLORS.info }]} />
          <Text style={styles.leyendaText}>Limpieza</Text>
        </View>
      </View>

      {/* Grid de Mesas */}
      <FlatList
        data={mesas}
        renderItem={renderMesaCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.mesasGrid}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <POSIcon name="grid-outline" size={80} color={COLORS.border} />
            <Text style={styles.emptyText}>No hay mesas disponibles</Text>
          </View>
        }
      />

      {/* Modal Unir Mesas */}
      <Modal
        visible={mostrarModalUnir}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setMostrarModalUnir(false)}
      >
        <View style={styles.modalOverlay}>
          <POSCard style={styles.modalContent} variant="elevated">
            <Text style={styles.modalTitle}>Unir Mesas</Text>
            <Text style={styles.modalText}>
              ¿Deseas unir las siguientes mesas?
            </Text>
            <View style={styles.modalMesas}>
              {mesasSeleccionadas.map((mesaId) => {
                const mesa = mesas.find((m: MesaPosResponseDTO) => m.id === mesaId);
                return mesa ? (
                  <View key={mesaId} style={styles.modalMesaItem}>
                    <Text style={styles.modalMesaText}>{mesa.nombre}</Text>
                  </View>
                ) : null;
              })}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setMostrarModalUnir(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmarUnion}
              >
                <Text style={styles.modalButtonTextConfirm}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </POSCard>
        </View>
      </Modal>

      {/* Accesos Rápidos Flotantes */}
      <View style={styles.floatingActions}>
        <TouchableOpacity
          style={styles.fabSecondary}
          onPress={() => router.push('/pos/ordenes')}
        >
          <POSIcon name="list" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fabPrimary}
          onPress={() => router.push('/pos/crear-orden')}
        >
          <POSIcon name="add" size={32} color={COLORS.white} />
        </TouchableOpacity>
      </View>
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
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  ordenesSinMesaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  ordenesSinMesaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  badgeContador: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeContadorText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  unirButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  unirButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  unirActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelarButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  cancelarButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmarButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  confirmarButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Leyenda
  leyenda: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leyendaColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  leyendaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Grid de Mesas
  mesasGrid: {
    padding: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: 16,
    marginBottom: 16,
  },
  mesaCard: {
    flex: 1,
  },
  mesaCardInner: {
    padding: 12,
    gap: 8,
  },
  mesaSeleccionada: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  mesaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mesaNumero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mesaNumeroText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  estadoIndicador: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  mesaInfo: {
    gap: 6,
    marginTop: 8,
  },
  mesaInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mesaInfoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  mesaTotalText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  ordenActual: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 6,
  },
  ordenActualText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  modalMesas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  modalMesaItem: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalMesaText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F9FAFB',
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.primary,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalButtonTextConfirm: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Floating Actions
  floatingActions: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  fabSecondary: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.info,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPrimary: {
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
});
