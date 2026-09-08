package com.api.apos.domain.financiero.corte_caja;

import java.util.List;

import com.api.apos.domain.financiero.caja.Caja;
import com.api.apos.domain.financiero.movimiento.Movimiento;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
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

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "corte_caja")
@Data 
public class CorteCaja {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(cascade = CascadeType.ALL,fetch = FetchType.LAZY)
    @JoinColumn(name = "caja_id")
    private Caja caja;

    @OneToMany(mappedBy = "corteCaja")
    @JoinColumn(name = "corte_caja_id")
    private List<Movimiento> movimientos;

}
