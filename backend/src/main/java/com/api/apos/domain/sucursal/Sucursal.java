package com.api.apos.domain.sucursal;

import java.util.List;

import com.api.apos.domain.inventario.entity.ExistenciaMaterial;
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
    private String codigo;
    private String telefono;
    private String email;
    private String horarioApertura;
    private String horarioCierre;
    private String timezone;
    private Boolean activa;
    
    private java.math.BigDecimal latitud;
    private java.math.BigDecimal longitud;
    
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;

    @OneToMany(mappedBy = "sucursal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExistenciaMaterial> existencias;
    
    @OneToMany(mappedBy = "sucursal", cascade = CascadeType.ALL)
    private List<com.api.apos.domain.empleado.entity.Empleado> empleados;
    
    @OneToMany(mappedBy = "sucursal", cascade = CascadeType.ALL)
    private List<com.api.apos.domain.mesa.entity.Mesa> mesas;
    
    @OneToMany(mappedBy = "sucursal", cascade = CascadeType.ALL)
    private List<com.api.apos.domain.orden.entity.Orden> ordenes;
    
    @OneToMany(mappedBy = "sucursal", cascade = CascadeType.ALL)
    private List<com.api.apos.domain.caja.entity.Caja> cajas;
    
    @OneToMany(mappedBy = "sucursal", cascade = CascadeType.ALL)
    private List<com.api.apos.domain.gasto.entity.Gasto> gastos;
    
    @OneToMany(mappedBy = "sucursal", cascade = CascadeType.ALL)
    private List<com.api.apos.domain.compra.entity.CompraInventario> compras;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

}