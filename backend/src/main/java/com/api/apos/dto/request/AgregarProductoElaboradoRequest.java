package com.api.apos.dto.request;

import com.api.apos.enums.TipoUnidad;

import lombok.Data;

@Data
public class AgregarProductoElaboradoRequest {
    
    // ID del producto elaborado (si ya existe en catálogo)
    private Long productoElaboradoId;
    
    // Datos para crear producto elaborado nuevo
    private String nombre;
    private String descripcion;
    private Long recetaOrigenId; // Receta que crea este producto
    private TipoUnidad unidadMedida;
    
    // Datos de stock inicial
    private Double cantidad;
    private Double stockMinimo;
}
