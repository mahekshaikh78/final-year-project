
const jobPreferencesForm = document.getElementById("jobPreferencesForm");
const fetchJobsButton = document.getElementById("fetchJobsButton");

if (jobPreferencesForm && fetchJobsButton) {
    jobPreferencesForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const jobRole = document.getElementById("jobRole").value;
        const preferredSkills = document.getElementById("preferredSkills").value.trim();
        const experienceLevel = document.getElementById("experienceLevel").value;
        const jobLocation = document.getElementById("jobLocation").value;
        const jobPlatform = document.getElementById("jobPlatform").value;

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

        const jobPreferences = {
            jobRole: jobRole,
            preferredSkills: preferredSkills,
            experienceLevel: experienceLevel,
            jobLocation: jobLocation,
            jobPlatform: jobPlatform
        };

        // Save preferences so the results page can access them
        sessionStorage.setItem(
            "jobPreferences",
            JSON.stringify(jobPreferences)
        );

        // Open the results page
        window.location.href = "results.html";
    });
}
