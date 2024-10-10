package org.openmrs.module.icare.billing.services.payment.gepg;

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.*;
import java.util.Base64;

import org.openmrs.GlobalProperty;
import org.openmrs.api.AdministrationService;
import org.openmrs.api.context.Context;

public class SignatureUtils {
	
	// public static String signData(String data, String base64PrivateKey) throws
	// Exception {
	// // Decode the base64 encoded private key
	// byte[] keyBytes = Base64.getDecoder().decode(base64PrivateKey);
	// PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
	// KeyFactory keyFactory = KeyFactory.getInstance("RSA");
	// PrivateKey privateKey = keyFactory.generatePrivate(spec);
	
	// // Create a Signature object and initialize it with the private key
	// Signature signature = Signature.getInstance("SHA1withRSA");
	// signature.initSign(privateKey);
	// signature.update(data.getBytes(StandardCharsets.UTF_8));
	
	// // Sign the data and encode the signature in BASE64
	// byte[] digitalSignature = signature.sign();
	// String base64Signature =
	// Base64.getEncoder().encodeToString(digitalSignature);
	
	// // Log the signed data and signature
	// System.out.println("Data: " + data);
	// System.out.println("Base64 Signature: " + base64Signature);
	
	// return base64Signature;
	// }
	
	public static String signData(String payload, String base64PrivateKey) throws Exception {
		AdministrationService administrationService = Context.getAdministrationService();
		String clientPrivateKey = "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAKcElMpG9OrSU3/ylY+ZrHa7jUCbI7jWjKeB+jqLM+tTGkfwLuQIe+fLWIRJfK6q53qLD4nMdhhRdVB4Eg6CDSxXxl8QxLkWPLFyJ2iU8f6iAgZUE1yx4pGv8g8RmXtAG05HnVXtbKeO/33hEzHtKt5gNQN3RmiZR7hbF5QGN545AgMBAAECgYAhrYPPMfWq8BRURXcxCJzFKFZ4Q5A1clXUZRou+ejTN+Ohw+XAp5FMkS1dJ3BTzDR2+ll8wNTDXJGaU0vYzxKWnfta6U+mRmtdwBxT/PqlVtMOU090VweeO9+j5SaJx5eXauKyK9lxb75dTSmRjh3PW8wbZiXDIcknZj6udeqEnQJBANcxSfqHa4EW8PldeLfQ7K7erxN6h/jfe2mjAPf/fU04JDifoavcEBM6E/Bc6slsHtEazzv/CAhn93CA0SgkHhsCQQDGsJyod57dqd12XaVfbo05PMX0rsRJMresCIHLDzGIoApWZMzn8DmzS4FjtM+j7AzNbqR3slzp0wrBIaTtIOo7AkBKKWhveOAp2vgtWHNUFiKbmY8IzX+y24Iyw8R/s4NBa4nAIfObwPmhRrC8c6lOxX5RXkXxTVE9ZGc4VIzAosHlAkA8sGGJi9A4wNPmfcAvoCL+4rNMg71s5lL39zk9/wwQQWIm9W8pQVU+kMea3vW1ijp23V7bON3shgv45f/sdmtVAkEAuLiFZ6ncUsIv7ydLXUWyhY6h2qtk12aFKGaHqkWLCDrqD4WCJffti/+NPwCJu+qTIgc6YUpJPjFfHw8ULsxQig==";
		
		PrivateKey privateKey = getRsaPrivateKey(clientPrivateKey);
		Signature signature = Signature.getInstance("SHA256withRSA");
		signature.initSign(privateKey);
		signature.update(payload.getBytes());
		
		byte[] signedData = signature.sign();
		GlobalProperty globalProperty = new GlobalProperty();
		globalProperty.setProperty("gepg.signatureGenerated.icareConnect");
		globalProperty.setPropertyValue(Base64.getEncoder().encodeToString(signedData));
		administrationService.saveGlobalProperty(globalProperty);
		return Base64.getEncoder().encodeToString(signedData);
	}
	
	private static PrivateKey getRsaPrivateKey(String key) throws Exception {
		byte[] keyBytes = Base64.getDecoder().decode(key);
		PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
		KeyFactory keyFactory = KeyFactory.getInstance("RSA");
		return keyFactory.generatePrivate(spec);
	}
	
	public static boolean verifySignature(String data, String base64PublicKey, String base64Signature) throws Exception {
		// Decode the base64 encoded public key
		byte[] keyBytes = Base64.getDecoder().decode(base64PublicKey);
		X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
		KeyFactory keyFactory = KeyFactory.getInstance("RSA");
		PublicKey publicKey = keyFactory.generatePublic(spec);
		
		// Create a Signature object and initialize it with the public key
		Signature signature = Signature.getInstance("SHA1withRSA");
		signature.initVerify(publicKey);
		signature.update(data.getBytes(StandardCharsets.UTF_8));
		
		// Decode the base64 encoded signature
		byte[] digitalSignature = Base64.getDecoder().decode(base64Signature);
		
		// Log the data and signature before verification
		System.out.println("Data: " + data);
		System.out.println("Base64 Signature: " + base64Signature);
		
		// Verify the signature
		return signature.verify(digitalSignature);
	}
}
// import java.nio.charset.StandardCharsets;
// import java.security.*;
// import java.security.spec.PKCS8EncodedKeySpec;
// import java.security.spec.X509EncodedKeySpec;
// import java.util.Base64;
// public class SignatureUtils {
// // Method to sign data using the private key
// public static String signData(String data, String base64PrivateKey) throws
// Exception {
// // Decode the Base64-encoded private key
// byte[] privateKeyBytes = Base64.getDecoder().decode(base64PrivateKey);
// // Create PKCS8EncodedKeySpec with the private key bytes
// PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
// // Generate PrivateKey object using RSA
// KeyFactory keyFactory = KeyFactory.getInstance("RSA");
// PrivateKey privateKey = keyFactory.generatePrivate(keySpec);
// // Initialize a Signature object with SHA256withRSA algorithm
// Signature signature = Signature.getInstance("SHA256withRSA");
// signature.initSign(privateKey);
// // Update the signature object with the data
// signature.update(data.getBytes(StandardCharsets.UTF_8));
// // Sign the data and return the Base64-encoded signature
// byte[] signedBytes = signature.sign();
// return Base64.getEncoder().encodeToString(signedBytes);
// }
// // Method to verify signed data using the public key
// public static boolean verifySignature(String data, String base64PublicKey,
// String base64Signature) throws Exception {
// // Decode the Base64-encoded public key
// byte[] publicKeyBytes = Base64.getDecoder().decode(base64PublicKey);
// // Create X509EncodedKeySpec with the public key bytes
// X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicKeyBytes);
// // Generate PublicKey object using RSA
// KeyFactory keyFactory = KeyFactory.getInstance("RSA");
// PublicKey publicKey = keyFactory.generatePublic(keySpec);
// // Initialize a Signature object with SHA256withRSA algorithm
// Signature signature = Signature.getInstance("SHA256withRSA");
// signature.initVerify(publicKey);
// // Update the signature object with the original data
// signature.update(data.getBytes(StandardCharsets.UTF_8));
// // Verify the signature and return the result
// byte[] signedBytes = Base64.getDecoder().decode(base64Signature);
// return signature.verify(signedBytes);
// }
// }