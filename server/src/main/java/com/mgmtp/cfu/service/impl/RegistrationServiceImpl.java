package com.mgmtp.cfu.service.impl;

import com.mgmtp.cfu.dto.MailContentUnit;
import com.mgmtp.cfu.dto.PageResponse;
import com.mgmtp.cfu.dto.RegistrationRequest;
import com.mgmtp.cfu.dto.coursedto.CourseRequest;
import com.mgmtp.cfu.dto.coursedto.CourseResponse;
import com.mgmtp.cfu.dto.registrationdto.FeedbackRequest;
import com.mgmtp.cfu.dto.registrationdto.RegistrationEnrollDTO;
import com.mgmtp.cfu.dto.registrationdto.RegistrationOverviewDTO;
import com.mgmtp.cfu.dto.registrationdto.RegistrationOverviewParams;
import com.mgmtp.cfu.dto.registrationdto.RegistrationDetailDTO;
import com.mgmtp.cfu.entity.Category;
import com.mgmtp.cfu.entity.Course;
import com.mgmtp.cfu.enums.*;
import com.mgmtp.cfu.entity.RegistrationFeedback;
import com.mgmtp.cfu.entity.User;
import com.mgmtp.cfu.exception.*;
import com.mgmtp.cfu.mapper.RegistrationOverviewMapper;
import com.mgmtp.cfu.entity.Registration;
import com.mgmtp.cfu.mapper.DTOMapper;
import com.mgmtp.cfu.mapper.factory.MapperFactory;
import com.mgmtp.cfu.repository.RegistrationRepository;
import com.mgmtp.cfu.service.*;
import com.mgmtp.cfu.repository.*;
import com.mgmtp.cfu.specification.RegistrationSpecifications;
import com.mgmtp.cfu.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.List;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static com.mgmtp.cfu.util.AuthUtils.getCurrentUser;
import static com.mgmtp.cfu.util.AuthUtils.getUserName;
import static com.mgmtp.cfu.util.RegistrationOverviewUtils.getRegistrationOverviewDTOS;

@Service
@Slf4j
public class RegistrationServiceImpl implements RegistrationService {

    private final RegistrationRepository registrationRepository;

    private final CourseRepository courseRepository;

    private final MapperFactory<Registration> registrationMapperFactory;

    private final RegistrationOverviewMapper registrationOverviewMapper;

    private final NotificationService notificationService;

    private final RegistrationFeedbackService feedbackService;

    private final IEmailService emailService;

    private final CourseService courseService;

    private final UserRepository userRepository;

    private final NotificationRepository notificationRepository;

    private final RegistrationFeedbackRepository registrationFeedbackRepository;

    private final DocumentServiceImpl documentService;

    private final CategoryService categoryService;

    private final UploadService uploadService;

    @Value("${course4u.upload.thumbnail-directory}")
    private String uploadThumbnailDir;

    @Autowired
    public RegistrationServiceImpl(RegistrationRepository registrationRepository,
                                   MapperFactory<Registration> registrationMapperFactory,
                                   RegistrationOverviewMapper registrationOverviewMapper,
                                   CourseRepository courseRepository,
                                   NotificationRepository notificationRepository,
                                   RegistrationFeedbackRepository registrationFeedbackRepository,
                                   IEmailService emailService,
                                   UserRepository userRepository,
                                   NotificationService notificationService,
                                   RegistrationFeedbackService feedbackService,
                                   CourseService courseService,
                                   CategoryService categoryService,
                                   UploadService uploadService,
                                   DocumentServiceImpl documentService) {
        this.registrationRepository = registrationRepository;
        this.registrationMapperFactory = registrationMapperFactory;
        this.registrationOverviewMapper = registrationOverviewMapper;
        this.courseRepository = courseRepository;
        this.notificationService = notificationService;
        this.feedbackService = feedbackService;
        this.emailService = emailService;
        this.courseService = courseService;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.registrationFeedbackRepository=registrationFeedbackRepository;
        this.documentService = documentService;
        this.categoryService = categoryService;
        this.uploadService = uploadService;
    }

