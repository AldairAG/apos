package com.api.apos.service.sucursal;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.dto.request.CrearSucursalRequest;
import com.api.apos.dto.response.SucursalDto;
import com.api.apos.entity.Inventario;
import com.api.apos.entity.Sucursal;
import com.api.apos.entity.Usuario;
import com.api.apos.repository.SucursalRepository;
import com.api.apos.repository.UsuarioRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class SucursalServiceImpl implements SucursalService {

    @Autowired
    private SucursalRepository sucursalRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    @Transactional
    public void crearSucursal(Sucursal sucursal) {
        sucursal.setActiva(true);
        
        // Crear inventario vacío para la sucursal
        Inventario inventario = new Inventario();
        inventario.setSucursal(sucursal);
        sucursal.setInventario(inventario);
        
        sucursalRepository.save(sucursal);
    }

    @Override
    @Transactional
    public void actualizarSucursal(Long id, Sucursal sucursal) {
        Sucursal sucursalExistente = sucursalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada con id: " + id));

        sucursalExistente.setNombre(sucursal.getNombre());
        sucursalExistente.setDireccion(sucursal.getDireccion());
        sucursalExistente.setPropietario(sucursal.getPropietario());
        sucursalExistente.setActiva(sucursal.getActiva());

        sucursalRepository.save(sucursalExistente);
    }

    @Override
    @Transactional
    public void eliminarSucursal(Long id) {
        Sucursal sucursal = sucursalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada con id: " + id));

        sucursal.setActiva(false);
        sucursalRepository.save(sucursal);
    }

    @Override
    @Transactional
    public void asignarUsuarioASucursal(Long sucursalId, Long usuarioId) {
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada con id: " + sucursalId));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + usuarioId));

        if (!usuario.getSucursales().contains(sucursal)) {
            usuario.getSucursales().add(sucursal);
            usuarioRepository.save(usuario);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Sucursal> obtenerSucursalesPorPropietario(Long propietarioId) {
        Usuario usuario = usuarioRepository.findById(propietarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + propietarioId));

        return usuario.getSucursales();
    }

    @Transactional
    public SucursalDto crearSucursalParaUsuario(Long usuarioId, CrearSucursalRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + usuarioId));

        Sucursal sucursal = new Sucursal();
        sucursal.setNombre(request.getNombre());
        sucursal.setDireccion(request.getDireccion());
        sucursal.setActiva(true);

        // Crear inventario vacío para la sucursal
        Inventario inventario = new Inventario();
        inventario.setSucursal(sucursal);
        sucursal.setInventario(inventario);

        sucursal = sucursalRepository.save(sucursal);

        usuario.getSucursales().add(sucursal);
        usuarioRepository.save(usuario);

        return SucursalDto.builder()
                .id(sucursal.getId())
                .nombre(sucursal.getNombre())
                .direccion(sucursal.getDireccion())
                .cantidadRecetas(0)
                .cantidadProductos(0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<SucursalDto> obtenerSucursalesPorUsuarioId(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + usuarioId));

        return usuario.getSucursales().stream()
                .map(sucursal -> SucursalDto.builder()
                        .id(sucursal.getId())
                        .nombre(sucursal.getNombre())
                        .direccion(sucursal.getDireccion())
                        .cantidadRecetas(sucursal.getRecetas() != null ? sucursal.getRecetas().size() : 0)
                        .cantidadProductos(sucursal.getInventario() != null
                                && sucursal.getInventario().getProductosElaborados() != null
                                        ? sucursal.getInventario().getProductosElaborados().size()
                                        : 0)
                        .build())
                .toList();
    }
}
