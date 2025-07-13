package org.openmrs.module.icare.billing.services.insurance.nhif.claim;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// import org.openmrs.module.icare.billing.models.Invoice;
import org.openmrs.module.icare.billing.services.insurance.Claim;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Folio implements Claim {

    @JsonProperty("FacilityCode")
    private String facilityCode;

    @JsonProperty("ClaimYear")
    private int claimYear;

    @JsonProperty("ClaimMonth")
    private int claimMonth;

    @JsonProperty("FolioNo")
    private long folioNo;

    @JsonProperty("CardNo")
    private String cardNo;

    @JsonProperty("FirstName")
    private String firstName;

    @JsonProperty("LastName")
    private String lastName;

    @JsonProperty("Gender")
    private String gender;

    @JsonProperty("DateOfBirth")
    private String dateOfBirth;

    @JsonProperty("TelephoneNo")
    private String telephoneNo;

    @JsonProperty("PatientFileNo")
    private String patientFileNo;

    @JsonProperty("BillNo")
    private String billNo;

    @JsonProperty("ClinicalNotes")
    private String clinicalNotes;

    @JsonProperty("AuthorizationNo")
    private String authorizationNo;

    @JsonProperty("AttendanceDate")
    private String attendanceDate;

    @JsonProperty("VisitTypeID")
    private int visitTypeID;

    @JsonProperty("PatientTypeCode")
    private String patientTypeCode;

    @JsonProperty("DateAdmitted")
    private String dateAdmitted;

    @JsonProperty("DateDischarged")
    private String dateDischarged;

    @JsonProperty("AttendingPractitioners")
    private List<String> attendingPractitioners = new ArrayList<>();

    @JsonProperty("LateSubmissionReason")
    private String lateSubmissionReason;

    @JsonProperty("AmountClaimed")
    private int amountClaimed;

    @JsonProperty("ConfirmationCode")
    private String confirmationCode;

    @JsonProperty("FolioDiseases")
    private List<FolioDisease> folioDiseases = new ArrayList<>();

    @JsonProperty("FolioItems")
    private List<FolioItem> folioItems = new ArrayList<>();

    @JsonProperty("Signatures")
    private List<Signature> signatures = new ArrayList<>();

    @JsonProperty("DateCreated")
    private String dateCreated;

    @JsonProperty("CreatedBy")
    private String createdBy;

    @JsonProperty("LastModified")
    private String lastModified;

    @JsonProperty("LastModifiedBy")
    private String lastModifiedBy;

    // Getters and Setters

    public String getFacilityCode() {
        return facilityCode;
    }

    public void setFacilityCode(String facilityCode) {
        this.facilityCode = facilityCode;
    }

    public int getClaimYear() {
        return claimYear;
    }

    public void setClaimYear(int claimYear) {
        this.claimYear = claimYear;
    }

    public int getClaimMonth() {
        return claimMonth;
    }

    public void setClaimMonth(int claimMonth) {
        this.claimMonth = claimMonth;
    }

    public long getFolioNo() {
        return folioNo;
    }

    public void setFolioNo(long folioNo) {
        this.folioNo = folioNo;
    }

    public String getCardNo() {
        return cardNo;
    }

    public void setCardNo(String cardNo) {
        this.cardNo = cardNo;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getTelephoneNo() {
        return telephoneNo;
    }

    public void setTelephoneNo(String telephoneNo) {
        this.telephoneNo = telephoneNo;
    }

    public String getPatientFileNo() {
        return patientFileNo;
    }

    public void setPatientFileNo(String patientFileNo) {
        this.patientFileNo = patientFileNo;
    }

    public String getBillNo() {
        return billNo;
    }

    public void setBillNo(String billNo) {
        this.billNo = billNo;
    }

    public String getClinicalNotes() {
        return clinicalNotes;
    }

    public void setClinicalNotes(String clinicalNotes) {
        this.clinicalNotes = clinicalNotes;
    }

    public String getAuthorizationNo() {
        return authorizationNo;
    }

    public void setAuthorizationNo(String authorizationNo) {
        this.authorizationNo = authorizationNo;
    }

    public String getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(String attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public int getVisitTypeID() {
        return visitTypeID;
    }

    public void setVisitTypeID(int visitTypeID) {
        this.visitTypeID = visitTypeID;
    }

    public String getPatientTypeCode() {
        return patientTypeCode;
    }

    public void setPatientTypeCode(String patientTypeCode) {
        this.patientTypeCode = patientTypeCode;
    }

    public String getDateAdmitted() {
        return dateAdmitted;
    }

    public void setDateAdmitted(String dateAdmitted) {
        this.dateAdmitted = dateAdmitted;
    }

    public String getDateDischarged() {
        return dateDischarged;
    }

    public void setDateDischarged(String dateDischarged) {
        this.dateDischarged = dateDischarged;
    }

    public List<String> getAttendingPractitioners() {
        return attendingPractitioners;
    }

    public void setAttendingPractitioners(List<String> attendingPractitioners) {
        this.attendingPractitioners = attendingPractitioners;
    }

    public String getLateSubmissionReason() {
        return lateSubmissionReason;
    }

    public void setLateSubmissionReason(String lateSubmissionReason) {
        this.lateSubmissionReason = lateSubmissionReason;
    }

    public int getAmountClaimed() {
        return amountClaimed;
    }

    public void setAmountClaimed(int amountClaimed) {
        this.amountClaimed = amountClaimed;
    }

    public String getConfirmationCode() {
        return confirmationCode;
    }

    public void setConfirmationCode(String confirmationCode) {
        this.confirmationCode = confirmationCode;
    }

    public List<FolioDisease> getFolioDiseases() {
        return folioDiseases;
    }

    public void setFolioDiseases(List<FolioDisease> folioDiseases) {
        this.folioDiseases = folioDiseases;
    }

    public List<FolioItem> getFolioItems() {
        return folioItems;
    }

    public void setFolioItems(List<FolioItem> folioItems) {
        this.folioItems = folioItems;
    }

    public List<Signature> getSignatures() {
        return signatures;
    }

    public void setSignatures(List<Signature> signatures) {
        this.signatures = signatures;
    }

    public String getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(String dateCreated) {
        this.dateCreated = dateCreated;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getLastModified() {
        return lastModified;
    }

    public void setLastModified(String lastModified) {
        this.lastModified = lastModified;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    @Override
    public Map<String, Object> toMap() {
        Map<String, Object> result = new HashMap<>();
        // Customize mapping as needed.
        return result;
    }
}
