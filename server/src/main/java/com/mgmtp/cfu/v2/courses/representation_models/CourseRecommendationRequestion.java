package com.mgmtp.cfu.v2.courses.representation_models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseRecommendationRequestion {
    private String userMessage;
    private Long aiThreadId;
}
