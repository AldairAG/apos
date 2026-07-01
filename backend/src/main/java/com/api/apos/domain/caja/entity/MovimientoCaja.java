package com.api.apos.domain.caja.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.domain.auth.empleado.entity.Empleado;
import com.api.apos.domain.orden.entity.Orden;
import com.api.apos.enums.MetodoPago;
import com.api.apos.enums.TipoMovimientoCaja;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "movimiento_caja")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoCaja {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    private TipoMovimientoCaja tipo;
    
    @Enumerated(EnumType.STRING)
    private MetodoPago metodoPago;
    
    private String concepto;
    private String referencia;
    private String comprobante;
    
    private BigDecimal monto;
    
    private Boolean aprobado;
    private Long autorizadoPor;
    
    private LocalDateTime fecha;
    private LocalDateTime createdAt;
    private Long createdBy;
    
    @ManyToOne
    @JoinColumn(name = "caja_id")
    private Caja caja;
    
    @ManyToOne
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;
    
    @OneToOne
    @JoinColumn(name = "orden_id")
    private Orden orden;
}
