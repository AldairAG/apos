package com.api.apos.domain.catalogo.complemento;

import java.util.List;

import com.api.apos.domain.catalogo.modificadores.Opcion;
import com.api.apos.domain.organizacion.empresa.Empresa;

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
@Table(name = "modificadores")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Modificador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @OneToMany(mappedBy = "modificador", orphanRemoval = true)
    private List<Opcion> opciones;

    @ManyToOne
    @JoinColumn(name = "empresa_id")
    private Empresa empresa;

    public void addOpciones(List<Opcion> opciones) {

        if (opciones == null || opciones.isEmpty()) {
            return;
        }

        for (Opcion opcion : opciones) {
            opcion.setModificador(this);
        }

        this.opciones.addAll(opciones);
    }

    public void addOpcion(Opcion opcion){
        opcion.setModificador(this);
        opciones.add(opcion);
    }
}