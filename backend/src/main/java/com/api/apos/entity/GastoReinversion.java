package com.api.apos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "gastos_reinversion")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class GastoReinversion extends MovimientoFinanciero {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private CategoriaGasto categoria;
}
