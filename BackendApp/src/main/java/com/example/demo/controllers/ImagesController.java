package com.example.demo.controllers;

import com.example.demo.services.ImagesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/images")
@CrossOrigin(origins = "*") // Optional: Adjust CORS settings as needed
public class ImagesController {

    @Autowired
    private ImagesService imagesService;

    // POST - Upload new image
    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = imagesService.upload(file);
        return ResponseEntity.ok(imageUrl);
    }

    // PUT - Update existing image (replace old one)
    @PutMapping("/update")
    public ResponseEntity<String> updateImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("existingFileName") String existingFileName) {
        String imageUrl = imagesService.update(file, existingFileName);
        return ResponseEntity.ok(imageUrl);
    }

    // DELETE - Remove image from storage
    @DeleteMapping("/delete/{fileName}")
    public ResponseEntity<String> deleteImage(@PathVariable("fileName") String fileName) {
        try {
            String result = imagesService.delete(fileName);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting image: " + e.getMessage());
        }
    }
}
