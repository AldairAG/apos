package com.api.apos.domain.receta.dto;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.domain.receta.entity.DetalleReceta;
import com.api.apos.enums.Unidad;

import lombok.Data;

@Data
public class CrearRecetaDTO {
    private String nombre;
    private String descripcion;
    private String instrucciones;
    private BigDecimal rendimiento;
    private Unidad unidadRendimiento;
    private BigDecimal costoTotal;
    private int tiempoPreparacion;
    private boolean activa;
    private List<DetalleReceta> detalles;

}
