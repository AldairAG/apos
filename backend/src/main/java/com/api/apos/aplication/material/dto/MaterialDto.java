package com.api.apos.aplication.material.dto;

import com.api.apos.enums.UnidadMedida;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Builder;
import lombok.Data;

@Data 
@Builder 
public class MaterialDto {
    private Long id;

    private String nombre;

    private String proveedor;

    @Enumerated(value = EnumType.STRING)
    private UnidadMedida unidad;

    private Double cantidad;

    private Double precio;

    private String descripcion;
}
