package com.api.apos.domain.sucursal;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.apos.domain.sucursal.service.SucursalService;
import com.api.apos.domain.usuario.Usuario;
import com.api.apos.enums.Rol;
import com.api.apos.helpers.ApiResponseWrapper;

@RestController
@RequestMapping("/api/sucursales")
public class SucursalController {

	private final SucursalService sucursalService;

	public SucursalController(SucursalService sucursalService) {
		this.sucursalService = sucursalService;
	}

	@PostMapping
	public ResponseEntity<ApiResponseWrapper<Sucursal>> crearSucursal(@RequestBody Sucursal sucursal) {
		try {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

			Long idUsuario = ((Usuario) authentication.getPrincipal()).getId();

			Sucursal creada = sucursalService.crearSucursal(sucursal, idUsuario);
			return ResponseEntity.ok(new ApiResponseWrapper<>(true, creada, null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
		} catch (RuntimeException e) {
			return ResponseEntity.internalServerError().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
		}
	}

	@GetMapping("/usuario/{idUsuario}")
	public ResponseEntity<ApiResponseWrapper<List<Sucursal>>> obtenerSucursalesPorUsuario(
			@PathVariable Long idUsuario) {
		try {
			Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

			Rol rol = ((Usuario) authentication.getPrincipal()).getRol();

			if(rol != Rol.ADMINISTRADOR) {
				List<Sucursal> sucursalesColaborador = sucursalService.obtenerSucursalesParaColaborador(((Usuario) authentication.getPrincipal()).getId());
				return ResponseEntity.status(403).body(new ApiResponseWrapper<>(false, sucursalesColaborador, "Sucursales de colaborador obtenidas"));
			}

			List<Sucursal> sucursales = sucursalService.obtenerSucursalesPorIdUsuario(idUsuario);
			return ResponseEntity.ok(new ApiResponseWrapper<>(true, sucursales, null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
		} catch (RuntimeException e) {
			return ResponseEntity.internalServerError().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
		}
	}

	@PutMapping("/{idSucursal}")
	public ResponseEntity<ApiResponseWrapper<Sucursal>> actualizarSucursal(@PathVariable Long idSucursal,
			@RequestBody Sucursal sucursal) {
		try {
			sucursal.setId(idSucursal);
			Sucursal actualizada = sucursalService.actualizarSucursal(sucursal);
			return ResponseEntity.ok(new ApiResponseWrapper<>(true, actualizada, null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
		}
	}

	@DeleteMapping("/{idSucursal}")
	public ResponseEntity<ApiResponseWrapper<String>> eliminarSucursal(@PathVariable Long idSucursal) {
		try {
			sucursalService.eliminarSucursal(idSucursal);
			return ResponseEntity.ok(new ApiResponseWrapper<>(true, "Sucursal eliminada correctamente", null));
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
		} catch (RuntimeException e) {
			return ResponseEntity.badRequest().body(new ApiResponseWrapper<>(false, null, e.getMessage()));
		}
	}

}
