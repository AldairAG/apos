package com.api.apos.domain.inventario.detalle_compra;

import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import java.math.BigDecimal;

import com.api.apos.domain.inventario.compra.Compra;
import com.api.apos.domain.inventario.material.Material;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
@Table(name = "detalle_compras")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal cantidad;

    private BigDecimal costoUnitario;

    private BigDecimal subtotal;

    @ManyToOne
    @JoinColumn(name = "material_id")
    private Material material;

    @ManyToOne
    @JoinColumn(name = "compra_id")
    private Compra compra;

}
