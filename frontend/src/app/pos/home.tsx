import { COLORS, POSIcon } from '@/components/pos';
import { EstadoMesa } from '@/features/mesas/mesas.types';
import { EstadoOrden } from '@/features/pos/pos.types';
import usePos from '@/features/pos/usePos';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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

export default function HomeScreen() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const animacionMenu = useState(new Animated.Value(0))[0];

  const { mesas, cargarMesas, cargarOrdenes, ordenes } = usePos();

  useEffect(() => {
    cargarMesas();
    cargarOrdenes();
  }, [cargarMesas, cargarOrdenes]);

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

    switch (accion) {
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

  const renderOpcionMenu = (icono: string, label: string, accion: string, index: number, color: string) => {
    const translateY = animacionMenu.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -(64 * (index + 1))],
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
        <View style={styles.labelOpcionMenu}>
          <Text style={styles.labelOpcionMenuTexto}>{label.toUpperCase()}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.botonOpcionMenu,
            { backgroundColor: color },
            hardShadow(pressed),
          ]}
          onPress={() => accionMenu(accion)}
          android_ripple={RIPPLE}
        >
          <POSIcon name={icono as any} size={22} color={INK} />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>CENTRO DE CONTROL POS</Text>
            <View style={styles.activoBadge}>
              <Text style={styles.activoBadgeTexto}>ACTIVO</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Resumen de Mesas */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>ESTADO DE MESAS</Text>
          <View style={styles.estadisticasGrid}>
            <View style={[styles.estadisticaCard, { backgroundColor: COLORS.success }]}>
              <POSIcon name="checkmark-circle" size={28} color={INK} />
              <Text style={styles.estadisticaNumero}>{mesasLibres}</Text>
              <Text style={styles.estadisticaLabel}>LIBRES</Text>
            </View>

            <View style={[styles.estadisticaCard, { backgroundColor: COLORS.warning }]}>
              <POSIcon name="restaurant" size={28} color={INK} />
              <Text style={styles.estadisticaNumero}>{mesasOcupadas}</Text>
              <Text style={styles.estadisticaLabel}>OCUPADAS</Text>
            </View>

            <View style={[styles.estadisticaCard, { backgroundColor: COLORS.info }]}>
              <POSIcon name="time" size={28} color={INK} />
              <Text style={styles.estadisticaNumero}>{mesasReservadas}</Text>
              <Text style={styles.estadisticaLabel}>RESERVADAS</Text>
            </View>
          </View>
        </View>

        {/* Resumen de Órdenes */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>ESTADO DE ÓRDENES</Text>
          <View style={styles.estadisticasGrid}>
            <View style={[styles.estadisticaCard, { backgroundColor: COLORS.primary }]}>
              <POSIcon name="receipt" size={28} color={INK} />
              <Text style={styles.estadisticaNumero}>{ordenesActivas}</Text>
              <Text style={styles.estadisticaLabel}>ACTIVAS</Text>
            </View>

            <View style={[styles.estadisticaCard, { backgroundColor: '#FFB37A' }]}>
              <POSIcon name="flame" size={28} color={INK} />
              <Text style={styles.estadisticaNumero}>{ordenesEnCocina}</Text>
              <Text style={styles.estadisticaLabel}>EN COCINA</Text>
            </View>

            <View style={[styles.estadisticaCard, { backgroundColor: COLORS.warning }]}>
              <POSIcon name="cash" size={28} color={INK} />
              <Text style={styles.estadisticaNumero}>{ordenesPendientesCobro}</Text>
              <Text style={styles.estadisticaLabel}>POR COBRAR</Text>
            </View>
          </View>
        </View>

        {/* Accesos Rápidos */}
        <View style={styles.seccion}>
          <Text style={styles.tituloSeccion}>ACCESOS RÁPIDOS</Text>
          <View style={styles.accesosGrid}>
            <Pressable
              style={({ pressed }) => [styles.accesoCard, { backgroundColor: COLORS.success }, hardShadow(pressed)]}
              onPress={() => router.push('/pos/crear-orden')}
              android_ripple={RIPPLE}
            >
              <POSIcon name="add-circle" size={38} color={INK} />
              <Text style={styles.accesoLabel}>NUEVA ORDEN</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.accesoCard, { backgroundColor: COLORS.primary }, hardShadow(pressed)]}
              onPress={() => router.push('/pos/vista-mesas')}
              android_ripple={RIPPLE}
            >
              <POSIcon name="grid" size={38} color={INK} />
              <Text style={styles.accesoLabel}>MESAS</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.accesoCard, { backgroundColor: COLORS.info }, hardShadow(pressed)]}
              onPress={() => router.push('/pos/ordenes')}
              android_ripple={RIPPLE}
            >
              <POSIcon name="list" size={38} color={INK} />
              <Text style={styles.accesoLabel}>ÓRDENES</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.accesoCard, { backgroundColor: '#FFB37A' }, hardShadow(pressed)]}
              onPress={() => router.push('/pos/cocina')}
              android_ripple={RIPPLE}
            >
              <POSIcon name="flame" size={38} color={INK} />
              <Text style={styles.accesoLabel}>COCINA</Text>
            </Pressable>
          </View>
        </View>

        {/* Actividad Reciente */}
        <View style={[styles.seccion, styles.ultimaSeccion]}>
          <Text style={styles.tituloSeccion}>ACTIVIDAD RECIENTE</Text>
          {ordenes.length === 0 ? (
            <View style={styles.emptyActividad}>
              <View style={styles.emptyIconBadge}>
                <POSIcon name="receipt-outline" size={32} color={INK} />
              </View>
              <Text style={styles.emptyActividadTexto}>SIN ACTIVIDAD TODAVÍA</Text>
            </View>
          ) : (
            ordenes.slice(0, 5).map((orden) => {
              const estadoColor =
                orden.estado === EstadoOrden.PENDIENTE ? COLORS.warning :
                  orden.estado === EstadoOrden.EN_PREPARACION ? COLORS.info :
                    orden.estado === EstadoOrden.LISTA ? COLORS.success :
                      '#D9D9D0';

              return (
                <Pressable
                  key={orden.id}
                  style={({ pressed }) => [styles.actividadCard, hardShadow(pressed)]}
                  onPress={() => router.push(`/pos/detalle-orden?ordenId=${orden.id}`)}
                  android_ripple={RIPPLE}
                >
                  <View style={styles.actividadHeader}>
                    <View style={styles.actividadInfo}>
                      <Text style={styles.actividadOrden}>ORDEN {orden.folio}</Text>
                      {orden.mesa && (
                        <View style={styles.actividadMesa}>
                          <POSIcon name="restaurant" size={13} color={INK} />
                          <Text style={styles.actividadMesaText}>
                            Mesa {orden?.mesa?.numero || orden?.mesa?.nombre}
                          </Text>
                        </View>
                      )}
                      {orden.tipo === 'PARA_LLEVAR' && (
                        <View style={[styles.miniBadge, { backgroundColor: COLORS.info }]}>
                          <Text style={styles.miniBadgeTexto}>LLEVAR</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.actividadDerecha}>
                      <View style={[styles.miniBadge, { backgroundColor: estadoColor }]}>
                        <Text style={styles.miniBadgeTexto}>{orden.estado.replace('_', ' ')}</Text>
                      </View>
                      <Text style={styles.actividadTotal}>${orden.total.toFixed(2)}</Text>
                    </View>
                  </View>
                  <Text style={styles.actividadDetalle}>
                    {orden.detalles?.length || 0} {orden.detalles?.length === 1 ? 'producto' : 'productos'}
                    {orden.tiempoPreparacion && ` · ${orden.tiempoPreparacion} min`}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* FAB Menu Flotante */}
      <View style={styles.fabContainer}>
        {menuAbierto && (
          <Pressable style={styles.overlay} onPress={toggleMenu} />
        )}

        {/* Opciones del menú */}
        {renderOpcionMenu('add-circle', 'Nueva Orden', 'nueva-orden', 4, COLORS.success)}
        {renderOpcionMenu('grid', 'Mesas', 'mesas', 3, COLORS.primary)}
        {renderOpcionMenu('list', 'Órdenes', 'ordenes', 2, COLORS.info)}
        {renderOpcionMenu('flame', 'Cocina', 'cocina', 1, '#FFB37A')}
        {renderOpcionMenu('time', 'Historial', 'historial', 0, COLORS.warning)}

        {/* Botón principal */}
        <Pressable
          style={({ pressed }) => [
            styles.fabButton,
            menuAbierto && styles.fabButtonActivo,
            hardShadow(pressed),
          ]}
          onPress={toggleMenu}
          android_ripple={RIPPLE}
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
            <POSIcon name="menu" size={26} color={INK} />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1EC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
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
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  activoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: INK,
  },
  activoBadgeTexto: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },

  // ── Secciones ────────────────────────────────────────────────────────────
  seccion: {
    padding: 16,
  },
  ultimaSeccion: {
    paddingBottom: 20,
  },
  tituloSeccion: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: INK,
    marginBottom: 12,
  },

  // ── Estadísticas ────────────────────────────────────────────────────────
  estadisticasGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  estadisticaCard: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    gap: 6,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
  },
  estadisticaNumero: {
    fontSize: 28,
    fontWeight: '800',
    color: INK,
  },
  estadisticaLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: INK,
    textAlign: 'center',
  },

  // ── Accesos Rápidos ─────────────────────────────────────────────────────
  accesosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  accesoCard: {
    width: '47%',
    alignItems: 'center',
    padding: 20,
    gap: 10,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    borderColor: INK,
  },
  accesoLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: INK,
    textAlign: 'center',
  },

  // ── Actividad Reciente ──────────────────────────────────────────────────
  actividadCard: {
    backgroundColor: COLORS.white,
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: INK,
  },
  actividadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 10,
  },
  actividadInfo: {
    flex: 1,
    gap: 5,
  },
  actividadOrden: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
  },
  actividadMesa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actividadMesaText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  actividadDerecha: {
    alignItems: 'flex-end',
    gap: 6,
  },
  actividadTotal: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.success,
  },
  actividadDetalle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: INK,
    alignSelf: 'flex-start',
  },
  miniBadgeTexto: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: INK,
    textTransform: 'uppercase',
  },

  // ── Empty actividad ─────────────────────────────────────────────────────
  emptyActividad: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS,
    borderWidth: 2,
    borderColor: INK,
    borderStyle: 'dashed',
    gap: 8,
  },
  emptyIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F1EC',
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyActividadTexto: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
    color: INK,
  },

  // ── FAB Menu ────────────────────────────────────────────────────────────
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
    backgroundColor: 'rgba(13, 13, 13, 0.5)',
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    borderWidth: BORDER_W,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabButtonActivo: {
    backgroundColor: '#FF9494',
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
    borderWidth: 2,
    borderColor: INK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelOpcionMenu: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: INK,
  },
  labelOpcionMenuTexto: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: INK,
  },
});