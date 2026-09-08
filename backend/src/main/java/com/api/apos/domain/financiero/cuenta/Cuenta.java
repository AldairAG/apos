package com.api.apos.domain.financiero.cuenta;
import java.math.BigDecimal;
import java.util.List;

import com.api.apos.domain.financiero.auditable.AuditableEntity;
import com.api.apos.domain.financiero.movimiento.Movimiento;
import com.api.apos.domain.organizacion.empresa.Empresa;
import com.api.apos.enums.TipoCuenta;
import com.api.apos.enums.TipoMovimiento;
import com.api.apos.enums.EstadoMovimiento;

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
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@Table(name = "cuentas")
@AllArgsConstructor 
@NoArgsConstructor 
public class Cuenta extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private Boolean activa;

    private BigDecimal saldo;

    @Enumerated(EnumType.STRING)
    private TipoCuenta tipo;

    private Boolean cuentaDestino;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @OneToMany(mappedBy = "cuenta", cascade = CascadeType.ALL)
    private List<Movimiento> movimientos;

    public void delete() {
        this.activa = false;
    }

    public void aumentarSaldo(BigDecimal monto) {
        this.saldo = this.saldo.add(monto);
    }

    public void disminuirSaldo(BigDecimal monto) {
        this.saldo = this.saldo.subtract(monto);
    }

    public void addIngreso(Movimiento movimiento) {
        this.movimientos.add(movimiento);
        movimiento.setCuenta(this);
        movimiento.setTipo(TipoMovimiento.INGRESO);
        movimiento.setEstado(EstadoMovimiento.COMPLETADO);
        this.aumentarSaldo(movimiento.getMonto());
    }

    public void addEgreso(Movimiento movimiento) {
        this.movimientos.add(movimiento);
        movimiento.setCuenta(this);
        movimiento.setTipo(TipoMovimiento.EGRESO);
        movimiento.setEstado(EstadoMovimiento.COMPLETADO);
        this.disminuirSaldo(movimiento.getMonto());
    }

}
