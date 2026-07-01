package com.api.apos.domain.catalogo.producto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.catalogo.categoria.entity.Categoria;
import com.api.apos.domain.catalogo.extra.entity.ProductoGrupoExtra;
import com.api.apos.domain.catalogo.receta.entity.Receta;
import com.api.apos.domain.orden.entity.DetalleOrden;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

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

    private BigDecimal precioVenta;
    private BigDecimal costo;
    private BigDecimal margen;
    
    private Integer tiempoPreparacion;
    private Integer orden;
    
    private Boolean activo;
    private Boolean disponible;
    private Boolean destacado;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;

    @ManyToOne
    @JoinColumn(name = "receta_id")
    @JsonIgnore
    private Receta receta;
    
    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<DetalleOrden> detallesOrden;
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ProductoGrupoExtra> gruposExtra;
}