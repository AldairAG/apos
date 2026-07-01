package com.api.apos.domain.auth.usuario.service;

import java.time.LocalDateTime;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioRepository;
import com.api.apos.domain.auth.usuario.dto.ColaboradorDTO;
import com.api.apos.dto.response.JwtResponse;
import com.api.apos.enums.Rol;
import com.api.apos.helpers.JwtHelper;

@Service
public class UsuarioServiceImpl implements UsuarioService {

        private final UsuarioRepository usuarioRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;
        private final JwtHelper jwtHelper;

        public UsuarioServiceImpl(
                        UsuarioRepository usuarioRepository,
                        PasswordEncoder passwordEncoder,
                        @Lazy AuthenticationManager authenticationManager,
                        JwtHelper jwtHelper) {
                this.usuarioRepository = usuarioRepository;
                this.passwordEncoder = passwordEncoder;
                this.authenticationManager = authenticationManager;
                this.jwtHelper = jwtHelper;
        }

        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                return usuarioRepository.findByEmail(username)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "Usuario no encontrado con email: " + username));
        }

        @Override
        public JwtResponse registrarUsuario(String email, String password) {
                // Validar si el usuario ya existe
                if (usuarioRepository.findByEmail(email).isPresent()) {
                        throw new IllegalArgumentException("El email ya está registrado");
                }

                // Crear nuevo usuario
                Usuario nuevoUsuario = Usuario.builder()
                                .email(email)
                                .password(passwordEncoder.encode(password))
                                .activo(true)
                                .rol(Rol.ADMINISTRADOR) // Por defecto, asignar rol ADMINISTRADOR
                                .fechaRegistro(LocalDateTime.now())
                                .createdAt(LocalDateTime.now())
                                .build();

                // Guardar usuario
                Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

                // Generar token JWT
                String token = jwtHelper.generateToken(usuarioGuardado);

                return new JwtResponse(token, usuarioGuardado.getId(), usuarioGuardado.getEmail());
        }

        @Override
        public JwtResponse login(String email, String password) {
                // Autenticar usuario
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(email, password));

                // Obtener usuario autenticado
                Usuario usuario = (Usuario) authentication.getPrincipal();

                // Actualizar último acceso
                usuario.setUltimoAcceso(LocalDateTime.now());
                usuarioRepository.save(usuario);

                // Generar token JWT
                String token = jwtHelper.generateToken(usuario);

                return new JwtResponse(token, usuario.getId(), usuario.getEmail());
        }

        @Override
        public Usuario obtenerUsuarioAutenticado() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated()) {
                        throw new RuntimeException("No hay un usuario autenticado");
                }
                return (Usuario) authentication.getPrincipal();
        }

        @Override
        public ColaboradorDTO agregarColaborador(ColaboradorDTO colaboradorDTO) {
                // Validar si el usuario ya existe
                if (usuarioRepository.findByEmail(colaboradorDTO.getEmail()).isPresent()) {
                        throw new IllegalArgumentException("El email ya está registrado");
                }

                // Crear nuevo colaborador
                Usuario nuevoColaborador = Usuario.builder()
                                .nombre(colaboradorDTO.getNombre())
                                .email(colaboradorDTO.getEmail())
                                .password(passwordEncoder.encode(colaboradorDTO.getPassword()))
                                .telefono(colaboradorDTO.getTelefono())
                                .activo(true)
                                .rol(colaboradorDTO.getRol()) // Asignar rol COLABORADOR
                                .fechaRegistro(LocalDateTime.now())
                                .createdAt(LocalDateTime.now())
                                .build();

                // Guardar colaborador
                return mapUsuarioToColaboradorDTO(usuarioRepository.save(nuevoColaborador));
        }

        @Override
        public void eliminarColaborador(Long id) {
                Usuario colaborador = usuarioRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado"));
                usuarioRepository.delete(colaborador);
        }

        @Override
        public Usuario obtenerColaboradorPorId(Long id) {
                return usuarioRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado"));
        }

        @Override
        public Usuario actualizarColaborador(Long id, ColaboradorDTO colaboradorDTO) {
                Usuario colaboradorExistente = usuarioRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Colaborador no encontrado"));

                // Actualizar campos del colaborador
                colaboradorExistente.setNombre(colaboradorDTO.getNombre());
                colaboradorExistente.setEmail(colaboradorDTO.getEmail());
                if (colaboradorDTO.getPassword() != null && !colaboradorDTO.getPassword().isEmpty()) {
                        colaboradorExistente.setPassword(passwordEncoder.encode(colaboradorDTO.getPassword()));
                }
                colaboradorExistente.setTelefono(colaboradorDTO.getTelefono());
                colaboradorExistente.setRol(colaboradorDTO.getRol());
                colaboradorExistente.setUpdatedAt(LocalDateTime.now());

                return usuarioRepository.save(colaboradorExistente);
        }

        private ColaboradorDTO mapUsuarioToColaboradorDTO(Usuario usuario) {
                return ColaboradorDTO.builder()
                                .id(usuario.getId())
                                .nombre(usuario.getNombre())
                                .email(usuario.getEmail())
                                .telefono(usuario.getTelefono())
                                .rol(usuario.getRol())
                                .build();
        }
}