    @Override
    public RegistrationDetailDTO getDetailRegistration(Long id) {
        Optional<DTOMapper<RegistrationDetailDTO, Registration>> registrationDtoMapperOpt = registrationMapperFactory.getDTOMapper(RegistrationDetailDTO.class);

        if (registrationDtoMapperOpt.isEmpty()) {
            throw new MapperNotFoundException("No mapper found for registrationDtoMapperOpt");
        }
        Registration registration = registrationRepository.findById(id).orElseThrow(() -> new RegistrationNotFoundException("Registration not found"));
        return registrationDtoMapperOpt.get().toDTO(registration);
    }

    @Override
    public PageResponse getMyRegistrationPage(int page, String status) {
        status = status.trim();
        var userId = getCurrentUser().getId();

        var myRegistrations = registrationRepository.getSortedRegistrations(userId);
        myRegistrations=myRegistrations!=null?myRegistrations:new ArrayList<>();
        if (!RegistrationValidator.isDefaultStatus(status)) {
            try {
                var statusEnum = RegistrationStatus.valueOf(status.toUpperCase());
                myRegistrations = myRegistrations.stream().filter(registration -> registration.getStatus().equals(statusEnum)).toList();
            } catch (Exception e) {
                throw new IllegalArgumentException(e.getMessage());
            }
        }
        if (myRegistrations.isEmpty()) {
            return PageResponse.builder().totalElements(0).list(new ArrayList<>()).build();
        }
        var listOfMyRegistration = getRegistrationOverviewDTOS(page, myRegistrations, registrationMapperFactory.getDTOMapper(RegistrationOverviewDTO.class));
        return PageResponse.builder().list(listOfMyRegistration).totalElements(myRegistrations.size()).build();
    }

    @Override
    public void approveRegistration(Long id) {
        var registration = registrationRepository.findById(id).orElseThrow(() -> new RegistrationNotFoundException("Registration not found"));

        // check if registration has a submitted status
        if (registration.getStatus() != RegistrationStatus.SUBMITTED) {
            throw new BadRequestRuntimeException("Registration must be in submitted status to be approved");
        }

        // check if the course with the same link already exists and available
        if(courseRepository.findFirstByLinkIgnoreCaseAndStatus(registration.getCourse().getLink(), CourseStatus.AVAILABLE).isPresent() && !registration.getCourse().getStatus().equals(CourseStatus.AVAILABLE)){
            throw new DuplicateCourseException("This course already exists and is available");
        }
        registration.getCourse().setStatus(CourseStatus.AVAILABLE);

        // change status category to available
        for (var category : registration.getCourse().getCategories()) {
            if (category.getStatus() == CategoryStatus.PENDING) {
                category.setStatus(CategoryStatus.AVAILABLE);
            }
        }

        // Update registration
        registration.setLastUpdated(LocalDateTime.now());
        registration.setStatus(RegistrationStatus.APPROVED);
        registrationRepository.save(registration);

        // send notification
        notificationService.sendNotificationToUser(registration.getUser(), NotificationType.SUCCESS, "Registration for \"" + registration.getCourse().getName() + "\" has been approved. ");

        // send email
        List<MailContentUnit> mailContentUnits = List.of(
                EmailUtil.generateTitle("Registration Approved"),
                EmailUtil.updateTitleStyle("Registration Approved"),
                EmailUtil.generateGreeting("Dear {name},", registration.getUser()),
                EmailUtil.generateApproveContent(registration.getCourse().getName())
        );
        emailService.sendMail(registration.getUser().getEmail(), EmailUtil.generateSubject("Registration Approved"), "email-template.xml", mailContentUnits);
    }

