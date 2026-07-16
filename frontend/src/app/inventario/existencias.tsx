import { COLORS, POSBadge, POSButton, POSCard, POSIcon, SearchBar } from '@/components/pos';
import { MaterialDTO } from '@/features/inventario/inventario/inventario.types';
import useInventario from '@/features/inventario/inventario/useInventario';
import { Unidad } from '@/types/globalTypes';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

// ─────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────

const MOCK_MATERIALES: MaterialDTO[] = [
  {
    id: 1,
    nombre: 'Harina de Trigo',
    descripcion: 'Harina para uso general en panadería y cocina',
    proveedor: 'Molinos del Norte',
    categoriaInventario: 'Granos y Harinas',
    unidadMedida: Unidad.KG,
    costoUnitario: 18.5,
    activo: true,
    perecedero: false,
    diasVencimiento: 180,
    sucursalId: 1,
    existencia: {
      id: 101,
      stockActual: 4,
      stockMinimo: 10,
      stockMaximo: 50,
      ubicacion: 'Almacén A1',
      lote: 'L2025-001',
      fechaVencimiento: '2026-01-15',
      alertaBajoStock: true,
      ultimaActualizacion: '2025-07-14',
    },
  },
  {
    id: 2,
    nombre: 'Queso Mozzarella',
    descripcion: 'Queso mozzarella para pizzas y gratinados',
    proveedor: 'Lácteos Premium',
    categoriaInventario: 'Lácteos',
    unidadMedida: Unidad.KG,
    costoUnitario: 120.0,
    activo: true,
    perecedero: true,
    diasVencimiento: 14,
    sucursalId: 1,
    existencia: {
      id: 102,
      stockActual: 3,
      stockMinimo: 5,
      stockMaximo: 20,
      ubicacion: 'Refrigerador B2',
      lote: 'L2025-042',
      fechaVencimiento: '2025-07-28',
      alertaBajoStock: true,
      ultimaActualizacion: '2025-07-15',
    },
  },
  {
    id: 3,
    nombre: 'Salsa de Tomate',
    descripcion: 'Salsa de tomate para bases de pizza',
    proveedor: 'Conservas del Sol',
    categoriaInventario: 'Salsas y Condimentos',
    unidadMedida: Unidad.LT,
    costoUnitario: 35.0,
    activo: true,
    perecedero: false,
    diasVencimiento: 365,
    sucursalId: 1,
    existencia: {
      id: 103,
      stockActual: 8,
      stockMinimo: 6,
      stockMaximo: 30,
      ubicacion: 'Almacén A2',
      lote: 'L2025-018',
      fechaVencimiento: '2026-06-01',
      alertaBajoStock: false,
      ultimaActualizacion: '2025-07-10',
    },
  },
  {
    id: 4,
    nombre: 'Azúcar Estándar',
    descripcion: 'Azúcar refinada para preparaciones dulces',
    proveedor: 'Azucarera Central',
    categoriaInventario: 'Endulzantes',
    unidadMedida: Unidad.KG,
    costoUnitario: 22.0,
    activo: true,
    perecedero: false,
    diasVencimiento: 730,
    sucursalId: 1,
    existencia: {
      id: 104,
      stockActual: 25,
      stockMinimo: 10,
      stockMaximo: 60,
      ubicacion: 'Almacén A1',
      lote: 'L2025-009',
      fechaVencimiento: '2027-01-01',
      alertaBajoStock: false,
      ultimaActualizacion: '2025-07-12',
    },
  },
  {
    id: 5,
    nombre: 'Fresa Natural',
    descripcion: 'Fresa fresca para jarabes y decorados',
    proveedor: 'Frutas del Campo',
    categoriaInventario: 'Frutas',
    unidadMedida: Unidad.KG,
    costoUnitario: 55.0,
    activo: true,
    perecedero: true,
    diasVencimiento: 5,
    sucursalId: 1,
    existencia: {
      id: 105,
      stockActual: 7,
      stockMinimo: 8,
      stockMaximo: 25,
      ubicacion: 'Refrigerador C1',
      lote: 'L2025-061',
      fechaVencimiento: '2025-07-20',
      alertaBajoStock: true,
      ultimaActualizacion: '2025-07-15',
    },
  },
  {
    id: 6,
    nombre: 'Té Negro',
    descripcion: 'Hojas de té negro para preparaciones de bebida',
    proveedor: 'Importadora Oriental',
    categoriaInventario: 'Infusiones',
    unidadMedida: Unidad.GR,
    costoUnitario: 0.8,
    activo: true,
    perecedero: false,
    diasVencimiento: 540,
    sucursalId: 1,
    existencia: {
      id: 106,
      stockActual: 500,
      stockMinimo: 200,
      stockMaximo: 2000,
      ubicacion: 'Almacén A3',
      lote: 'L2025-027',
      fechaVencimiento: '2026-12-01',
      alertaBajoStock: false,
      ultimaActualizacion: '2025-07-11',
    },
  },
  {
    id: 7,
    nombre: 'Perlas de Tapioca',
    descripcion: 'Perlas de tapioca para bubble tea',
    proveedor: 'Importadora Oriental',
    categoriaInventario: 'Insumos Especiales',
    unidadMedida: Unidad.KG,
    costoUnitario: 85.0,
    activo: true,
    perecedero: false,
    diasVencimiento: 365,
    sucursalId: 1,
    existencia: {
      id: 107,
      stockActual: 12,
      stockMinimo: 10,
      stockMaximo: 40,
      ubicacion: 'Almacén A4',
      lote: 'L2025-033',
      fechaVencimiento: '2026-07-01',
      alertaBajoStock: false,
      ultimaActualizacion: '2025-07-09',
    },
  },
  {
    id: 8,
    nombre: 'Levadura Seca',
    descripcion: 'Levadura activa deshidratada para masas',
    proveedor: 'Insumos de Panadería SA',
    categoriaInventario: 'Levaduras y Fermentos',
    unidadMedida: Unidad.GR,
    costoUnitario: 0.5,
    activo: true,
    perecedero: true,
    diasVencimiento: 90,
    sucursalId: 1,
    existencia: {
      id: 108,
      stockActual: 80,
      stockMinimo: 100,
      stockMaximo: 500,
      ubicacion: 'Almacén A1',
      lote: 'L2025-055',
      fechaVencimiento: '2025-10-01',
      alertaBajoStock: true,
      ultimaActualizacion: '2025-07-14',
    },
  },
];

