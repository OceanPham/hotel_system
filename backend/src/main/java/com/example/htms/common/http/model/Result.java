package com.example.htms.common.http.model;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import java.util.Date;

@JsonSerialize
@SuppressWarnings("unused")
public class Result {

    public static final String SUCCESS = "success";
    public static final String FAIL = "fail";
    public static final String ERROR = "error";
    public static final String PARAM_ERROR = "paramError";
    public static final String BO_ERROR = "boError";
    public static final String NO_DATA = "noData";
    public static final String FORBIDDEN = "forbidden";
    public static final String UNAUTHORIZED = "unauthorized";
    public static final String SESSION_TIMEOUT = "sessionTimeout";

    // Operation result
    private String status;
    // Result code
    private String retCode;
    // Message
    private String retMsg;
    // Date
    private String date;

    public Result() {
        this.status = Result.SUCCESS;
        this.retCode = "00";
        this.retMsg = "";
        setNowDate();
    }

    public Result(Status status) {
        if (status != null) {
            this.status = status.getStatus();
            this.retCode = status.getCode();
            this.retMsg = status.getMessage();
        }
        setNowDate();
    }

    public Result(String status) {
        this.status = status;
        if (Result.SUCCESS.equals(status)) {
            this.retMsg = "Processed successfully.";
            this.retCode = "00";
        } else if (Result.FAIL.equals(status)) {
            this.retCode = "10";
            this.retMsg = "A system error has occurred.";
        } else if (Result.NO_DATA.equals(status)) {
            this.retCode = "11";
            this.retMsg = "No device information found.";
        } else if (Result.ERROR.equals(status)) {
            this.retCode = "99";
            this.retMsg = "An integration error has occurred.";
        } else if (Result.PARAM_ERROR.equals(status)) {
            this.retCode = "98";
            this.retMsg = "Invalid parameter information.";
        } else if (Result.UNAUTHORIZED.equals(status)) {
            this.retCode = "401";
        } else if (Result.BO_ERROR.equals(status)) {
            this.retCode = "469";
        } else if (Result.SESSION_TIMEOUT.equals(status)) {
            this.retCode = "01";
        }
        setNowDate();
    }

    public Result(String status, String msg) {
        this.status = status;
        this.retMsg = msg;
        if (Result.SUCCESS.equals(status)) {
            this.retMsg = "Processed successfully.";
            this.retCode = "00";
        } else if (Result.FAIL.equals(status)) {
            this.retCode = "01";
        } else if (Result.NO_DATA.equals(status)) {
            this.retCode = "11";
        } else if (Result.ERROR.equals(status)) {
            this.retCode = "99";
        } else if (Result.PARAM_ERROR.equals(status)) {
            this.retCode = "98";
        } else if (Result.FORBIDDEN.equals(status)) {
            this.retCode = "403";
        } else if (Result.UNAUTHORIZED.equals(status)) {
            this.retCode = "401";
        } else if (Result.SESSION_TIMEOUT.equals(status)) {
            this.retCode = "01";
        } else if (Result.BO_ERROR.equals(status)) {
            this.retCode = "469";
        }
        setNowDate();
    }

    public Result(String status, String code, String msg) {
        this.status = status;
        this.retCode = code;
        this.retMsg = msg;
        setNowDate();
    }

    public Result(String success, long totalLeaveDays) {
        // Placeholder constructor (possibly unused)
    }

    public void setNowDate() {
        date = new Date().toString();
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRetCode() {
        return retCode;
    }

    public void setRetCode(String retCode) {
        this.retCode = retCode;
    }

    public String getRetMsg() {
        return retMsg;
    }

    public void setRetMsg(String retMsg) {
        this.retMsg = retMsg;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    @Override
    public String toString() {
        return "Result [status=" + status + ", retCode=" + retCode + ", retMsg=" + retMsg + ", date=" + date + "]";
    }
}
