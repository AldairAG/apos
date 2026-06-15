package com.api.apos.domain.orden.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.empleado.entity.Empleado;
import com.api.apos.domain.mesa.entity.Mesa;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.enums.EstadoOrden;
import com.api.apos.enums.TipoOrden;

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
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ordenes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Orden {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String folio;
    
    @Enumerated(EnumType.STRING)
    private TipoOrden tipo;
    
    @Enumerated(EnumType.STRING)
    private EstadoOrden estado;
    
    private Integer numeroPersonas;
    private Integer tiempoPreparacion;
    
    private String observaciones;
    private String nombreCliente;
    private String telefonoCliente;
    private String direccionEntrega;
    private String motivoCancelacion;
    
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal propina;
    private BigDecimal impuestos;
    private BigDecimal total;
    
    private Boolean cancelada;
    
    private LocalDateTime fecha;
    private LocalDateTime fechaProgramada;
    private LocalDateTime horaEntrega;
    private LocalDateTime fechaCancelacion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
    
    @ManyToOne
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;
    
    @ManyToOne
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;
    
    @ManyToOne
    @JoinColumn(name = "mesa_id")
    private Mesa mesa;
    
    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleOrden> detalles;
    
    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL)
    private List<HistorialOrden> historial;
}
