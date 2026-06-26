import { COLORS, POSBadge, POSCard, POSIcon } from '@/components/pos';
import { EstadoMesa } from '@/features/mesas/mesas.types';
import { EstadoOrden } from '@/features/pos/pos.types';
import usePos from '@/features/pos/usePos';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const animacionMenu = useState(new Animated.Value(0))[0];
  
  const { mesas, cargarMesas, cargarOrdenes, getOrdenesBySucursal } = usePos();
  const [ordenes, setOrdenes] = useState<any[]>([]);

  useEffect(() => {
    cargarMesas();
    cargarOrdenes();
    loadOrdenes();
  }, []);

  const loadOrdenes = async () => {
    try {
      const data = await getOrdenesBySucursal(1); // Usar sucursal actual
      setOrdenes(data || []);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
    }
  };

  // Calcular estadísticas desde datos reales
  const mesasLibres = mesas.filter((m: any) => m.estado === EstadoMesa.LIBRE).length;
  const mesasOcupadas = mesas.filter((m: any) => m.estado === EstadoMesa.OCUPADA).length;
  const mesasReservadas = mesas.filter((m: any) => m.estado === EstadoMesa.RESERVADA).length;
  
  const ordenesActivas = ordenes.filter(o => o.estado !== EstadoOrden.CANCELADA && o.estado !== EstadoOrden.ENTREGADA).length;
  const ordenesEnCocina = ordenes.filter(o => o.estado === EstadoOrden.EN_PREPARACION).length;
  const ordenesPendientesCobro = ordenes.filter(o => o.estado === EstadoOrden.LISTA).length;

  const toggleMenu = () => {
    const toValue = menuAbierto ? 0 : 1;
    Animated.spring(animacionMenu, {
      toValue,
      useNativeDriver: true,
      friction: 5,
    }).start();
    setMenuAbierto(!menuAbierto);
  };

  const accionMenu = (accion: string) => {
    console.log('Acción del menú:', accion);
    setMenuAbierto(false);
    Animated.spring(animacionMenu, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    
    switch(accion) {
      case 'nueva-orden':
        router.push('/pos/crear-orden');
        break;
      case 'mesas':
        router.push('/pos/vista-mesas');
        break;
      case 'ordenes':
        router.push('/pos/ordenes');
        break;
      case 'cocina':
        router.push('/pos/cocina');
        break;
      case 'historial':
        console.log('Navegar a historial');
        break;
    }
  };

  const renderOpcionMenu = (icono: string, label: string, accion: string, index: number) => {
    const translateY = animacionMenu.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -(60 * (index + 1))],
    });

    const scale = animacionMenu.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        key={accion}
        style={[
          styles.opcionMenu,
          {
            transform: [{ translateY }, { scale }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.botonOpcionMenu}
          onPress={() => accionMenu(accion)}
          activeOpacity={0.8}
        >
          <POSIcon name={icono as any} size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.labelOpcionMenu}>{label}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Centro de Control POS</Text>
            <POSBadge label="ACTIVO" variant="success" />
          </View>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('es-MX', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>

        {/* Resumen de Mesas */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Estado de Mesas</Text>
          <View style={styles.estadisticasGrid}>
            <POSCard style={styles.estadisticaCard} variant="elevated">
              <POSIcon name="checkmark-circle" size={32} color={COLORS.success} />
              <Text style={styles.estadisticaNumero}>{mesasLibres}</Text>
              <Text style={styles.estadisticaLabel}>Libres</Text>
            </POSCard>

            <POSCard style={styles.estadisticaCard} variant="elevated">
              <POSIcon name="restaurant" size={32} color={COLORS.danger} />
              <Text style={styles.estadisticaNumero}>{mesasOcupadas}</Text>
              <Text style={styles.estadisticaLabel}>Ocupadas</Text>
            </POSCard>

            <POSCard style={styles.estadisticaCard} variant="elevated">
              <POSIcon name="time" size={32} color={COLORS.warning} />
              <Text style={styles.estadisticaNumero}>{mesasReservadas}</Text>
              <Text style={styles.estadisticaLabel}>Reservadas</Text>
            </POSCard>
          </View>
        </View>

        {/* Resumen de Órdenes */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Estado de Órdenes</Text>
          <View style={styles.estadisticasGrid}>
            <POSCard style={styles.estadisticaCard} variant="elevated">
              <POSIcon name="receipt" size={32} color={COLORS.primary} />
              <Text style={styles.estadisticaNumero}>{ordenesActivas}</Text>
              <Text style={styles.estadisticaLabel}>Activas</Text>
            </POSCard>

            <POSCard style={styles.estadisticaCard} variant="elevated">
              <POSIcon name="flame" size={32} color={COLORS.info} />
              <Text style={styles.estadisticaNumero}>{ordenesEnCocina}</Text>
              <Text style={styles.estadisticaLabel}>En Cocina</Text>
            </POSCard>

            <POSCard style={styles.estadisticaCard} variant="elevated">
              <POSIcon name="cash" size={32} color={COLORS.warning} />
              <Text style={styles.estadisticaNumero}>{ordenesPendientesCobro}</Text>
              <Text style={styles.estadisticaLabel}>Por Cobrar</Text>
            </POSCard>
          </View>
        </View>

        {/* Accesos Rápidos */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>Accesos Rápidos</Text>
          <View style={styles.acceosGrid}>
            <TouchableOpacity 
              style={styles.accesoCard}
              onPress={() => router.push('/pos/crear-orden')}
              activeOpacity={0.8}
            >
              <POSCard style={styles.accesoCardInner} variant="elevated">
                <POSIcon name="add-circle" size={48} color={COLORS.success} />
                <Text style={styles.accesoLabel}>Nueva Orden</Text>
              </POSCard>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.accesoCard}
              onPress={() => router.push('/pos/vista-mesas')}
              activeOpacity={0.8}
            >
              <POSCard style={styles.accesoCardInner} variant="elevated">
                <POSIcon name="grid" size={48} color={COLORS.primary} />
                <Text style={styles.accesoLabel}>Mesas</Text>
              </POSCard>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.accesoCard}
              onPress={() => router.push('/pos/ordenes')}
              activeOpacity={0.8}
            >
              <POSCard style={styles.accesoCardInner} variant="elevated">
                <POSIcon name="list" size={48} color={COLORS.info} />
                <Text style={styles.accesoLabel}>Órdenes</Text>
              </POSCard>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.accesoCard}
              onPress={() => router.push('/pos/cocina')}
              activeOpacity={0.8}
            >
              <POSCard style={styles.accesoCardInner} variant="elevated">
                <POSIcon name="flame" size={48} color={COLORS.danger} />
                <Text style={styles.accesoLabel}>Cocina</Text>
              </POSCard>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actividad Reciente */}
        <View style={[styles.seccion, styles.ultimaSeccion]}>
          <Text style={styles.tituloSeccion}>Actividad Reciente</Text>
          {ordenes.slice(0, 5).map((orden) => (
            <TouchableOpacity
              key={orden.id}
              onPress={() => router.push(`/pos/detalle-orden?ordenId=${orden.id}`)}
            >
              <POSCard style={styles.actividadCard}>
                <View style={styles.actividadHeader}>
                  <View style={styles.actividadInfo}>
                    <Text style={styles.actividadOrden}>Orden {orden.folio}</Text>
                    {orden.mesa && (
                      <View style={styles.actividadMesa}>
                        <POSIcon name="restaurant" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.actividadMesaText}>Mesa {orden.mesa.numero || orden.mesa.nombre}</Text>
                      </View>
                    )}
                    {orden.tipo === 'PARA_LLEVAR' && (
                      <POSBadge label="LLEVAR" variant="info" size="small" />
                    )}
                  </View>
                  <View style={styles.actividadDerecha}>
                    <POSBadge 
                      label={orden.estado.replace('_', ' ')}
                      variant={
                        orden.estado === EstadoOrden.PENDIENTE ? 'warning' :
                        orden.estado === EstadoOrden.EN_PREPARACION ? 'info' :
                        orden.estado === EstadoOrden.LISTA ? 'success' :
                        'default'
                      }
                      size="small"
                    />
                    <Text style={styles.actividadTotal}>${orden.total.toFixed(2)}</Text>
                  </View>
                </View>
                <Text style={styles.actividadDetalle}>
                  {orden.detalles?.length || 0} {orden.detalles?.length === 1 ? 'producto' : 'productos'}
                  {orden.tiempoPreparacion && ` • ${orden.tiempoPreparacion} min`}
                </Text>
              </POSCard>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FAB Menu Flotante */}
      <View style={styles.fabContainer}>
        {menuAbierto && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={toggleMenu}
          />
        )}

        {/* Opciones del menú */}
        {renderOpcionMenu('add-circle', 'Nueva Orden', 'nueva-orden', 4)}
        {renderOpcionMenu('grid', 'Mesas', 'mesas', 3)}
        {renderOpcionMenu('list', 'Órdenes', 'ordenes', 2)}
        {renderOpcionMenu('flame', 'Cocina', 'cocina', 1)}
        {renderOpcionMenu('time', 'Historial', 'historial', 0)}

        {/* Botón principal */}
        <TouchableOpacity
          style={[styles.fabButton, menuAbierto && styles.fabButtonRotate]}
          onPress={toggleMenu}
          activeOpacity={0.9}
        >
          <Animated.View
            style={{
              transform: [{
                rotate: animacionMenu.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '45deg'],
                }),
              }],
            }}
          >
            <POSIcon name="menu" size={28} color={COLORS.white} />
          </Animated.View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
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
    textTransform: 'capitalize',
  },
  seccion: {
    padding: 16,
  },
  ultimaSeccion: {
    paddingBottom: 20,
  },
  tituloSeccion: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  estadisticasGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  estadisticaCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  estadisticaNumero: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  estadisticaLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  acceosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  accesoCard: {
    width: '48%',
  },
  accesoCardInner: {
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  accesoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  actividadCard: {
    padding: 14,
    marginBottom: 10,
  },
  actividadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  actividadInfo: {
    flex: 1,
    gap: 4,
  },
  actividadOrden: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  actividadMesa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actividadMesaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  actividadDerecha: {
    alignItems: 'flex-end',
    gap: 6,
  },
  actividadTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  actividadDetalle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fabButton: {
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
  fabButtonRotate: {
    backgroundColor: COLORS.danger,
  },
  opcionMenu: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botonOpcionMenu: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  labelOpcionMenu: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
});