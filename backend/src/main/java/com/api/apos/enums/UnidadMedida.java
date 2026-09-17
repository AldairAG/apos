package com.api.apos.enums;

public enum UnidadMedida {
    //Masa
    GR("Gramos", 1.0f, TipoUnidadMedida.MASA),
    KG("Kilogramos", 1000.0f, TipoUnidadMedida.MASA),
    MG("Miligramos", 0.001f, TipoUnidadMedida.MASA),
    LB("Libras", 453.59f, TipoUnidadMedida.MASA),

    //Volumen
    ML("Mililitros", 1.0f, TipoUnidadMedida.VOLUMEN),
    LT("Litros", 1000.0f, TipoUnidadMedida.VOLUMEN),
    OZ("Onzas", 28.35f, TipoUnidadMedida.VOLUMEN),
    GAL("Galones", 3785.41f, TipoUnidadMedida.VOLUMEN),
    CUP("Tazas", 236.59f, TipoUnidadMedida.VOLUMEN),
    TBSP("Cucharadas", 14.79f, TipoUnidadMedida.VOLUMEN),
    TSP("Cucharaditas", 4.93f, TipoUnidadMedida.VOLUMEN),

    //Pieza
    PZ("Piezas", 1.0f, TipoUnidadMedida.PIEZA),
    UNIDAD("Unidad", 1.0f, TipoUnidadMedida.PIEZA),
    USO("Uso", 1.0f, TipoUnidadMedida.PIEZA),
    POR("Porción", 1.0f, TipoUnidadMedida.PIEZA),
    REBANADA("Rebanada", 1.0f, TipoUnidadMedida.PIEZA),
    PAQUETE("Paquete", 1.0f, TipoUnidadMedida.PIEZA),
    BARRA("Barra", 1.0f, TipoUnidadMedida.PIEZA),
    RAMO("Ramo", 1.0f, TipoUnidadMedida.PIEZA),
    LATA("Lata", 1.0f, TipoUnidadMedida.PIEZA),
    BOLSA("Bolsa", 1.0f, TipoUnidadMedida.PIEZA);

    private String nombre;
    private Float equivalencia;
    private TipoUnidadMedida tipoUnidadMedida;

    private UnidadMedida(String nombre, Float equivalencia, TipoUnidadMedida tipoUnidadMedida) {
        this.nombre = nombre;
        this.equivalencia = equivalencia;
        this.tipoUnidadMedida = tipoUnidadMedida;
    }

    public String getNombre() {
        return nombre;
    }

    public Float getEquivalencia() {
        return equivalencia;
    }

    public TipoUnidadMedida getTipoUnidadMedida() {
        return tipoUnidadMedida;
    }

}
