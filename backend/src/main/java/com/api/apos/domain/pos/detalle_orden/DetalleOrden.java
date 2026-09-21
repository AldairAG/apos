package com.api.apos.domain.pos.detalle_orden;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.annotation.Id;

import com.api.apos.domain.catalogo.producto.Producto;
import com.api.apos.domain.pos.detalle_modificador.DetalleModificador;
import com.api.apos.domain.pos.orden.Orden;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity 
@Table (name = "detalle_orden")
@Data 
@NoArgsConstructor 
@AllArgsConstructor 
@Builder 
public class DetalleOrden {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id", nullable = false)
    private Orden orden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    private Integer cantidad;

    private BigDecimal precioUnitario;

    private BigDecimal subtotal;

    private String notas;

    @OneToMany(mappedBy = "detalleOrden",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<DetalleModificador> modificadores ;
}
