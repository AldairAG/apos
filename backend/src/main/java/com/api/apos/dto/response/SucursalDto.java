package com.api.apos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SucursalDto {
    private Long id;
    private String nombre;
    private String direccion;
    private Integer cantidadRecetas;
    private Integer cantidadProductos;

}
