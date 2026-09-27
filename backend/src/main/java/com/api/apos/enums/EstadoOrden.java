package com.api.apos.enums;

public enum EstadoOrden {
    PENDIENTE,
    EN_PREPARACION,
    LISTA,
    ENTREGADA,
    CANCELADA,
    COBRADA;

    public EstadoOrden siguiente() {
        return switch (this) {
            case PENDIENTE -> EN_PREPARACION;
            case EN_PREPARACION -> LISTA;
            case LISTA -> ENTREGADA;
            case ENTREGADA -> COBRADA;
            case CANCELADA -> CANCELADA;
            case COBRADA -> COBRADA;
        };
    }
}
