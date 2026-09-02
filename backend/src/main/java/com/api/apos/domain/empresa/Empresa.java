package com.api.apos.domain.empresa;

import java.util.List;
import java.util.ArrayList;

import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.cuenta.Cuenta;
import com.api.apos.domain.empresa.enums.TipoEmpresa;
import com.api.apos.domain.sucursal.Sucursal;
import com.fasterxml.jackson.annotation.JsonIgnore;

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

    @JsonIgnore
    @OneToMany(mappedBy = "empresa")
    private List<Usuario> usuarios;

    @JsonIgnore
    @OneToMany(mappedBy = "empresa")
    private List<Sucursal> sucursales;

    @JsonIgnore
    @OneToMany(mappedBy = "empresa")
    private List<Cuenta> cuentas;

    public void delete(){
        activa=false;
    }
    
    public void addUsuario(Usuario usuario) {
        if (usuarios == null) {
            usuarios = new ArrayList<>();
        }

        usuarios.add(usuario);
        usuario.setEmpresa(this);
    }

    public void addCuenta(Cuenta cuenta) {
        if (cuentas == null) {
            cuentas = new ArrayList<>();
        }
        cuentas.add(cuenta);
        cuenta.setEmpresa(this);
    }

    public void addSucursal(Sucursal sucursal) {
        if (sucursales == null) {
            sucursales = new ArrayList<>();
        }
        sucursales.add(sucursal);
        sucursal.setEmpresa(this);
    }

}
