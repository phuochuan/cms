package com.mgmtp.cfu.v2.courses.controllers;

import com.mgmtp.cfu.entity.Category;
import com.mgmtp.cfu.entity.Course;
import com.mgmtp.cfu.enums.CourseLevel;
import com.mgmtp.cfu.enums.CoursePlatform;
import com.mgmtp.cfu.enums.CourseStatus;
import com.mgmtp.cfu.repository.CategoryRepository;
import com.mgmtp.cfu.repository.CourseRepository;
import com.mgmtp.cfu.v2.courses.LearningContentRepository;
import com.mgmtp.cfu.v2.courses.models.LearningContent;
import com.mgmtp.cfu.v2.courses.models.LearningContentType;
import com.mgmtp.cfu.v2.courses.representation_models.InsideCourseResponseModel;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Limit;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v2/courses")
@RequiredArgsConstructor
public class CourseManagementController {
    private final CourseRepository courseRepository;

    private final CategoryRepository categoryRepository;

    private final LearningContentRepository learningContentRepository;

    @GetMapping("")
    public ResponseEntity<List<Course>> findAll() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @GetMapping("/inside-courses")
    public ResponseEntity<List<InsideCourseResponseModel>> findAllInsideCourses() {
        try {
            List<InsideCourseResponseModel> courses = courseRepository.findInsideCourseResponseModelAllByPlatform(CoursePlatform.COURSE4U);

                courses.sort((o1, o2) -> o2.getId().compareTo(o1.getId()));

            return ResponseEntity.ok(courses.stream().peek(insideCourseResponseModel -> {
                List<Category> categories = categoryRepository.findAllCategoriesByCourseId(insideCourseResponseModel.getId());

                insideCourseResponseModel.setCategories(categories);

            }).toList());

        } catch (Exception e) {
            e.printStackTrace();
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("")
    public ResponseEntity<Course> create(@RequestBody final Course course) {
        return ResponseEntity.ok(courseRepository.save(course));
    }

    @PutMapping
    public ResponseEntity<Course> update(@RequestBody final Course course) {
        return ResponseEntity.ok(courseRepository.save(course));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") final Long id) {
        courseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }


    @PostConstruct()
    public void init() {
        Category category1 = Category.builder().name("aws").build();
        Category category2 = Category.builder().name("aws").build();
        Category category3 = Category.builder().name("aws").build();

        categoryRepository.save(category1);
        categoryRepository.save(category2);
        categoryRepository.save(category3);

        Course course1 = Course.builder()
            .name("Java Spring Boot Masterclass")
            .link("https://example.com/java-spring")
            .platform(CoursePlatform.COURSE4U)
            .level(CourseLevel.INTERMEDIATE)
            .thumbnailUrl("https://example.com/thumb1.jpg")
            .teacherName("Nguyen Van A")
            .createdDate(LocalDate.now())
            .status(CourseStatus.AVAILABLE)
            .categories(Set.of(category2, category3))
            .build();

        Course course2 = Course.builder()
            .name("React Frontend Basics")
            .link("https://example.com/react-course")
            .platform(CoursePlatform.COURSE4U)
            .level(CourseLevel.INTERMEDIATE)
            .thumbnailUrl("https://example.com/thumb1.jpg")
            .teacherName("Nguyen Van A")
            .createdDate(LocalDate.now())
            .status(CourseStatus.AVAILABLE)
            .categories(Set.of(category2, category3))
            .build();

        Course course3 = Course.builder()
            .name("Advanced PostgreSQL Inside")
            .link(null)  // Inside course, không có link
            .platform(CoursePlatform.COURSERA)
            .level(CourseLevel.BEGINNER)
            .thumbnailUrl("https://example.com/thumb1.jpg")
            .teacherName("Nguyen Van A")
            .createdDate(LocalDate.now())
            .status(CourseStatus.AVAILABLE)
            .categories(Set.of(category2, category3))
            .build();

        Course course4 = Course.builder()
            .name("Docker & Jenkins CI/CD")
            .link("https://example.com/devops-course")
            .platform(CoursePlatform.UDEMY)
            .level(CourseLevel.INTERMEDIATE)
            .thumbnailUrl("https://example.com/thumb1.jpg")
            .teacherName("Nguyen Van A")
            .createdDate(LocalDate.now())
            .status(CourseStatus.AVAILABLE)
            .categories(Set.of(category2, category3))
            .build();

        Course course5 = Course.builder()
            .name("AWS Cloud Practitioner Inside")
            .link(null)
            .platform(CoursePlatform.OTHER)
            .level(CourseLevel.ADVANCED)
            .thumbnailUrl("https://example.com/thumb1.jpg")
            .teacherName("Nguyen Van A")
            .createdDate(LocalDate.now())
            .status(CourseStatus.AVAILABLE)
            .categories(Set.of(category2, category3, category1))
            .build();

        courseRepository.save(course1);

        courseRepository.save(course2);

        courseRepository.save(course3);

        courseRepository.save(course4);

        courseRepository.save(course5);

        LearningContent chapter1 = LearningContent.builder()
            .title("Chapter 1: Introduction")
            .description("This chapter introduces the basics of the course.")
            .type(LearningContentType.CHAPTER)
            .videoUrl(null) // Chapter không cần video
            .course(course1)
            .build();

        chapter1 = learningContentRepository.save(chapter1);

        LearningContent lecture1 = LearningContent.builder()
            .title("Lecture 1: What is Spring Boot?")
            .description("An overview of Spring Boot and its features.")
            .type(LearningContentType.LECTURE)
            .videoUrl("https://example.com/video1.mp4")
            .course(course1)
            .parent(chapter1)
            .build();

        LearningContent lecture2 = LearningContent.builder()
            .title("Lecture 2: Setting up the Environment")
            .description("Guide to setting up Java, Maven, and IDE.")
            .type(LearningContentType.LECTURE)
            .videoUrl("https://example.com/video2.mp4")
            .course(course1)
            .parent(chapter1)
            .build();

        LearningContent chapter2 = LearningContent.builder()
            .title("Chapter 2: Core Concepts")
            .description("Covers core concepts such as dependency injection.")
            .type(LearningContentType.CHAPTER)
            .videoUrl(null)
            .course(course1)
            .build();

        chapter2 = learningContentRepository.save(chapter2);

        LearningContent lecture3 = LearningContent.builder()
            .title("Lecture 3: Creating Your First Spring Boot App")
            .description("Step-by-step guide to creating your first app.")
            .type(LearningContentType.LECTURE)
            .videoUrl("https://example.com/video3.mp4")
            .course(course1)
            .parent(chapter2)
            .build();

        List<LearningContent> contents = List.of(lecture1, lecture2, lecture3);

        learningContentRepository.saveAll(contents);
    }


}
