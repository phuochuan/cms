package com.mgmtp.cfu.v2.courses.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mgmtp.cfu.entity.Course;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

@Entity
public class LearningContent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String title;

    String description;

    @Enumerated(EnumType.STRING)
    LearningContentType type;

    String videoUrl;

    @ManyToOne
    @JsonIgnore
    Course course;

    LocalDate createdDate;

    @ManyToOne
    LearningContent parent;

}
