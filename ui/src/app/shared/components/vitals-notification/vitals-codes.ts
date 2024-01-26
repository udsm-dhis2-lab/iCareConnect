export function showPopup(patientName: string): void {
    const popupContainer = document.createElement('div');
    popupContainer.classList.add('popup-container');

    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');
    popupContent.innerHTML = 'Pulse on the new patient! <strong>${patientName}</strong>&apos s vitals are in! ✅';

    popupContainer.appendChild(popupContent);
    document.body.appendChild(popupContainer);

    // Optional: Add a timeout to automatically close the popup after a certain duration
    setTimeout(() => {
        document.body.removeChild(popupContainer);
    }, 5000); // Adjust the duration (in milliseconds) as needed
}