interface RecetaMock {
  id: number;
  nombre: string;
  descripcion: string;
  rendimiento: string;
  unidadRendimiento: string;
}

const MOCK_RECETAS: RecetaMock[] = [
  {
    id: 1,
    nombre: 'Masa para Pizza',
    descripcion: 'Base de masa fina con harina, agua, levadura y aceite',
    rendimiento: '4',
    unidadRendimiento: 'bases (30 cm)',
  },
  {
    id: 2,
    nombre: 'Jarabe de Fresa',
    descripcion: 'Jarabe concentrado de fresa para bebidas y postres',
    rendimiento: '2',
    unidadRendimiento: 'litros',
  },
  {
    id: 3,
    nombre: 'Té Concentrado',
    descripcion: 'Base concentrada de té negro para bubble tea',
    rendimiento: '5',
    unidadRendimiento: 'litros',
  },
  {
    id: 4,
    nombre: 'Perlas de Tapioca Cocidas',
    descripcion: 'Perlas de tapioca cocidas y listas para servir',
    rendimiento: '3',
    unidadRendimiento: 'kg (listos)',
  },
];

type VistaEstado = 'normal' | 'loading' | 'empty' | 'error';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getStockStatus(material: MaterialDTO): 'success' | 'warning' | 'danger' {
  const { stockActual, stockMinimo } = material.existencia;
  if (stockActual <= stockMinimo * 0.5) return 'danger';
  if (stockActual < stockMinimo) return 'warning';
  return 'success';
}

