// Gráfica de pastel (donut) reutilizable, basada en react-native-svg.
// Recibe una lista de segmentos { categoria, monto, porcentaje, color } y los
// dibuja como un anillo, mostrando el total en el centro.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS } from '../pos';

export interface SegmentoPie {
  categoria: string;
  monto: number;
  porcentaje: number;
  color: string;
}

interface PieChartCajaProps {
  data: SegmentoPie[];
  size?: number;
  strokeWidth?: number;
  centroLabel?: string;
}

export const PieChartCaja: React.FC<PieChartCajaProps> = ({
  data,
  size = 180,
  strokeWidth = 28,
  centroLabel = 'Total',
}) => {
  const radio = (size - strokeWidth) / 2;
  const circunferencia = 2 * Math.PI * radio;
  const total = data.reduce((sum, d) => sum + d.monto, 0);

  let acumulado = 0;

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <G rotation={-90} originX={size / 2} originY={size / 2}>
            {total === 0 ? (
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radio}
                stroke={COLORS.lightGray}
                strokeWidth={strokeWidth}
                fill="none"
              />
            ) : (
              data.map((segmento, index) => {
                const largo = (segmento.monto / total) * circunferencia;
                const offset = circunferencia - acumulado;
                acumulado += largo;
                return (
                  <Circle
                    key={index}
                    cx={size / 2}
                    cy={size / 2}
                    r={radio}
                    stroke={segmento.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${largo} ${circunferencia - largo}`}
                    strokeDashoffset={offset}
                    strokeLinecap="butt"
                    fill="none"
                  />
                );
              })
            )}
          </G>
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.centro]} pointerEvents="none">
          <Text style={styles.centroValor}>${total.toFixed(0)}</Text>
          <Text style={styles.centroLabel}>{centroLabel}</Text>
        </View>
      </View>

      <View style={styles.leyenda}>
        {data.length === 0 && (
          <Text style={styles.sinDatos}>Sin movimientos registrados</Text>
        )}
        {data.map((segmento, index) => (
          <View key={index} style={styles.leyendaItem}>
            <View style={[styles.leyendaPunto, { backgroundColor: segmento.color }]} />
            <Text style={styles.leyendaTexto} numberOfLines={1}>
              {segmento.categoria}
            </Text>
            <Text style={styles.leyendaPorcentaje}>{segmento.porcentaje}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  centro: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centroValor: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  centroLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  leyenda: {
    marginTop: 16,
    width: '100%',
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  leyendaPunto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  leyendaTexto: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
  },
  leyendaPorcentaje: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  sinDatos: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
