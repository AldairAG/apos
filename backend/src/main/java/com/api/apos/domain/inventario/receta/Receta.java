package com.api.apos.domain.inventario.receta;

import java.math.BigDecimal;
import java.util.List;

import com.api.apos.domain.catalogo.producto.Producto;
import com.api.apos.domain.inventario.receta_detalle.RecetaDetalle;
import com.api.apos.domain.organizacion.empresa.Empresa;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recetas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Receta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private Double rendimiento;

    private String notas;

    private Integer tiempoPreparacion;

    private Float porcentajeSobreCostos;

    private BigDecimal costoTotal;

    @ElementCollection
    @CollectionTable(name = "receta_instrucciones", joinColumns = @JoinColumn(name = "receta_id"))
    @Column(name = "instruccion", nullable = false)
    @OrderColumn(name = "orden")
    private List<String> instrucciones;

    @OneToMany(mappedBy = "receta", orphanRemoval = true, cascade = CascadeType.ALL) 
    private List<RecetaDetalle> recetaDetalles;

    @OneToMany(mappedBy = "receta", orphanRemoval = true, cascade = CascadeType.ALL)
    private List<Producto> productos;

    @ManyToOne 
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    public void addRecetaDetalle(RecetaDetalle recetaDetalle) {
        if (this.recetaDetalles == null) {
            this.recetaDetalles = new java.util.ArrayList<>();
        }

        this.recetaDetalles.add(recetaDetalle);
        recetaDetalle.setReceta(this);
    }


}
