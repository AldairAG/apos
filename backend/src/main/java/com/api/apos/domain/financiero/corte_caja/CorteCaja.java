package com.api.apos.domain.financiero.corte_caja;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.domain.financiero.caja.Caja;
import com.api.apos.domain.financiero.movimiento.Movimiento;
import com.api.apos.enums.EstadoCaja;
import com.api.apos.domain.financiero.auditable.AuditableEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
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
import lombok.EqualsAndHashCode;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "corte_caja")
@EqualsAndHashCode(callSuper = true)
@Data
public class CorteCaja extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal saldoInicial;

    private BigDecimal saldoFinal;

    private BigDecimal ingresos;

    private BigDecimal egresos;

    private BigDecimal gastos;

    private BigDecimal ventas;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private EstadoCaja estado = EstadoCaja.ABIERTA;

    private Long createdBy;

    @ManyToOne(cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    @JoinColumn(name = "caja_id")
    private Caja caja;

    @OneToMany(mappedBy = "corteCaja")
    private List<Movimiento> movimientos;

    public void cerrar() {
        this.estado = EstadoCaja.CERRADA;
        this.caja.cerrar(this.saldoFinal);
    }
    
}
