package com.example.htms.enumation;

import lombok.Getter;

@Getter
public enum BookingStatusEnum {
    Completed("Completed"),
    Confirmed("Confirmed"),
    Cancelled("Cancelled");

    private final String value;

    BookingStatusEnum(String value) {
        this.value = value;
    }

}
