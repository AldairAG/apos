package com.api.apos.domain.financiero.caja;

import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import com.api.apos.enums.EstadoCaja;

import com.api.apos.domain.financiero.auditable.AuditableEntity;
import com.api.apos.domain.financiero.corte_caja.CorteCaja;
import com.api.apos.domain.organizacion.sucursal.Sucursal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Builder 
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Table(name = "cajas")
@Data
public class Caja extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private BigDecimal saldo;

    private BigDecimal saldoInicial;

    @Builder.Default
    private Boolean activa = true;

    private EstadoCaja estado;

    @ManyToOne(fetch = FetchType.LAZY)
    private Sucursal sucursal;

    @OneToMany(mappedBy = "caja")
    private List<CorteCaja> cortesCaja;

    public void delete() {
        this.activa = false;
        this.estado = EstadoCaja.CERRADA;
    }

    public void abrir(CorteCaja corteCaja){
        this.estado = EstadoCaja.ABIERTA;
        this.cortesCaja.add(corteCaja);
        corteCaja.setCaja(this);
    }

    public void cerrar(BigDecimal saldoFinal) {
        this.estado = EstadoCaja.CERRADA;
        this.saldo = saldoFinal;
        this.saldoInicial = this.saldo;
    }


}
