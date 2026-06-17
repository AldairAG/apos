export interface Usuario {
    private Long id;
    private String nombre;
    private String email;
    private String password;
    private String telefono;
    private Boolean activo;
    
    private LocalDateTime fechaRegistro;
    private LocalDateTime ultimoAcceso;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @Enumerated(EnumType.STRING)
    private Rol rol;


    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Material> materiales;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Receta> recetas;

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sucursal> sucursales;
    
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.api.apos.domain.categoria.entity.Categoria> categorias;
    
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<com.api.apos.domain.extra.entity.GrupoExtra> gruposExtra;

}