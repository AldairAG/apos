package com.api.apos.domain.caja.caja;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CajaService {

    private final CajaRepository cajaRepository;

    public Caja crearCaja(Caja caja) {
        return cajaRepository.save(caja);
    }

    public Caja actualizarCaja(Long id, Caja caja) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'actualizarCaja'");
    }

    public void eliminarCaja(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'eliminarCaja'");
    }

    public Caja obtenerCajaPorId(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'obtenerCajaPorId'");
    }

    public List<Caja> obtenerCajasPorSucursal(Long idSucursal) {
        List<Caja> cajas = cajaRepository.findBySucursal_Id(idSucursal);

        return cajas;
    }

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
