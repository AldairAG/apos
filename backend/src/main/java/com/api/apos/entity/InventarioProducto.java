package com.api.apos.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

/**
 * Almacena productos elaborados en el inventario.
 * Estos productos pueden usarse luego en otras recetas.
 */
@Data
@Entity
public class InventarioProducto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "inventario_id")
    private Inventario inventario;
    
    @ManyToOne
    @JoinColumn(name = "producto_elaborado_id")
    private ProductoElaborado productoElaborado;
    
    private Double cantidad;
    private Double stockMinimo;
    
    private LocalDateTime fechaUltimaActualizacion;
    private LocalDateTime fechaUltimaProduccion;
}
