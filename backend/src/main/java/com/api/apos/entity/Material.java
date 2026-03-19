package com.api.apos.entity;

import com.api.apos.enums.TipoMaterial;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Table(name = "materiales")
@Data
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private BigDecimal cantidad;

    private String unidadMedida;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMaterial tipoMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventario_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Inventario inventario;
}
