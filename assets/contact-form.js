
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("project-enquiry-form");

    if (!form) return;

    // ==========================================
    // CONFIGURATION
    // ==========================================

    const API_URL = form.dataset.workerUrl;

    const messageElement = document.getElementById("form-message");
    const submitButton = form.querySelector('button[type="submit"]');

    if (!API_URL || !messageElement || !submitButton) {
        console.error("Contact form configuration is incomplete.");
        return;
    }

    // Preserve original button content.
    const originalButtonHTML = submitButton.innerHTML;

    // ==========================================
    // FORM MESSAGE HANDLER
    // ==========================================

    function showMessage(message, type) {
        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
        messageElement.setAttribute("role", "status");
    }

    function clearMessage() {
        messageElement.textContent = "";
        messageElement.className = "form-message";
    }

    // ==========================================
    // SUBMIT BUTTON STATE
    // ==========================================

    function setLoading(isLoading) {
        submitButton.disabled = isLoading;

        form.setAttribute(
            "aria-busy",
            isLoading ? "true" : "false"
        );

        if (isLoading) {
            submitButton.innerHTML = `
                <span>Submitting enquiry...</span>
            `;
        } else {
            submitButton.innerHTML = originalButtonHTML;
        }
    }

    // ==========================================
    // FORM SUBMISSION
    // ==========================================

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Prevent duplicate submissions.
        if (submitButton.disabled) return;

        clearMessage();

        // Browser-native required field validation.
        if (!form.reportValidity()) return;

        const formData = new FormData(form);

        // ======================================
        // PREPARE API PAYLOAD
        // ======================================

        const payload = {
            name: String(formData.get("name") || "").trim(),

            company: String(formData.get("company") || "").trim(),

            email: String(formData.get("email") || "").trim(),

            phone: String(formData.get("phone") || "").trim(),

            project: String(formData.get("project") || "").trim(),

            quantity: String(formData.get("quantity") || "").trim(),

            message: String(formData.get("message") || "").trim(),

            consent: form.elements.namedItem("consent").checked,

            // Existing hidden honeypot field.
            website: String(formData.get("website") || "").trim(),

            // Track the page from which the enquiry originated.
            sourcePage: window.location.href
        };

        // ======================================
        // CLIENT-SIDE VALIDATION
        // ======================================

        if (!payload.name || !payload.email ||
            !payload.project || !payload.message) {

            showMessage(
                "Please complete all required fields.",
                "error"
            );

            return;
        }

        if (!payload.consent) {
            showMessage(
                "Please agree to be contacted about this enquiry.",
                "error"
            );

            return;
        }

        // ======================================
        // SEND REQUEST TO CLOUDFLARE WORKER
        // ======================================

        setLoading(true);

        showMessage(
            "Submitting your project enquiry...",
            "loading"
        );

        try {
            const response = await fetch(API_URL, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(payload)
            });

            let result;

            try {
                result = await response.json();
            } catch {
                throw new Error(
                    "Invalid response received from the enquiry server."
                );
            }

            // ==================================
            // HANDLE API ERRORS
            // ==================================

            if (!response.ok || !result.success) {

                const errorMessages = {
                    400: "Please check your enquiry details and try again.",
                    403: "Your request could not be authorized.",
                    413: "Your enquiry is too large.",
                    415: "Unsupported request format.",
                    429: "Too many submissions. Please try again later.",
                    502: "We couldn't save your enquiry. Please try again later."
                };

                throw new Error(
                    result.error ||
                    errorMessages[response.status] ||
                    "Something went wrong. Please try again."
                );
            }

            // ==================================
            // SUCCESS
            // ==================================

            showMessage(
                "Thank you! Your enquiry has been submitted successfully. Our team will get in touch with you.",
                "success"
            );

            console.log("Enquiry submitted successfully:", {
                submissionId: result.data?.submissionId,
                submittedAt: result.data?.submittedAt
            });

            // Reset all form fields after successful submission.
            form.reset();

        } catch (error) {

            // ==================================
            // NETWORK / SERVER ERROR
            // ==================================

            console.error(
                "Contact form submission failed:",
                error
            );

            showMessage(
                error.message ||
                "Unable to submit your enquiry. Please try again later.",
                "error"
            );

        } finally {

            // Restore button state.
            setLoading(false);

        }
    });

});
