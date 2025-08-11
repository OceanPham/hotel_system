package com.example.htms.enumation;

import lombok.Getter;

@Getter
public enum RoleEnum {
    USER("USER"),
    ACCOUNTANT("ACCOUNTANT"),
    STAFF("STAFF");


    private final String value;

    RoleEnum(String value) {
        this.value = value;
    }

    public static RoleEnum fromString(String value) {
        for (RoleEnum role : values()) {
            if (role.value.equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("No enum constant for value: " + value);
    }
}