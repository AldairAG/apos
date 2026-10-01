package com.api.apos.domain.organizacion.sucursal;

import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class SucursalService {

    private final SucursalRepository sucursalRepository;

    public Sucursal save(Sucursal sucursal){
        return sucursalRepository.save(sucursal);
    }

    public Sucursal edit(Sucursal sucursal){
        return sucursalRepository.save(sucursal);
    }

    public void delete(Long id){
        Sucursal sucursal = findById(id);
        sucursal.delete();
        sucursalRepository.save(sucursal);
    }

    public List<Sucursal> findActivasByEmpresaId(Long empresaId){
        return sucursalRepository.findActivasByEmpresaId(empresaId);
    }

    public Sucursal findById(Long id){
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUCURSAL_NO_ENCONTRADA));
        if (Boolean.FALSE.equals(sucursal.getActiva())) {
            throw new AppException(ErrorCode.SUCURSAL_NO_ENCONTRADA);
        }
        return sucursal;
    }

    public Sucursal findByCodigo(String codigo){
        Sucursal sucursal = sucursalRepository.findByCodigo(codigo)
                .orElseThrow(() -> new AppException(ErrorCode.SUCURSAL_NO_ENCONTRADA));
        if (Boolean.FALSE.equals(sucursal.getActiva())) {
            throw new AppException(ErrorCode.SUCURSAL_NO_ENCONTRADA);
        }
        return sucursal;
    }

    public List<Sucursal> findAllByEmpresaId(Long empresaId){
        return sucursalRepository.findAllByEmpresaId(empresaId);
    }


}
