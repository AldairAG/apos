package com.api.apos.domain.financiero.cuenta;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.apos.enums.TipoCuenta;

import java.util.List;

public interface CuentaRepository extends JpaRepository<Cuenta, Long> {

    List<Cuenta> findByEmpresaId(Long empresaId);

    // Este metodo devuelve una ceunta donde destino es true en base al tipo de
    // cuenta y la empresaId
    Cuenta findByCuentaDestinoTrueAndTipoAndEmpresaId(
            TipoCuenta tipo,
            Long empresaId);
}
