package com.api.apos.domain.producto;

import java.util.List;

import com.api.apos.domain.receta.entity.Receta;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;

@Entity
@Data
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String codigo;
    private String sku;
    private String descripcion;
    private String imagen;

    private java.math.BigDecimal precioVenta;
    private java.math.BigDecimal costo;
    private java.math.BigDecimal margen;
    
    private Integer tiempoPreparacion;
    private Integer orden;
    
    private Boolean activo;
    private Boolean disponible;
    private Boolean destacado;
    
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;

    @ManyToOne
    @JoinColumn(name = "receta_id")
    private Receta receta;
    
    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private com.api.apos.domain.categoria.entity.Categoria categoria;
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<com.api.apos.domain.orden.entity.DetalleOrden> detallesOrden;
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<com.api.apos.domain.extra.entity.ProductoGrupoExtra> gruposExtra;
}