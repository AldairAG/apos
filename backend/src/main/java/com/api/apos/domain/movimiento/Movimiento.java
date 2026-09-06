package com.api.apos.domain.movimiento;

import java.math.BigDecimal;

import com.api.apos.domain.auditable.AuditableEntity;
import com.api.apos.domain.cuenta.Cuenta;
import com.api.apos.enums.EstadoMovimiento;
import com.api.apos.enums.TipoMovimiento;
import com.api.apos.enums.CategoriaMovimiento;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@Table(name = "movimientos")
public class Movimiento extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descripcion;

    private BigDecimal monto;

    //Representa si el movimiento fue de ingreso o egreso
    @Enumerated(EnumType.STRING)
    private TipoMovimiento tipo;

    //Representa si el movimiento fue cancelado
    @Enumerated(EnumType.STRING)
    private EstadoMovimiento estado;

    //Categoria del movimiento ya sea ingreso o egreso
    @Enumerated(EnumType.STRING)
    private CategoriaMovimiento categoria;

    private Long createdBy;

    private Long cuentaDestinoId;

    private Long cuentaOrigenId;

    @ManyToOne
    @JoinColumn(name = "cuenta_id") 
    private Cuenta cuenta;

    public void delete() {
        this.estado = EstadoMovimiento.CANCELADO;
    }
}
