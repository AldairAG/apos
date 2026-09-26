package com.api.apos.aplication.inventario.existencia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor 
@Data 
@Builder 
public class ProductoDescuentoDto {
    private Long productoId;
    private Integer cantidad;
    private Long sucursalId;
}
