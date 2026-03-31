package com.api.apos.service.mesa;

import com.api.apos.entity.Mesa;
import com.api.apos.entity.Sucursal;
import com.api.apos.repository.MesaRepository;
import com.api.apos.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MesaServiceImpl implements MesaService {

    private final MesaRepository mesaRepository;
    private final SucursalRepository sucursalRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Mesa> findAll() {
        return mesaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Mesa> findById(Long id) {
        return mesaRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Mesa> findBySucursalId(Long sucursalId) {
        return mesaRepository.findBySucursalId(sucursalId);
    }

    @Override
    @Transactional
    public Mesa save(Mesa mesa) {
        Sucursal sucursal = sucursalRepository.findById(mesa.getSucursal().getId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        mesa.setSucursal(sucursal);
        return mesaRepository.save(mesa);
    }

    @Override
    @Transactional
    public Mesa update(Long id, Mesa data) {
        Mesa mesa = mesaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));
        mesa.setNumero(data.getNumero());
        mesa.setDescripcion(data.getDescripcion());
        return mesaRepository.save(mesa);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        mesaRepository.deleteById(id);
    }
}
