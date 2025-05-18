package com.mgmtp.cfu.v2.ai.controllers;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mgmtp.cfu.entity.Category;
import com.mgmtp.cfu.entity.Course;
import com.mgmtp.cfu.entity.User;
import com.mgmtp.cfu.enums.CoursePlatform;
import com.mgmtp.cfu.repository.CourseRepository;
import com.mgmtp.cfu.repository.UserRepository;
import com.mgmtp.cfu.service.OpenGraphService;
import com.mgmtp.cfu.service.impl.ResourceServiceImpl;
import com.mgmtp.cfu.util.AuthUtils;
import com.mgmtp.cfu.v2.ai.integration.DeepSeek;
import com.mgmtp.cfu.v2.ai.integration.DeepSeekChatCompletionResponse;
import com.mgmtp.cfu.v2.ai.integration.DeepSeekRecommendedCoursesResponse;
import com.mgmtp.cfu.v2.ai.interactors.FindingSuitableCoursePromptBuilder;
import com.mgmtp.cfu.v2.ai.models.AIFakeRegistration;
import com.mgmtp.cfu.v2.ai.models.AIMessage;
import com.mgmtp.cfu.v2.ai.models.AIThread;
import com.mgmtp.cfu.v2.ai.repositories.AIFakeRegistrationRepository;
import com.mgmtp.cfu.v2.ai.repositories.AIMessageRepository;
import com.mgmtp.cfu.v2.ai.repositories.AIThreadRepository;
import com.mgmtp.cfu.v2.ai.representation_models.CourseRecommendationResponse;
import com.mgmtp.cfu.v2.courses.representation_models.CourseRecommendationRequestion;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Limit;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v2/ai/courses/recommendation")
@RequiredArgsConstructor
public class CourseRecommendationUsingAIController {
    private final CourseRepository courseRepo;

    private final ResourceServiceImpl resourceService;

    private final AIFakeRegistrationRepository aiFakeRegistrationRepo;

    private final AIMessageRepository aiMessageRepo;

    private final AIThreadRepository aiThreadRepo;

    private final UserRepository userRepo;

    private final OpenGraphService openGraphService;

    @PostMapping
    public ResponseEntity<?> recommendationUsingAI(
        @RequestBody CourseRecommendationRequestion courseRecommendationRequestion
    ) throws IOException {
        DeepSeekRecommendedCoursesResponse deepSeekRecommendedCoursesResponse = getDeepSeekRecommendedCoursesResponse(courseRecommendationRequestion);

        AIMessage aiMessage = saveDeepSeekRecommendedCoursesResponse(deepSeekRecommendedCoursesResponse, courseRecommendationRequestion);

//        CourseRecommendationResponse courseRecommendationResponse = new CourseRecommendationResponse(deepSeekRecommendedCoursesResponse.getAssistantResponseGreetingMessage(), aiFakeRegistrations);

        return new ResponseEntity<>(aiMessage, HttpStatus.OK);
    }

    private AIMessage saveDeepSeekRecommendedCoursesResponse(DeepSeekRecommendedCoursesResponse deepSeekRecommendedCoursesResponse, CourseRecommendationRequestion courseRecommendationRequestion) {
        AIThread aiThread = null;

        if (courseRecommendationRequestion.getAiThreadId() != null) {
            aiThread = aiThreadRepo.findById(courseRecommendationRequestion.getAiThreadId()).orElse(null);
        }

        if (courseRecommendationRequestion.getAiThreadId() == null || aiThread == null) {
            LocalDateTime now = LocalDateTime.now();

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy HH:mm");

            String date = now.format(formatter);

            User currentUser = AuthUtils.getCurrentUser();

            aiThread = AIThread
                .builder()
                .content(deepSeekRecommendedCoursesResponse.getMainRequirement())
                .createdDate(date)
                .user(currentUser)
                .build();

            aiThread = aiThreadRepo.save(aiThread);
        }

        AIMessage userMessage = AIMessage.builder()
            .role("user")
            .thread(aiThread)
            .message("userMessage")
            .build();

        AIMessage assistantMessage = AIMessage.builder()
            .role("assistant")
            .thread(aiThread)
            .message(deepSeekRecommendedCoursesResponse.getAssistantResponseGreetingMessage())
            .build();

        aiMessageRepo.save(userMessage);

        AIMessage finalAssistantMessage = aiMessageRepo.save(assistantMessage);


        List<AIFakeRegistration> aiFakeRegistrations = deepSeekRecommendedCoursesResponse.getDeepSeekCourseResponses().stream()
            .map(deepSeekCourseResponse -> new AIFakeRegistration(deepSeekCourseResponse, finalAssistantMessage)).peek(
                aiFakeRegistration -> {
                    if (aiFakeRegistration.getCourseId() != null) {

                        Course course = courseRepo.findById(aiFakeRegistration.getCourseId()).orElse(null);

                        if (course == null) {
                            return;
                        }

                        aiFakeRegistration.setPlatform(course.getPlatform());

                        aiFakeRegistration.setName(course.getName());

                        aiFakeRegistration.setDescription(course.getDescription());

                        aiFakeRegistration.setLevel(course.getLevel());

                        aiFakeRegistration.setCategories(course.getCategories().stream().map(Category::getName).collect(Collectors.joining(", ")));

                        aiFakeRegistration.setThumbnailUrl(course.getThumbnailUrl());

                        aiFakeRegistration.setTeacherName(course.getTeacherName());
                    } else {
                        Map<String, String> metaDataMap = openGraphService.getCourseInfo(aiFakeRegistration.getLink());

                        CoursePlatform platform = CoursePlatform.fromLabel(metaDataMap.get("site_name"));

                        aiFakeRegistration.setPlatform(platform);

                        aiFakeRegistration.setThumbnailUrl(metaDataMap.get("image"));

                        aiFakeRegistration.setName(metaDataMap.get("title"));

                        aiFakeRegistration.setDescription(metaDataMap.get("description"));
                    }
                }
            ).filter(aiFakeRegistration -> aiFakeRegistration.getName() != null).toList();


        aiFakeRegistrationRepo.saveAll(aiFakeRegistrations);

        return finalAssistantMessage;
    }

