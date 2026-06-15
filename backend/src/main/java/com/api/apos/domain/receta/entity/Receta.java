package com.api.apos.domain.receta.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.producto.Producto;
import com.api.apos.domain.usuario.Usuario;
import com.api.apos.enums.Unidad;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;

@Data
@Entity
public class Receta {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private String codigo;
    private String descripcion;
    private String instrucciones;
    private String imagen;

    private BigDecimal rendimiento;

    @Enumerated(EnumType.STRING)
    private Unidad unidadRendimiento;

    private BigDecimal costoTotal;
    private Integer tiempoPreparacion;
    private Boolean activo;
    
    private LocalDateTime fechaCreacion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;

    @OneToMany(mappedBy = "receta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleReceta> detalles;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @OneToMany(mappedBy = "receta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Producto> productos;
    
    @OneToMany(mappedBy = "receta", cascade = CascadeType.ALL)
    private List<com.api.apos.domain.produccion.entity.Produccion> producciones;
}