function getStockLabel(status: 'success' | 'warning' | 'danger'): string {
  if (status === 'danger') return 'Stock Bajo';
  if (status === 'warning') return 'Stock Mínimo';
  return 'Stock OK';
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

// ─────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  backgroundColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, backgroundColor }) => {
  const { width } = useWindowDimensions();
  const phone = width < 600;
  return (
    <View style={[styles.statCard, { borderLeftColor: color }, phone && styles.statCard_phone]}>
      <View style={[styles.statIconBox, { backgroundColor }, phone && styles.statIconBox_phone]}>
        <POSIcon name={icon as any} size={phone ? 16 : 22} color={color} />
      </View>
      <View style={[styles.statContent, phone && styles.statContent_phone]}>
        <Text style={[styles.statValue, phone && styles.statValue_phone]}>{value}</Text>
        <Text style={[styles.statLabel, phone && styles.statLabel_phone]}>{label}</Text>
      </View>
    </View>
  );
};

interface AlertaStockCardProps {
  material: MaterialDTO;
}

const AlertaStockCard: React.FC<AlertaStockCardProps> = ({ material }) => (
  <View style={styles.alertaCard}>
    <POSIcon name="warning" size={18} color={COLORS.danger} style={{ marginRight: 8 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.alertaNombre}>{material.nombre}</Text>
      <Text style={styles.alertaDetalle}>
        Actual: <Text style={styles.alertaValorBad}>{material.existencia.stockActual} {material.unidadMedida}</Text>
        {'  '}Mínimo: <Text style={styles.alertaValorRef}>{material.existencia.stockMinimo} {material.unidadMedida}</Text>
      </Text>
    </View>
  </View>
);

interface RecetaCardProps {
  receta: RecetaMock;
  onProducir: (receta: RecetaMock) => void;
}

const RecetaCard: React.FC<RecetaCardProps> = ({ receta, onProducir }) => {
  const { width } = useWindowDimensions();
  const phone = width < 600;
  return (
    <POSCard variant="outlined" style={{ ...styles.recetaCard, ...(phone ? styles.recetaCard_phone : undefined) }}>
      <View style={styles.recetaHeader}>
        <View style={styles.recetaIconBox}>
          <POSIcon name="restaurant" size={20} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.recetaNombre}>{receta.nombre}</Text>
          <Text style={styles.recetaDescripcion}>{receta.descripcion}</Text>
        </View>
      </View>
      <View style={styles.recetaFooter}>
        <View style={styles.rendimientoBox}>
          <POSIcon name="flask" size={14} color={COLORS.textSecondary} />
          <Text style={styles.rendimientoText}>
            Rinde: {receta.rendimiento} {receta.unidadRendimiento}
          </Text>
        </View>
        <POSButton
          title="Producir"
          onPress={() => onProducir(receta)}
          variant="primary"
          size="small"
        />
      </View>
    </POSCard>
  );
};

