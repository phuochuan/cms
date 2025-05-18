package com.mgmtp.cfu.repository;

import com.mgmtp.cfu.dto.coursedto.CourseDto;
import com.mgmtp.cfu.entity.Category;
import com.mgmtp.cfu.entity.Course;
import com.mgmtp.cfu.enums.CoursePlatform;
import com.mgmtp.cfu.enums.CourseStatus;
import com.mgmtp.cfu.enums.RegistrationStatus;
import com.mgmtp.cfu.v2.courses.representation_models.InsideCourseResponseModel;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long>, JpaSpecificationExecutor<Course> {
    Course findFirstByLinkIgnoreCase(String link);

    @Query(
        "SELECT co FROM Course co " +
            "JOIN co.categories cat " +
            "WHERE co.id != :courseId AND co.status = :status AND cat IN :categories " +
            "GROUP BY co.id " +
            "ORDER BY COUNT(cat.id) DESC "
    )
    List<Course> findTop8RelatedCourse(@Param("categories") Set<Category> categories, Pageable pageable, @Param("courseId") Long courseId, @Param("status") CourseStatus courseStatus
    );

    Optional<Course> findFirstByLinkIgnoreCaseAndStatus(String link, CourseStatus courseStatus);

    @Query("select new com.mgmtp.cfu.dto.coursedto.CourseDto(c.id, c.name, c.link, c.platform, c.thumbnailUrl, c.teacherName, c.createdDate, c.status, c.level, count(r.id)) " +
        "from Course c left join Registration r on c.id = r.course.id and r.status IN :acceptedStatuses " +
        "where c.id = :id " +
        "GROUP BY c.id, c.name, c.link, c.platform, c.thumbnailUrl, c.teacherName, " +
        "c.createdDate, c.status, c.level")
    Optional<CourseDto> findDtoById(@Param("id") Long id, @Param("acceptedStatuses") List<RegistrationStatus> acceptedStatuses);

    List<Course> findAllByPlatform(CoursePlatform platform, Limit limit);

    @Query("select new com.mgmtp.cfu.v2.courses.representation_models.InsideCourseResponseModel(" +
        "c.id, c.name, c.link, c.platform, c.thumbnailUrl, c.teacherName, c.createdDate, c.status, c.level, count(lc.id)) " +
        "from Course c left join LearningContent lc on lc.course.id = c.id and lc.type = 'CHAPTER' " +
        "where c.platform = :coursePlatform " +
        "group by c.id, c.name, c.link, c.platform, c.thumbnailUrl, c.teacherName, c.createdDate, c.status, c.level")
    List<InsideCourseResponseModel> findInsideCourseResponseModelAllByPlatform(@Param("coursePlatform") CoursePlatform coursePlatform);
}
