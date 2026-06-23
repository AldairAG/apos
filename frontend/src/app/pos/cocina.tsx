import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MOCK_ORDENES } from '@/data/posMockData';
import { ROUTES } from '@/routes/routes';
import { EstadoOrden, Orden } from '@/types/pos.types';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ColumnaKDS = 'pendiente' | 'preparando' | 'lista';

export default function CocinaScreen() {
  const [ordenes, setOrdenes] = useState(MOCK_ORDENES);
  const [tiempos, setTiempos] = useState<{ [key: number]: number }>({});

  // Simulación de actualización de tiempos cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setTiempos(prev => {
        const nuevo = { ...prev };
        ordenes.forEach(orden => {
          nuevo[orden.id] = (orden.tiempoTranscurrido || 0) + 1;
        });
        return nuevo;
      });
    }, 60000); // Cada minuto

    // Inicializar tiempos
    const tiemposIniciales: { [key: number]: number } = {};
    ordenes.forEach(orden => {
      tiemposIniciales[orden.id] = orden.tiempoTranscurrido || 0;
    });
    setTiempos(tiemposIniciales);

    return () => clearInterval(interval);
  }, [ordenes]);

  const cambiarEstado = (ordenId: number, nuevoEstado: EstadoOrden) => {
    setOrdenes(ordenes.map(orden => 
      orden.id === ordenId 
        ? { ...orden, estado: nuevoEstado }
        : orden
    ));
  };

  const obtenerColorTiempo = (minutos: number) => {
    if (minutos < 10) return COLORS.success;
    if (minutos < 20) return COLORS.warning;
    return COLORS.danger;
  };

  const obtenerOrdenesPorEstado = (estado: EstadoOrden) => {
    return ordenes.filter(orden => orden.estado === estado);
  };

  const renderOrdenCard = (orden: Orden, columna: ColumnaKDS) => {
    const tiempo = tiempos[orden.id] || orden.tiempoTranscurrido || 0;
    const colorTiempo = obtenerColorTiempo(tiempo);

    return (
      <POSCard key={orden.id} style={styles.ordenCard} variant="elevated">
        {/* Header */}
        <View style={styles.ordenHeader}>
          <View style={styles.ordenHeaderLeft}>
            <Text style={styles.ordenNumero}>{orden.numero}</Text>
            {orden.mesaId && (
              <View style={styles.mesaTag}>
                <POSIcon name="restaurant" size={12} color={COLORS.white} />
                <Text style={styles.mesaTagText}>Mesa {orden.mesaId}</Text>
              </View>
            )}
            {orden.paraLlevar && (
              <POSBadge label="LLEVAR" variant="info" size="small" />
            )}
          </View>
          <View style={[styles.tiempoCirculo, { backgroundColor: colorTiempo }]}>
            <Text style={styles.tiempoTexto}>{tiempo}'</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.ordenItems}>
          {orden.items.map((item, index) => (
            <View key={item.id} style={styles.ordenItem}>
              <View style={styles.itemCantidadBadge}>
                <Text style={styles.itemCantidadTexto}>{item.cantidad}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemNombre} numberOfLines={1}>
                  {item.producto.nombre}
                </Text>
                {item.extras.length > 0 && (
                  <View style={styles.itemExtras}>
                    {item.extras.map(extra => (
                      <Text key={extra.id} style={styles.itemExtra}>
                        + {extra.nombre}
                      </Text>
                    ))}
                  </View>
                )}
                {item.notas && (
                  <View style={styles.itemNotasContainer}>
                    <POSIcon name="alert-circle" size={12} color={COLORS.danger} />
                    <Text style={styles.itemNotas}>{item.notas}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Acciones */}
        <View style={styles.ordenAcciones}>
          {columna === 'pendiente' && (
            <TouchableOpacity
              style={[styles.accionButton, styles.accionIniciar]}
              onPress={() => cambiarEstado(orden.id, 'preparando')}
            >
              <POSIcon name="play" size={18} color={COLORS.white} />
              <Text style={styles.accionButtonText}>Iniciar</Text>
            </TouchableOpacity>
          )}
          
          {columna === 'preparando' && (
            <TouchableOpacity
              style={[styles.accionButton, styles.accionCompletar]}
              onPress={() => cambiarEstado(orden.id, 'lista')}
            >
              <POSIcon name="checkmark" size={18} color={COLORS.white} />
              <Text style={styles.accionButtonText}>Completar</Text>
            </TouchableOpacity>
          )}

          {columna === 'lista' && (
            <TouchableOpacity
              style={[styles.accionButton, styles.accionServido]}
              onPress={() => console.log('Orden servida:', orden.numero)}
            >
              <POSIcon name="checkmark-done" size={18} color={COLORS.white} />
              <Text style={styles.accionButtonText}>Servido</Text>
            </TouchableOpacity>
          )}
        </View>
      </POSCard>
    );
  };

  const renderColumna = (titulo: string, estado: EstadoOrden, columna: ColumnaKDS, color: string) => {
    const ordenesColumna = obtenerOrdenesPorEstado(estado);

    return (
      <View style={styles.columna}>
        <View style={[styles.columnaHeader, { backgroundColor: color }]}>
          <Text style={styles.columnaTitulo}>{titulo}</Text>
          <View style={styles.columnaContador}>
            <Text style={styles.columnaContadorTexto}>{ordenesColumna.length}</Text>
          </View>
        </View>
        <ScrollView 
          style={styles.columnaScroll}
          contentContainerStyle={styles.columnaContent}
          showsVerticalScrollIndicator={false}
        >
          {ordenesColumna.length === 0 ? (
            <View style={styles.columnaVacia}>
              <POSIcon name="checkmark-circle-outline" size={40} color={COLORS.lightGray} />
              <Text style={styles.columnaVaciaTexto}>Sin órdenes</Text>
            </View>
          ) : (
            ordenesColumna.map(orden => renderOrdenCard(orden, columna))
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <ProtectedRoute requiredRoute={ROUTES.POS.COCINA}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Pantalla de Cocina</Text>
            <View style={styles.headerBadges}>
              <POSBadge 
                label={`${ordenes.length} ÓRDENES`} 
                variant="info" 
              />
            </View>
          </View>
          <View style={styles.leyenda}>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.leyendaTexto}>{'< 10 min'}</Text>
            </View>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.leyendaTexto}>10-20 min</Text>
            </View>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: COLORS.danger }]} />
              <Text style={styles.leyendaTexto}>{'>20 min'}</Text>
            </View>
          </View>
        </View>

        {/* Columnas KDS */}
        <View style={styles.columnasContainer}>
          {renderColumna('Pendiente', 'pendiente', 'pendiente', '#FFC107')}
          {renderColumna('Preparando', 'preparando', 'preparando', '#17A2B8')}
          {renderColumna('Listo', 'lista', 'lista', '#28A745')}
        </View>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  leyenda: {
    flexDirection: 'row',
    gap: 16,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leyendaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  leyendaTexto: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  columnasContainer: {
    flex: 1,
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  columna: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  columnaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  columnaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  columnaContador: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  columnaContadorTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  columnaScroll: {
    flex: 1,
  },
  columnaContent: {
    padding: 8,
    gap: 8,
  },
  columnaVacia: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  columnaVaciaTexto: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  ordenCard: {
    padding: 12,
    marginBottom: 0,
  },
  ordenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ordenHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  ordenNumero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mesaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mesaTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  tiempoCirculo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tiempoTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  ordenItems: {
    gap: 10,
    marginBottom: 12,
  },
  ordenItem: {
    flexDirection: 'row',
    gap: 10,
  },
  itemCantidadBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCantidadTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  itemInfo: {
    flex: 1,
  },
  itemNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  itemExtras: {
    marginTop: 2,
    gap: 2,
  },
  itemExtra: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  itemNotasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    padding: 6,
    backgroundColor: '#FFF3CD',
    borderRadius: 6,
  },
  itemNotas: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
    flex: 1,
  },
  ordenAcciones: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  accionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  accionIniciar: {
    backgroundColor: COLORS.info,
  },
  accionCompletar: {
    backgroundColor: COLORS.success,
  },
  accionServido: {
    backgroundColor: COLORS.gray,
  },
  accionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});
