package com.mgmtp.cfu.v2.ai.models;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mgmtp.cfu.enums.CourseLevel;
import com.mgmtp.cfu.enums.CoursePlatform;
import com.mgmtp.cfu.v2.ai.representation_models.DeepSeekCourseResponse;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.BeanUtils;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Builder
public class AIFakeRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String name;

    Long courseId;

    String link;

    String teacherName;

    String description;

    LocalDateTime createdDate;

    String categories;

    @Enumerated(EnumType.STRING)
    CourseLevel level;

    String thumbnailUrl;

    Integer durationPerWeek;

    @Enumerated(EnumType.STRING)
    CoursePlatform platform;

    @ManyToOne
    @JsonIgnore
    AIMessage aiMessage;

    public AIFakeRegistration(DeepSeekCourseResponse deepSeekCourseResponse,AIMessage aiMessage) {
        BeanUtils.copyProperties(deepSeekCourseResponse, this);

        this.createdDate = LocalDateTime.now();

        this.aiMessage = aiMessage;
    }

}
