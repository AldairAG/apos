package com.api.apos.domain.inventario.movimiento_inventario;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.api.apos.enums.ConceptoMovimientoInventario;
import com.api.apos.enums.TipoMovimientoInventario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "movimientos_inventario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoInventario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long materialId;

    private Long sucursalId;

    private BigDecimal cantidad;

    @Enumerated(EnumType.STRING)
    private TipoMovimientoInventario tipoMovimiento;

    @Enumerated(EnumType.STRING)
    private ConceptoMovimientoInventario conceptoMovimiento;

    private LocalDateTime fecha;

    private Long usuarioId;
}
