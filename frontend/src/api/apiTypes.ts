// Tipos para las respuestas de la API
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Tipos específicos para web
export interface UploadProgressEvent {
    loaded: number;
    total?: number;
    progress?: number;
    lengthComputable?: boolean;
}

export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    details?: Record<string, unknown>;
}


export interface Page<T> {
    content: T[];
    page:{
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
    }
}

// Tipo para datos de request
export type RequestData = Record<string, unknown> | FormData | string | null | unknown;