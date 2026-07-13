package com.api.apos.domain.caja.caja.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.domain.caja.caja.Caja;
import com.api.apos.domain.caja.caja.CajaRepository;
import com.api.apos.domain.caja.caja.dto.CajaDTO;
import com.api.apos.domain.caja.caja.dto.CrearCajaRequest;
import com.api.apos.domain.caja.caja.mapper.CajaMapper;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.domain.sucursal.service.SucursalService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CajaServiceImpl implements CajaService {

    private final CajaRepository cajaRepository;

    private final SucursalService sucursalService;

    @Override
    public CajaDTO crearCaja(CrearCajaRequest caja) {
        Caja nuevaCaja = Caja.builder()
                .nombre(caja.getNombre())
                .activa(caja.getActiva())
                .build();

        Sucursal sucursal = sucursalService.obtenerSucursalPorId(caja.getSucursalId());
        nuevaCaja.setSucursal(sucursal);

        Caja cajaGuardada = cajaRepository.save(nuevaCaja);

        return CajaMapper.toDTO(cajaGuardada);
    }

    @Override
    public Caja actualizarCaja(Long id, Caja caja) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'actualizarCaja'");
    }

    @Override
    public void eliminarCaja(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'eliminarCaja'");
    }

    @Override
    public Caja obtenerCajaPorId(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerCajaPorId'");
    }

    @Override
    public List<CajaDTO> obtenerCajasPorSucursal(Long idSucursal) {
        List<Caja> cajas = cajaRepository.findBySucursal_Id(idSucursal);

        if (cajas.isEmpty()) {
            throw new RuntimeException("No se encontraron cajas para la sucursal con ID: " + idSucursal);
        }

        return cajas.stream()
                .map(CajaMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public Caja modificarSaldo(Long id, BigDecimal monto) {
        Caja caja = cajaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Caja no encontrada con ID: " + id));

        if (caja.getMontoActual() == null) {
            caja.setMontoActual(BigDecimal.ZERO);
        }

        BigDecimal nuevoSaldo = caja.getMontoActual().add(monto);
        caja.setMontoActual(nuevoSaldo);

        return cajaRepository.save(caja);
    }
    
    
}
