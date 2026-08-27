package com.api.apos.domain.sucursal;

import java.util.List;

import org.springframework.stereotype.Service;

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

    public Sucursal findById(Long id){
        return sucursalRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
    }

    public Sucursal findByCodigo(String codigo){
        return sucursalRepository.findByCodigo(codigo)
        .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
    }

    public List<Sucursal> findAllByEmpresaId(Long empresaId){
        return sucursalRepository.findAllByEmpresaId(empresaId);
    }
    


}
