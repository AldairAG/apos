package com.api.apos.domain.movimiento;

import java.math.BigDecimal;

import com.api.apos.domain.auditable.AuditableEntity;
import com.api.apos.enums.EstadoMovimiento;
import com.api.apos.enums.TipoMovimiento;
import com.api.apos.enums.CategoriaMovimiento;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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

    private TipoMovimiento tipo;

    private EstadoMovimiento estado;

    private CategoriaMovimiento categoria;

    private Long usuarioId;

    private Long cuentaDestinoId;

    private Long cuentaOrigenId;

    public void delete() {
        this.estado = EstadoMovimiento.CANCELADO;
    }
}