interface MaterialCardProps {
  material: MaterialDTO;
  onVerDetalle: (m: MaterialDTO) => void;
  onEntrada: (m: MaterialDTO) => void;
  onSalida: (m: MaterialDTO) => void;
  onAjustar: (m: MaterialDTO) => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  onVerDetalle,
  onEntrada,
  onSalida,
  onAjustar,
}) => {
  const { width } = useWindowDimensions();
  const phone = width < 600;
  const status = getStockStatus(material);
  const badgeVariant = status;
  const indicatorColor =
    status === 'success' ? COLORS.success : status === 'warning' ? COLORS.warning : COLORS.danger;

  return (
    <POSCard variant="elevated" style={styles.materialCard}>
      {/* Indicador lateral de color */}
      <View style={[styles.stockIndicator, { backgroundColor: indicatorColor }]} />

      <View style={styles.materialContent}>
        {/* Fila superior */}
        <View style={styles.materialTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.materialNombre}>{material.nombre}</Text>
            <Text style={styles.materialDescripcion}>{material.descripcion}</Text>
            <Text style={styles.materialCategoria}>{material.categoriaInventario}</Text>
          </View>
          <POSBadge
            label={getStockLabel(status)}
            variant={badgeVariant}
            size="small"
          />
        </View>

        {/* Fila de datos — 4 cols en tablet, grid 2×2 en teléfono */}
        <View style={[styles.materialDataRow, phone && styles.materialDataRow_phone]}>
          <View style={[styles.dataItem, phone && styles.dataItem_phone]}>
            <Text style={styles.dataLabel}>Existencia</Text>
            <Text style={[styles.dataValue, { color: indicatorColor }]}>
              {material.existencia.stockActual}
            </Text>
            <Text style={styles.dataUnit}>{material.unidadMedida}</Text>
          </View>
          {!phone && <View style={styles.dataDivider} />}
          <View style={[styles.dataItem, phone && styles.dataItem_phone]}>
            <Text style={styles.dataLabel}>Mínimo</Text>
            <Text style={styles.dataValue}>{material.existencia.stockMinimo}</Text>
            <Text style={styles.dataUnit}>{material.unidadMedida}</Text>
          </View>
          {!phone && <View style={styles.dataDivider} />}
          <View style={[styles.dataItem, phone && styles.dataItem_phone]}>
            <Text style={styles.dataLabel}>Costo</Text>
            <Text style={styles.dataValue}>{formatCurrency(material.costoUnitario)}</Text>
            <Text style={styles.dataUnit}>/{material.unidadMedida}</Text>
          </View>
          {!phone && <View style={styles.dataDivider} />}
          <View style={[styles.dataItem, phone && styles.dataItem_phone]}>
            <Text style={styles.dataLabel}>Valor</Text>
            <Text style={styles.dataValue}>
              {formatCurrency(material.existencia.stockActual * material.costoUnitario)}
            </Text>
            <Text style={styles.dataUnit}>total</Text>
          </View>
        </View>

        {/* Barra de progreso de stock */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    100,
                    (material.existencia.stockActual / material.existencia.stockMaximo) * 100
                  )}%`,
                  backgroundColor: indicatorColor,
                },
              ]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {material.existencia.stockActual}/{material.existencia.stockMaximo} {material.unidadMedida}
          </Text>
        </View>

        {/* Acciones — tablet: fila única · teléfono: 3 botones + Ajustar full-width */}
        {phone ? (
          <View>
            <View style={styles.accionesTopRow}>
              <TouchableOpacity style={styles.accionBtn_phone} onPress={() => onVerDetalle(material)}>
                <POSIcon name="eye-outline" size={15} color={COLORS.info} />
                <Text style={[styles.accionText, { color: COLORS.info }]}>Detalle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.accionBtn_phone} onPress={() => onEntrada(material)}>
                <POSIcon name="arrow-down-circle-outline" size={15} color={COLORS.success} />
                <Text style={[styles.accionText, { color: COLORS.success }]}>Entrada</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.accionBtn_phone} onPress={() => onSalida(material)}>
                <POSIcon name="arrow-up-circle-outline" size={15} color={COLORS.gray} />
                <Text style={[styles.accionText, { color: COLORS.gray }]}>Salida</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.accionAjustar_phone} onPress={() => onAjustar(material)}>
              <POSIcon name="sync-outline" size={16} color={COLORS.white} />
              <Text style={[styles.accionText, styles.accionAjustarText_phone]}>Ajustar Existencia</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.accionesRow}>
            <TouchableOpacity style={styles.accionBtn} onPress={() => onVerDetalle(material)}>
              <POSIcon name="eye-outline" size={16} color={COLORS.info} />
              <Text style={[styles.accionText, { color: COLORS.info }]}>Detalle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accionBtn} onPress={() => onEntrada(material)}>
              <POSIcon name="arrow-down-circle-outline" size={16} color={COLORS.success} />
              <Text style={[styles.accionText, { color: COLORS.success }]}>Entrada</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accionBtn} onPress={() => onSalida(material)}>
              <POSIcon name="arrow-up-circle-outline" size={16} color={COLORS.gray} />
              <Text style={[styles.accionText, { color: COLORS.gray }]}>Salida</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.accionBtn, styles.accionAjustar]}
              onPress={() => onAjustar(material)}
            >
              <POSIcon name="sync-outline" size={16} color={COLORS.white} />
              <Text style={[styles.accionText, { color: COLORS.white }]}>Ajustar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </POSCard>
  );
};

// ─────────────────────────────────────────────
// Estados visuales
// ─────────────────────────────────────────────

const LoadingState: React.FC = () => (
  <View style={styles.stateContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.stateTitle}>Cargando inventario...</Text>
    <Text style={styles.stateSubtitle}>Obteniendo existencias de la sucursal</Text>
  </View>
);

const EmptyState: React.FC = () => (
  <View style={styles.stateContainer}>
    <View style={styles.stateIconBox}>
      <POSIcon name="cube-outline" size={48} color={COLORS.textSecondary} />
    </View>
    <Text style={styles.stateTitle}>Sin materiales registrados</Text>
    <Text style={styles.stateSubtitle}>
      No hay materiales en el inventario de esta sucursal.{'\n'}
      Agrega materiales desde el catálogo.
    </Text>
    <POSButton title="Ir al catálogo" onPress={() => { }} variant="primary" />
  </View>
);

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <View style={styles.stateContainer}>
    <View style={[styles.stateIconBox, { backgroundColor: '#FEE2E2' }]}>
      <POSIcon name="cloud-offline-outline" size={48} color={COLORS.danger} />
    </View>
    <Text style={[styles.stateTitle, { color: COLORS.danger }]}>Error al cargar</Text>
    <Text style={styles.stateSubtitle}>
      No se pudo obtener el inventario.{'\n'}
      Verifica la conexión e intenta nuevamente.
    </Text>
    <POSButton title="Reintentar" onPress={onRetry} variant="danger" />
  </View>
);

// ─────────────────────────────────────────────
// Pantalla Principal
// ─────────────────────────────────────────────

export default function InventarioSucursalScreen() {
  const { materiales, materialSeleccionado, loading, error, seleccionarMaterial, fetchMaterialesBySucursal } = useInventario();

  useEffect(() => {
    // Simular fetch de inventario al montar el componente
    fetchMaterialesBySucursal(); // Sucursal ID 1 (ejemplo)
  }, [fetchMaterialesBySucursal]);

  const { width } = useWindowDimensions();
  const phone = width < 600;

  const [busqueda, setBusqueda] = useState('');
  const [vistaEstado, setVistaEstado] = useState<VistaEstado>('normal');

  const materialesFiltrados = materiales.filter(
    (m) =>
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const materialesBajoStock = materiales.filter((m) => m.existencia.alertaBajoStock);
  
  const valorTotal = materiales.reduce(
    (sum, m) => sum + m.existencia.stockActual * m.costoUnitario,
    0
  );

  const handleAccion = (accion: string, material: MaterialDTO) => {
    Alert.alert(accion, `Material: ${material.nombre}\n(Mock — sin implementación)`);
  };

  const handleProducir = (receta: RecetaMock) => {
    Alert.alert('Producción', `Iniciando producción de: ${receta.nombre}\n(Mock — sin implementación)`);
  };

  // ── Demostrador de estados visuales ──────────
  const DemoEstados = () => (
    <View style={styles.demoBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.demoBarContent}
      >
        <Text style={styles.demoLabel}>Vista:</Text>
        {(['normal', 'loading', 'empty', 'error'] as VistaEstado[]).map((estado) => (
          <TouchableOpacity
            key={estado}
            style={[styles.demoBtn, vistaEstado === estado && styles.demoBtnActivo]}
            onPress={() => setVistaEstado(estado)}
          >
            <Text style={[styles.demoBtnText, vistaEstado === estado && styles.demoBtnTextActivo]}>
              {estado}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // ── Renderizado por estado ────────────────────
  if (vistaEstado === 'loading') {
    return (
      <View style={styles.root}>
        <DemoEstados />
        <LoadingState />
      </View>
    );
  }

  if (vistaEstado === 'empty') {
    return (
      <View style={styles.root}>
        <DemoEstados />
        <EmptyState />
      </View>
    );
  }

  if (vistaEstado === 'error') {
    return (
      <View style={styles.root}>
        <DemoEstados />
        <ErrorState onRetry={() => setVistaEstado('normal')} />
      </View>
    );
  }

  // ── Vista normal ─────────────────────────────
  return (
    <View style={styles.root}>
      <DemoEstados />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Encabezado ── */}
        <View style={[styles.header, phone && styles.header_phone]}>
          <View style={[styles.headerTitleRow, phone && styles.headerTitleRow_phone]}>
            <POSIcon name="layers" size={phone ? 22 : 28} color={COLORS.primary} style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, phone && styles.headerTitle_phone]}>Inventario de Sucursal</Text>
              <Text style={styles.headerSubtitle}>Sucursal Centro — julio 2025</Text>
            </View>
          </View>
          <View style={[styles.statsGrid, phone && styles.statsGrid_phone]}>
            <StatCard
              icon="cube"
              label="Total materiales"
              value={MOCK_MATERIALES.length}
              color={COLORS.primary}
              backgroundColor="#EBF5FF"
            />
            <StatCard
              icon="warning"
              label="Stock bajo"
              value={materialesBajoStock.length}
              color={COLORS.danger}
              backgroundColor="#FEE2E2"
            />
            <StatCard
              icon="cash"
              label="Valor total"
              value={formatCurrency(valorTotal)}
              color={COLORS.success}
              backgroundColor="#D1FAE5"
            />
          </View>
        </View>

        {/* ── Buscador ── */}
        <View style={[styles.section, phone && styles.section_phone]}>
          <SearchBar
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar por nombre o descripción..."
          />
        </View>

        {/* ── Alertas de stock bajo ── */}
        {materialesBajoStock.length > 0 && (
          <View style={[styles.section, phone && styles.section_phone]}>
            <View style={styles.sectionHeader}>
              <POSIcon name="alert-circle" size={18} color={COLORS.danger} style={{ marginRight: 6 }} />
              <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>
                Alertas de Stock Bajo
              </Text>
              <View style={styles.alertaBadge}>
                <Text style={styles.alertaBadgeText}>{materialesBajoStock.length}</Text>
              </View>
            </View>
            <View style={styles.alertasContainer}>
              {materialesBajoStock.map((m) => (
                <AlertaStockCard key={m.id} material={m} />
              ))}
            </View>
          </View>
        )}

        {/* ── Producción ── */}
        <View style={[styles.section, phone && styles.section_phone]}>
          <View style={styles.sectionHeader}>
            <POSIcon name="construct" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Producción</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Genera inventario a partir de recetas disponibles
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recetasScroll}
            nestedScrollEnabled
          >
            {MOCK_RECETAS.map((receta) => (
              <RecetaCard key={receta.id} receta={receta} onProducir={handleProducir} />
            ))}
          </ScrollView>
        </View>

        {/* ── Lista de inventario ── */}
        <View style={[styles.section, phone && styles.section_phone]}>
          <View style={styles.sectionHeader}>
            <POSIcon name="list" size={18} color={COLORS.text} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Lista de Inventario</Text>
            <Text style={styles.sectionCount}>
              {materialesFiltrados.length} de {materiales.length}
            </Text>
          </View>

          {materialesFiltrados.length === 0 ? (
            <View style={styles.noResultsBox}>
              <POSIcon name="search" size={32} color={COLORS.textSecondary} />
              <Text style={styles.noResultsText}>Sin resultados para "{busqueda}"</Text>
            </View>
          ) : (
            materialesFiltrados.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onVerDetalle={(m) => handleAccion('Ver detalle', m)}
                onEntrada={(m) => handleAccion('Registrar entrada', m)}
                onSalida={(m) => handleAccion('Registrar salida', m)}
                onAjustar={(m) => handleAccion('Ajustar existencia', m)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },

  // ── Demo bar ──────────────────────────────────
  demoBar: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
  },
  demoBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 6,
    paddingRight: 20,
  },
  demoLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginRight: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  demoBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#334155',
  },
  demoBtnActivo: {
    backgroundColor: COLORS.primary,
  },
  demoBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  demoBtnTextActivo: {
    color: COLORS.white,
  },

  // ── Layout principal ──────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Encabezado ────────────────────────────────
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  header_phone: {
    padding: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow_phone: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  headerTitle_phone: {
    fontSize: 17,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statsGrid_phone: {
    gap: 8,
  },

  // ── Stat Card ─────────────────────────────────
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    gap: 10,
  },
  statCard_phone: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    gap: 4,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconBox_phone: {
    width: 30,
    height: 30,
    borderRadius: 6,
  },
  statContent: {
    flex: 1,
  },
  statContent_phone: {
    flex: 0,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  statValue_phone: {
    fontSize: 13,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  statLabel_phone: {
    fontSize: 9,
    textAlign: 'center',
  },

  // ── Secciones generales ───────────────────────
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section_phone: {
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
    marginTop: -4,
  },
  sectionCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // ── Alertas de stock ──────────────────────────
  alertaBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  alertaBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  alertasContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    overflow: 'hidden',
  },
  alertaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
  },
  alertaNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
  },
  alertaDetalle: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 2,
  },
  alertaValorBad: {
    fontWeight: '700',
    color: COLORS.danger,
  },
  alertaValorRef: {
    fontWeight: '600',
    color: '#6B7280',
  },

  // ── Recetas / Producción ──────────────────────
  recetasScroll: {
    gap: 12,
    paddingRight: 4,
  },
  recetaCard: {
    width: 220,
    padding: 14,
  },
  recetaCard_phone: {
    width: 190,
    padding: 12,
  },
  recetaHeader: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  recetaIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recetaNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  recetaDescripcion: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  recetaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  rendimientoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rendimientoText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // ── Tarjeta de material ───────────────────────
  materialCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  stockIndicator: {
    width: 5,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  materialContent: {
    flex: 1,
    padding: 14,
  },
  materialTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  materialNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  materialDescripcion: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  materialCategoria: {
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 3,
    fontWeight: '600',
  },

  // Fila de datos — tablet (4 columnas)
  materialDataRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  // Fila de datos — phone (grid 2×2)
  materialDataRow_phone: {
    flexWrap: 'wrap',
    padding: 0,
    gap: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
  },
  dataItem_phone: {
    flex: 0,
    width: '50%',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    backgroundColor: '#F8FAFC',
  },
  dataDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  dataLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  dataUnit: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },

  // ── Barra de progreso de stock ────────────────
  progressContainer: {
    marginBottom: 12,
    gap: 4,
  },
  progressBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },

  // ── Acciones de material — tablet ────────────
  accionesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  accionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  accionAjustar: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    paddingHorizontal: 14,
  },
  accionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Acciones de material — phone ─────────────
  accionesTopRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  accionBtn_phone: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  accionAjustar_phone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  accionAjustarText_phone: {
    color: COLORS.white,
    fontSize: 13,
  },

  // ── Sin resultados ────────────────────────────
  noResultsBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  noResultsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // ── Estados visuales ──────────────────────────
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 14,
  },
  stateIconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
});
