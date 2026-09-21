package com.api.apos.domain.pos.detalle_modificador;

import java.math.BigDecimal;

import com.api.apos.domain.catalogo.complemento.Modificador;
import com.api.apos.domain.pos.detalle_orden.DetalleOrden;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity 
@Table (name = "detalle_modificador")
@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder 
public class DetalleModificador {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "detalle_orden_id", nullable = false)
    private DetalleOrden detalleOrden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modificador_id", nullable = false)
    private Modificador modificador;

    private Integer cantidad;

    private BigDecimal precioUnitario;

    private BigDecimal subtotal;
}
