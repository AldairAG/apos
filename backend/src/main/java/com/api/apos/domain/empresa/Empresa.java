package com.api.apos.domain.empresa;

import java.util.List;

import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.empresa.enums.TipoEmpresa;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "empresa")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Empresa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    @Enumerated(EnumType.STRING)
    private TipoEmpresa tipoEmpresa; 
    private String logoUrl;

    private boolean activa;

    @OneToMany(mappedBy = "empresa")
    private List<Usuario> usuarios;

    public void delete(){
        activa=false;
    }
    
    public void addUsuario(Usuario usuario) {
        usuarios.add(usuario);
        usuario.setEmpresa(this);
    }

}
