import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEmpresa } from "../hook/useEmpresa";
import { EmpresaDto } from "../../domain/types/empresa.types";
import { router } from "expo-router";
import { ROUTES } from "@/routes/routes";

interface EmpresaFormValues {
  nombre: string;
  imgFile: File | null;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Esquema de validación con Yup. Reemplaza tanto las reglas que antes vivían
// en `register("nombre", { required, validate })` como las del `rules` del
// Controller de react-hook-form para `imgFile`.
const validationSchema = Yup.object({
  nombre: Yup.string()
    .trim()
    .required("Ingresa el nombre de la empresa."),
  imgFile: Yup.mixed<File>()
    .nullable()
    .test(
      "fileType",
      "El archivo debe ser una imagen.",
      (value) => {
        // Si no hay archivo, es válido porque la imagen es opcional
        if (!value) return true;

        // Si existe, debe ser un File y tener un tipo de imagen
        return value instanceof File && value.type.startsWith("image/");
      }
    )
    .test(
      "fileSize",
      "La imagen no debe superar 5MB.",
      (value) => {
        // Si no hay archivo, es válido porque la imagen es opcional
        if (!value) return true;

        // Si existe, debe pesar como máximo 5MB
        return value instanceof File && value.size <= MAX_FILE_SIZE_BYTES;
      }
    ),
});

export default function CrearEmpresaScreen() {
  const { crearEmpresa } = useEmpresa();

  const [enviado, setEnviado] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik<EmpresaFormValues>({
    initialValues: { nombre: "", imgFile: null },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {

      const data: EmpresaDto = {
        nombre: values.nombre.trim(),
        imgUrl,
        imgFile: values.imgFile,
      };

      const result = await crearEmpresa(data);

      if (result.success) {
        setEnviado(true);
        setTimeout(() => setEnviado(false), 3000);
        router.replace(ROUTES.ADMIN.HOME);
      }


      resetForm();
      setImgUrl("");
    },
  });

  const {
    values,
    errors,
    touched,
    submitCount,
    isSubmitting,
    handleSubmit,
    handleChange,
    handleBlur,
    setFieldValue,
    setFieldTouched,
  } = formik;

  // Muestra el error de un campo solo si ya fue tocado o si ya se intentó enviar
  const mostrarError = (campo: keyof EmpresaFormValues) =>
    Boolean(errors[campo]) && (touched[campo] || submitCount > 0);

  // Genera y libera la vista previa cada vez que cambia el archivo seleccionado
  useEffect(() => {
    if (!values.imgFile) {
      setImgUrl("");
      return;
    }
    const url = URL.createObjectURL(values.imgFile);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [values.imgFile]);

  const applyFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setFieldValue("imgFile", null);
      return;
    }
    setFieldValue("imgFile", file);
    setFieldTouched("imgFile", true, false);
  };

  const removeImage = () => {
    setFieldValue("imgFile", null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#F1EEF4] flex flex-col">
      {/* Top app bar M3 */}
      <header className="h-16 shrink-0 bg-[#FFFBFE] flex items-center gap-2 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          aria-label="Volver"
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F1EEF4] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C1B1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-medium text-[#1C1B1F]">Registrar empresa</h1>
      </header>

      {/* Contenido de la pantalla */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-7" noValidate>
          {enviado && (
            <div className="rounded-2xl bg-[#D8E2FF] text-[#001B3D] text-sm px-4 py-3">
              Empresa registrada correctamente.
            </div>
          )}

          <div className="w-16 h-16 rounded-2xl bg-[#D8E2FF] flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1857B6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" />
              <path d="M5 21V7l8-4v18" />
              <path d="M19 21V11l-6-4" />
              <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
            </svg>
          </div>

          {/* Campo: nombre (filled text field M3) */}
          <div>
            <div className="relative">
              <input
                id="nombre"
                name="nombre"
                type="text"
                placeholder=" "
                value={values.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`peer w-full h-14 rounded-t-[4px] px-4 pt-5 pb-1.5 text-[#1C1B1F] bg-white outline-none border-b-2 transition-colors placeholder-transparent ${mostrarError("nombre")
                  ? "border-[#B3261E]"
                  : "border-[#79747E] focus:border-[#1857B6]"
                  }`}
              />
              <label
                htmlFor="nombre"
                className="absolute left-4 top-4 text-[#49454F] text-base transition-all duration-150 origin-left
                  peer-focus:top-2 peer-focus:text-xs peer-focus:text-[#1857B6]
                  peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Nombre de la empresa
              </label>
            </div>
            {mostrarError("nombre") && (
              <p className="mt-1.5 ml-4 text-xs text-[#B3261E]">{errors.nombre}</p>
            )}
          </div>

          {/* Campo: imagen */}
          <div>
            <p className="text-sm font-medium text-[#1C1B1F] mb-2">Logo de la empresa</p>

            {values.imgFile ? (
              <div className="w-full rounded-2xl bg-white p-3 flex items-center gap-3">
                <img
                  src={imgUrl}
                  alt="Vista previa del logo"
                  className="w-16 h-16 rounded-xl object-cover bg-[#F1EEF4]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1C1B1F] truncate">{values.imgFile.name}</p>
                  <p className="text-xs text-[#49454F]">
                    {(values.imgFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="text-xs font-medium text-[#1857B6] hover:bg-[#D8E2FF] rounded-full px-3 py-1.5 transition-colors"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) applyFile(file);
                }}
                onClick={() => inputRef.current?.click()}
                role="button"
                tabIndex={0}
                className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${dragOver
                  ? "border-[#8A6D00] bg-[#FFF7DE]"
                  : mostrarError("imgFile")
                    ? "border-[#B3261E] bg-[#F9DEDC]/40"
                    : "border-[#79747E] bg-white hover:bg-[#FFF7DE]"
                  }`}
              >
                <div className="mx-auto w-10 h-10 rounded-full bg-[#FFE28A] flex items-center justify-center mb-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A6D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
                    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                  </svg>
                </div>
                <p className="text-sm text-[#1C1B1F]">
                  Arrastra una imagen aquí o{" "}
                  <span className="text-[#1857B6] font-medium underline underline-offset-2">
                    selecciona un archivo
                  </span>
                </p>
                <p className="text-xs text-[#49454F] mt-1">PNG, JPG hasta 5MB</p>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              name="imgFile"
              accept="image/*"
              className="hidden"
              onBlur={handleBlur}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) applyFile(file);
              }}
            />
            {mostrarError("imgFile") && (
              <p className="mt-1.5 ml-1 text-xs text-[#B3261E]">{errors.imgFile}</p>
            )}
          </div>

          {/* Botón filled M3 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-full bg-[#1857B6] text-white text-sm font-medium tracking-wide
              shadow-[0_1px_2px_rgba(0,0,0,0.15),0_1px_3px_1px_rgba(0,0,0,0.08)]
              hover:bg-[#1E63CC] hover:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_4px_8px_3px_rgba(0,0,0,0.1)]
              active:bg-[#154E9E] transition-all disabled:opacity-40 disabled:shadow-none"
          >
            {isSubmitting ? "Registrando…" : "Registrar empresa"}
          </button>
        </form>
      </main>
    </div>
  );
}