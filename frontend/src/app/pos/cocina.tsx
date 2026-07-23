import { POSIcon } from '@/components/pos';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useCocina } from '@/features/cocina/useCocina';
import { EstadoOrden, OrdenResponseDTO } from '@/features/pos/pos.types';
import usePos from '@/features/pos/usePos';
import { ROUTES } from '@/routes/routes';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/* ============================================================
 * Mismo sistema visual que VistaMesasScreen / OrdenesScreen —
 * consistencia entre pantallas = confianza (nada que reaprender).
 * En cocina la prioridad #1 es velocidad: cada tarjeta debe leerse
 * y accionarse en menos de 2 segundos, con el cocinero de pie y
 * con las manos ocupadas la mayor parte del tiempo.
 *
 * FIX: las 3 columnas ya no se dividen en partes iguales con flex:1
 * (eso las dejaba demasiado angostas en celular y provocaba que el
 * círculo de tiempo se montara sobre el número de orden). Ahora cada
 * columna tiene un ancho mínimo fijo y el tablero completo se desplaza
 * horizontalmente. Dentro de la tarjeta se blindó cada elemento con
 * flexShrink/minWidth explícitos para que nada se superponga aunque
 * el contenido sea largo.
 * ============================================================ */
const INK = '#0A0A0A';
const PALETTE = {
  bg: '#F2F1EC',
  surface: '#FFFFFF',
  ink: INK,
  primary: '#1652F0',
  primaryDark: '#0F3BB8',
  success: '#1C8A4B',
  successDark: '#136436',
  warning: '#F2A900',
  warningDark: '#B87D00',
  danger: '#C4491D',
  dangerDark: '#8F350F',
  info: '#0E7C86',
  infoDark: '#0A5A61',
  neutral: '#6B6B63',
  border: INK,
};

const BORDER_W = 3;
const RADIUS = 14;
const COLUMN_WIDTH = 300; // ancho fijo por columna — evita que el contenido se aplaste/superponga

const hardShadow = (color: string = INK, size = 4) => ({
  shadowColor: color,
  shadowOffset: { width: size, height: size },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: size + 2,
});

