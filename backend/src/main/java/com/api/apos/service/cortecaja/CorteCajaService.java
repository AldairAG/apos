package com.api.apos.service.cortecaja;

import com.api.apos.entity.CorteCaja;
import java.util.List;
import java.util.Optional;

public interface CorteCajaService {
    List<CorteCaja> findAll();

    Optional<CorteCaja> findById(Long id);

    List<CorteCaja> findByCajaId(Long cajaId);

    List<CorteCaja> findByUsuarioId(Long usuarioId);

    CorteCaja save(CorteCaja corteCaja);

    void deleteById(Long id);
}
