package com.api.apos.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "salidas")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class Salida extends MovimientoFinanciero {
}
