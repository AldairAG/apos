import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

type Props = {
    sellosActuales: number;
    sellosRequeridos: number;
};

const PALETA = {
    primario: '#2563EB',
    secundario: '#22C55E',
    fondoClaro: '#F8FAFC',
    fondoOscuro: '#0F172A',
    selloVacioClaro: '#E2E8F0',
    selloVacioOscuro: '#1E293B',
};

export default function TarjetaSellos({ sellosActuales, sellosRequeridos }: Props) {
    const esOscuro = useColorScheme() === 'dark';
    const completa = sellosActuales >= sellosRequeridos;

    return (
        <View
            style={[
                estilos.contenedor,
                { backgroundColor: esOscuro ? PALETA.fondoOscuro : PALETA.fondoClaro },
            ]}
        >
            <Text style={[estilos.titulo, { color: esOscuro ? '#F8FAFC' : '#0F172A' }]}>
                {sellosActuales} / {sellosRequeridos} sellos
            </Text>

            <View style={estilos.filaSellos}>
                {Array.from({ length: sellosRequeridos }).map((_, i) => {
                    const lleno = i < sellosActuales;
                    return (
                        <View
                            key={i}
                            style={[
                                estilos.sello,
                                {
                                    backgroundColor: lleno
                                        ? PALETA.secundario
                                        : esOscuro
                                            ? PALETA.selloVacioOscuro
                                            : PALETA.selloVacioClaro,
                                    borderColor: PALETA.primario,
                                },
                            ]}
                        />
                    );
                })}
            </View>

            {completa && (
                <View style={estilos.banner}>
                    <Text style={estilos.bannerTexto}>Tarjeta completa · recompensa disponible</Text>
                </View>
            )}
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: {
        borderRadius: 16,
        borderWidth: 2,
        borderColor: PALETA.primario,
        padding: 20,
        gap: 16,
    },
    titulo: {
        fontSize: 18,
        fontWeight: '700',
    },
    filaSellos: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    sello: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
    },
    banner: {
        backgroundColor: PALETA.secundario,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    bannerTexto: {
        color: '#052e16',
        fontWeight: '700',
        fontSize: 14,
    },
});