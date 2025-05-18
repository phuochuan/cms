package com.mgmtp.cfu.v2.ai.interactors;

import com.mgmtp.cfu.entity.Course;
import com.mgmtp.cfu.enums.CourseLevel;
import com.mgmtp.cfu.service.impl.ResourceServiceImpl;
import com.mgmtp.cfu.v2.ai.integration.DeepSeekRecommendedCoursesResponse;
import com.mgmtp.cfu.v2.ai.representation_models.DeepSeekCourseResponse;
import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;

import java.nio.charset.StandardCharsets;
import java.io.IOException;

import org.springframework.util.StreamUtils;

import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
public class FindingSuitableCoursePromptBuilder {
    List<Course> alreadyCourses;

    ResourceServiceImpl resourceService;

    String userMessage;

    public String build() throws IOException {
        Resource resource = resourceService.loadResourceByName("/ai/finding_suitable_courses_prompt.txt");

        String prompt = readResourceAsString(resource);

        String alreadyCoursesString = alreadyCourses.stream().map(Course::buildShortIntro).collect(Collectors.joining(";"));

        String responseClass = ClassDefinitionBuilder.buildClassDefinition(
            DeepSeekRecommendedCoursesResponse.class
        ) + " " + ClassDefinitionBuilder.buildClassDefinition(
            DeepSeekCourseResponse.class
        ) + " " + ClassDefinitionBuilder.buildClassDefinition(
            CourseLevel.class
        );

        prompt = prompt.replace("{{already_courses}}", alreadyCoursesString);

        prompt = prompt.replace("{{user_message}}", userMessage);

        prompt = prompt.replace("{{response_class}}", responseClass);

        return prompt;
    }

    public String readResourceAsString(Resource resource) throws IOException {
        return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
    }
}
