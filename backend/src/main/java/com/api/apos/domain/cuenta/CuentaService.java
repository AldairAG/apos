package com.api.apos.domain.cuenta;

import java.util.List;

import org.springframework.stereotype.Service;

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
        return cuentaRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CUENTA_NO_ENCONTRADA));
    }
    
    public List<Cuenta> findByEmpresaId(Long empresaId) {
        return cuentaRepository.findByEmpresaId(empresaId);
    }
}
