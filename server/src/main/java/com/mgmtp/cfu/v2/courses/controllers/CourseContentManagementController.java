package com.mgmtp.cfu.v2.courses.controllers;

import com.mgmtp.cfu.entity.Course;
import com.mgmtp.cfu.repository.CourseRepository;
import com.mgmtp.cfu.service.impl.UploadServiceImpl;
import com.mgmtp.cfu.v2.courses.LearningContentRepository;
import com.mgmtp.cfu.v2.courses.models.LearningContent;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v2/courses")
@RequiredArgsConstructor
public class CourseContentManagementController {
    private final LearningContentRepository learningContentRepository;

    private final CourseRepository courseRepository;

    private final UploadServiceImpl uploadService;

    @Value("${course4u.upload.video-directory}")
    private String uploadThumbnailDir;


    @GetMapping("/{courseId}/content")
    public ResponseEntity<List<LearningContent>> getContent(@PathVariable("courseId") final Long courseId) {
        List<LearningContent> contents = learningContentRepository.findAllByCourseId(courseId);

        return ResponseEntity.ok(contents);
    }

    @PostMapping("/{courseId}/content")
    public ResponseEntity<LearningContent> createContent(@PathVariable("courseId") final Long courseId,
                                                         @RequestBody final LearningContent content) {
        Course course = courseRepository.findById(courseId).orElse(null);

        content.setCourse(course);

        return ResponseEntity.ok(learningContentRepository.save(content));
    }

    @PutMapping("/{courseId}/content/{contentId}")
    public ResponseEntity<LearningContent> updateContent(
        @PathVariable("courseId") final Long courseId,
        @PathVariable("contentId") final Long contentId,
        @RequestBody final LearningContent content) {

        Course course = courseRepository.findById(courseId).orElse(null);

        content.setCourse(course);

        learningContentRepository.save(content);

        return ResponseEntity.ok(learningContentRepository.save(content));
    }

    @DeleteMapping("/{courseId}/content/{id}")
    public ResponseEntity<Void> deleteContent(@PathVariable("courseId") final Long id) {
        learningContentRepository.deleteById(id);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/content/videos")
    public ResponseEntity<String> uploadVideo(
        @RequestParam("video") MultipartFile file
    ) throws IOException {
        String name = uploadService.uploadVideo(file, uploadThumbnailDir);

        String url = "/video/" + name;

        return ResponseEntity.ok(url);
    }

}
