package com.mgmtp.cfu.service.impl;

import com.mgmtp.cfu.service.UploadService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class UploadServiceImpl implements UploadService {

    @Override
    public String uploadThumbnail(MultipartFile thumbnail, String directory) throws IOException {
        String uuidFilename = UUID.randomUUID() + ".jpg"; // Default extension
        String thumbnailUrl = uuidFilename;
        if (thumbnail != null && !thumbnail.isEmpty()) {
            Path uploadPath = Paths.get(directory).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(uuidFilename);
            thumbnail.transferTo(filePath.toFile());
            thumbnailUrl = uuidFilename;
        }
        return thumbnailUrl;
    }

    @Override
    public void deleteThumbnail(String filename, String directory) throws IOException {
        if (filename != null && !filename.isEmpty()) {
            Path uploadPath = Paths.get(directory).toAbsolutePath().normalize();
            Path filePath = uploadPath.resolve(filename);
            Files.deleteIfExists(filePath);
        }
    }

    // ✅ Method mới: Upload Video
    public String uploadVideo(MultipartFile video, String directory) throws IOException {
        if (video == null || video.isEmpty()) {
            throw new IllegalArgumentException("Video file is empty");
        }

        // Lấy phần mở rộng file (vd: .mp4)
        String originalFilename = video.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : ".mp4"; // default

        // Tạo tên file random
        String uuidFilename = UUID.randomUUID() + extension;

        // Đường dẫn lưu video
        Path uploadPath = Paths.get(directory).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(uuidFilename);

        // Lưu file
        video.transferTo(filePath.toFile());

        // Trả về tên file hoặc URL (tuỳ bạn map)
        return uuidFilename;
    }

}
