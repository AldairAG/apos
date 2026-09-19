package com.api.apos.domain.catalogo.producto;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.domain.catalogo.categoria.Categoria;
import com.api.apos.domain.catalogo.grupo_producto.ModificadorProducto;
import com.api.apos.domain.inventario.receta.Receta;
import com.api.apos.domain.organizacion.sucursal.Sucursal;

import jakarta.persistence.Entity;
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
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Producto {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private BigDecimal precio;

    private BigDecimal costo;

    private Float margenGanancia;

    private Boolean disponible;

    @ManyToOne 
    @JoinColumn (name = "receta_id")
    private Receta receta;

    @OneToMany(mappedBy = "producto", orphanRemoval = true)
    private List<ModificadorProducto> grupoProductos;

    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    @ManyToOne 
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;

}
