package com.api.apos.enums;

import java.math.BigDecimal;

public enum UnidadMedida {
    //Masa
    GR("Gramos", 1.0f, TipoUnidadMedida.MASA,BigDecimal.valueOf(1000)),
    KG("Kilogramos", 1000.0f, TipoUnidadMedida.MASA, BigDecimal.valueOf(1)),
    MG("Miligramos", 0.001f, TipoUnidadMedida.MASA, BigDecimal.valueOf(1000000)),
    LB("Libras", 453.59f, TipoUnidadMedida.MASA, BigDecimal.valueOf(2)),

    //Volumen
    ML("Mililitros", 1.0f, TipoUnidadMedida.VOLUMEN, BigDecimal.valueOf(1000)),
    LT("Litros", 1000.0f, TipoUnidadMedida.VOLUMEN, BigDecimal.valueOf(1)),
    OZ("Onzas", 28.35f, TipoUnidadMedida.VOLUMEN, BigDecimal.valueOf(16)),
    GAL("Galones", 3785.41f, TipoUnidadMedida.VOLUMEN, BigDecimal.valueOf(1)),
    CUP("Tazas", 236.59f, TipoUnidadMedida.VOLUMEN, BigDecimal.valueOf(4)),
    TBSP("Cucharadas", 14.79f, TipoUnidadMedida.VOLUMEN, BigDecimal.valueOf(16)),
    TSP("Cucharaditas", 4.93f, TipoUnidadMedida.VOLUMEN, BigDecimal.valueOf(48)),

    //Pieza
    PZ("Piezas", 1.0f, TipoUnidadMedida.PIEZA, BigDecimal.valueOf(1)),
    UNIDAD("Unidad", 1.0f, TipoUnidadMedida.PIEZA, BigDecimal.valueOf(1)),
    USO("Uso", 1.0f, TipoUnidadMedida.PIEZA, BigDecimal.valueOf(1)),
    POR("Porción", 1.0f, TipoUnidadMedida.PIEZA, BigDecimal.valueOf(1)  ),
    REBANADA("Rebanada", 1.0f, TipoUnidadMedida.PIEZA, BigDecimal.valueOf(1)),
    PAQUETE("Paquete", 1.0f, TipoUnidadMedida.PIEZA, BigDecimal.valueOf(1)),
    BARRA("Barra", 1.0f, TipoUnidadMedida.PIEZA, BigDecimal.valueOf(1)),
    RAMO("Ramo", 1.0f, TipoUnidadMedida.PIEZA, BigDecimal.valueOf(1)),
    LATA("Lata", 1.0f, TipoUnidadMedida.PIEZA, BigDecimal.valueOf(1)),
    BOLSA("Bolsa", 1.0f, TipoUnidadMedida.PIEZA, BigDecimal.valueOf(1));

    private String nombre;
    private Float equivalencia;
    private TipoUnidadMedida tipoUnidadMedida;
    private BigDecimal existenciaMinimaDefault;

    private UnidadMedida(String nombre, Float equivalencia, TipoUnidadMedida tipoUnidadMedida, BigDecimal existenciaMinimaDefault) {
        this.nombre = nombre;
        this.equivalencia = equivalencia;
        this.tipoUnidadMedida = tipoUnidadMedida;
        this.existenciaMinimaDefault = existenciaMinimaDefault;
    }

    public String getNombre() {
        return nombre;
    }

    public Float getEquivalencia() {
        return equivalencia;
    }

    public BigDecimal getExistenciaMinimaDefault() {
        return existenciaMinimaDefault;
    }

    public TipoUnidadMedida getTipoUnidadMedida() {
        return tipoUnidadMedida;
    }

}
