import { COLORS, POSBadge, POSButton, POSIcon } from '@/components/pos';
import { MOCK_MESAS, MOCK_ORDENES } from '@/data/posMockData';
import { EstadoMesa, Mesa } from '@/types/pos.types';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function VistaMesasScreen() {
  const [mesas, setMesas] = useState(MOCK_MESAS);
  const [mesasSeleccionadas, setMesasSeleccionadas] = useState<number[]>([]);
  const [mostrarModalUnir, setMostrarModalUnir] = useState(false);
  const [modoUnir, setModoUnir] = useState(false);

  const obtenerColorEstado = (estado: EstadoMesa) => {
    switch (estado) {
      case 'libre': return COLORS.success;
      case 'ocupada': return COLORS.danger;
      case 'reservada': return COLORS.warning;
      default: return COLORS.gray;
    }
  };

  const obtenerIconoEstado = (estado: EstadoMesa) => {
    switch (estado) {
      case 'libre': return 'checkmark-circle';
      case 'ocupada': return 'restaurant';
      case 'reservada': return 'time';
      default: return 'help-circle';
    }
  };

  const toggleSeleccionMesa = (mesaId: number) => {
    if (modoUnir) {
      if (mesasSeleccionadas.includes(mesaId)) {
        setMesasSeleccionadas(mesasSeleccionadas.filter(id => id !== mesaId));
      } else {
        setMesasSeleccionadas([...mesasSeleccionadas, mesaId]);
      }
    } else {
      // Navegación normal a crear orden
      navigation.navigate('crear-orden');
    }
  };

  const iniciarModoUnir = () => {
    setModoUnir(true);
    setMesasSeleccionadas([]);
  };

  const cancelarUnion = () => {
    setModoUnir(false);
    setMesasSeleccionadas([]);
  };

  const confirmarUnion = () => {
    if (mesasSeleccionadas.length >= 2) {
      setMostrarModalUnir(true);
    }
  };

  const unirMesas = () => {
    // Aquí iría la lógica para unir mesas (mock)
    console.log('Unir mesas:', mesasSeleccionadas);
    setMostrarModalUnir(false);
    setModoUnir(false);
    setMesasSeleccionadas([]);
  };

  const verOrdenesSinMesa = () => {
    // Navegar a la pantalla de órdenes filtradas por "para llevar"
    console.log('Ver órdenes sin mesa / para llevar');
    // navigation.navigate('ordenes', { filtro: 'para-llevar' });
  };

  const contarOrdenesSinMesa = () => {
    return MOCK_ORDENES.filter(orden => orden.paraLlevar || !orden.mesaId).length;
  };

  const renderMesa = (mesa: Mesa) => {
    const isSeleccionada = mesasSeleccionadas.includes(mesa.id);
    
    return (
      <TouchableOpacity
        key={mesa.id}
        style={[
          styles.mesaCard,
          { borderColor: obtenerColorEstado(mesa.estado) },
          isSeleccionada && styles.mesaSeleccionada,
        ]}
        onPress={() => toggleSeleccionMesa(mesa.id)}
        activeOpacity={0.7}
      >
        {/* Encabezado de la mesa */}
        <View style={styles.mesaHeader}>
          <View style={styles.mesaNumero}>
            <POSIcon name={obtenerIconoEstado(mesa.estado)} size={20} color={obtenerColorEstado(mesa.estado)} />
            <Text style={styles.mesaNumeroText}>Mesa {mesa.numero}</Text>
          </View>
          <POSBadge 
            label={mesa.estado.toUpperCase()} 
            variant={
              mesa.estado === 'libre' ? 'success' : 
              mesa.estado === 'ocupada' ? 'danger' : 
              'warning'
            }
            size="small"
          />
        </View>

        {/* Información de la mesa */}
        <View style={styles.mesaInfo}>
          <View style={styles.mesaInfoRow}>
            <POSIcon name="people" size={16} color={COLORS.textSecondary} />
            <Text style={styles.mesaInfoText}>
              {mesa.personasActuales || 0}/{mesa.capacidad}
            </Text>
          </View>

          {mesa.estado === 'ocupada' && mesa.totalAcumulado && (
            <View style={styles.mesaInfoRow}>
              <POSIcon name="cash" size={16} color={COLORS.textSecondary} />
              <Text style={styles.mesaTotalText}>${mesa.totalAcumulado}</Text>
            </View>
          )}
        </View>

        {/* Orden actual */}
        {mesa.ordenActual && (
          <View style={styles.ordenActual}>
            <Text style={styles.ordenActualText}>Orden #{mesa.ordenActual}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Vista de Mesas</Text>
          <TouchableOpacity 
            style={styles.ordenesSinMesaButton}
            onPress={verOrdenesSinMesa}
          >
            <POSIcon name="bag-handle" size={20} color={COLORS.white} />
            <Text style={styles.ordenesSinMesaButtonText}>Para Llevar</Text>
            {contarOrdenesSinMesa() > 0 && (
              <View style={styles.badgeContador}>
                <Text style={styles.badgeContadorText}>{contarOrdenesSinMesa()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.headerActions}>
          {!modoUnir ? (
            <TouchableOpacity style={styles.unirButton} onPress={iniciarModoUnir}>
              <POSIcon name="git-merge" size={20} color={COLORS.primary} />
              <Text style={styles.unirButtonText}>Unir Mesas</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.unirActions}>
              <TouchableOpacity style={styles.cancelarButton} onPress={cancelarUnion}>
                <Text style={styles.cancelarButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmarButton, mesasSeleccionadas.length < 2 && styles.buttonDisabled]} 
                onPress={confirmarUnion}
                disabled={mesasSeleccionadas.length < 2}
              >
                <Text style={styles.confirmarButtonText}>
                  Confirmar ({mesasSeleccionadas.length})
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Leyenda de estados */}
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
      </View>

      {/* Grid de mesas */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.mesasGrid}>
        {mesas.map(renderMesa)}
      </ScrollView>

      {/* Modal de confirmación de unión */}
      <Modal
        visible={mostrarModalUnir}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarModalUnir(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Unir Mesas</Text>
            <Text style={styles.modalText}>
              ¿Deseas unir las mesas seleccionadas?
            </Text>
            <View style={styles.modalMesas}>
              {mesasSeleccionadas.map(id => {
                const mesa = mesas.find(m => m.id === id);
                return (
                  <View key={id} style={styles.modalMesaItem}>
                    <Text style={styles.modalMesaText}>Mesa {mesa?.numero}</Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.modalActions}>
              <POSButton
                title="Cancelar"
                onPress={() => setMostrarModalUnir(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <POSButton
                title="Unir"
                onPress={unirMesas}
                variant="primary"
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
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  unirButtonText: {
    marginLeft: 8,
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
    backgroundColor: COLORS.lightGray,
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
  },
  scrollView: {
    flex: 1,
  },
  mesasGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  mesaCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mesaSeleccionada: {
    backgroundColor: '#E3F2FD',
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
  mesaInfo: {
    gap: 6,
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
  },
  ordenActualText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
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
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
  },
});
