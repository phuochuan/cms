package com.mgmtp.cfu.v2.ai.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mgmtp.cfu.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
public class AIThread {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    String content;

    String createdDate;

    @ManyToOne
    @JsonIgnore
    User user;
}
