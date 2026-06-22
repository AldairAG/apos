package com.api.apos.domain.mesa.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.apos.domain.mesa.Mesa;
import com.api.apos.domain.mesa.MesaRepository;
import com.api.apos.domain.mesa.dto.CrearMesaDTO;
import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.domain.sucursal.service.SucursalService;
import com.api.apos.domain.usuario.Usuario;
import com.api.apos.domain.usuario.service.UsuarioService;
import com.api.apos.enums.EstadoMesa;

@Service
public class MesaServiceImpl implements MesaService {

    private final MesaRepository mesaRepository;

    private final UsuarioService usuarioService;

    private final SucursalService sucursalService;

    public MesaServiceImpl(MesaRepository mesaRepository, UsuarioService usuarioService, SucursalService sucursalService) {
        this.mesaRepository = mesaRepository;
        this.usuarioService = usuarioService;
        this.sucursalService = sucursalService;
    }

    @Override
    public Mesa crearMesa(CrearMesaDTO mesa, Long sucursalId) {

        Usuario usuarioAuth = usuarioService.obtenerUsuarioAutenticado(); 

        Sucursal sucursal = sucursalService.obtenerSucursalPorId(sucursalId);
        
        Mesa nuevaMesa = Mesa.builder()
                .nombre(mesa.getNombre())
                .codigo(mesa.getCodigo())
                .estado(EstadoMesa.LIBRE)
                .activa(true)
                .ordenActual(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(usuarioAuth.getId())
                .updatedBy(usuarioAuth.getId())
                .sucursal(sucursal)
                .build();

        return mesaRepository.save(nuevaMesa);      
        
    }

    @Override
    public Mesa actualizarMesa(Long id, Mesa mesa) {
        if (id == null) {
            throw new IllegalArgumentException("El ID de la mesa no puede ser nulo");
        }

        Mesa existente = obtenerMesaPorId(id);

        existente.setNombre(mesa.getNombre());
        existente.setCodigo(mesa.getCodigo());
        existente.setEstado(mesa.getEstado());
        existente.setActiva(mesa.getActiva());
        existente.setOrdenActual(mesa.getOrdenActual());
        existente.setUpdatedAt(LocalDateTime.now());
        existente.setUpdatedBy(mesa.getUpdatedBy());

        if (mesa.getSucursal() != null) {
            existente.setSucursal(mesa.getSucursal());
        }

        return mesaRepository.save(existente);
    }

    @Override
    public void eliminarMesa(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("El ID de la mesa no puede ser nulo");
        }

        if (!mesaRepository.existsById(id)) {
            throw new IllegalArgumentException("No existe una mesa con el ID proporcionado: " + id);
        }

        mesaRepository.deleteById(id);
    }

    @Override
    public Mesa obtenerMesaPorId(Long id) {
        return mesaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No existe una mesa con el ID proporcionado: " + id));
    }

    @Override
    public List<Mesa> obtenerMesasPorSucursal(Long idSucursal) {
        return mesaRepository.findBySucursal_Id(idSucursal);
    }

    @Override
    public Mesa cambiarEstadoMesa(Long id, EstadoMesa nuevoEstado) {
        Mesa mesa = obtenerMesaPorId(id);
        mesa.setEstado(nuevoEstado);
        return mesaRepository.save(mesa);
    }
    
}
