package com.api.apos.service.usuario;

import org.springframework.context.annotation.Lazy;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.apos.dto.request.CrearSucursalRequest;
import com.api.apos.dto.response.JwtResponse;
import com.api.apos.dto.response.SucursalDto;
import com.api.apos.entity.Inventario;
import com.api.apos.entity.Sucursal;
import com.api.apos.entity.Usuario;
import com.api.apos.helpers.JwtHelper;
import com.api.apos.repository.SucursalRepository;
import com.api.apos.repository.UsuarioRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class UsuarioServiceImpl implements UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtHelper jwtHelper;

    @Autowired
    private SucursalRepository sucursalRepository;

    @Lazy
    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
    }

    @Override
    public JwtResponse registrarUsuario(String email, String password) {
        usuarioRepository.findByEmail(email).ifPresent(
                usuario -> {
                    throw new IllegalArgumentException("El email ya está registrado: " + email);
                });

        // Aquí se debería encriptar la contraseña antes de guardar
        String encodedPassword = passwordEncoder.encode(password);

        Usuario nuevoUsuario = Usuario.builder()
                .email(email)
                .password(encodedPassword)
                .activo(true)
                .rol(com.api.apos.enums.Rol.ADMINISTRADOR) // Asignar un rol por defecto
                .build();

        usuarioRepository.save(nuevoUsuario);

        return login(email, password);

    }

    @Transactional
    public JwtResponse login(String email, String password) {
        try {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException(
                            "Usuario no encontrado con email: " + email));

            // Autenticar usuario con contraseña normal
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            password));

            // Obtener usuario autenticado
            usuario = (Usuario) authentication.getPrincipal();

            // Generar token JWT
            String token = jwtHelper.generateToken(usuario);

            // Crear respuesta
            return new JwtResponse(
                    token,
                    usuario.getId(),
                    usuario.getEmail());

        } catch (AuthenticationException e) {
            throw new RuntimeException("Ocurrió un error durante la autenticación: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SucursalDto> getSucursalesByUsuarioId(Long usuarioId) {
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

    @Override
    @Transactional
    public void eliminarSucursalDeUsuario(Long usuarioId, Long sucursalId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con id: " + usuarioId));

        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new EntityNotFoundException("Sucursal no encontrada con id: " + sucursalId));

        if (!usuario.getSucursales().contains(sucursal)) {
            throw new IllegalArgumentException("La sucursal no pertenece al usuario");
        }

        usuario.getSucursales().remove(sucursal);
        usuarioRepository.save(usuario);
    }

    @Override
    @Transactional
    public CrearSucursalRequest crearSucursalParaUsuario(Long usuarioId, CrearSucursalRequest request) {
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

        return request;
    }

}
