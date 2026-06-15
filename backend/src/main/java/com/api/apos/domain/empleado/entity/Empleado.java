package com.api.apos.domain.empleado.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.api.apos.domain.sucursal.Sucursal;
import com.api.apos.enums.Turno;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "empleados")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Empleado {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private String apellido;
    private String correo;
    private String password;
    private String telefono;
    private String direccion;
    private String numeroEmpleado;
    private String foto;
    
    private java.math.BigDecimal salario;
    
    @Enumerated(EnumType.STRING)
    private Turno turno;
    
    private LocalDate fechaNacimiento;
    private LocalDate fechaContratacion;
    
    private Boolean activo;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
    
    @ManyToOne
    @JoinColumn(name = "sucursal_id")
    private Sucursal sucursal;
    
    @ManyToOne
    @JoinColumn(name = "rol_id")
    private RolEntity rol;
}
