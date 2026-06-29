package com.api.apos.domain.sucursal.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.domain.sucursal.SucursalRepository;
import com.api.apos.domain.usuario.Usuario;
import com.api.apos.domain.usuario.UsuarioRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class SucursalServiceImpl implements SucursalService {

    private final SucursalRepository sucursalRepository;

    private final UsuarioRepository usuarioRepository;

    @Override
    public Sucursal crearSucursal(Sucursal sucursal, Long idUsuario) {

        if (sucursal == null) {
            throw new IllegalArgumentException("La sucursal es requerida");
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (sucursal.getActiva() == null) {
            sucursal.setActiva(true);
        }

        LocalDateTime now = LocalDateTime.now();
        if (sucursal.getCreatedAt() == null) {
            sucursal.setCreatedAt(now);
        }
        sucursal.setUpdatedAt(now);

        sucursal.setUsuario(usuario);
        return sucursalRepository.save(sucursal);
    }

    @Override
    public List<Sucursal> obtenerSucursalesPorIdUsuario(Long idUsuario) {
        if (idUsuario == null) {
            throw new IllegalArgumentException("El id del usuario es requerido");
        }

        return sucursalRepository.findByUsuarioId(idUsuario);
    }

    @Override
    public Sucursal actualizarSucursal(Sucursal sucursal) {
        if (sucursal == null || sucursal.getId() == null) {
            throw new IllegalArgumentException("El id de la sucursal es requerido");
        }

        Sucursal existente = sucursalRepository.findById(sucursal.getId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));

        existente.setNombre(sucursal.getNombre());
        existente.setDireccion(sucursal.getDireccion());
        existente.setCodigo(sucursal.getCodigo());
        existente.setTelefono(sucursal.getTelefono());
        existente.setEmail(sucursal.getEmail());
        existente.setHorarioApertura(sucursal.getHorarioApertura());
        existente.setHorarioCierre(sucursal.getHorarioCierre());
        existente.setTimezone(sucursal.getTimezone());
        existente.setActiva(sucursal.getActiva());
        existente.setLatitud(sucursal.getLatitud());
        existente.setLongitud(sucursal.getLongitud());
        existente.setUpdatedBy(sucursal.getUpdatedBy());
        existente.setUpdatedAt(LocalDateTime.now());

        if (sucursal.getUsuario() != null) {
            existente.setUsuario(sucursal.getUsuario());
        }

        return sucursalRepository.save(existente);
    }

    @Override
    public void eliminarSucursal(Long idSucursal) {
        if (idSucursal == null) {
            throw new IllegalArgumentException("El id de la sucursal es requerido");
        }

        Sucursal sucursal = sucursalRepository.findById(idSucursal)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));

        sucursalRepository.delete(sucursal);
    }

    @Override
    public Sucursal obtenerSucursalPorId(Long idSucursal) {
        if (idSucursal == null) {
            throw new IllegalArgumentException("El id de la sucursal es requerido");
        }

        return sucursalRepository.findById(idSucursal)
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada"));
    }

    @Override
    public List<Sucursal> obtenerSucursalesParaColaborador(Long colaboradorId) {
        if (colaboradorId == null) {
            throw new IllegalArgumentException("El id del colaborador es requerido");
        }

        Usuario colaborador = usuarioRepository.findById(colaboradorId)
                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado"));

        return sucursalRepository.findByUsuarioId(colaborador.getSucursalId());
    }




}
