package com.api.apos.domain.organizacion.sucursal;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.api.apos.domain.catalogo.producto.Producto;
import com.api.apos.domain.catalogo.categoria.Categoria;
import com.api.apos.domain.financiero.caja.Caja;
import com.api.apos.domain.inventario.compra.Compra;
import com.api.apos.domain.inventario.existencia.Existencia;
import com.api.apos.domain.organizacion.empresa.Empresa;
import com.api.apos.domain.pos.mesa.Mesa;

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

    @OneToMany(mappedBy = "sucursal", fetch = FetchType.LAZY)
    private List<Categoria> categorias;

    @OneToMany(mappedBy = "sucursal", fetch = FetchType.LAZY)
    private List<Mesa> mesas;

    @OneToMany(mappedBy = "sucursal", fetch = FetchType.LAZY)
    private List<Compra> compras;

    public void delete() {
        this.activa = false;
    }

    public void addProducto(Producto producto){
        if (productos == null) {
            productos = new ArrayList<>();
        }
        productos.add(producto);
        producto.setSucursal(this);
    }

    public void addExistencia(Existencia existencia){
        if (existencias == null) {
            existencias = new ArrayList<>();
        }
        existencias.add(existencia);
        existencia.setSucursal(this);
    }

    public void addCategoria(Categoria categoria){
        if (categorias == null) {
            categorias = new ArrayList<>();
        }
        categorias.add(categoria);
        categoria.setSucursal(this);
    }

    public void addMesa(Mesa mesa){
        if (mesas == null) {
            mesas = new ArrayList<>();
        }
        mesas.add(mesa);
        mesa.setSucursal(this);
    }

    public void addCompra(Compra compra){
        if (compras == null) {
            compras = new ArrayList<>();
        }
        compras.add(compra);
        compra.setSucursal(this);
    }
    
}
