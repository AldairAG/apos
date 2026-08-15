package com.api.apos.helpers;

public class ApiResponseWrapper<T> {
    private boolean success;
    private T data;
    private String message;
    private String codeError;

    public ApiResponseWrapper(boolean success, T data, String message, String codeError) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.codeError = codeError;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCodeError() {
        return codeError;
    }

    public void setCodeError(String codeError) {
        this.codeError = codeError;
    }
}
