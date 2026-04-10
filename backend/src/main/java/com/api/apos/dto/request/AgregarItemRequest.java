package com.api.apos.dto.request;

import com.api.apos.enums.TipoMaterial;
import com.api.apos.enums.TipoUnidad;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

@Data
public class AgregarItemRequest {
    // Material
    private Long materialId; // Para editar, se necesita el ID del material
    private String nombre;
    private String descripcion;
    @Enumerated(EnumType.STRING)
    private TipoMaterial tipoMaterial;
    @Enumerated(EnumType.STRING)
    private TipoUnidad tipoUnidad;
    private Double precioPorPaquete;
    private Double cantidadPorPaquete;

    // InventarioItem
    private Double cantidad;
    private Double stockMinimo;
    private Double stockMaximo;
    private Double precioUnitario;
}
