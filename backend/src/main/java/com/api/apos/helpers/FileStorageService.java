package com.api.apos.helpers;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.api.apos.exception.AppException;
import com.api.apos.exception.ErrorCode;

@Service
public class FileStorageService {
    private final Path fileStorageLocation;

    public FileStorageService() {
        this.fileStorageLocation = Paths.get("../../uploads")
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo crear el directorio", ex);
        }
    }

    public String storeFile(MultipartFile file, Long empresaId, String dir) throws IOException {

        // Validar que exista el archivo
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.ERROR_ALMACENANDO_ARCHIVO_ARCHIVO_VACIO);
        }

        // Obtener extensión del archivo original
        String originalFileName = file.getOriginalFilename();

        String extension = "";

        if (originalFileName != null) {
            int index = originalFileName.lastIndexOf(".");

            if (index >= 0) {
                extension = originalFileName.substring(index).toLowerCase();
            }
        }

        // Crear directorio
        Path dirPath = fileStorageLocation
                .resolve(dir)
                .resolve(empresaId.toString())
                .normalize();

        Files.createDirectories(dirPath);

        // Nombre fijo para el logo de la empresa
        String fileName = "logo" + extension;

        Path targetLocation = dirPath.resolve(fileName);

        // Reemplazar el logo anterior si existe
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return dir + "/" + empresaId + "/" + fileName;
    }

    public Resource loadFileAsResource(String filePath) throws IOException {

        Path path = fileStorageLocation
                .resolve(filePath)
                .normalize();

        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists()) {
            throw new AppException(ErrorCode.ARCHIVO_NO_ENCONTRADO);
        }

        return resource;
    }
}
