package org.openmrs.module.icare.web.controller;

import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.KeyFactory;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Base64Utils;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Base64;

@RestController
@RequestMapping("/api/gepg")
public class GepgBillingController {

    private final String SERVICE_API_URL = "https://api-testengine.udsm.ac.tz/index.php?r=api/service";

    // Your public and private keys
    private final String ENGINE_PUBLIC_KEY = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8503OpGb1/RVPOJrnFR31pSpI5dZMK1GjITfX6YSBLd9dHY9S+HS2CCBb6Nvqtu/Wc1NNJhrxPZKALHTK1fMbH55F4J51HycvhjCzJepLKQLxDyE4Aff9mXV77gQcxdh+2SdEb0Qi9+9TNAqpze2TbXd5Zf9wDOhJXKdB5o16XQIDAQAB";
    private final String CLIENT_PRIVATE_KEY = "MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAOKJJaeHkWryn6D0A/xrcNLOD9fj5Hn2zJKAJOT+6pEZTaTY/aeiQmqLLr6/s9xfj5oa+TsbmnCEeoiJ63/LdkMqaYEjLgC/TacFsxK7nOLQ7CZeFpEYKG2zZv0ppSTUcEL72a8Ia3+PmuOm7CsuVWGHP/IzoWNRs+bCoNTPdanPAgMBAAECgYEAhWagDuytfJ5N1Fl982pNsUX5XHfuNshYJbligJuBBFszNu01Sj8p/1Xg/CElyJNZnDVgKSeTJclN4xPc44+sHru7JbFUIZYzeXPI3nJzw/KlFDiB3UKJWj9mjF89G9IEgOhqzEfuRvyKtyouwKqlmMvY+XT5z9uphKnGUf9IEUECQQDy066RTEkzZt1en0tM07ZUlvuznfKT7nx+KGHkxxPW1+lkwtKge5jFNvIzYy6H9P8SzFI8iYLU4weoNPs65/hhAkEA7tM3whLxhrUL83brUSIp8UBkWG37G8Rrxgt4wdly/ZRnVA4KZz5ZCZ8KmwYbEVSdN3JL0mBCyKAuQ226ifkQLwJAT534bsuEdMYVbyDrn5ULA1E91fbDwp0/VF4JOunLJ3ZDoDYAuX3M6VzKrO6oIwvBVniHvjGYJBUMPaqhdP76AQJBALPKTKqMykjH2QRjHQnKN1sIR8KOoUCpIR1Jm5ILmlauNw9/NnO86xikIz7LXOsyEN0h7VSl5QDWHZ3jaE/gMT8CQQCFq2VBx7yHNeORrVK4BgArsWxajssplqM0s1zhZO4SM0WZZqRdhdXgedWv7OsO57kP1KlYrkz8atqRo2OwWQSj";

    @Autowired
    private RestTemplate restTemplate;

    public GepgBillingController(RestTemplate restTemplate2) {
        // TODO Auto-generated constructor stub
    }

    @RequestMapping(value = "/requestControlNumber", method = RequestMethod.POST)
    public ResponseEntity<String> requestControlNumber(@RequestBody String payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Signing the payload using private key
        String signedPayload = signPayload(payload, CLIENT_PRIVATE_KEY);

        // Adding signed payload to the request
        HttpEntity<String> requestEntity = new HttpEntity<>(signedPayload, headers);

        ResponseEntity<String> responseEntity = restTemplate.exchange(SERVICE_API_URL, HttpMethod.POST, requestEntity,
                String.class);

        return ResponseEntity.status(responseEntity.getStatusCode()).body(responseEntity.getBody());
    }

    // Method to sign payload using private key
    private String signPayload(String payload, String privateKey) {
        try {
            byte[] keyBytes = Base64Utils.decodeFromString(privateKey);
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PrivateKey privateKeyObj = keyFactory.generatePrivate(spec);

            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initSign(privateKeyObj);
            signature.update(payload.getBytes());
            byte[] signatureBytes = signature.sign();
            return Base64Utils.encodeToString(signatureBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
