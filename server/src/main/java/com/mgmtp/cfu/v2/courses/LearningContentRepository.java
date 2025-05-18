package com.mgmtp.cfu.v2.courses;

import com.mgmtp.cfu.v2.courses.models.LearningContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface LearningContentRepository extends JpaRepository<LearningContent, Long> {
    List<LearningContent> findAllByCourseId(Long courseId);
}
