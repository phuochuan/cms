package com.mgmtp.cfu.v2.registration.controller;

import com.mgmtp.cfu.entity.Registration;
import com.mgmtp.cfu.enums.RegistrationStatus;
import com.mgmtp.cfu.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v2/registration")
@RequiredArgsConstructor
public class RegistrationV2Controller {
    private final RegistrationRepository registrationRepository;
    @PutMapping("/{id}/admin")
    public void  approveAdmin(@PathVariable("id") Long id) {
        Registration registration = registrationRepository.findById(id).orElse(null);

        registration.setStatus(RegistrationStatus.VERIFYING_ACCOUNTANT);

        registrationRepository.save(registration);
    }

    @PutMapping("/{id}/accountant")
    public void  approveAccountant(@PathVariable("id") Long id) {
        Registration registration = registrationRepository.findById(id).orElse(null);

        registration.setStatus(RegistrationStatus.VERIFIED);

        registrationRepository.save(registration);
    }
}
