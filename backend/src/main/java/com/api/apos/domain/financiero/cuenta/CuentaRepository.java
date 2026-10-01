package com.api.apos.domain.financiero.cuenta;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.api.apos.enums.TipoCuenta;

public interface CuentaRepository extends JpaRepository<Cuenta, Long> {

    List<Cuenta> findByEmpresaId(Long empresaId);

    @Query("SELECT c FROM Cuenta c WHERE c.empresa.id = :empresaId AND (c.activa = true OR c.activa IS NULL)")
    List<Cuenta> findActivasByEmpresaId(@Param("empresaId") Long empresaId);

    // Este metodo devuelve una ceunta donde destino es true en base al tipo de
    // cuenta y la empresaId
    Cuenta findByCuentaDestinoTrueAndTipoAndEmpresaId(
            TipoCuenta tipo,
            Long empresaId);

    @Query("SELECT c FROM Cuenta c WHERE c.cuentaDestino = true AND c.tipo = :tipo AND c.empresa.id = :empresaId AND (c.activa = true OR c.activa IS NULL)")
    Cuenta findCuentaDestinoActiva(@Param("tipo") TipoCuenta tipo, @Param("empresaId") Long empresaId);
}
