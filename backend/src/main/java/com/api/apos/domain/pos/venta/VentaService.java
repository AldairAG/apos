package com.api.apos.domain.pos.venta;

import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@AllArgsConstructor 
@Service 
public class VentaService {

    private final VentaRepository ventaRepository;

    public Venta saveVenta(Venta venta) {
        return ventaRepository.save(venta);
    }

    public Venta getVentaById(Long id) {
        return ventaRepository.findById(id).orElse(null);
    }

}
