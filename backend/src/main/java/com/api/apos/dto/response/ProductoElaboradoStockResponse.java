package com.api.apos.dto.response;

import java.time.LocalDateTime;

import com.api.apos.enums.TipoUnidad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductoElaboradoStockResponse {
    
    private Long inventarioProductoId;
    private Long productoElaboradoId;
    private String nombre;
    private String descripcion;
    private TipoUnidad unidadMedida;
    private Double cantidad;
    private Double stockMinimo;
    private Double deficit; // Para alertas de stock bajo
    private Long recetaOrigenId;
    private String recetaOrigenNombre;
    private LocalDateTime fechaUltimaActualizacion;
    private LocalDateTime fechaUltimaProduccion;
}
