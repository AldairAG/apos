package com.api.apos.service.usuario;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.api.apos.dto.response.JwtResponse;

@Service
public class UsuarioServiceImpl implements UsuarioService {

        @Override
        public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                // TODO Auto-generated method stub
                throw new UnsupportedOperationException("Unimplemented method 'loadUserByUsername'");
        }

        @Override
        public JwtResponse registrarUsuario(String email, String password) {
                // TODO Auto-generated method stub
                throw new UnsupportedOperationException("Unimplemented method 'registrarUsuario'");
        }

        @Override
        public JwtResponse login(String email, String password) {
                // TODO Auto-generated method stub
                throw new UnsupportedOperationException("Unimplemented method 'login'");
        }
}
