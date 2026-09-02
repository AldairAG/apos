package com.api.apos.aplication.empresa.controller.usecase;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import com.api.apos.aplication.empresa.controller.dto.EmpresaDto;
import com.api.apos.aplication.empresa.controller.mapper.EmpresaMapper;
import com.api.apos.domain.auth.usuario.Usuario;
import com.api.apos.domain.auth.usuario.UsuarioService;
import com.api.apos.domain.cuenta.CuentaService;
import com.api.apos.domain.cuenta.Cuenta;
import com.api.apos.domain.empresa.Empresa;
import com.api.apos.domain.empresa.EmpresaService;
import com.api.apos.enums.TipoCuenta;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CrearEmpresa {

    private final EmpresaService empresaService;

    private final UsuarioService usuarioService;

    private final CuentaService cuentaService;

    public EmpresaDto execute(EmpresaDto empresaDto) {
        Usuario usuario = usuarioService.getUsuarioAutenticado();

        String fileName = null;

/*         try {
            fileName = fileStorageService.storeFile(empresaDto.getImgFile(), usuario.getId(), "LOGO_EMPRESA");
        } catch (IOException e) {
            throw new AppException(ErrorCode.ERROR_ALMACENANDO_ARCHIVO);
        }
 */
        Empresa empresa = Empresa.builder()
                .nombre(empresaDto.getNombre())
                .logoUrl(fileName)
                .usuarios(null)
                .activa(true)
                .build();

        empresa.addUsuario(usuario);

        empresa = empresaService.save(empresa);

        usuarioService.save(usuario);

        crearCuentasDefault(empresa);

        return EmpresaMapper.toDto(empresa);
    }

    /**
     * Crea 2 cuentas por defecto al crear la empresa
     * cuenta digital marcada como cuenta destino y cuenta fisica 
     * tambien marcada como cuenta destino por defecto.
     * 
     * @param empresa La empresa para la cual se crearán las cuentas por defecto.
     * @return Lista de cuentas creadas.
     */
    public List<Cuenta> crearCuentasDefault(Empresa empresa) {
        List<Cuenta> cuentas = new ArrayList<>();

        Cuenta cuentaDigital = Cuenta.builder()
                .nombre("Cuenta Digital")
                .cuentaDestino(true)
                .empresa(empresa)
                .tipo(TipoCuenta.DIGITAL)
                .saldo(BigDecimal.ZERO) 
                .build();
        cuentaService.save(cuentaDigital);
        cuentas.add(cuentaDigital);

        Cuenta cuentaFisica = Cuenta.builder()
                .nombre("Cuenta Fisica")
                .cuentaDestino(true)
                .empresa(empresa)
                .tipo(TipoCuenta.FISICA)
                .saldo(BigDecimal.ZERO)
                .build();
        cuentaService.save(cuentaFisica);
        cuentas.add(cuentaFisica);

        return cuentas;
    }

}
