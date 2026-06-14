package com.api.apos.domain.existenciaMaterial;

import java.time.LocalDateTime;

import com.api.apos.domain.material.Material;
import com.api.apos.domain.sucursal.Sucursal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class ExistenciaMaterial {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    private Float stockActual;
    private Float stockMinimo;
    private Float stockMaximo;

    private LocalDateTime fechaUltimaActualizacion;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    @ManyToOne
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;
}
