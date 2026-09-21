package com.api.apos.domain.pos.orden;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.organizacion.sucursal.Sucursal;
import com.api.apos.domain.pos.detalle_orden.DetalleOrden;
import com.api.apos.enums.EstadoOrden;

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


@Entity 
@Table (name = "ordenes")
@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder 
public class Orden {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @Enumerated(EnumType.STRING)
    private EstadoOrden estado;

    private BigDecimal subtotal;

    private BigDecimal descuento;

    private BigDecimal total;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "orden",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<DetalleOrden> detalles;


}