    private DeepSeekRecommendedCoursesResponse getDeepSeekRecommendedCoursesResponse(CourseRecommendationRequestion courseRecommendationRequestion) throws IOException {
        List<Course> courses = courseRepo.findAllByPlatform(CoursePlatform.COURSE4U, Limit.of(100));

        FindingSuitableCoursePromptBuilder findingSuitableCoursePromptBuilder
            = new FindingSuitableCoursePromptBuilder(courses, resourceService, courseRecommendationRequestion.getUserMessage());

        String message = findingSuitableCoursePromptBuilder.build();

//        DeepSeek deepSeek = new DeepSeek(message);
//
//        DeepSeekChatCompletionResponse deepSeekChatCompletionResponse = deepSeek.chatCompletion();
//
//        String result = deepSeekChatCompletionResponse.getMessageContent();

        String result = "{\n" +
            "  \"mainRequirement\" : \"AWS, Python, Salesforce\",\n" +
            "  \"assistantResponseGreetingMessage\" : \"Here are some recommended courses for AWS, Python, and Salesforce:\",\n" +
            "  \"deepSeekCourseResponses\" : [ {\n" +
            "    \"link\" : \"https://www.coursera.org/learn/aws-cloud-techniques\",\n" +
            "    \"teacherName\" : \"Morgan Willis\",\n" +
            "    \"categories\" : \"AWS, Cloud Computing\",\n" +
            "    \"level\" : \"BEGINNER\",\n" +
            "    \"durationPerWeek\" : 4\n" +
            "  }, {\n" +
            "    \"link\" : \"https://www.udemy.com/course/complete-python-bootcamp/\",\n" +
            "    \"teacherName\" : \"Jose Portilla\",\n" +
            "    \"categories\" : \"Python, Programming\",\n" +
            "    \"level\" : \"BEGINNER\",\n" +
            "    \"durationPerWeek\" : 5\n" +
            "  }, {\n" +
            "    \"link\" : \"https://www.udemy.com/course/salesforce-admin-certification-course/\",\n" +
            "    \"teacherName\" : \"Mike Wheeler\",\n" +
            "    \"categories\" : \"Salesforce, CRM\",\n" +
            "    \"level\" : \"INTERMEDIATE\",\n" +
            "    \"durationPerWeek\" : 6\n" +
            "  } ]\n" +
            "}";

        DeepSeekRecommendedCoursesResponse deepSeekRecommendedCoursesResponse = new ObjectMapper().readValue(result, DeepSeekRecommendedCoursesResponse.class);

        return deepSeekRecommendedCoursesResponse;
    }

    @GetMapping("/threads")
    public ResponseEntity<List<AIThread>> getThreads() {
        User currentUser = AuthUtils.getCurrentUser();

        var result = aiThreadRepo.findAllByUserId(currentUser.getId());

        result.sort((o1, o2) -> o2.getId().compareTo(o1.getId()));

        return ResponseEntity.ok(result);
    }

    @GetMapping("/threads/{id}/messages")
    public ResponseEntity<List<?>> getThreadContent(@PathVariable long id) {

        return ResponseEntity.ok(aiMessageRepo.findAllByThreadId(id));
    }

