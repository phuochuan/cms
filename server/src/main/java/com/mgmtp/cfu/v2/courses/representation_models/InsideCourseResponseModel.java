package com.mgmtp.cfu.v2.courses.representation_models;

import com.mgmtp.cfu.entity.Category;
import com.mgmtp.cfu.entity.Course;
import com.mgmtp.cfu.enums.CourseLevel;
import com.mgmtp.cfu.enums.CoursePlatform;
import com.mgmtp.cfu.enums.CourseStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.BeanUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
public class InsideCourseResponseModel {
    private Long id;
    private String name;
    private String link;
    private CoursePlatform platform;
    private String thumbnailUrl;
    private String teacherName;
    private LocalDate createdDate;
    private CourseStatus status;
    private CourseLevel level;
    private Long totalChapter;
    private List<Category> categories;

    public InsideCourseResponseModel(Long id, String name, String link, CoursePlatform platform, String thumbnailUrl,
                                     String teacherName, LocalDate createdDate, CourseStatus status,
                                     CourseLevel level, Long totalChapter) {
        this.id = id;
        this.name = name;
        this.link = link;
        this.platform = platform;
        this.thumbnailUrl = thumbnailUrl;
        this.teacherName = teacherName;
        this.createdDate = createdDate;
        this.status = status;
        this.level = level;
        this.totalChapter = totalChapter;
    }
}

