
const jobPreferencesForm = document.getElementById("jobPreferencesForm");
const fetchJobsButton = document.getElementById("fetchJobsButton");

const JOBS_WEBHOOK_URL =
    "https://n8n.bhuvisx.com/webhook/skillbridge-jobs";

// Platform dropdown
const platformToggle = document.getElementById("platformToggle");
const platformOptions = document.getElementById("platformOptions");
const platformLabel = document.getElementById("platformLabel");
const jobRoleSelect = document.getElementById("jobRole");
const customRoleGroup = document.getElementById("customRoleGroup");
const customJobRole = document.getElementById("customJobRole");

jobRoleSelect.addEventListener("change", () => {
    const isOther = jobRoleSelect.value === "other";

    customRoleGroup.hidden = !isOther;
    customJobRole.required = isOther;

    if (!isOther) {
        customJobRole.value = "";
    }
});

if (platformToggle && platformOptions) {
    platformToggle.addEventListener("click", () => {
        platformOptions.hidden = !platformOptions.hidden;
        platformToggle.setAttribute(
            "aria-expanded",
            String(!platformOptions.hidden)
        );
    });

    const platformCheckboxes = platformOptions.querySelectorAll(
        'input[name="jobPlatform"]'
    );

    platformCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            const anyPlatform = platformOptions.querySelector(
                'input[value="Any Platform"]'
            );

            if (checkbox.value === "Any Platform" && checkbox.checked) {
                platformCheckboxes.forEach((item) => {
                    if (item !== checkbox) item.checked = false;
                });
            } else if (checkbox.checked && anyPlatform) {
                anyPlatform.checked = false;
            }

            const selected = Array.from(platformCheckboxes)
                .filter((item) => item.checked)
                .map((item) => item.value);

            platformLabel.textContent = selected.length
                ? selected.join(", ")
                : "Select platforms";
        });
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest("#platformDropdown")) {
            platformOptions.hidden = true;
            platformToggle.setAttribute("aria-expanded", "false");
        }
    });
}

// Make Any Location exclusive
const locationCheckboxes = document.querySelectorAll(
    'input[name="jobLocation"]'
);

locationCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        const anyLocation = document.querySelector(
            'input[name="jobLocation"][value="Any Location"]'
        );

        if (checkbox.value === "Any Location" && checkbox.checked) {
            locationCheckboxes.forEach((item) => {
                if (item !== checkbox) item.checked = false;
            });
        } else if (checkbox.checked && anyLocation) {
            anyLocation.checked = false;
        }
    });
});

// Submit preferences
if (jobPreferencesForm && fetchJobsButton) {
    jobPreferencesForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const selectedJobRole =
            document.getElementById("jobRole").value;

        const preferredSkills =
            document.getElementById("preferredSkills").value.trim();

        const experienceLevel =
            document.getElementById("experienceLevel").value;

        const country =
            document.getElementById("jobCountry").value;

        const selectedPlatforms = Array.from(
        document.querySelectorAll(
        '#platformGroup input[name="jobPlatform"]:checked'
         )
        ).map((item) => item.value);

        const selectedLocations = Array.from(
            document.querySelectorAll(
                'input[name="jobLocation"]:checked'
            )
        ).map((item) => item.value);

        const selectedWorkModes = Array.from(
            document.querySelectorAll(
                'input[name="workMode"]:checked'
            )
        ).map((item) => item.value);

        if (
            !selectedJobRole ||
            !preferredSkills ||
            !experienceLevel ||
            !country ||
            selectedPlatforms.length === 0 ||
            selectedLocations.length === 0 ||
            selectedWorkModes.length === 0
        ) {
            alert(
                "Please select a job role, platforms, location, " +
                "country, experience level, work mode, and skills."
            );
            return;
        }

        const isOtherSelected = selectedJobRole === "other";

        const finalJobRole = isOtherSelected
            ? customJobRole.value.trim()
            : selectedJobRole;

        if (isOtherSelected && !finalJobRole) {
            alert("Please enter your preferred job role.");
            return;
        }

        const jobPreferences = {
            role: finalJobRole,
            platform: selectedPlatforms,
            location: selectedLocations,
            country: country,
            experienceLevel: experienceLevel,
            preferredSkills: preferredSkills,
            workMode: selectedWorkModes,
            searchBySkillsOnly: false
        };

        fetchJobsButton.disabled = true;
        fetchJobsButton.textContent = "Finding Matching Jobs...";

        try {
            const response = await fetch(JOBS_WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jobPreferences)
            });

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success || !Array.isArray(result.jobs)) {
                throw new Error(
                    "The workflow returned an unexpected response."
                );
            }

            sessionStorage.setItem(
                "jobPreferences",
                JSON.stringify({
                    jobRole: isOtherSelected ? "Other" : selectedJobRole,
                    preferredSkills,
                    experienceLevel,
                    jobLocation: selectedLocations,
                    jobPlatform: selectedPlatforms,
                    jobCountry: country,
                    workMode: selectedWorkModes,
                    searchBySkillsOnly: isOtherSelected
                })
            );

            sessionStorage.setItem(
                "jobResults",
                JSON.stringify(result)
            );

            window.location.href = "results.html";
        } catch (error) {
            console.error("Job retrieval error:", error);

            alert(
                "Unable to retrieve jobs. Check the n8n execution " +
                "details and browser console for the error."
            );
        } finally {
            fetchJobsButton.disabled = false;
            fetchJobsButton.textContent = "Find Matching Jobs →";
        }
    });
}
