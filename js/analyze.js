
const jobPreferencesForm = document.getElementById("jobPreferencesForm");
const fetchJobsButton = document.getElementById("fetchJobsButton");

const JOBS_WEBHOOK_URL =
    "https://n8n.bhuvisx.com/webhook/skillbridge-jobs";

if (jobPreferencesForm && fetchJobsButton) {
    jobPreferencesForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const jobRole = document.getElementById("jobRole").value;
        const preferredSkills = document
            .getElementById("preferredSkills")
            .value.trim();
        const experienceLevel =
            document.getElementById("experienceLevel").value;
        const jobLocation =
            document.getElementById("jobLocation").value;
        const jobPlatform =
            document.getElementById("jobPlatform").value;

        if (
            !jobRole ||
            !preferredSkills ||
            !experienceLevel ||
            !jobLocation ||
            !jobPlatform
        ) {
            alert("Please fill in all job preferences.");
            return;
        }

        // Convert frontend field names to the names expected by n8n.
        const jobPreferences = {
            role: jobRole,
            platform: jobPlatform,
            location: jobLocation,
            experienceLevel: experienceLevel,
            preferredSkills: preferredSkills
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
                throw new Error("The workflow returned an unexpected response.");
            }

            // Save preferences and job results for results.html.
            sessionStorage.setItem(
                "jobPreferences",
                JSON.stringify({
                    jobRole,
                    preferredSkills,
                    experienceLevel,
                    jobLocation,
                    jobPlatform
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
                "Unable to retrieve jobs. Please check that your n8n workflow " +
                "is listening for a test event and try again. If the problem " +
                "continues, check the browser console and n8n execution details."
            );

        } finally {
            fetchJobsButton.disabled = false;
            fetchJobsButton.textContent = "Find Matching Jobs →";
        }
    });
}
