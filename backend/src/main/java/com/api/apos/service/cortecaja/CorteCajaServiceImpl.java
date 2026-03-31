package com.api.apos.service.cortecaja;

import com.api.apos.entity.Caja;
import com.api.apos.entity.CorteCaja;
import com.api.apos.entity.Usuario;
import com.api.apos.repository.CajaRepository;
import com.api.apos.repository.CorteCajaRepository;
import com.api.apos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CorteCajaServiceImpl implements CorteCajaService {

    private final CorteCajaRepository corteCajaRepository;
    private final CajaRepository cajaRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CorteCaja> findAll() {
        return corteCajaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CorteCaja> findById(Long id) {
        return corteCajaRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CorteCaja> findByCajaId(Long cajaId) {
        return corteCajaRepository.findByCajaId(cajaId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CorteCaja> findByUsuarioId(Long usuarioId) {
        return corteCajaRepository.findByUsuarioResponsableId(usuarioId);
    }

    @Override
    @Transactional
    public CorteCaja save(CorteCaja corteCaja) {
        Caja caja = cajaRepository.findById(corteCaja.getCaja().getId())
                .orElseThrow(() -> new RuntimeException("Caja no encontrada"));
        Usuario usuario = usuarioRepository.findById(corteCaja.getUsuarioResponsable().getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        corteCaja.setCaja(caja);
        corteCaja.setUsuarioResponsable(usuario);
        return corteCajaRepository.save(corteCaja);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        corteCajaRepository.deleteById(id);
    }
}
