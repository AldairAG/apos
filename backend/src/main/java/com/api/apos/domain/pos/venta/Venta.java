package com.api.apos.domain.pos.venta;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.domain.financiero.movimiento.Movimiento;
import com.api.apos.domain.pos.orden.Orden;
import com.api.apos.enums.MetodoPago;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;     

@Entity
@Table(name = "ventas")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Venta{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal impuestos;

    private BigDecimal descuentos;

    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    private MetodoPago metodoDePago;

    @OneToOne(mappedBy = "venta")
    private Orden orden;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Movimiento> movimientos;

}
