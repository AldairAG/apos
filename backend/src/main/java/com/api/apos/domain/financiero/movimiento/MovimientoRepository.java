package com.api.apos.domain.financiero.movimiento;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.api.apos.enums.CategoriaMovimiento;
import com.api.apos.enums.TipoMovimiento;

public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {
        List<Movimiento> findByCorteCajaIdAndTipo(Long corteCajaId, TipoMovimiento tipo);

        List<Movimiento> findByCuentaId(Long cuentaId);

        List<Movimiento> findByCorteCajaIdAndCategoria(Long corteCajaId, CategoriaMovimiento categoria);

        List<Movimiento> findByCorteCajaIdAndCategoriaNot(
                        Long corteCajaId,
                        CategoriaMovimiento categoria);

        List<Movimiento> findByCategoriaIn(
                        List<CategoriaMovimiento> categorias);

        @Query("""
                            SELECT COALESCE(SUM(m.monto), 0)
                            FROM Movimiento m
                            WHERE m.corteCaja.id = :corteCajaId
                            AND m.tipo = :tipo
                        """)
        BigDecimal sumarPorTipo(
                        @Param("corteCajaId") Long corteCajaId,
                        @Param("tipo") TipoMovimiento tipo);

        List<Movimiento> findByFecha(LocalDateTime fecha);

        List<Movimiento> findByCuentaEmpresaIdAndFechaGreaterThanEqualAndFechaLessThan(
                        Long empresaId,
                        LocalDateTime inicio,
                        LocalDateTime fin);
}
