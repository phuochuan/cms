package com.mgmtp.cfu.v2.ai.representation_models;

import com.mgmtp.cfu.enums.CourseLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class DeepSeekCourseResponse {
    Long courseId;

    String link;

    String teacherName;

    String categories;

    CourseLevel level;

    Integer durationPerWeek;
}
