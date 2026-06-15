package com.api.apos.domain.compra.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.caja.entity.MovimientoCaja;
import com.api.apos.domain.empleado.entity.Empleado;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.enums.EstadoCompra;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "compra_inventario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompraInventario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String folio;
    private String factura;
    private String proveedor;
    private String observaciones;
    
    @Enumerated(EnumType.STRING)
    private EstadoCompra estado;
    
    private BigDecimal total;
    private BigDecimal descuento;
    private BigDecimal impuestos;
    
    private LocalDateTime fecha;
    private LocalDateTime fechaRecepcion;
    private LocalDateTime createdAt;
    private Long createdBy;
    
    @ManyToOne
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;
    
    @ManyToOne
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;
    
    @OneToMany(mappedBy = "compraInventario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompraDetalle> detalles;
    
    @OneToOne
    @JoinColumn(name = "movimiento_caja_id")
    private MovimientoCaja movimientoCaja;
}
