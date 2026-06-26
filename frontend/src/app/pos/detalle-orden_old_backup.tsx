import { COLORS, POSBadge, POSButton, POSCard, POSIcon } from '@/components/pos';
import { MOCK_ORDENES } from '@/data/posMockData';
import { Descuento, Orden } from '@/types/pos.types';
import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type TabType = 'items' | 'descuentos' | 'division' | 'pago';

export default function DetalleOrdenScreen() {
  // Simulación: normalmente esto vendría por props o navegación
  const [orden, setOrden] = useState<Orden>(MOCK_ORDENES[0]);
  const [tabActiva, setTabActiva] = useState<TabType>('items');
  const [modalDescuentoVisible, setModalDescuentoVisible] = useState(false);
  const [modalCortesiaVisible, setModalCortesiaVisible] = useState(false);
  const [modalDivisionVisible, setModalDivisionVisible] = useState(false);
  const [modalPagoVisible, setModalPagoVisible] = useState(false);
  
  // Estados para descuento
  const [tipoDescuento, setTipoDescuento] = useState<'porcentaje' | 'monto'>('porcentaje');
  const [valorDescuento, setValorDescuento] = useState('');
  const [motivoDescuento, setMotivoDescuento] = useState('');

  const calcularDescuentos = () => {
    return orden.descuentos.reduce((sum, desc) => {
      if (desc.tipo === 'porcentaje') {
        return sum + (orden.subtotal * desc.valor / 100);
      }
      return sum + desc.valor;
    }, 0);
  };

  const agregarDescuento = () => {
    if (!valorDescuento || !motivoDescuento) return;

    const nuevoDescuento: Descuento = {
      tipo: tipoDescuento,
      valor: parseFloat(valorDescuento),
      motivo: motivoDescuento,
    };

    const descuentosActualizados = [...orden.descuentos, nuevoDescuento];
    const totalDescuentos = descuentosActualizados.reduce((sum, desc) => {
      if (desc.tipo === 'porcentaje') {
        return sum + (orden.subtotal * desc.valor / 100);
      }
      return sum + desc.valor;
    }, 0);

    setOrden({
      ...orden,
      descuentos: descuentosActualizados,
      total: orden.subtotal - totalDescuentos,
    });

    setModalDescuentoVisible(false);
    setValorDescuento('');
    setMotivoDescuento('');
  };

  const procesarPago = (metodo: string) => {
    console.log('Procesar pago:', metodo, orden.total);
    setModalPagoVisible(false);
  };

  const renderTabItems = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.itemsContainer}>
        {orden.items.map((item, index) => (
          <POSCard key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemCantidad}>{item.cantidad}x</Text>
                <View style={styles.itemDetalles}>
                  <Text style={styles.itemNombre}>{item.producto.nombre}</Text>
                  <Text style={styles.itemPrecioUnitario}>
                    ${item.precio} c/u
                  </Text>
                </View>
              </View>
              <Text style={styles.itemTotal}>${item.subtotal.toFixed(2)}</Text>
            </View>

            {item.extras.length > 0 && (
              <View style={styles.itemExtras}>
                <Text style={styles.itemExtrasLabel}>Extras:</Text>
                {item.extras.map(extra => (
                  <View key={extra.id} style={styles.extraItem}>
                    <Text style={styles.extraNombre}>• {extra.nombre}</Text>
                    {extra.precio > 0 && (
                      <Text style={styles.extraPrecio}>+${extra.precio}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {item.notas && (
              <View style={styles.itemNotas}>
                <POSIcon name="document-text" size={14} color={COLORS.info} />
                <Text style={styles.itemNotasText}>{item.notas}</Text>
              </View>
            )}
          </POSCard>
        ))}
      </View>
    </ScrollView>
  );

  const renderTabDescuentos = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.descuentosContainer}>
        {orden.descuentos.length === 0 ? (
          <View style={styles.emptyState}>
            <POSIcon name="pricetag-outline" size={48} color={COLORS.lightGray} />
            <Text style={styles.emptyStateText}>No hay descuentos aplicados</Text>
          </View>
        ) : (
          orden.descuentos.map((desc, index) => (
            <POSCard key={index} style={styles.descuentoCard}>
              <View style={styles.descuentoHeader}>
                <View style={styles.descuentoInfo}>
                  <Text style={styles.descuentoMotivo}>{desc.motivo}</Text>
                  <Text style={styles.descuentoTipo}>
                    {desc.tipo === 'porcentaje' ? `${desc.valor}%` : `$${desc.valor}`}
                  </Text>
                </View>
                <Text style={styles.descuentoMonto}>
                  -${desc.tipo === 'porcentaje' 
                    ? (orden.subtotal * desc.valor / 100).toFixed(2)
                    : desc.valor.toFixed(2)
                  }
                </Text>
              </View>
            </POSCard>
          ))
        )}

        <POSButton
          title="Agregar Descuento"
          onPress={() => setModalDescuentoVisible(true)}
          variant="outline"
          fullWidth
          style={styles.agregarButton}
        />

        {orden.cortesias.length > 0 && (
          <View style={styles.cortesiasSection}>
            <Text style={styles.cortesiasTitle}>Cortesías</Text>
            {orden.cortesias.map((cortesia, index) => {
              const item = orden.items.find(i => i.id === cortesia.itemId);
              return (
                <POSCard key={index} style={styles.cortesiaCard}>
                  <View style={styles.cortesiaInfo}>
                    <POSIcon name="gift" size={20} color={COLORS.warning} />
                    <View style={styles.cortesiaDetalles}>
                      <Text style={styles.cortesiaNombre}>
                        {item?.producto.nombre}
                      </Text>
                      <Text style={styles.cortesiaMotivo}>{cortesia.motivo}</Text>
                    </View>
                  </View>
                </POSCard>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderTabDivision = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.divisionContainer}>
        <View style={styles.emptyState}>
          <POSIcon name="people-outline" size={48} color={COLORS.lightGray} />
          <Text style={styles.emptyStateText}>División de cuenta</Text>
          <Text style={styles.emptyStateSubtext}>
            Divide la cuenta por personas o por artículos
          </Text>
        </View>

        <POSButton
          title="Dividir por Personas"
          onPress={() => console.log('Dividir por personas')}
          variant="outline"
          fullWidth
          style={styles.divisionButton}
        />

        <POSButton
          title="Dividir por Artículos"
          onPress={() => console.log('Dividir por artículos')}
          variant="outline"
          fullWidth
          style={styles.divisionButton}
        />
      </View>
    </ScrollView>
  );

  const renderTabPago = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.pagoContainer}>
        <View style={styles.resumenPago}>
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>Subtotal:</Text>
            <Text style={styles.resumenValue}>${orden.subtotal.toFixed(2)}</Text>
          </View>
          
          {orden.descuentos.length > 0 && (
            <View style={styles.resumenRow}>
              <Text style={styles.resumenLabel}>Descuentos:</Text>
              <Text style={[styles.resumenValue, styles.resumenDescuento]}>
                -${calcularDescuentos().toFixed(2)}
              </Text>
            </View>
          )}

          <View style={[styles.resumenRow, styles.resumenTotal]}>
            <Text style={styles.resumenTotalLabel}>Total:</Text>
            <Text style={styles.resumenTotalValue}>${orden.total.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.metodosTitle}>Métodos de Pago</Text>

        <TouchableOpacity 
          style={styles.metodoPagoCard}
          onPress={() => procesarPago('efectivo')}
        >
          <POSIcon name="cash" size={32} color={COLORS.success} />
          <Text style={styles.metodoPagoText}>Efectivo</Text>
          <POSIcon name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.metodoPagoCard}
          onPress={() => procesarPago('tarjeta')}
        >
          <POSIcon name="card" size={32} color={COLORS.primary} />
          <Text style={styles.metodoPagoText}>Tarjeta</Text>
          <POSIcon name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.metodoPagoCard}
          onPress={() => procesarPago('transferencia')}
        >
          <POSIcon name="phone-portrait" size={32} color={COLORS.info} />
          <Text style={styles.metodoPagoText}>Transferencia</Text>
          <POSIcon name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.metodoPagoCard}
          onPress={() => setModalPagoVisible(true)}
        >
          <POSIcon name="wallet" size={32} color={COLORS.warning} />
          <Text style={styles.metodoPagoText}>Pago Múltiple</Text>
          <POSIcon name="chevron-forward" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Orden {orden.numero}</Text>
          <POSBadge 
            label={orden.estado.toUpperCase()}
            variant={
              orden.estado === 'pendiente' ? 'warning' :
              orden.estado === 'preparando' ? 'info' :
              orden.estado === 'lista' ? 'success' :
              'default'
            }
          />
        </View>
        
        {orden.mesaId && (
          <View style={styles.headerInfo}>
            <POSIcon name="restaurant" size={16} color={COLORS.textSecondary} />
            <Text style={styles.headerInfoText}>Mesa {orden.mesaId}</Text>
          </View>
        )}
        
        {orden.paraLlevar && (
          <View style={styles.headerInfo}>
            <POSIcon name="bag-handle" size={16} color={COLORS.primary} />
            <Text style={styles.headerInfoText}>Para llevar</Text>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tabActiva === 'items' && styles.tabActiva]}
            onPress={() => setTabActiva('items')}
          >
            <POSIcon 
              name="list" 
              size={20} 
              color={tabActiva === 'items' ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[styles.tabText, tabActiva === 'items' && styles.tabTextActiva]}>
              Items
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tabActiva === 'descuentos' && styles.tabActiva]}
            onPress={() => setTabActiva('descuentos')}
          >
            <POSIcon 
              name="pricetag" 
              size={20} 
              color={tabActiva === 'descuentos' ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[styles.tabText, tabActiva === 'descuentos' && styles.tabTextActiva]}>
              Descuentos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tabActiva === 'division' && styles.tabActiva]}
            onPress={() => setTabActiva('division')}
          >
            <POSIcon 
              name="people" 
              size={20} 
              color={tabActiva === 'division' ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[styles.tabText, tabActiva === 'division' && styles.tabTextActiva]}>
              División
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, tabActiva === 'pago' && styles.tabActiva]}
            onPress={() => setTabActiva('pago')}
          >
            <POSIcon 
              name="cash" 
              size={20} 
              color={tabActiva === 'pago' ? COLORS.primary : COLORS.textSecondary} 
            />
            <Text style={[styles.tabText, tabActiva === 'pago' && styles.tabTextActiva]}>
              Pago
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido de tabs */}
      {tabActiva === 'items' && renderTabItems()}
      {tabActiva === 'descuentos' && renderTabDescuentos()}
      {tabActiva === 'division' && renderTabDivision()}
      {tabActiva === 'pago' && renderTabPago()}

      {/* Modal de Descuento */}
      <Modal
        visible={modalDescuentoVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalDescuentoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Descuento</Text>
              <TouchableOpacity onPress={() => setModalDescuentoVisible(false)}>
                <POSIcon name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Tipo de descuento:</Text>
              <View style={styles.tipoDescuentoContainer}>
                <TouchableOpacity
                  style={[
                    styles.tipoDescuentoButton,
                    tipoDescuento === 'porcentaje' && styles.tipoDescuentoButtonActivo
                  ]}
                  onPress={() => setTipoDescuento('porcentaje')}
                >
                  <Text style={[
                    styles.tipoDescuentoText,
                    tipoDescuento === 'porcentaje' && styles.tipoDescuentoTextActivo
                  ]}>
                    Porcentaje (%)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoDescuentoButton,
                    tipoDescuento === 'monto' && styles.tipoDescuentoButtonActivo
                  ]}
                  onPress={() => setTipoDescuento('monto')}
                >
                  <Text style={[
                    styles.tipoDescuentoText,
                    tipoDescuento === 'monto' && styles.tipoDescuentoTextActivo
                  ]}>
                    Monto ($)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Valor:</Text>
              <TextInput
                style={styles.input}
                value={valorDescuento}
                onChangeText={setValorDescuento}
                placeholder={tipoDescuento === 'porcentaje' ? 'Ej: 10' : 'Ej: 50'}
                keyboardType="numeric"
                placeholderTextColor={COLORS.textSecondary}
              />

              <Text style={styles.inputLabel}>Motivo:</Text>
              <TextInput
                style={styles.input}
                value={motivoDescuento}
                onChangeText={setMotivoDescuento}
                placeholder="Ej: Cliente frecuente"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <View style={styles.modalFooter}>
              <POSButton
                title="Cancelar"
                onPress={() => setModalDescuentoVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <POSButton
                title="Aplicar"
                onPress={agregarDescuento}
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  headerInfoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActiva: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabTextActiva: {
    color: COLORS.primary,
  },
  tabContent: {
    flex: 1,
  },
  itemsContainer: {
    padding: 16,
    gap: 12,
  },
  itemCard: {
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  itemCantidad: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  itemDetalles: {
    flex: 1,
  },
  itemNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  itemPrecioUnitario: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  itemExtras: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  itemExtrasLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  extraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  extraNombre: {
    fontSize: 13,
    color: COLORS.text,
  },
  extraPrecio: {
    fontSize: 13,
    color: COLORS.success,
  },
  itemNotas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  itemNotasText: {
    fontSize: 13,
    color: COLORS.info,
    fontStyle: 'italic',
    flex: 1,
  },
  descuentosContainer: {
    padding: 16,
    gap: 12,
  },
  descuentoCard: {
    padding: 12,
  },
  descuentoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descuentoInfo: {
    flex: 1,
  },
  descuentoMotivo: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  descuentoTipo: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  descuentoMonto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  agregarButton: {
    marginTop: 8,
  },
  cortesiasSection: {
    marginTop: 20,
  },
  cortesiasTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  cortesiaCard: {
    padding: 12,
    marginBottom: 8,
  },
  cortesiaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cortesiaDetalles: {
    flex: 1,
  },
  cortesiaNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  cortesiaMotivo: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  divisionContainer: {
    padding: 16,
  },
  divisionButton: {
    marginBottom: 12,
  },
  pagoContainer: {
    padding: 16,
  },
  resumenPago: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resumenLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  resumenValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  resumenDescuento: {
    color: COLORS.danger,
  },
  resumenTotal: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resumenTotalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resumenTotalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  metodosTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  metodoPagoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metodoPagoText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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
    maxHeight: '80%',
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
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 16,
  },
  tipoDescuentoContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tipoDescuentoButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  tipoDescuentoButtonActivo: {
    backgroundColor: COLORS.primary,
  },
  tipoDescuentoText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  tipoDescuentoTextActivo: {
    color: COLORS.white,
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