const tap = (style: 'light' | 'medium' | 'success' = 'light') => {
  try {
    if (style === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (style === 'medium') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics no disponible (web/simulador) — no bloquea el flujo.
  }
};

type ColumnaKDS = 'pendiente' | 'preparando' | 'lista';

const COLUMNAS: { titulo: string; estado: EstadoOrden; key: ColumnaKDS; solid: string; dark: string }[] = [
  { titulo: 'Pendiente', estado: EstadoOrden.PENDIENTE, key: 'pendiente', solid: PALETTE.warning, dark: PALETTE.warningDark },
  { titulo: 'Preparando', estado: EstadoOrden.EN_PREPARACION, key: 'preparando', solid: PALETTE.info, dark: PALETTE.infoDark },
  { titulo: 'Listo', estado: EstadoOrden.LISTA, key: 'lista', solid: PALETTE.success, dark: PALETTE.successDark },
];

export default function CocinaScreen() {
  const { ordenes } = usePos();
  const { cargarOrdenes } = useCocina();
  const [tiempos, setTiempos] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const minutosDesde = (fecha: string): number => {
    const fechaNormalizada = fecha.replace(/(\.\d{3})\d*/, '$1');
    const inicio = new Date(fechaNormalizada);
    return Math.floor((Date.now() - inicio.getTime()) / 60000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTiempos((prev) => {
        const nuevo = { ...prev };
        ordenes.forEach((orden) => {
          nuevo[orden.id] = (orden.createdAt ? minutosDesde(orden.createdAt) : 0) + 1;
        });
        return nuevo;
      });
    }, 60000);

    const tiemposIniciales: { [key: number]: number } = {};
    ordenes.forEach((orden) => {
      tiemposIniciales[orden.id] = orden.createdAt ? minutosDesde(orden.createdAt) : 0;
    });
    setTiempos(tiemposIniciales);

    return () => clearInterval(interval);
  }, [ordenes]);

  const cambiarEstado = (ordenId: number, nuevoEstado: EstadoOrden) => {
    tap('success');
    // Aquí iría la lógica de actualización de estado
  };

  // Terracota en vez de rojo puro: una orden tardía debe alertar,
  // no generar pánico visual en un entorno ya de por sí de alta presión.
  const obtenerColorTiempo = (minutos: number) => {
    if (minutos < 10) return { solid: PALETTE.success, dark: PALETTE.successDark };
    if (minutos < 20) return { solid: PALETTE.warning, dark: PALETTE.warningDark };
    return { solid: PALETTE.danger, dark: PALETTE.dangerDark };
  };

  const obtenerOrdenesPorEstado = (estado: EstadoOrden) => ordenes.filter((orden) => orden.estado === estado);

  const renderOrdenCard = (orden: OrdenResponseDTO, columna: ColumnaKDS) => {
    const tiempo = tiempos[orden.id] ?? (orden.createdAt ? minutosDesde(orden.createdAt) : 0);
    const colorTiempo = obtenerColorTiempo(tiempo);

    return (
      <View
        key={orden.id}
        style={[styles.ordenCard, { borderColor: colorTiempo.dark }, hardShadow(colorTiempo.dark, 4)]}
      >
        {/* Header */}
        <View style={styles.ordenHeader}>
          <View style={styles.ordenHeaderLeft}>
            <Text style={styles.ordenNumero} numberOfLines={1}>
              #{orden.id}
            </Text>
            {orden?.mesa?.nombre ? (
              <View style={styles.mesaTag}>
                <POSIcon name="restaurant" size={13} color="#FFF" />
                <Text style={styles.mesaTagText} numberOfLines={1}>
                  Mesa {orden.mesa.nombre}
                </Text>
              </View>
            ) : (
              <View style={[styles.mesaTag, { backgroundColor: PALETTE.info, borderColor: PALETTE.infoDark }]}>
                <POSIcon name="bag-handle" size={13} color="#FFF" />
                <Text style={styles.mesaTagText} numberOfLines={1}>
                  LLEVAR
                </Text>
              </View>
            )}
          </View>
          {/* Reloj de tiempo — ancho fijo y flexShrink:0 para que NUNCA se monte sobre el texto de la izquierda */}
          <View style={[styles.tiempoCirculo, { backgroundColor: colorTiempo.solid, borderColor: colorTiempo.dark }]}>
            <Text style={styles.tiempoTexto}>{tiempo}'</Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.ordenItems}>
          {orden.detalles.map((item) => (
            <View key={item.id} style={styles.ordenItem}>
              <View style={styles.itemCantidadBadge}>
                <Text style={styles.itemCantidadTexto}>{item.cantidad}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemNombre} numberOfLines={1}>
                  {item.nombreProducto}
                </Text>
                {item.extras.length > 0 && (
                  <View style={styles.itemExtras}>
                    {item.extras.map((extra) => (
                      <Text key={extra.id} style={styles.itemExtra} numberOfLines={1}>
                        + {extra.nombreExtra}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
          {orden.observaciones ? (
            <View style={styles.notaContainer}>
              <POSIcon name="alert-circle" size={15} color={PALETTE.dangerDark} />
              <Text style={styles.notaTexto}>{orden.observaciones}</Text>
            </View>
          ) : null}
        </View>

        {/* Acción — un solo botón grande, la única decisión que importa aquí */}
        <View style={styles.ordenAcciones}>
          {columna === 'pendiente' && (
            <Pressable
              onPress={() => cambiarEstado(orden.id, EstadoOrden.EN_PREPARACION)}
              style={({ pressed }) => [
                styles.accionButton,
                { backgroundColor: PALETTE.info, borderColor: PALETTE.infoDark },
                hardShadow(PALETTE.infoDark, pressed ? 1 : 3),
                pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
              ]}
            >
              <POSIcon name="play" size={20} color="#FFF" />
              <Text style={styles.accionButtonText}>Iniciar</Text>
            </Pressable>
          )}

          {columna === 'preparando' && (
            <Pressable
              onPress={() => cambiarEstado(orden.id, EstadoOrden.LISTA)}
              style={({ pressed }) => [
                styles.accionButton,
                { backgroundColor: PALETTE.success, borderColor: PALETTE.successDark },
                hardShadow(PALETTE.successDark, pressed ? 1 : 3),
                pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
              ]}
            >
              <POSIcon name="checkmark" size={20} color="#FFF" />
              <Text style={styles.accionButtonText}>Completar</Text>
            </Pressable>
          )}

          {columna === 'lista' && (
            <Pressable
              onPress={() => {
                tap('success');
                console.log('Orden servida:', orden.id);
              }}
              style={({ pressed }) => [
                styles.accionButton,
                { backgroundColor: PALETTE.ink, borderColor: PALETTE.ink },
                hardShadow('#4A4A44', pressed ? 1 : 3),
                pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
              ]}
            >
              <POSIcon name="checkmark-done" size={20} color="#FFF" />
              <Text style={styles.accionButtonText}>Servido</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const renderColumna = (titulo: string, estado: EstadoOrden, columna: ColumnaKDS, solid: string, dark: string) => {
    const ordenesColumna = obtenerOrdenesPorEstado(estado);

    return (
      <View style={[styles.columna, { borderColor: dark }, hardShadow(dark, 4)]}>
        <View style={[styles.columnaHeader, { backgroundColor: solid, borderBottomColor: dark }]}>
          <Text style={styles.columnaTitulo} numberOfLines={1} ellipsizeMode="tail">
            {titulo}
          </Text>
          <View style={[styles.columnaContador, { borderColor: dark }]}>
            <Text style={[styles.columnaContadorTexto, { color: dark }]}>{ordenesColumna.length}</Text>
          </View>
        </View>
        <ScrollView
          style={styles.columnaScroll}
          contentContainerStyle={styles.columnaContent}
          showsVerticalScrollIndicator={false}
        >
          {ordenesColumna.length === 0 ? (
            <View style={styles.columnaVacia}>
              <POSIcon name="checkmark-circle" size={36} color={PALETTE.neutral} />
              <Text style={styles.columnaVaciaTexto}>Sin órdenes</Text>
            </View>
          ) : (
            ordenesColumna.map((orden) => renderOrdenCard(orden, columna))
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
            <Text style={styles.title}>Cocina</Text>
            <View style={styles.contadorTotal}>
              <Text style={styles.contadorTotalText}>{ordenes.length} órdenes</Text>
            </View>
          </View>
          <View style={styles.leyenda}>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: PALETTE.success, borderColor: PALETTE.successDark }]} />
              <Text style={styles.leyendaTexto}>{'< 10 min'}</Text>
            </View>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: PALETTE.warning, borderColor: PALETTE.warningDark }]} />
              <Text style={styles.leyendaTexto}>10–20 min</Text>
            </View>
            <View style={styles.leyendaItem}>
              <View style={[styles.leyendaDot, { backgroundColor: PALETTE.danger, borderColor: PALETTE.dangerDark }]} />
              <Text style={styles.leyendaTexto}>{'> 20 min'}</Text>
            </View>
          </View>
        </View>

        {/* Columnas KDS — scroll horizontal con ancho fijo por columna en vez de flex:1 a partes iguales */}
        <ScrollView
          horizontal
          style={styles.columnasContainer}
          contentContainerStyle={styles.columnasContent}
          showsHorizontalScrollIndicator={false}
        >
          {COLUMNAS.map((c) => (
            <View key={c.key} style={styles.columnaWrapper}>
              {renderColumna(c.titulo, c.estado, c.key, c.solid, c.dark)}
            </View>
          ))}
        </ScrollView>
      </View>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PALETTE.bg },

  header: {
    backgroundColor: PALETTE.surface,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: BORDER_W,
    borderBottomColor: PALETTE.border,
    gap: 12,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '900', color: PALETTE.ink, letterSpacing: -0.5 },
  contadorTotal: {
    backgroundColor: PALETTE.primary,
    borderWidth: 2,
    borderColor: PALETTE.primaryDark,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexShrink: 0,
  },
  contadorTotalText: { fontSize: 13, fontWeight: '900', color: '#FFF' },

  leyenda: { flexDirection: 'row', gap: 18, flexWrap: 'wrap' },
  leyendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  leyendaDot: { width: 12, height: 12, borderRadius: 4, borderWidth: 2 },
  leyendaTexto: { fontSize: 12, color: PALETTE.ink, fontWeight: '700' },

  // FIX: ya no flex:1 partiendo el ancho a la fuerza; ahora es un carril horizontal con scroll
  columnasContainer: { flex: 1 },
  columnasContent: { flexDirection: 'row', padding: 10, gap: 10 },
  columnaWrapper: { width: COLUMN_WIDTH, flexShrink: 0 },
  columna: {
    flex: 1,
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    overflow: 'hidden',
    minHeight: 200,
  },
  columnaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: BORDER_W,
    gap: 8,
  },
  // FIX: flex:1 + minWidth:0 para que el título se trunque con "..." en vez de encimarse con el contador
  columnaTitulo: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '900', color: '#FFF' },
  columnaContador: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 3,
    minWidth: 32,
    alignItems: 'center',
    flexShrink: 0,
  },
  columnaContadorTexto: { fontSize: 14, fontWeight: '900' },
  columnaScroll: { flex: 1 },
  columnaContent: { padding: 8, gap: 10 },
  columnaVacia: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
  columnaVaciaTexto: { fontSize: 13, color: PALETTE.neutral, fontWeight: '700' },

  ordenCard: {
    backgroundColor: PALETTE.surface,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
    padding: 12,
  },
  ordenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#EDEBE3',
    gap: 8,
  },
  // FIX: minWidth:0 es clave — sin esto, un View con flex:1 dentro de un row no se
  // encoge por debajo del ancho de su contenido y termina empujándose sobre el vecino
  ordenHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, flexWrap: 'wrap' },
  ordenNumero: { fontSize: 18, fontWeight: '900', color: PALETTE.ink, flexShrink: 0 },
  mesaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PALETTE.primary,
    borderWidth: 2,
    borderColor: PALETTE.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 1,
    maxWidth: '100%',
  },
  mesaTagText: { fontSize: 11, fontWeight: '800', color: '#FFF', flexShrink: 1 },

  // FIX: flexShrink:0 — el círculo de tiempo ya NUNCA se comprime ni se monta sobre el texto
  tiempoCirculo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: BORDER_W,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  tiempoTexto: { fontSize: 17, fontWeight: '900', color: '#FFF' },

  ordenItems: { gap: 10, marginBottom: 10 },
  ordenItem: { flexDirection: 'row', gap: 10 },
  itemCantidadBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: PALETTE.primaryDark,
    backgroundColor: PALETTE.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  itemCantidadTexto: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  itemInfo: { flex: 1, minWidth: 0 },
  itemNombre: { fontSize: 15, fontWeight: '800', color: PALETTE.ink, marginBottom: 2 },
  itemExtras: { marginTop: 2, gap: 2 },
  itemExtra: { fontSize: 12, color: PALETTE.neutral, fontWeight: '600' },

  notaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    padding: 8,
    backgroundColor: '#FDF1D9',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: PALETTE.warningDark,
  },
  notaTexto: { fontSize: 12, color: PALETTE.dangerDark, fontWeight: '800', flex: 1 },

  ordenAcciones: { marginTop: 4, paddingTop: 10, borderTopWidth: 2, borderTopColor: '#EDEBE3' },
  accionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
    borderRadius: RADIUS,
    borderWidth: BORDER_W,
  },
  accionButtonText: { fontSize: 15, fontWeight: '900', color: '#FFF' },
});