import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';

type Cliente = {
    id: string;
    nombre: string;
    telefono: string;
    sellosActuales: number;
    sellosRequeridos: number;
};

const PALETA = {
    primario: '#2563EB',
    secundario: '#22C55E',
    fondoClaro: '#F8FAFC',
    fondoOscuro: '#0F172A',
    tarjetaOscura: '#1E293B',
};

async function buscarClientes(termino: string): Promise<Cliente[]> {
    const res = await fetch(`https://tu-api.com/clientes?buscar=${termino}`);
    if (!res.ok) throw new Error('Error al buscar clientes');
    return res.json();
}

export default function BuscarClienteScreen() {
    const router = useRouter();
    const esOscuro = useColorScheme() === 'dark';
    const [termino, setTermino] = useState('');
    const [resultados, setResultados] = useState<Cliente[]>([]);
    const [cargando, setCargando] = useState(false);

    const onBuscar = async (texto: string) => {
        setTermino(texto);
        if (texto.length < 3) {
            setResultados([]);
            return;
        }
        setCargando(true);
        try {
            const clientes = await buscarClientes(texto);
            setResultados(clientes);
        } catch {
            setResultados([]);
        } finally {
            setCargando(false);
        }
    };

    const colorFondo = esOscuro ? PALETA.fondoOscuro : PALETA.fondoClaro;
    const colorTexto = esOscuro ? '#F8FAFC' : '#0F172A';
    const colorTarjeta = esOscuro ? PALETA.tarjetaOscura : '#FFFFFF';

    return (
        <View style={[estilos.contenedor, { backgroundColor: colorFondo }]}>
            <TextInput
                style={[
                    estilos.input,
                    { backgroundColor: colorTarjeta, color: colorTexto, borderColor: PALETA.primario },
                ]}
                placeholder="Buscar por nombre o teléfono"
                placeholderTextColor="#94A3B8"
                value={termino}
                onChangeText={onBuscar}
                autoFocus
            />

            <FlatList
                data={resultados}
                keyExtractor={(item) => item.id}
                refreshing={cargando}
                contentContainerStyle={estilos.lista}
                ListEmptyComponent={
                    termino.length >= 3 && !cargando ? (
                        <TouchableOpacity
                            style={[estilos.botonNuevo, { borderColor: PALETA.primario }]}
                            onPress={() =>
                                router.push({ pathname: '/clientes/registrar', params: { telefono: termino } })
                            }
                        >
                            <Text style={{ color: PALETA.primario, fontWeight: '700' }}>
                                No se encontró · registrar cliente nuevo
                            </Text>
                        </TouchableOpacity>
                    ) : null
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[estilos.filaCliente, { backgroundColor: colorTarjeta }]}
                        onPress={() => router.push(`/clientes/${item.id}`)}
                    >
                        <View>
                            <Text style={[estilos.nombre, { color: colorTexto }]}>{item.nombre}</Text>
                            <Text style={estilos.telefono}>{item.telefono}</Text>
                        </View>
                        <Text style={[estilos.sellos, { color: PALETA.secundario }]}>
                            {item.sellosActuales}/{item.sellosRequeridos}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: { flex: 1, padding: 16, gap: 12 },
    input: {
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    lista: { gap: 10, paddingBottom: 24 },
    filaCliente: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 12,
        padding: 16,
    },
    nombre: { fontSize: 16, fontWeight: '700' },
    telefono: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
    sellos: { fontSize: 16, fontWeight: '700' },
    botonNuevo: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
});