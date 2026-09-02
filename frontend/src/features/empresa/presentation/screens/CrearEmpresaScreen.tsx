import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEmpresa } from "../hook/useEmpresa";
import { router } from "expo-router";
import { ROUTES } from "@/routes/routes";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

type Step = 1 | 2;

// ---------- Paso 1: nombre ----------
interface NombreFormValues {
  nombre: string;
}

const nombreSchema = Yup.object({
  nombre: Yup.string().trim().required("Ingresa el nombre de la empresa."),
});

// ---------- Paso 2: imagen ----------
interface ImagenFormValues {
  imgFile: File | null;
}

const imagenSchema = Yup.object({
  imgFile: Yup.mixed<File>()
    .nullable()
    .test("fileType", "El archivo debe ser una imagen.", (value) => {
      if (!value) return true;
      return value instanceof File && value.type.startsWith("image/");
    })
    .test("fileSize", "La imagen no debe superar 5MB.", (value) => {
      if (!value) return true;
      return value instanceof File && value.size <= MAX_FILE_SIZE_BYTES;
    }),
});

export default function CrearEmpresaScreen() {
  // NOTA: asumo que `useEmpresa` expone (o vas a agregar):
  // - crearEmpresa({ nombre }) -> { success, data: { id, nombre } }
  // - subirLogoEmpresa(empresaId: string, file: File) -> { success }
  // Ajusta los nombres/firmas a tu implementación real.
  const { crearEmpresa, subirLogoEmpresa } = useEmpresa();

  const [step, setStep] = useState<Step>(1);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [empresaNombre, setEmpresaNombre] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [errorApi, setErrorApi] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ----- Formik paso 1: crear empresa -----
  const formikNombre = useFormik<NombreFormValues>({
    initialValues: { nombre: "" },
    validationSchema: nombreSchema,
    onSubmit: async (values) => {
      setErrorApi("");
      const result = await crearEmpresa({ nombre: values.nombre.trim() });

      if (result.success) {
        setEmpresaId(result.data.id);
        setEmpresaNombre(values.nombre.trim());
        setStep(2);
      } else {
        setErrorApi("No se pudo registrar la empresa. Intenta de nuevo.");
      }
    },
  });

  // ----- Formik paso 2: subir logo (opcional) -----
  const formikImagen = useFormik<ImagenFormValues>({
    initialValues: { imgFile: null },
    validationSchema: imagenSchema,
    onSubmit: async (values) => {
      if (!empresaId) return;

      if (!values.imgFile) {
        finalizar();
        return;
      }

      setErrorApi("");
      const result = await subirLogoEmpresa(empresaId, values.imgFile);

      if (result.success) {
        finalizar();
      } else {
        setErrorApi("La empresa se guardó, pero el logo no se pudo subir. Puedes omitirlo o reintentar.");
      }
    },
  });

  const finalizar = () => {
    router.replace(ROUTES.ADMIN.HOME);
  };

  const omitirImagen = () => {
    finalizar();
  };

  // Vista previa de la imagen seleccionada
  useEffect(() => {
    if (!formikImagen.values.imgFile) {
      setImgUrl("");
      return;
    }
    const url = URL.createObjectURL(formikImagen.values.imgFile);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [formikImagen.values.imgFile]);

  const applyFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      formikImagen.setFieldValue("imgFile", null);
      return;
    }
    formikImagen.setFieldValue("imgFile", file);
    formikImagen.setFieldTouched("imgFile", true, false);
  };

  const removeImage = () => {
    formikImagen.setFieldValue("imgFile", null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const mostrarErrorNombre =
    Boolean(formikNombre.errors.nombre) &&
    (formikNombre.touched.nombre || formikNombre.submitCount > 0);

  const mostrarErrorImagen =
    Boolean(formikImagen.errors.imgFile) &&
    (formikImagen.touched.imgFile || formikImagen.submitCount > 0);

  return (
    <div className="min-h-screen bg-[#F1EEF4] flex flex-col">
      {/* Top app bar M3 */}
      <header className="h-16 shrink-0 bg-[#FFFBFE] flex items-center gap-2 px-4 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
        <button
          type="button"
          aria-label="Volver"
          onClick={() => (step === 2 ? setStep(1) : router.back())}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F1EEF4] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1C1B1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-medium text-[#1C1B1F]">Registrar empresa</h1>
      </header>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 pt-6">
        <div className={`h-2 w-8 rounded-full transition-colors ${step >= 1 ? "bg-[#1857B6]" : "bg-[#CAC4D0]"}`} />
        <div className={`h-2 w-8 rounded-full transition-colors ${step >= 2 ? "bg-[#1857B6]" : "bg-[#CAC4D0]"}`} />
      </div>
      <p className="text-center text-xs text-[#49454F] mt-1">
        Paso {step} de 2 · {step === 1 ? "Datos de la empresa" : "Logo (opcional)"}
      </p>

      {/* Contenido de la pantalla */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        {errorApi && (
          <div className="max-w-md mx-auto mb-4 rounded-2xl bg-[#F9DEDC] text-[#B3261E] text-sm px-4 py-3">
            {errorApi}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={formikNombre.handleSubmit} className="max-w-md mx-auto space-y-7" noValidate>
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
                  value={formikNombre.values.nombre}
                  onChange={formikNombre.handleChange}
                  onBlur={formikNombre.handleBlur}
                  className={`peer w-full h-14 rounded-t-[4px] px-4 pt-5 pb-1.5 text-[#1C1B1F] bg-white outline-none border-b-2 transition-colors placeholder-transparent ${mostrarErrorNombre
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
              {mostrarErrorNombre && (
                <p className="mt-1.5 ml-4 text-xs text-[#B3261E]">{formikNombre.errors.nombre}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={formikNombre.isSubmitting}
              className="w-full h-12 rounded-full bg-[#1857B6] text-white text-sm font-medium tracking-wide
                shadow-[0_1px_2px_rgba(0,0,0,0.15),0_1px_3px_1px_rgba(0,0,0,0.08)]
                hover:bg-[#1E63CC] hover:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_4px_8px_3px_rgba(0,0,0,0.1)]
                active:bg-[#154E9E] transition-all disabled:opacity-40 disabled:shadow-none"
            >
              {formikNombre.isSubmitting ? "Guardando…" : "Continuar"}
            </button>
          </form>
        ) : (
          <form onSubmit={formikImagen.handleSubmit} className="max-w-md mx-auto space-y-7" noValidate>
            <div className="rounded-2xl bg-white px-4 py-3">
              <p className="text-xs text-[#49454F]">Empresa registrada</p>
              <p className="text-sm font-medium text-[#1C1B1F]">{empresaNombre}</p>
            </div>

            {/* Campo: imagen */}
            <div>
              <p className="text-sm font-medium text-[#1C1B1F] mb-2">Logo de la empresa (opcional)</p>

              {formikImagen.values.imgFile ? (
                <div className="w-full rounded-2xl bg-white p-3 flex items-center gap-3">
                  <img
                    src={imgUrl}
                    alt="Vista previa del logo"
                    className="w-16 h-16 rounded-xl object-cover bg-[#F1EEF4]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1C1B1F] truncate">{formikImagen.values.imgFile.name}</p>
                    <p className="text-xs text-[#49454F]">
                      {(formikImagen.values.imgFile.size / 1024).toFixed(0)} KB
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
                    : mostrarErrorImagen
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
                onBlur={formikImagen.handleBlur}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) applyFile(file);
                }}
              />
              {mostrarErrorImagen && (
                <p className="mt-1.5 ml-1 text-xs text-[#B3261E]">{formikImagen.errors.imgFile}</p>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={formikImagen.isSubmitting}
                className="w-full h-12 rounded-full bg-[#1857B6] text-white text-sm font-medium tracking-wide
                  shadow-[0_1px_2px_rgba(0,0,0,0.15),0_1px_3px_1px_rgba(0,0,0,0.08)]
                  hover:bg-[#1E63CC] hover:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_4px_8px_3px_rgba(0,0,0,0.1)]
                  active:bg-[#154E9E] transition-all disabled:opacity-40 disabled:shadow-none"
              >
                {formikImagen.isSubmitting
                  ? "Guardando…"
                  : formikImagen.values.imgFile
                    ? "Guardar logo"
                    : "Finalizar"}
              </button>

              {formikImagen.values.imgFile && (
                <button
                  type="button"
                  onClick={omitirImagen}
                  className="w-full h-12 rounded-full text-[#1857B6] text-sm font-medium hover:bg-[#D8E2FF] transition-colors"
                >
                  Omitir por ahora
                </button>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
}