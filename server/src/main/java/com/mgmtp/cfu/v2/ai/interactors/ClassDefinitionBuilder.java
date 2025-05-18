package com.mgmtp.cfu.v2.ai.interactors;

import java.lang.reflect.Field;

public class ClassDefinitionBuilder {
    public static String buildClassDefinition(Class clazz) {
        StringBuilder classDefinition = new StringBuilder();

        Class<?> superclass = clazz.getSuperclass();
        if (superclass != null) {
            classDefinition.append("public class ")
                .append(clazz.getSimpleName())
                .append(" extends ")
                .append(superclass.getSimpleName())
                .append(" {\n");
        } else {
            classDefinition.append("public class ")
                .append(clazz.getSimpleName())
                .append(" {\n");
        }

        // Use reflection to get fields
        Field[] fields = clazz.getDeclaredFields();
        for (Field field : fields) {
            classDefinition.append("    ")
                .append(field.getType().getSimpleName())
                .append(" ")
                .append(field.getName())
                .append(";\n");
        }
        classDefinition.append("}");

        return classDefinition.toString();
    }
}

