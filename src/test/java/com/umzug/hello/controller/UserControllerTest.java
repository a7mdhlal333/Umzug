package com.umzug.hello.controller;

import com.umzug.hello.model.User;
import com.umzug.hello.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class UserControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void healthEndpointRespondsImmediately() throws Exception {
        mockMvc.perform(get("/api/users/health"))
                .andExpect(status().isOk());
    }

    @Test
    void loginCreatesCustomerAndNormalizesPhoneNumber() throws Exception {
        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("Ali", "0157 507-59010", "KUNDE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Ali")))
                .andExpect(jsonPath("$.telefonnummer", is("015750759010")))
                .andExpect(jsonPath("$.rolle", is("KUNDE")));
    }

    @Test
    void loginRejectsInvalidPhoneNumber() throws Exception {
        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("Ali", "123", "KUNDE")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginRejectsMissingRequiredValues() throws Exception {
        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Ali\",\"telefonnummer\":\"015750759010\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginReusesExistingUserForSamePhoneNumber() throws Exception {
        User existingUser = userRepository.save(
                new User("Erster Name", "015750759011", User.Role.FAHRER));

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson("Neuer Name", "015750759011", "KUNDE")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(existingUser.getId().intValue())))
                .andExpect(jsonPath("$.name", is("Erster Name")))
                .andExpect(jsonPath("$.rolle", is("FAHRER")));
    }

    private String loginJson(String name, String phone, String role) throws Exception {
        return "{\"name\":\"" + name + "\",\"telefonnummer\":\"" + phone
                + "\",\"rolle\":\"" + role + "\"}";
    }
}