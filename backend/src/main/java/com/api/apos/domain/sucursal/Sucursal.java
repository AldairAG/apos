package com.api.apos.domain.sucursal;

import java.util.List;

import com.api.apos.domain.existenciaMaterial.ExistenciaMaterial;
import com.api.apos.domain.usuario.Usuario;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;

@Data
@Entity
public class Sucursal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String direccion;
    private String propietario;
    private Boolean activa;

    @OneToMany(mappedBy = "sucursal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExistenciaMaterial> existencias;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

}