    @Override
    public void declineRegistration(Long id, FeedbackRequest feedbackRequest) {
        var registration = registrationRepository.findById(id).orElseThrow(() -> new RegistrationNotFoundException("Registration not found"));
        // check if registration has been declined
        if (registration.getStatus() != RegistrationStatus.SUBMITTED) {
            throw new BadRequestRuntimeException("Registration must be in submitted status to be declined");
        }
        // send feedback
        if (feedbackRequest == null || feedbackRequest.getComment() == null || feedbackRequest.getComment().isBlank())
            throw new BadRequestRuntimeException("Feedback comment is required");
        feedbackService.sendFeedback(registration, feedbackRequest.getComment().trim());

        // Update registration
        registration.setStatus(RegistrationStatus.DECLINED);
        registration.setLastUpdated(LocalDateTime.now());
        registrationRepository.save(registration);

        // send notification
        notificationService.sendNotificationToUser(registration.getUser(), NotificationType.ERROR, "Registration for \"" + registration.getCourse().getName() + "\" has been declined. Please review the feedbacks!");

        // send email
        List<MailContentUnit> mailContentUnits = List.of(
                EmailUtil.generateTitle("Registration Declined"),
                EmailUtil.updateTitleStyle("Registration Declined"),
                EmailUtil.generateGreeting("Dear {name},", registration.getUser()),
                EmailUtil.generateDeclineContent(registration.getCourse().getName())
        );
        emailService.sendMail(registration.getUser().getEmail(), EmailUtil.generateSubject("Registration Declined"), "email-template.xml", mailContentUnits);
    }


    @Transactional
    public Boolean createRegistration(RegistrationRequest registrationRequest) {
        // Create course if needed
        var modelMapper = new ModelMapper();
        CourseRequest courseRequest = CourseRequest.builder()
                                                   .name(registrationRequest.getName())
                                                   .link(registrationRequest.getLink())
                                                   .platform(registrationRequest.getPlatform())
                                                   .thumbnailFile(registrationRequest.getThumbnailFile())
                                                   .thumbnailUrl(registrationRequest.getThumbnailUrl())
                                                   .teacherName(registrationRequest.getTeacherName())
                                                   .categories(registrationRequest.getCategories())
                                                   .level(registrationRequest.getLevel())
                                                   .build();

        CourseResponse course = courseService.createCourse(courseRequest);

        Registration registration = Registration.builder()
                                                .course(modelMapper.map(course, Course.class))
                                                .status(RegistrationStatus.SUBMITTED)
                                                .registerDate(LocalDate.now())
                                                .duration(registrationRequest.getDuration())
                                                .durationUnit(registrationRequest.getDurationUnit())
                                                .lastUpdated(LocalDateTime.now())
                                                .user(getCurrentUser())
                                                .build();

        registrationRepository.save(registration);
        notifyWhenSummitRegistration();
        return true;
    }

    private void notifyWhenSummitRegistration() {
        String notificationMessageForUser="Registration has been successfully submitted! Please wait for Admin to approve your registration.";
        String notificationMessageForAdmin=getUserName(getCurrentUser())+" submitted a registration.";
        notificationService.sendNotificationToUser(getCurrentUser(), NotificationType.SUCCESS, notificationMessageForUser);
        var admins=getAllAdmin();
        admins.forEach(admin -> {
            notificationService.sendNotificationToUser(admin, NotificationType.INFORMATION,notificationMessageForAdmin);
        });
    }

    // Admin Registration Services

    @Override
    public Page<RegistrationOverviewDTO> getRegistrations(RegistrationOverviewParams params, int page, int pageSize) {
        String status = params.getStatus();
        String search = params.getSearch().trim();
        String orderBy = (params.getOrderBy().isEmpty()) ? "id" : params.getOrderBy();

        Pageable pageable = PageRequest.of(page - 1, pageSize);

        return getRegistrationsBySpec(status, search, orderBy, pageable).map(registrationOverviewMapper::toDTO);
    }

    private Page<Registration> getRegistrationsBySpec(String status, String search, String orderBy, Pageable pageable) {
        Specification<Registration> spec = RegistrationSpecifications.getSpecs(status, search, orderBy);
        return registrationRepository.findAll(spec, pageable);
    }

