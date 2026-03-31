package com.api.apos.service.silla;

import com.api.apos.entity.Mesa;
import com.api.apos.entity.Silla;
import com.api.apos.repository.MesaRepository;
import com.api.apos.repository.SillaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SillaServiceImpl implements SillaService {

    private final SillaRepository sillaRepository;
    private final MesaRepository mesaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Silla> findAll() {
        return sillaRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Silla> findById(Long id) {
        return sillaRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Silla> findByMesaId(Long mesaId) {
        return sillaRepository.findByMesaId(mesaId);
    }

    @Override
    @Transactional
    public Silla save(Silla silla) {
        Mesa mesa = mesaRepository.findById(silla.getMesa().getId())
                .orElseThrow(() -> new RuntimeException("Mesa no encontrada"));
        silla.setMesa(mesa);
        return sillaRepository.save(silla);
    }

    @Override
    @Transactional
    public Silla update(Long id, Silla data) {
        Silla silla = sillaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Silla no encontrada"));
        silla.setNumero(data.getNumero());
        return sillaRepository.save(silla);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        sillaRepository.deleteById(id);
    }
}
