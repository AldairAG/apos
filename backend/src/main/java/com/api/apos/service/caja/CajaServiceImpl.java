package com.api.apos.service.caja;

import com.api.apos.entity.Caja;
import com.api.apos.entity.Sucursal;
import com.api.apos.repository.CajaRepository;
import com.api.apos.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CajaServiceImpl implements CajaService {

    private final CajaRepository cajaRepository;
    private final SucursalRepository sucursalRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Caja> findAll() {
        return cajaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Caja> findById(Long id) {
        return cajaRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Caja> findBySucursalId(Long sucursalId) {
        return cajaRepository.findBySucursalId(sucursalId);
    }

    @Override
    @Transactional
    public Caja save(Caja caja) {
        Sucursal sucursal = sucursalRepository.findById(caja.getSucursal().getId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        caja.setSucursal(sucursal);
        return cajaRepository.save(caja);
    }

    @Override
    @Transactional
    public Caja update(Long id, Caja cajaData) {
        Caja caja = cajaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Caja no encontrada"));
        caja.setTipoCaja(cajaData.getTipoCaja());
        caja.setSaldo(cajaData.getSaldo());
        caja.setFechaApertura(cajaData.getFechaApertura());
        caja.setFechaCierre(cajaData.getFechaCierre());
        return cajaRepository.save(caja);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        cajaRepository.deleteById(id);
    }
}
