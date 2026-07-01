package com.api.apos.domain.caja.gasto.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.domain.auth.empleado.entity.Empleado;
import com.api.apos.domain.caja.entity.MovimientoCaja;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.enums.TipoGasto;

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
@Table(name = "gastos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Gasto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String concepto;
    private String descripcion;
    
    @Enumerated(EnumType.STRING)
    private TipoGasto tipo;
    
    private BigDecimal monto;
    
    private LocalDateTime fecha;
    private LocalDateTime createdAt;
    private Long createdBy;
    
    @ManyToOne
    @JoinColumn(name = "empleado_id")
    private Empleado empleado;
    
    @ManyToOne
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;
    
    @OneToOne
    @JoinColumn(name = "movimiento_caja_id")
    private MovimientoCaja movimientoCaja;
}