    @Override
    @Transactional
    public void finishRegistration(Long id) {
        Registration registration = registrationRepository.findById(id).orElseThrow(() -> new RegistrationNotFoundException("Registration not found"));

        if (registration.getStatus() != RegistrationStatus.APPROVED) {
            throw new BadRequestRuntimeException("Registration must be in approved status to be finished");
        }

        registration.setStatus(RegistrationStatus.DONE);
        registration.setEndDate(ZonedDateTime.now());
        registration.setLastUpdated(LocalDateTime.now());
        updateScore(registration);

        registrationRepository.save(registration);
    }

    private void updateScore(Registration registration) {
        if (registration.getStatus() != RegistrationStatus.DONE) {
            throw new BadRequestRuntimeException("Registration must be in done status to calculate score");
        }

        int score = ScoreCalculator.calculateScore(registration.getCourse().getLevel(), registration.getStartDate(), registration.getEndDate(), registration.getDuration(), registration.getDurationUnit());

        if (registration.getScore() == null) {
            registration.setScore(score);
        } else {
            registration.setScore(registration.getScore() + score);
        }
    }

    @Override
    @Transactional
    public void closeRegistration(Long id, FeedbackRequest feedbackRequest) {
        Registration registration = registrationRepository.findById(id).orElseThrow(() -> new RegistrationNotFoundException("Registration not found"));


        if (!RegistrationStatusUtil.isCloseableStatus(registration.getStatus())) {
            throw new BadRequestRuntimeException("Registration status must be in [DONE, VERIFYING, DOCUMENT_DECLINED, VERIFIED]  to be closed");
        }

        // If the registration is not verified, send feedback
        if (registration.getStatus() != RegistrationStatus.VERIFIED) {
            if (feedbackRequest == null || feedbackRequest.getComment() == null || feedbackRequest.getComment().isBlank())
                throw new BadRequestRuntimeException("Feedback comment is required");
            feedbackService.sendFeedback(registration, feedbackRequest.getComment().trim());
        }

        registration.setStatus(RegistrationStatus.CLOSED);
        registration.setLastUpdated(LocalDateTime.now());
        registrationRepository.save(registration);

        // send notification
        notificationService.sendNotificationToUser(registration.getUser(), NotificationType.INFORMATION, "Your registration for course " + registration.getCourse().getName() + " has been closed");

        // send email
        List<MailContentUnit> mailContentUnits = List.of(
                EmailUtil.generateTitle("Registration Closed"),
                EmailUtil.updateTitleStyle("Registration Closed"),
                EmailUtil.generateGreeting("Dear {name},", registration.getUser()),
                EmailUtil.generateCloseContent(registration.getCourse().getName())
        );
        emailService.sendMail(registration.getUser().getEmail(), EmailUtil.generateSubject("Registration Closed"), "email-template.xml", mailContentUnits);
    }

    @Override
    public void deleteRegistration(Long id) {
        var registration = registrationRepository.findById(id)
                                                 .orElseThrow(() -> new BadRequestRuntimeException("Registration not found"));

        if (!Objects.equals(getCurrentUser().getId(), registration.getUser().getId())) {
            throw new ForbiddenException("You do not have permission to delete this registration.");
        }

        if (registration.getStatus() != RegistrationStatus.DRAFT && registration.getStatus() != RegistrationStatus.DISCARDED) {
            throw new BadRequestRuntimeException("Registration must be in DRAFT or DISCARDED status to be deleted.");
        }

        registrationRepository.delete(registration);
    }

    @Override
    public void discardRegistration(Long id) {
        var registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RegistrationNotFoundException("Registration not found"));

