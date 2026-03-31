package com.api.apos.service.inventario;

import com.api.apos.entity.Inventario;
import com.api.apos.entity.Sucursal;
import com.api.apos.repository.InventarioRepository;
import com.api.apos.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InventarioServiceImpl implements InventarioService {

    private final InventarioRepository inventarioRepository;
    private final SucursalRepository sucursalRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Inventario> findAll() {
        return inventarioRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Inventario> findById(Long id) {
        return inventarioRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Inventario> findBySucursalId(Long sucursalId) {
        return inventarioRepository.findBySucursalId(sucursalId);
    }

    @Override
    @Transactional
    public Inventario save(Inventario inventario) {
        Sucursal sucursal = sucursalRepository.findById(inventario.getSucursal().getId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        inventario.setSucursal(sucursal);
        return inventarioRepository.save(inventario);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        inventarioRepository.deleteById(id);
    }
}
