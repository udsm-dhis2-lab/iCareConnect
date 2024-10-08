package org.openmrs.module.icare.billing.services.payment.gepg;

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class SignatureUtils {
	
	// Method to sign data using the private key
	public static String signData(String data, String base64PrivateKey) throws Exception {
		// Decode the Base64-encoded private key
		byte[] privateKeyBytes = Base64.getDecoder().decode(base64PrivateKey);
		
		// Create PKCS8EncodedKeySpec with the private key bytes
		PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
		
		// Generate PrivateKey object using RSA
		KeyFactory keyFactory = KeyFactory.getInstance("RSA");
		PrivateKey privateKey = keyFactory.generatePrivate(keySpec);
		
		// Initialize a Signature object with SHA256withRSA algorithm
		Signature signature = Signature.getInstance("SHA256withRSA");
		signature.initSign(privateKey);
		
		// Update the signature object with the data
		signature.update(data.getBytes(StandardCharsets.UTF_8));
		
		// Sign the data and return the Base64-encoded signature
		byte[] signedBytes = signature.sign();
		return Base64.getEncoder().encodeToString(signedBytes);
	}
	
	// Method to verify signed data using the public key
	public static boolean verifySignature(String data, String base64PublicKey, String base64Signature) throws Exception {
		// Decode the Base64-encoded public key
		byte[] publicKeyBytes = Base64.getDecoder().decode(base64PublicKey);
		
		// Create X509EncodedKeySpec with the public key bytes
		X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKeyBytes);
		
		// Generate PublicKey object using RSA
		KeyFactory keyFactory = KeyFactory.getInstance("RSA");
		PublicKey publicKey = keyFactory.generatePublic(keySpec);
		
		// Initialize a Signature object with SHA256withRSA algorithm
		Signature signature = Signature.getInstance("SHA256withRSA");
		signature.initVerify(publicKey);
		
		// Update the signature object with the original data
		signature.update(data.getBytes(StandardCharsets.UTF_8));
		
		// Verify the signature and return the result
		byte[] signedBytes = Base64.getDecoder().decode(base64Signature);
		return signature.verify(signedBytes);
	}
}
