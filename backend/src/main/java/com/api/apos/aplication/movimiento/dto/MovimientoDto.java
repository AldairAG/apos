package com.api.apos.aplication.movimiento.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.enums.CategoriaMovimiento;
import com.api.apos.enums.EstadoMovimiento;
import com.api.apos.enums.TipoMovimiento;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MovimientoDto {
    private Long id;

    private String descripcion;

    private BigDecimal monto;

    private TipoMovimiento tipo;

    private EstadoMovimiento estado;

    private CategoriaMovimiento categoria;

    private Long createdBy;

    private Long cuentaDestinoId;

    private Long cuentaOrigenId;

    private LocalDateTime updatedAt;

    private LocalDateTime createdAt;

    //Metodos de formulario
    private Long cuentaId;

    private Long cajaId;

}
