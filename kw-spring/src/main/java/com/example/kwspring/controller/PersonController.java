package com.example.kwspring.controller;

import com.example.kwspring.dto.CreatePersonDTO;
import com.example.kwspring.dto.PersonResponseDTO;
import com.example.kwspring.service.PersonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/persons")
@RequiredArgsConstructor
@RestController
public class PersonController {
    private final PersonService personService;

    @PostMapping
    public ResponseEntity<PersonResponseDTO> createPerson(@RequestBody CreatePersonDTO request) {
        PersonResponseDTO responseDTO = personService.createPerson(request);
        return ResponseEntity.ok().body(responseDTO);
    }

    @GetMapping("/{persondId}")
    public ResponseEntity<PersonResponseDTO> getPerson(@PathVariable Long persondId) {
        return ResponseEntity.ok().body(personService.getPerson(persondId));
    }
}
