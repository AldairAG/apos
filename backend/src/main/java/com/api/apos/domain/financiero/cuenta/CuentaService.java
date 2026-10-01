package com.api.apos.domain.financiero.cuenta;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.enums.TipoCuenta;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CuentaService {

    private final CuentaRepository cuentaRepository;

    public Cuenta save(Cuenta cuenta) {
        return cuentaRepository.save(cuenta);
    }

    public void deleteById(Long id) {
        Cuenta cuenta = cuentaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUENTA_NO_ENCONTRADA));
        cuenta.delete();
        cuentaRepository.save(cuenta);
    }

    public Cuenta findById(Long id) {
        Cuenta cuenta = cuentaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUENTA_NO_ENCONTRADA));
        if (Boolean.FALSE.equals(cuenta.getActiva())) {
            throw new AppException(ErrorCode.CUENTA_NO_ENCONTRADA);
        }
        return cuenta;
    }
    
    public List<Cuenta> findByEmpresaId(Long empresaId) {
        return cuentaRepository.findByEmpresaId(empresaId);
    }

    public List<Cuenta> findActivasByEmpresaId(Long empresaId) {
        return cuentaRepository.findActivasByEmpresaId(empresaId);
    }

    public Cuenta findByCuentaDestinoAndTipoAndEmpresaId( TipoCuenta tipo, Long empresaId) {
        return cuentaRepository.findCuentaDestinoActiva(tipo, empresaId);
    }
}
