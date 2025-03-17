export interface PatientI {
    patient: object,
    paymentTypeDetails: "Insurance" | "Cash",
    visitUuid: string
}