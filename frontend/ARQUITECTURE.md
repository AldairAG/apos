Stack tecnológico

El frontend utiliza:

React Native
Expo
Expo Router
TypeScript
Redux Toolkit
AsyncStorage
NativeWind
Tailwind CSS
Formik
Yup

La aplicación está estructurada para mantener separadas:

UI
Estado global
Casos de uso
Comunicación con API
Tipos / DTOs
Componentes reutilizables

Feature-based architecture

Las funcionalidades deben organizarse por módulo o dominio.

Ejemplo conceptual:

features/
├── productos/
├── materiales/
├── recetas/
├── modificadores/
├── inventario/
├── caja/
├── mesas/
├── ordenes/
└── configuracion/

Cada feature debe contener únicamente código relacionado con ese dominio.

No colocar lógica específica de productos dentro de caja, ni lógica de caja dentro de productos.

Features

Cada módulo funcional debe tener una estructura similar a:

features/
└── productos/
    ├── application/
    │   ├── usecase/
    │   └── query/
    │
    ├── domain/
    │   ├── enums/
    │   └── types/
    │
    ├── infrastructure/
    │   └── api/
    │
    ├── presentation/
    │   ├── components/
    │   ├── hooks/
    │   └── forms/
    │
    └── store/
        ├── productoSlice.ts
        └── ...