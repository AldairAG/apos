package com.api.apos.domain.auth.usuario;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;

import org.springframework.security.core.userdetails.UserDetailsService;


@Service
@AllArgsConstructor
public class UsuarioService implements UserDetailsService {

        private final UsuarioRepository usuarioRepository;

        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                return usuarioRepository.findByEmail(username)
                                .orElseThrow(() -> new UsernameNotFoundException(
                                                "Usuario no encontrado con email: " + username));
        }

        public Usuario getUsuarioAutenticado() {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated()) {
                        throw new RuntimeException("No hay un usuario autenticado");
                }
                Usuario usuario = usuarioRepository.findById(((Usuario) authentication.getPrincipal()).getId()).orElse(null);
                if (usuario == null) {
                        throw new RuntimeException("No se encontró el usuario autenticado");
                }
                return usuario;
        }

        public Long getUsuarioAutenticadoId() {
                 Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication == null || !authentication.isAuthenticated()) {
                        throw new RuntimeException("No hay un usuario autenticado");
                }

                Usuario usuario=((Usuario) authentication.getPrincipal());

                return usuario.getId();
        }

        public Usuario findByEmail(String email) {
                return usuarioRepository.findByEmail(email)
                                .orElseThrow(() -> new AppException(ErrorCode.USUARIO_NO_ENCONTRADO));
        }

        public Usuario save(Usuario usuario) {
                return usuarioRepository.save(usuario);
        }

        public Boolean existsByEmail(String email) {
                return usuarioRepository.findByEmail(email).isPresent();
        }

}
