package com.api.apos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.apos.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    
}
