package com.api.apos.aplication.inventario.existencia.dto;

import java.math.BigDecimal;

import com.api.apos.aplication.inventario.material.dto.MaterialDto;
import com.api.apos.enums.EstadoStock;
import com.api.apos.enums.UnidadMedida;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data 
@AllArgsConstructor 
@Builder 
public class ExistenciaDto {
    
    private Long id;

    private BigDecimal cantidadActual;

    private BigDecimal cantidadMinima;

    private EstadoStock estado;

    private UnidadMedida unidadMedida;

    private MaterialDto material;

    //metodos de formulario

    private Long materialId;

    private Long sucursalId;

}
