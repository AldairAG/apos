package com.api.apos.service.entrada;

import com.api.apos.entity.Entrada;
import com.api.apos.entity.Sucursal;
import com.api.apos.repository.EntradaRepository;
import com.api.apos.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EntradaServiceImpl implements EntradaService {

    private final EntradaRepository entradaRepository;
    private final SucursalRepository sucursalRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Entrada> findAll() {
        return entradaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Entrada> findById(Long id) {
        return entradaRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Entrada> findBySucursalId(Long sucursalId) {
        return entradaRepository.findBySucursalId(sucursalId);
    }

    @Override
    @Transactional
    public Entrada save(Entrada entrada) {
        Sucursal sucursal = sucursalRepository.findById(entrada.getSucursal().getId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        entrada.setSucursal(sucursal);
        return entradaRepository.save(entrada);
    }

    @Override
    @Transactional
    public Entrada update(Long id, Entrada data) {
        Entrada entrada = entradaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entrada no encontrada"));
        entrada.setDescripcion(data.getDescripcion());
        entrada.setMonto(data.getMonto());
        entrada.setFecha(data.getFecha());
        return entradaRepository.save(entrada);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        entradaRepository.deleteById(id);
    }
}
