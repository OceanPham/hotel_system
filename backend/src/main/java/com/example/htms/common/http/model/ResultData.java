package com.example.htms.common.http.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

@JsonSerialize
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResultData<T> extends Result {

    @JsonProperty("data")
    private T resultData;

    @JsonProperty("total")
    private Integer total; // ✅ Thêm thuộc tính total

    public ResultData() {
        super();
    }

    public ResultData(String status) {
        super(status);
    }

    public ResultData(Status status, T resultData) {
        super(status);
        this.resultData = resultData;
    }

    public ResultData(String status, T resultData) {
        super(status);
        this.resultData = resultData;
    }

    public ResultData(String status, String msg, T resultData) {
        super(status, msg);
        this.resultData = resultData;
    }

    public ResultData(String status, String code, String msg, T resultData) {
        super(status, code, msg);
        this.resultData = resultData;
    }

    // ✅ Constructor mới hỗ trợ total
    public ResultData(String status, T resultData, Integer total) {
        super(status);
        this.resultData = resultData;
        this.total = total;
    }

    public T getResultData() {
        return resultData;
    }

    public void setResultData(T resultData) {
        this.resultData = resultData;
    }

    public Integer getTotal() {
        return total;
    }

    public void setTotal(Integer total) {
        this.total = total;
    }

    @Override
    public String toString() {
        return "ResultData [resultData=" + resultData + ", total=" + total + "]";
    }
}
