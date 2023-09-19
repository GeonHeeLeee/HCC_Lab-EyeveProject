package com.example.kwspring.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class PersonResponseDTO {
    private Long id;

    private String name;

    private Integer age;

    private String des;
}
