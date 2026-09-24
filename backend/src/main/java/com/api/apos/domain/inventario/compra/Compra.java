package com.api.apos.domain.inventario.compra;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;      
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.domain.financiero.movimiento.Movimiento;
import com.api.apos.domain.organizacion.sucursal.Sucursal;

@Entity
@Table(name = "compras")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Compra {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal total;

    private LocalDateTime fecha;

    private String proveedor;

    @ManyToOne 
    @JoinColumn (name = "sucursal_id")
    private Sucursal sucursal;

    @ManyToOne
    @JoinColumn(name = "movimiento_id")
    private Movimiento movimiento;

}