        if (!RegistrationStatusUtil.isDiscardableStatus(registration.getStatus())) {
            throw new BadRequestRuntimeException("Registration must be in correct status to be discarded.");
        }
        registration.setLastUpdated(LocalDateTime.now());
        registration.setStatus(RegistrationStatus.DISCARDED);
        registrationRepository.save(registration);
    }

    @Override
    public boolean startLearningCourse(Long registrationId) {
        var userId = getCurrentUser().getId();
        if (!registrationRepository.existsByIdAndUserId(registrationId, userId))
            throw new BadRequestRuntimeException("Not found any registration that id is " + registrationId);
        var registrationOpt = registrationRepository.findById(registrationId);
        if (registrationOpt.isPresent()) {
            var registration = registrationOpt.get();
            if (Objects.nonNull(registration.getStartDate()))
                throw new ConflictRuntimeException("This course was started learning");
            if (!registration.getStatus().equals(RegistrationStatus.APPROVED)) {
                throw new BadRequestRuntimeException("This registration requires approval by admin.");
            }
            registration.setStartDate(ZonedDateTime.now());
            registration.setLastUpdated(LocalDateTime.now());
            registrationRepository.save(registration);
            return true;
        }
        return false;
    }

    @Override
    @Transactional(rollbackOn = Exception.class)
    public void verifyRegistration(Long id, Map<String, String> longDocumentStatusMap, String status) {
        // Fetch the registration by ID or throw an error if not found
        var registration = registrationRepository.findById(id)
                .orElseThrow(() -> new BadRequestRuntimeException("Error: Registration not found."));

        // Check if the registration status is VERIFYING
        if (registration.getStatus() == null || registration.getStatus() != RegistrationStatus.VERIFYING_ADMIN) {
            throw new BadRequestRuntimeException("Error: Registration must be in VERIFYING status.");
        }

        RegistrationStatus registrationStatus;
        try {
            // Convert status to RegistrationStatus enum
            registrationStatus = RegistrationStatus.valueOf(status.toUpperCase());
        } catch (Exception e) {
            throw new BadRequestRuntimeException("Error: Invalid status. Must be 'VERIFIED' or 'DOCUMENT_DECLINED'.");
        }

        // Get feedback and remove from map
        String feedback = longDocumentStatusMap.getOrDefault("feedbackRequest", "");
        longDocumentStatusMap.remove("feedbackRequest");

        int numberOfApprovedCertificateDocument = 0;
        int numberOfApprovedPaymentDocument = 0;

        try {
            // Process each document status entry
            for (Map.Entry<String, String> documentStatusMap : longDocumentStatusMap.entrySet()) {
                long documentId;
                try {
                     documentId = Long.parseLong(documentStatusMap.getKey());
                }catch (Exception e){
                    continue;
                }
                var documentStatus = DocumentStatus.valueOf(documentStatusMap.getValue().toUpperCase());
                var document = documentService.verifyDocument(documentId, documentStatus);

                // Count approved documents by type
                if (documentStatus == DocumentStatus.APPROVED) {
                    if (document.getType() == DocumentType.CERTIFICATE) {
                        numberOfApprovedCertificateDocument++;
                    }
                    if (document.getType() == DocumentType.PAYMENT) {
                        numberOfApprovedPaymentDocument++;
                    }
                }
            }
        } catch (Exception e) {
            throw new BadRequestRuntimeException("Error: Failed to process documents. " + e.getMessage());
        }

        // Validate documents and set registration status
        if (registrationStatus == RegistrationStatus.VERIFIED) {
            if (numberOfApprovedCertificateDocument <= 0 || numberOfApprovedPaymentDocument <= 0) {
                throw new BadRequestRuntimeException("Error: At least one approved payment and certificate document are required.");
            }
            registration.setStatus(RegistrationStatus.VERIFIED);
        } else if (registrationStatus == RegistrationStatus.DOCUMENT_DECLINED) {
            registration.setStatus(RegistrationStatus.DOCUMENT_DECLINED);
            if (feedback.isEmpty()) {
                throw new BadRequestRuntimeException("Error: Feedback cannot be null or empty.");
            }
            var registrationFeedback = RegistrationFeedback.builder()
                    .comment(feedback)
                    .createdDate(LocalDateTime.now())
                    .user(getCurrentUser())
                    .registration(registration)
                    .build();
            registrationFeedbackRepository.save(registrationFeedback);
        } else {
            throw new BadRequestRuntimeException("Error: Status must be 'VERIFIED' or 'DOCUMENT_DECLINED'.");
        }

        // Notify about the verified documents and save the registration
        notifyVerifiedDocument(registration);
        registration.setLastUpdated(LocalDateTime.now());
        registrationRepository.save(registration);
    }

    private void notifyVerifiedDocument(Registration registration) {
        var courseName=registration.getCourse().getName();
        if (registration.getStatus().equals(RegistrationStatus.VERIFIED)) {
            var user = registration.getUser();
            var admins = getAllAdmin();
            // Notify admins about the verification
            admins.forEach(admin -> {
                String message = String.format(
                        "The course titled \"%s\" that user %s registered has been successfully verified by our accountant .",
                        courseName,  (user)
                );
                String notificationMessage="Registration for \"" + courseName + "\" has been verified.";
                notificationRepository.save(NotificationUtil.createNotification(NotificationType.INFORMATION, admin, notificationMessage));
                sendEmail(registration, admin, message);
            });

            // Notify the user about the verification
            String notificationMessage="Congratulations! Registration for \"" + courseName + "\" has been verified.";
            String userMessage = "Congratulations! Your course titled \"" + courseName + "\" has been verified successfully.";
            sendEmail(registration, user, userMessage);
            notificationRepository.save(NotificationUtil.createNotification(NotificationType.SUCCESS, user, notificationMessage));

        } else if (registration.getStatus().equals(RegistrationStatus.DOCUMENT_DECLINED)) {
            log.info("DOCUMENT_DECLINED");
            var notificationMessage="Documents of registration for \""+courseName+"\" has been declined. Please review the feedbacks!";
            String message = "We regret to inform you that your submitted documents for the course " +
                    registration.getCourse().getName() + " have been rejected. ";
            notificationRepository.save(NotificationUtil.createNotification(NotificationType.ERROR, registration.getUser(), notificationMessage));
            sendEmail(registration, registration.getUser(), message);
        }
    }

    private List<User> getAllAdmin() {
        return userRepository.findAllByRole(Role.ADMIN);
    }

    private void sendEmail(Registration registration, User user, String message) {
        var status = registration.getStatus();
        String title = status == RegistrationStatus.DOCUMENT_DECLINED ? "Document Declined" : "Document Approved";
        List<MailContentUnit> mailContentUnits = List.of(
                EmailUtil.generateTitle(title),
                EmailUtil.updateTitleStyle(title),
                EmailUtil.generateGreeting("Dear {name},", user),
                EmailUtil.generateDocumentDeclinedContent(message)
        );

        emailService.sendMail(
                user.getEmail(),
                EmailUtil.generateSubject(title),
                "email-template.xml",
                mailContentUnits
        );
    }

    @Override
    public void createRegistrationFromExistingCourses(Long courseId, RegistrationEnrollDTO registrationEnrollDTO,boolean asDraft) {
        if (registrationEnrollDTO.getDuration() == null || registrationEnrollDTO.getDurationUnit() == null) {
            throw new BadRequestRuntimeException("Duration and Duration Unit must not be null");
        }

        var course = courseRepository.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found"));

        Registration registration = Registration.builder()
                .course(course)
                .status(asDraft ? RegistrationStatus.DRAFT : RegistrationStatus.SUBMITTED)
                .registerDate(LocalDate.now())
                .duration(registrationEnrollDTO.getDuration().intValue())
                .durationUnit(registrationEnrollDTO.getDurationUnit())
                .lastUpdated(LocalDateTime.now())
                .user(getCurrentUser())
                .build();
        registrationRepository.save(registration);
        if(!asDraft) {
            notifyWhenSummitRegistration();
        }
    }

    private String handleThumbnail(RegistrationRequest registrationRequest) throws IOException {
        String thumbnailUrl = null;
        if (registrationRequest.getThumbnailFile() != null)
            thumbnailUrl = uploadService.uploadThumbnail(registrationRequest.getThumbnailFile(), uploadThumbnailDir);
        else if (registrationRequest.getThumbnailUrl() != null)
            thumbnailUrl = registrationRequest.getThumbnailUrl();
        return thumbnailUrl;
    }

    @Override
    public void editRegistration(Long id, RegistrationRequest registrationRequest, boolean asDraft) {

        Registration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new RegistrationNotFoundException("Registration with id " + id + " not found!"));

        Course course = courseRepository.findById(registration.getCourse().getId())
                .orElseThrow(() -> new CourseNotFoundException("Course with id " + id + " not found!"));

        if (registration.getUser().getId().equals(getCurrentUser().getId())) {
            var status = registration.getStatus();

            if (status.equals(RegistrationStatus.DRAFT) || status.equals(RegistrationStatus.SUBMITTED) || status.equals(RegistrationStatus.DECLINED)) {

                List<Category> categories = categoryService.findOrCreateNewCategory(registrationRequest.getCategories());
                course.setCategories(new HashSet<>(categories));

                String oldThumbnailUrl = null;
                try {
                    String thumbnailUrl = handleThumbnail(registrationRequest);
                    if (thumbnailUrl != null) {
                        if (course.getThumbnailUrl().endsWith(".jpg"))
                            oldThumbnailUrl = course.getThumbnailUrl();
                        course.setThumbnailUrl(thumbnailUrl);
                    }
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }

                course.setLink(registrationRequest.getLink());
                course.setName(registrationRequest.getName());
                course.setTeacherName(registrationRequest.getTeacherName());
                course.setPlatform(registrationRequest.getPlatform());
                course.setLevel(registrationRequest.getLevel());

                courseRepository.save(course);

                if (oldThumbnailUrl != null && !oldThumbnailUrl.startsWith("http")) {
                    try {
                        uploadService.deleteThumbnail(oldThumbnailUrl, uploadThumbnailDir);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                }

                registration.setCourse(course);
                registration.setDuration(registrationRequest.getDuration());
                registration.setDurationUnit(registrationRequest.getDurationUnit());
                registration.setLastUpdated(LocalDateTime.now());


                if ((registration.getStatus() == RegistrationStatus.DRAFT || registration.getStatus() == RegistrationStatus.DECLINED) && !asDraft) {
                    registration.setStatus(RegistrationStatus.SUBMITTED);
                    notifyWhenSummitRegistration();
                }

                registrationRepository.save(registration);
            } else
                throw new IllegalArgumentException("Status of Registration is invalid!");
        } else
            throw new IllegalArgumentException("You are not owner of this Registration!");
    }

    @Override
    public void createRegistrationAsDraft(RegistrationRequest registrationRequest) {
        log.info(String.valueOf(ZonedDateTime.now()));
        var modelMapper=new ModelMapper();
        CourseRequest courseRequest = CourseRequest.builder()
                .name(registrationRequest.getName()!=null?registrationRequest.getName():" ")
                .link(registrationRequest.getLink()!=null?registrationRequest.getLink():" ")
                .platform(registrationRequest.getPlatform())
                .thumbnailFile(registrationRequest.getThumbnailFile())
                .thumbnailUrl(registrationRequest.getThumbnailUrl()!=null?registrationRequest.getThumbnailUrl():" ")
                .teacherName(registrationRequest.getTeacherName()!=null?registrationRequest.getTeacherName():" ")
                .categories(registrationRequest.getCategories()!=null?registrationRequest.getCategories():new ArrayList<>())
                .level(registrationRequest.getLevel())
                .build();
        CourseResponse course = courseService.createCourse(courseRequest);
        Registration registration = Registration.builder()
                .course(modelMapper.map(course, Course.class))
                .status(RegistrationStatus.DRAFT)
                .registerDate(null)
                .duration(registrationRequest.getDuration())
                .durationUnit(registrationRequest.getDurationUnit())
                .lastUpdated(LocalDateTime.now())
                .user(getCurrentUser())
                .build();
        registrationRepository.save(registration);
    }
    @Override
    public Boolean isExistAvailableCourse(Long id) {
        Registration registration = registrationRepository.findById(id)
                                                          .orElseThrow(() -> new RegistrationNotFoundException("Registration with id " + id + " not found"));
        return registration.getCourse().getStatus() == CourseStatus.AVAILABLE;
    }
}
