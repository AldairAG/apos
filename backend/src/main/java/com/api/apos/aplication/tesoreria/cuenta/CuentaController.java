package com.api.apos.aplication.tesoreria.cuenta;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.aplication.tesoreria.cuenta.usecase.DesactivarCuentaUseCase;
import com.api.apos.helpers.ApiResponseWrapper;

import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/api/cuentas")
@AllArgsConstructor
public class CuentaController {
	private final DesactivarCuentaUseCase desactivarCuentaUseCase;

	@DeleteMapping("/{cuentaId}")
	public ResponseEntity<ApiResponseWrapper<Void>> desactivarCuenta(@PathVariable Long cuentaId) {
		desactivarCuentaUseCase.execute(cuentaId);
		return ResponseEntity.ok(ApiResponseWrapper.success(null));
	}

}
