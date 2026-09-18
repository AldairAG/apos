package com.api.apos.domain.catalogo.grupo_producto;

import com.api.apos.domain.catalogo.complemento.GrupoModificador;
import com.api.apos.domain.catalogo.producto.Producto;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "grupo_producto")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrupoProducto {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne 
    @JoinColumn(name = "producto_id")
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "grupo_modificador_id")
    private GrupoModificador grupoModificador;

}
