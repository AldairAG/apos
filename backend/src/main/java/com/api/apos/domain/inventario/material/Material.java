package com.api.apos.domain.inventario.material;

import jakarta.persistence.Table;

import java.util.List;

import com.api.apos.domain.inventario.detalle_compra.DetalleCompra;
import com.api.apos.domain.inventario.existencia.Existencia;
import com.api.apos.domain.organizacion.empresa.Empresa;
import com.api.apos.enums.UnidadMedida;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "materiales")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String proveedor;

    @Enumerated(value = EnumType.STRING)
    private UnidadMedida unidad;

    private Double cantidad;

    private Double precio;

    private String descripcion;
    
    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Existencia > existencias;

    @ManyToOne 
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetalleCompra> detalleCompras;
}
