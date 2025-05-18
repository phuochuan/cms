package com.mgmtp.cfu.v2.accounts;

import com.mgmtp.cfu.entity.User;
import com.mgmtp.cfu.enums.Gender;
import com.mgmtp.cfu.enums.Role;
import com.mgmtp.cfu.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v2/accounts")
public class AccountManagementColtroller {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<User>> getAccounts() {
        var result = userRepo.findAll();

//        List<User> users = new ArrayList<>();
//        users.addAll(result);
//        users.addAll(result);
//        users.addAll(result);

        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<User> createAccount(@RequestBody User user) {
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        } else {
            user.setPassword(passwordEncoder.encode(user.getUsername() + "1234"));
        }

        return ResponseEntity.ok(userRepo.save(user));
    }

    @PutMapping()
    public ResponseEntity<User> updateAccount(@RequestBody final User user) {

        return ResponseEntity.ok(userRepo.save(user));
    }

    @DeleteMapping("/{id}")
    public void deleteAccount(@PathVariable final Long id) {
        userRepo.deleteById(id);
    }

    @PostConstruct
    public void init() {
        User user1 = User.builder()
            .email("aam@example.com")
            .avatarUrl("https://example.com/avatar1.png")
            .dateOfBirth(LocalDate.of(1990, 1, 1))
            .role(Role.USER)
            .gender(Gender.FEMALE)
            .username("aam_user")
            .password(passwordEncoder.encode("password1"))
            .build();

        User user2 = User.builder()
            .email("bob@example.com")
            .avatarUrl("https://example.com/avatar2.png")
            .dateOfBirth(LocalDate.of(1988, 5, 10))
            .role(Role.ADMIN)
            .gender(Gender.MALE)
            .username("bob_admin")
            .password(passwordEncoder.encode("password2"))
            .build();

        User user3 = User.builder()
            .email("carol@example.com")
            .avatarUrl("https://example.com/avatar3.png")
            .dateOfBirth(LocalDate.of(1995, 7, 20))
            .role(Role.USER)
            .gender(Gender.FEMALE)
            .username("carol_user")
            .password(passwordEncoder.encode("password3"))
            .build();

        User user4 = User.builder()
            .email("admin@example.com")
            .avatarUrl("https://example.com/avatar4.png")
            .dateOfBirth(LocalDate.of(1992, 3, 15))
            .role(Role.ADMIN)
            .gender(Gender.MALE)
            .username("admin")
            .password(passwordEncoder.encode("admin"))
            .build();

        userRepo.save(user1);
        userRepo.save(user2);
        userRepo.save(user3);
        userRepo.save(user4);
    }
}
