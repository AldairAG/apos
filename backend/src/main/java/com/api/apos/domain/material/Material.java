package com.api.apos.domain.material;

import java.util.List;

import com.api.apos.domain.compra.entity.CompraDetalle;
import com.api.apos.domain.extra.entity.OpcionExtra;
import com.api.apos.domain.inventario.entity.ExistenciaMaterial;
import com.api.apos.domain.produccion.entity.Produccion;
import com.api.apos.domain.receta.entity.DetalleReceta;
import com.api.apos.domain.usuario.Usuario;
import com.api.apos.enums.Unidad;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {
    
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private String proveedor;
    private String categoriaInventario;

    @Enumerated(EnumType.STRING)
    private Unidad unidadMedida;
    
    private java.math.BigDecimal costoUnitario;
    private Boolean activo;
    private Boolean perecedero;
    private Integer diasVencimiento;
    
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;


    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExistenciaMaterial> existencias;

    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleReceta> detallesReceta;
    
    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL)
    private List<OpcionExtra> opcionesExtra;
    
    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL)
    private List<CompraDetalle> compraDetalles;
    
    @OneToMany(mappedBy = "materialProducido", cascade = CascadeType.ALL)
    private List<Produccion> producciones;


}
