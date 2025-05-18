package com.mgmtp.cfu.enums;

import lombok.Getter;

@Getter
public enum CoursePlatform {
    UDEMY("Udemy"),
    COURSERA("Coursera"),
    COURSE4U("Course4U"),
    LINKEDIN("LinkedIn"),
    OTHER("Other");

    private final String label;

    CoursePlatform(String label) {
        this.label = label;
    }

    public static CoursePlatform fromLabel(String label) {
        for (CoursePlatform platform : values()) {
            if (platform.getLabel().equalsIgnoreCase(label)) {
                return platform;
            }
        }
        return OTHER;
    }
}
