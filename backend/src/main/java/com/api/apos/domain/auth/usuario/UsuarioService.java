package com.api.apos.domain.auth.usuario;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.api.apos.domain.financiero.cuenta.Cuenta;
import com.api.apos.domain.financiero.cuenta.CuentaService;
import com.api.apos.domain.organizacion.empresa.Empresa;
import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

import lombok.AllArgsConstructor;


@Service
@AllArgsConstructor
public class UsuarioService implements UserDetailsService {

        private final UsuarioRepository usuarioRepository;

        private final CuentaService cuentaService;

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

        public java.util.List<Cuenta> findCuentasActivasByEmpresaId(Long empresaId) {
                return cuentaService.findActivasByEmpresaId(empresaId);
        }

        public Empresa getEmpresaFromAuthenticatedUser() {
                Usuario usuario = getUsuarioAutenticado();
                Empresa empresa = usuario.getEmpresa();
                if (empresa != null && !empresa.isActiva()) {
                        throw new AppException(ErrorCode.EMPRESA_DESACTIVADA);
                }
                return empresa;
        }

}
