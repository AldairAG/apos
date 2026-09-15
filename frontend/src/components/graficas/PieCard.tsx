import { buildPieData, formatCurrency } from "@/helpers/FormatHelpers";
import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";


// ---------- Tarjeta de gráfica de pastel ----------

export default function PieCard({
  titulo,
  total,
  data,
  colorTotal,
  vacio,
}: {
  titulo: string;
  total: number;
  data: ReturnType<typeof buildPieData>;
  colorTotal: string;
  vacio: string;
}) {
  return (
    <View className="bg-white rounded-2xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
      <Text className="text-sm font-medium text-[#1C1B1F] mb-4">{titulo}</Text>

      {data.length === 0 ? (
        <Text className="text-sm text-[#79747E] py-6 text-center">{vacio}</Text>
      ) : (
        <View className="items-center">
          <PieChart
            data={data}
            donut
            radius={78}
            innerRadius={50}
            innerCircleColor="#FFFFFF"
            centerLabelComponent={() => (
              <View className="items-center">
                <Text className="text-[11px] text-[#79747E]">Total</Text>
                <Text className="text-sm font-medium" style={{ color: colorTotal }}>
                  {formatCurrency(total)}
                </Text>
              </View>
            )}
          />

          <View className="w-full mt-5 gap-2.5">
            {data.map((item) => (
              <View key={item.categoria} className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2 shrink">
                  <View
                    style={{ backgroundColor: item.color }}
                    className="w-2.5 h-2.5 rounded-full"
                  />
                  <Text className="text-xs text-[#1C1B1F]" numberOfLines={1}>
                    {item.categoria}
                  </Text>
                </View>
                <Text className="text-xs text-[#49454F]">
                  {item.porcentaje}% · {formatCurrency(item.monto)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}