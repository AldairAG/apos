package com.api.apos.service.salida;

import com.api.apos.entity.Salida;
import com.api.apos.entity.Sucursal;
import com.api.apos.repository.SalidaRepository;
import com.api.apos.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SalidaServiceImpl implements SalidaService {

    private final SalidaRepository salidaRepository;
    private final SucursalRepository sucursalRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Salida> findAll() {
        return salidaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Salida> findById(Long id) {
        return salidaRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Salida> findBySucursalId(Long sucursalId) {
        return salidaRepository.findBySucursalId(sucursalId);
    }

    @Override
    @Transactional
    public Salida save(Salida salida) {
        Sucursal sucursal = sucursalRepository.findById(salida.getSucursal().getId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        salida.setSucursal(sucursal);
        return salidaRepository.save(salida);
    }

    @Override
    @Transactional
    public Salida update(Long id, Salida data) {
        Salida salida = salidaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salida no encontrada"));
        salida.setDescripcion(data.getDescripcion());
        salida.setMonto(data.getMonto());
        salida.setFecha(data.getFecha());
        return salidaRepository.save(salida);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        salidaRepository.deleteById(id);
    }
}
