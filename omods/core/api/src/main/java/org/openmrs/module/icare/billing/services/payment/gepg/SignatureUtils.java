package org.openmrs.module.icare.billing.services.payment.gepg;

import java.security.PrivateKey;
import java.security.Signature;
import java.util.Base64;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;

public class SignatureUtils {
	
	public static String signData(String data, String base64PrivateKey) throws Exception {
		
		byte[] keyBytes = Base64.getDecoder().decode(base64PrivateKey);
		PrivateKey privateKey = decodePrivateKey(keyBytes);
		
		Signature signature = Signature.getInstance("SHA1withRSA");
		signature.initSign(privateKey);
		signature.update(data.getBytes());
		
		byte[] digitalSignature = signature.sign();
		return Base64.getEncoder().encodeToString(digitalSignature);
	}
	
	public static PrivateKey decodePrivateKey(byte[] keyBytes) throws Exception {
		try {
			
			KeyFactory keyFactory = KeyFactory.getInstance("RSA");
			PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
			return keyFactory.generatePrivate(keySpec);
		}
		catch (Exception e) {
			throw new Exception("Failed to decode private key: " + e.getMessage(), e);
		}
	}
	
	public static byte[] decodeBase64(String base64String) {
		return Base64.getDecoder().decode(base64String);
	}
	
}
