package com.api.apos.domain.cuenta;
import java.math.BigDecimal;
import java.util.List;

import com.api.apos.domain.auditable.AuditableEntity;
import com.api.apos.domain.empresa.Empresa;
import com.api.apos.domain.movimiento.Movimiento;
import com.api.apos.enums.TipoCuenta;

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
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@Table(name = "cuentas")
public class Cuenta extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private Boolean activa;

    private BigDecimal saldo;

    @Enumerated(EnumType.STRING)
    private TipoCuenta tipo;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @OneToMany(mappedBy = "cuenta")
    private List<Movimiento> movimientos;

    public void delete() {
        this.activa = false;
    }

}
