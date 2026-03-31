package com.api.apos.service.sucursal;

import com.api.apos.entity.Sucursal;
import com.api.apos.entity.Usuario;
import com.api.apos.repository.SucursalRepository;
import com.api.apos.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SucursalServiceImpl implements SucursalService {

    private final SucursalRepository sucursalRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Sucursal> findAll() {
        return sucursalRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Sucursal> findById(Long id) {
        return sucursalRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Sucursal> findByUsuarioId(Long usuarioId) {
        return sucursalRepository.findByUsuarioId(usuarioId);
    }

    @Override
    @Transactional
    public Sucursal save(Sucursal sucursal) {
        Usuario usuario = usuarioRepository.findById(sucursal.getUsuario().getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        sucursal.setUsuario(usuario);
        return sucursalRepository.save(sucursal);
    }

    @Override
    @Transactional
    public Sucursal update(Long id, Sucursal sucursalData) {
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
        sucursal.setNombre(sucursalData.getNombre());
        sucursal.setDireccion(sucursalData.getDireccion());
        sucursal.setTelefono(sucursalData.getTelefono());
        return sucursalRepository.save(sucursal);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        sucursalRepository.deleteById(id);
    }
}
