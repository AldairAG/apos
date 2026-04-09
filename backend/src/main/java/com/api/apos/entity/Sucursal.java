package com.api.apos.entity;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
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

    @JsonIgnore
    @OneToOne(mappedBy = "sucursal", cascade = CascadeType.ALL)
    private Inventario inventario;

    @JsonIgnore
    @OneToMany(mappedBy = "sucursal", cascade = CascadeType.ALL)
    private List<Receta> recetas;

    @JsonIgnore
    @ManyToMany(mappedBy = "sucursales")
    private List<Usuario> usuarios;
}