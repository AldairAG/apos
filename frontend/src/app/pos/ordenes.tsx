import { COLORS, POSBadge, POSCard, POSIcon, SearchBar } from '@/components/pos';
import { MOCK_MESAS, MOCK_ORDENES } from '@/data/posMockData';
import { EstadoOrden, Orden } from '@/types/pos.types';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type FiltroTipo = 'todas' | 'mesas' | 'llevar' | 'cobradas';

export default function OrdenesScreen() {
  const [ordenes] = useState(MOCK_ORDENES);
  const [filtroActivo, setFiltroActivo] = useState<FiltroTipo>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<Orden | null>(null);

  const obtenerColorEstado = (estado: EstadoOrden) => {
    switch (estado) {
      case 'pendiente': return COLORS.warning;
      case 'preparando': return COLORS.info;
      case 'lista': return COLORS.success;
      case 'cobrada': return COLORS.gray;
      case 'cancelada': return COLORS.danger;
      default: return COLORS.gray;
    }
  };

  const filtrarOrdenes = () => {
    let ordenesFiltradas = ordenes;

    // Filtrar por tipo
    if (filtroActivo === 'mesas') {
      ordenesFiltradas = ordenesFiltradas.filter(o => o.tipo === 'mesa');
    } else if (filtroActivo === 'llevar') {
      ordenesFiltradas = ordenesFiltradas.filter(o => o.paraLlevar);
    } else if (filtroActivo === 'cobradas') {
      ordenesFiltradas = ordenesFiltradas.filter(o => o.estado === 'cobrada');
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      ordenesFiltradas = ordenesFiltradas.filter(o => 
        o.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
        o.id.toString().includes(busqueda)
      );
    }

    return ordenesFiltradas;
  };

  const obtenerNombreMesa = (mesaId?: number) => {
    if (!mesaId) return null;
    const mesa = MOCK_MESAS.find(m => m.id === mesaId);
    return mesa ? `Mesa ${mesa.numero}` : null;
  };

  const abrirDetalle = (orden: Orden) => {
    setOrdenSeleccionada(orden);
    console.log('Abrir detalle de orden:', orden.numero);
  };

  const enviarACocina = (orden: Orden) => {
    console.log('Enviar a cocina:', orden.numero);
  };

  const cobrarOrden = (orden: Orden) => {
    console.log('Cobrar orden:', orden.numero);
  };

  const renderOrdenCard = ({ item: orden }: { item: Orden }) => {
    const nombreMesa = obtenerNombreMesa(orden.mesaId);
    
    return (
      <POSCard style={styles.ordenCard} onPress={() => abrirDetalle(orden)}>
        {/* Header */}
        <View style={styles.ordenHeader}>
          <View style={styles.ordenHeaderLeft}>
            <Text style={styles.ordenNumero}>{orden.numero}</Text>
            {nombreMesa && (
              <View style={styles.mesaTag}>
                <POSIcon name="restaurant" size={14} color={COLORS.textSecondary} />
                <Text style={styles.mesaTagText}>{nombreMesa}</Text>
              </View>
            )}
            {orden.paraLlevar && (
              <View style={styles.llevarTag}>
                <POSIcon name="bag-handle" size={14} color={COLORS.primary} />
                <Text style={styles.llevarTagText}>Para llevar</Text>
              </View>
            )}
          </View>
          <POSBadge 
            label={orden.estado.toUpperCase()} 
            variant={
              orden.estado === 'pendiente' ? 'warning' :
              orden.estado === 'preparando' ? 'info' :
              orden.estado === 'lista' ? 'success' :
              'default'
            }
            size="small"
          />
        </View>

        {/* Items */}
        <View style={styles.ordenItems}>
          {orden.items.slice(0, 3).map((item, index) => (
            <View key={item.id} style={styles.ordenItem}>
              <Text style={styles.ordenItemCantidad}>{item.cantidad}x</Text>
              <Text style={styles.ordenItemNombre} numberOfLines={1}>
                {item.producto.nombre}
              </Text>
            </View>
          ))}
          {orden.items.length > 3 && (
            <Text style={styles.ordenItemsMas}>
              +{orden.items.length - 3} más...
            </Text>
          )}
        </View>

        {/* Footer */}
        <View style={styles.ordenFooter}>
          <View style={styles.ordenFooterLeft}>
            <View style={styles.tiempoContainer}>
              <POSIcon name="time" size={16} color={COLORS.textSecondary} />
              <Text style={styles.tiempoText}>{orden.tiempoTranscurrido} min</Text>
            </View>
            <Text style={styles.ordenTotal}>${orden.total.toFixed(2)}</Text>
          </View>
          
          <View style={styles.ordenAcciones}>
            {orden.estado === 'pendiente' && (
              <TouchableOpacity 
                style={styles.accionButton}
                onPress={() => enviarACocina(orden)}
              >
                <POSIcon name="send" size={18} color={COLORS.info} />
              </TouchableOpacity>
            )}
            {orden.estado === 'lista' && (
              <TouchableOpacity 
                style={styles.accionButton}
                onPress={() => cobrarOrden(orden)}
              >
                <POSIcon name="cash" size={18} color={COLORS.success} />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.accionButton}
              onPress={() => abrirDetalle(orden)}
            >
              <POSIcon name="eye" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </POSCard>
    );
  };

  const ordenesFiltradas = filtrarOrdenes();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Órdenes</Text>
        
        {/* Barra de búsqueda */}
        <SearchBar 
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar orden..."
        />

        {/* Filtros */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtros}
        >
          <TouchableOpacity
            style={[styles.filtroChip, filtroActivo === 'todas' && styles.filtroChipActivo]}
            onPress={() => setFiltroActivo('todas')}
          >
            <POSIcon 
              name="list" 
              size={16} 
              color={filtroActivo === 'todas' ? COLORS.white : COLORS.text} 
            />
            <Text style={[
              styles.filtroChipText,
              filtroActivo === 'todas' && styles.filtroChipTextoActivo
            ]}>
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filtroChip, filtroActivo === 'mesas' && styles.filtroChipActivo]}
            onPress={() => setFiltroActivo('mesas')}
          >
            <POSIcon 
              name="restaurant" 
              size={16} 
              color={filtroActivo === 'mesas' ? COLORS.white : COLORS.text} 
            />
            <Text style={[
              styles.filtroChipText,
              filtroActivo === 'mesas' && styles.filtroChipTextoActivo
            ]}>
              Mesas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filtroChip, filtroActivo === 'llevar' && styles.filtroChipActivo]}
            onPress={() => setFiltroActivo('llevar')}
          >
            <POSIcon 
              name="bag-handle" 
              size={16} 
              color={filtroActivo === 'llevar' ? COLORS.white : COLORS.text} 
            />
            <Text style={[
              styles.filtroChipText,
              filtroActivo === 'llevar' && styles.filtroChipTextoActivo
            ]}>
              Para llevar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filtroChip, filtroActivo === 'cobradas' && styles.filtroChipActivo]}
            onPress={() => setFiltroActivo('cobradas')}
          >
            <POSIcon 
              name="checkmark-circle" 
              size={16} 
              color={filtroActivo === 'cobradas' ? COLORS.white : COLORS.text} 
            />
            <Text style={[
              styles.filtroChipText,
              filtroActivo === 'cobradas' && styles.filtroChipTextoActivo
            ]}>
              Cobradas
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Lista de órdenes */}
      <FlatList
        data={ordenesFiltradas}
        renderItem={renderOrdenCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listaOrdenes}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <POSIcon name="receipt-outline" size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyStateText}>No hay órdenes</Text>
          </View>
        }
      />
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
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  filtros: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  filtroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filtroChipActivo: {
    backgroundColor: COLORS.primary,
  },
  filtroChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  filtroChipTextoActivo: {
    color: COLORS.white,
  },
  listaOrdenes: {
    padding: 16,
    gap: 12,
  },
  ordenCard: {
    marginBottom: 0,
  },
  ordenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ordenHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  ordenNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mesaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mesaTagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  llevarTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  llevarTagText: {
    fontSize: 12,
    color: COLORS.primary,
  },
  ordenItems: {
    gap: 6,
    marginBottom: 12,
  },
  ordenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ordenItemCantidad: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    width: 30,
  },
  ordenItemNombre: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  ordenItemsMas: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginLeft: 38,
  },
  ordenFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ordenFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tiempoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tiempoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ordenTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  ordenAcciones: {
    flexDirection: 'row',
    gap: 8,
  },
  accionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
});
