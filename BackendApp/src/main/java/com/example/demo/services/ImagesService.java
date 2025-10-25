package com.example.demo.services;
import com.google.auth.Credentials;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.Objects;
import java.util.UUID;

@Service
public class ImagesService {
    private static final String BUCKET_NAME = "ingbot-f8861.appspot.com";

    private String uploadFile(File file, String fileName) throws IOException {
        BlobId blobId = BlobId.of(BUCKET_NAME, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType("media").build();
        InputStream inputStream = ImagesService.class.getClassLoader().getResourceAsStream("ingbot-f8861-firebase-adminsdk-5dix6-ea6e6c4577.json");
        assert inputStream != null;
        Credentials credentials = GoogleCredentials.fromStream(inputStream);
        Storage storage = StorageOptions.newBuilder().setCredentials(credentials).build().getService();
        storage.create(blobInfo, Files.readAllBytes(file.toPath()));

        String downloadUrl = "https://firebasestorage.googleapis.com/v0/b/" + BUCKET_NAME + "/o/%s?alt=media";
        return String.format(downloadUrl, fileName);
    }

    private File convertToFile(MultipartFile multipartFile, String fileName) throws IOException {
        File tempFile = new File(fileName);
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(multipartFile.getBytes());
        }
        return tempFile;
    }

    private String getExtension(String fileName) {
        return fileName.substring(fileName.lastIndexOf("."));
    }

    public String upload(MultipartFile multipartFile) {
        try {
            String uploadId = UUID.randomUUID().toString();
            String shortId = uploadId.substring(0, 30);
            String fileName = shortId + getExtension(Objects.requireNonNull(multipartFile.getOriginalFilename()));
            File file = convertToFile(multipartFile, fileName);
            String URL = uploadFile(file, fileName);
            file.delete();
            return URL;
        } catch (Exception e) {
            e.printStackTrace();
            return "Image couldn't upload, Something went wrong";
        }
    }

    public String update(MultipartFile multipartFile, String existingFileName) {
        try {
            String updateId = UUID.randomUUID().toString();
            String shortId = updateId.substring(0, 7);
            String fileName = shortId + getExtension(Objects.requireNonNull(multipartFile.getOriginalFilename()));
            File file = convertToFile(multipartFile, fileName);
            String URL = uploadFile(file, fileName);
            file.delete();
            delete(existingFileName);
            return URL;
        } catch (Exception e) {
            return "Image couldn't update, Something went wrong";
        }
    }


    public String delete(String fileName) throws IOException {
        BlobId blobId = BlobId.of(BUCKET_NAME, fileName);
        Storage storage = StorageOptions.newBuilder()
                .setCredentials(getCredentials())
                .build()
                .getService();
        storage.delete(blobId);
        return "Imagen eliminada exitosamente";
    }

    private Credentials getCredentials() throws IOException {
        InputStream inputStream = ImagesService.class.getClassLoader().getResourceAsStream("ingbot-f8861-firebase-adminsdk-5dix6-ea6e6c4577.json");
        if (inputStream == null) {
            throw new IOException("Archivo de credenciales no encontrado: ingbot-f8861-firebase-adminsdk-5dix6-ea6e6c4577.json");
        }
        return GoogleCredentials.fromStream(inputStream);
    }
}