    @GetMapping("/threads/messages/{id}/fake-registration")
    public ResponseEntity<List<?>> getFakeRegistration(@PathVariable long id) {

        return ResponseEntity.ok(aiFakeRegistrationRepo.findByAiMessageId(id));
    }


    //    -------------------------------------------------------------------------------------------------------------------------
    int i = 1;

    @PostConstruct
    public void init() throws JsonProcessingException {
        if (i >= 3)
            return;

        i++;

        String result = "{\n" +
            "  \"mainRequirement\" : \"become backend engineer\",\n" +
            "  \"assistantResponseGreetingMessage\" : \"Here are some recommended courses to help you become a backend engineer.\",\n" +
            "  \"deepSeekCourseResponses\" : [ {\n" +
            "    \"courseId\" : \"1\",\n" +
            "    \"link\" : null,\n" +
            "    \"teacherName\" : null,\n" +
            "    \"categories\" : \"Java, Spring Boot\",\n" +
            "    \"level\" : \"INTERMEDIATE\",\n" +
            "    \"durationPerWeek\" : null\n" +
            "  }, {\n" +
            "    \"courseId\" : null,\n" +
            "    \"link\" : \"https://www.udemy.com/course/the-complete-web-development-bootcamp/\",\n" +
            "    \"teacherName\" : \"Dr. Angela Yu\",\n" +
            "    \"categories\" : \"Backend Development, Node.js, MongoDB\",\n" +
            "    \"level\" : \"BEGINNER\",\n" +
            "    \"durationPerWeek\" : 10\n" +
            "  }, {\n" +
            "    \"courseId\" : null,\n" +
            "    \"link\" : \"https://www.coursera.org/specializations/python\",\n" +
            "    \"teacherName\" : \"University of Michigan\",\n" +
            "    \"categories\" : \"Python, Django, Flask\",\n" +
            "    \"level\" : \"INTERMEDIATE\",\n" +
            "    \"durationPerWeek\" : 7\n" +
            "  } ]\n" +
            "}";

        DeepSeekRecommendedCoursesResponse deepSeekRecommendedCoursesResponse = new ObjectMapper().readValue(result, DeepSeekRecommendedCoursesResponse.class);

        LocalDateTime now = LocalDateTime.now();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy HH:mm");

        String date = now.format(formatter);

        User currentUser = userRepo.findById(4L).orElse(null);

        AIThread aiThread = AIThread
            .builder()
            .content(deepSeekRecommendedCoursesResponse.getMainRequirement())
            .createdDate(date)
            .user(currentUser)
            .build();

        aiThread = aiThreadRepo.save(aiThread);

        AIMessage userMessage = AIMessage.builder()
            .role("user")
            .thread(aiThread)
            .message("Learn about AWS and Python!")
            .build();

        AIMessage assistantMessage = AIMessage.builder()
            .role("assistant")
            .message(deepSeekRecommendedCoursesResponse.getAssistantResponseGreetingMessage())
            .thread(aiThread)
            .build();

        aiMessageRepo.save(userMessage);

        AIMessage finalAssistantMessage = aiMessageRepo.save(assistantMessage);

        List<AIFakeRegistration> aiFakeRegistrations = deepSeekRecommendedCoursesResponse.getDeepSeekCourseResponses().stream()
            .map(deepSeekCourseResponse -> new AIFakeRegistration(deepSeekCourseResponse, finalAssistantMessage)).peek(
                aiFakeRegistration -> {
                    if (aiFakeRegistration.getCourseId() != null) {

                        Course course = courseRepo.findById(aiFakeRegistration.getCourseId()).orElse(null);

                        if (course == null) {
                            return;
                        }

                        aiFakeRegistration.setPlatform(course.getPlatform());

                        aiFakeRegistration.setName(course.getName());

                        aiFakeRegistration.setDescription(course.getDescription());

                        aiFakeRegistration.setLevel(course.getLevel());

                        aiFakeRegistration.setCategories(course.getCategories().stream().map(Category::getName).collect(Collectors.joining(", ")));

                        aiFakeRegistration.setThumbnailUrl(course.getThumbnailUrl());

                        aiFakeRegistration.setTeacherName(course.getTeacherName());
                    } else {
                        Map<String, String> metaDataMap = openGraphService.getCourseInfo(aiFakeRegistration.getLink());

                        CoursePlatform platform = CoursePlatform.fromLabel(metaDataMap.get("site_name"));

                        aiFakeRegistration.setPlatform(platform);

                        aiFakeRegistration.setThumbnailUrl(metaDataMap.get("image"));

                        aiFakeRegistration.setName(metaDataMap.get("title"));

                        aiFakeRegistration.setDescription(metaDataMap.get("description"));
                    }
                }
            ).toList();

        aiFakeRegistrationRepo.saveAll(aiFakeRegistrations);

        init();
    }

}
