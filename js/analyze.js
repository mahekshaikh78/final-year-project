
// ========================================
// DOM ELEMENTS
// ========================================

const jobPreferencesForm = document.getElementById("jobPreferencesForm");
const fetchJobsButton = document.getElementById("fetchJobsButton");

const JOBS_WEBHOOK_URL =
    "https://n8n.bhuvisx.com/webhook/skillbridge-jobs";


// ========================================
// LOCATION CHECKBOX HANDLING
// Any Location is exclusive
// ========================================

const locationCheckboxes = document.querySelectorAll(
    'input[name="jobLocation"]'
);

locationCheckboxes.forEach(function (checkbox) {

    checkbox.addEventListener("change", function () {

        const anyLocation = document.querySelector(
            'input[name="jobLocation"][value="Any Location"]'
        );

        if (checkbox.value === "Any Location" && checkbox.checked) {

            locationCheckboxes.forEach(function (item) {
                if (item !== checkbox) {
                    item.checked = false;
                }
            });

        } else if (checkbox.checked && anyLocation) {

            anyLocation.checked = false;

        }

    });

});


// ========================================
// FORM SUBMISSION
// ========================================

if (jobPreferencesForm && fetchJobsButton) {

    jobPreferencesForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        // --------------------------------
        // Read form values
        // --------------------------------

        const selectedJobRole =
            document.getElementById("jobRole").value;

        const preferredSkills =
            document.getElementById("preferredSkills").value.trim();

        const experienceLevel =
            document.getElementById("experienceLevel").value;

        const country =
            document.getElementById("jobCountry").value;


        // --------------------------------
        // Selected platforms
        // --------------------------------

        const selectedPlatforms = Array.from(
            document.querySelectorAll(
                '#platformGroup input[name="jobPlatform"]:checked'
            )
        ).map(function (item) {
            return item.value;
        });


        // --------------------------------
        // Selected locations
        // --------------------------------

        const selectedLocations = Array.from(
            document.querySelectorAll(
                '#locationGroup input[name="jobLocation"]:checked'
            )
        ).map(function (item) {
            return item.value;
        });


        // --------------------------------
        // Selected work modes
        // --------------------------------

        const selectedWorkModes = Array.from(
            document.querySelectorAll(
                '#workModeGroup input[name="workMode"]:checked'
            )
        ).map(function (item) {
            return item.value;
        });


        // --------------------------------
        // Validate form
        // --------------------------------

        if (!selectedJobRole) {
            alert("Please select a job role.");
            return;
        }

        if (selectedPlatforms.length === 0) {
            alert("Please select at least one job platform.");
            return;
        }

        if (selectedLocations.length === 0) {
            alert("Please select at least one preferred location.");
            return;
        }

        if (selectedWorkModes.length === 0) {
            alert("Please select at least one work mode.");
            return;
        }

        if (!experienceLevel) {
            alert("Please select your experience level.");
            return;
        }

        if (!country) {
            alert("Please select a country.");
            return;
        }

        if (!preferredSkills) {
            alert("Please enter your preferred skills.");
            return;
        }


        // --------------------------------
        // Handle Other role
        // --------------------------------

        const isOtherSelected = selectedJobRole === "other";

        const finalJobRole = isOtherSelected
            ? "Other"
            : selectedJobRole;


        // --------------------------------
        // Prepare request data
        // --------------------------------

        const jobPreferences = {

            role: finalJobRole,

            platform: selectedPlatforms,

            location: selectedLocations,

            country: country,

            experienceLevel: experienceLevel,

            preferredSkills: preferredSkills,

            workMode: selectedWorkModes,

            searchBySkillsOnly: isOtherSelected

        };


        console.log("Job Search Request:", jobPreferences);


        // --------------------------------
        // Disable button while searching
        // --------------------------------

        fetchJobsButton.disabled = true;

        fetchJobsButton.textContent = "Finding Matching Jobs...";


        try {

            // --------------------------------
            // Send request to n8n
            // --------------------------------

            const response = await fetch(JOBS_WEBHOOK_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(jobPreferences)

            });


            if (!response.ok) {

                const errorText = await response.text();

                throw new Error(
                    `Request failed (${response.status}): ${errorText}`
                );

            }


            // --------------------------------
            // Read workflow response
            // --------------------------------

            const result = await response.json();


            if (
                !result.success ||
                !Array.isArray(result.jobs)
            ) {

                throw new Error(
                    "The workflow returned an unexpected response."
                );

            }


            // --------------------------------
            // Store job preferences
            // --------------------------------

            sessionStorage.setItem(

                "jobPreferences",

                JSON.stringify({

                    jobRole: finalJobRole,

                    preferredSkills: preferredSkills,

                    experienceLevel: experienceLevel,

                    jobLocation: selectedLocations,

                    jobPlatform: selectedPlatforms,

                    jobCountry: country,

                    workMode: selectedWorkModes,

                    searchBySkillsOnly: isOtherSelected

                })

            );


            // --------------------------------
            // Store job results
            // --------------------------------

            sessionStorage.setItem(

                "jobResults",

                JSON.stringify(result)

            );


            console.log("Job Search Results:", result);


            // --------------------------------
            // Navigate to results page
            // --------------------------------

            window.location.href = "results.html";


        } catch (error) {

            console.error("Job retrieval error:", error);

            alert(
                "Unable to retrieve jobs. Please check the browser console and n8n execution details."
            );

        } finally {

            // --------------------------------
            // Restore button
            // --------------------------------

            fetchJobsButton.disabled = false;

            fetchJobsButton.textContent = "Find Matching Jobs →";

        }

    });

}
