package com.api.apos.domain.organizacion.sucursal;

import java.time.LocalDateTime;
import java.util.List;

import com.api.apos.domain.catalogo.producto.Producto;
import com.api.apos.domain.financiero.caja.Caja;
import com.api.apos.domain.inventario.existencia.Existencia;
import com.api.apos.domain.organizacion.empresa.Empresa;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@Table(name = "sucursales")
@AllArgsConstructor 
@NoArgsConstructor 
public class Sucursal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String codigo;

    private Boolean activa;

    private String direccion;
    
    private String telefono;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaActualizacion;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @OneToMany(mappedBy = "sucursal", fetch = FetchType.LAZY)
    private List<Existencia> existencias;

    @OneToMany(mappedBy = "sucursal", fetch = FetchType.LAZY)
    private List<Caja> cajas;

    @OneToMany(mappedBy = "sucursal", fetch = FetchType.LAZY)
    private List<Producto> productos;

    public void delete() {
        this.activa = false;
    }

    public void addProducto(Producto producto){
        productos.add(producto);
        producto.setSucursal(this);
    }
    
}
