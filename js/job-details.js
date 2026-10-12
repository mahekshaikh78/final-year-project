
/* =========================
   JOB DATA
========================= */

const jobData = {
    "Python Developer": {
        description: "We are looking for a Python Developer to build and maintain applications using Python, Django, and databases.",
        responsibilities: [
            "Develop and maintain applications using Python.",
            "Build backend functionality using Django.",
            "Work with SQL databases and REST APIs.",
            "Test, debug, and improve application performance."
        ],
        skills: ["Python", "Django", "SQL", "REST APIs", "Git"]
    },

    "Full Stack Developer": {
        description: "We are looking for a Full Stack Developer who can build responsive user interfaces and develop backend applications.",
        responsibilities: [
            "Create responsive web pages using HTML, CSS, and JavaScript.",
            "Develop backend features using Python and Django.",
            "Work with databases and REST APIs.",
            "Test and maintain web applications."
        ],
        skills: ["HTML", "CSS", "JavaScript", "Python", "Django", "SQL", "REST APIs"]
    },

    "Frontend Developer": {
        description: "We are looking for a Frontend Developer to create responsive, accessible, and user-friendly web interfaces.",
        responsibilities: [
            "Build responsive web pages.",
            "Write maintainable HTML, CSS, and JavaScript.",
            "Work with designers to implement user interfaces.",
            "Test pages across different screen sizes."
        ],
        skills: ["HTML", "CSS", "JavaScript", "Responsive Design", "Git"]
    },

    "Backend Developer": {
        description: "We are looking for a Backend Developer to develop server-side applications, manage databases, and build APIs.",
        responsibilities: [
            "Develop backend logic and application features.",
            "Work with Python and Django.",
            "Design and query relational databases.",
            "Build, test, and maintain REST APIs."
        ],
        skills: ["Python", "Django", "SQL", "REST APIs", "Git"]
    },

    "Software Engineer": {
        description: "We are looking for a Software Engineer to design, develop, test, and maintain reliable software applications.",
        responsibilities: [
            "Write clean and maintainable code.",
            "Solve programming and debugging problems.",
            "Work with databases and software components.",
            "Test applications and collaborate with team members."
        ],
        skills: ["Python", "DSA", "OOP", "SQL", "Git"]
    },

    "Data Analyst": {
        description: "We are looking for a Data Analyst to analyze data, identify trends, and prepare reports that support decisions.",
        responsibilities: [
            "Collect, clean, and analyze datasets.",
            "Write SQL queries to retrieve information.",
            "Use Python to analyze data.",
            "Create reports and data visualizations."
        ],
        skills: ["SQL", "Python", "Excel", "Data Analysis", "Visualization"]
    },

    "AI/ML Engineer": {
        description: "We are looking for an AI/ML Engineer to prepare data, develop machine learning models, and evaluate model performance.",
        responsibilities: [
            "Prepare and process datasets.",
            "Develop and evaluate machine learning models.",
            "Use Python and relevant ML libraries.",
            "Document experiments and model results."
        ],
        skills: ["Python", "Machine Learning", "Pandas", "NumPy", "Statistics"]
    },

    "Web Developer": {
        description: "We are looking for a Web Developer to build, maintain, and improve modern websites and web applications.",
        responsibilities: [
            "Create web pages using HTML and CSS.",
            "Add interactive features using JavaScript.",
            "Connect pages to backend services when available.",
            "Test and maintain website functionality."
        ],
        skills: ["HTML", "CSS", "JavaScript", "Responsive Design", "Git"]
    }
};


/* =========================
   LOAD SAVED JOB
========================= */

const savedJob = JSON.parse(
    sessionStorage.getItem("selectedJob") || "null"
);

const roleSelect = document.getElementById("jobRoleSelect");
const roleTitle = document.getElementById("jobRoleTitle");
const descriptionText = document.getElementById("jobDescriptionText");
const responsibilitiesList = document.getElementById("jobResponsibilities");
const requiredSkills = document.getElementById("requiredSkills");
const descriptionType = document.getElementById("descriptionType");

const resumeFile = document.getElementById("resumeFile");
const selectedFileName = document.getElementById("selectedFileName");
const resumeForm = document.getElementById("resumeUploadForm");
const formMessage = document.getElementById("formMessage");


/* =========================
   DISPLAY JOB DETAILS
========================= */

function displayJobDetails(job, title) {
    roleTitle.textContent = title;
    descriptionText.textContent = job.description;

    responsibilitiesList.replaceChildren();

    job.responsibilities.forEach(function (responsibility) {
        const item = document.createElement("li");
        item.textContent = responsibility;
        responsibilitiesList.appendChild(item);
    });

    requiredSkills.replaceChildren();

    job.skills.forEach(function (skill) {
        const tag = document.createElement("span");
        tag.textContent = skill;
        requiredSkills.appendChild(tag);
    });

    descriptionType.textContent = "Sample Description";
}


/* =========================
   UPDATE JOB DESCRIPTION
========================= */

function updateJobDescription() {
    const selectedRole = roleSelect.value;
    const job = jobData[selectedRole];

    if (!job) {
        return;
    }

    displayJobDetails(job, selectedRole);
}

// Update the description when the dropdown changes.
roleSelect.addEventListener("change", updateJobDescription);


/* =========================
   INITIALIZE SELECTED JOB
========================= */

if (savedJob) {
    const matchingRole = Object.keys(jobData).find(function (role) {
        return role.toLowerCase() === savedJob.title.toLowerCase();
    });

    if (matchingRole) {
        roleSelect.value = matchingRole;
        updateJobDescription();
    } else {
        // Display a job selected from the Results page.
        const customJob = {
            description:
                "Sample job description for " + savedJob.title +
                " at " + savedJob.company + ".",

            responsibilities: [
                "Review the requirements for this position.",
                "Work with the technologies listed for this job.",
                "Develop, test, and maintain application features."
            ],

            skills: savedJob.skills || []
        };

        displayJobDetails(customJob, savedJob.title);
    }
} else {
    // Display the default role if no job was selected.
    updateJobDescription();
}


/* =========================
   RESUME VALIDATION
========================= */

resumeFile.addEventListener("change", function () {
    formMessage.textContent = "";

    const file = resumeFile.files[0];

    if (!file) {
        selectedFileName.textContent = "No file selected";
        return;
    }

    const validExtension = /\.(pdf|docx)$/i.test(file.name);

    const validType =
        file.type === "application/pdf" ||
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!validExtension || !validType) {
        selectedFileName.textContent = "No file selected";
        formMessage.textContent =
            "Please select a valid PDF or DOCX resume.";

        resumeFile.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        selectedFileName.textContent = "No file selected";
        formMessage.textContent =
            "Your resume must be smaller than 5 MB.";

        resumeFile.value = "";
        return;
    }

    selectedFileName.textContent = file.name;
});


/* =========================
   CONNECT TO GAP ANALYSIS
========================= */

resumeForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const file = resumeFile.files[0];

    if (!file) {
        formMessage.style.color = "#fca5a5";
        formMessage.textContent =
            "Please upload your resume first.";
        return;
    }

    // Identify the role currently displayed on this page.
    const currentTitle = roleTitle.textContent.trim();
    const matchingRole = Object.keys(jobData).find(function (role) {
        return role.toLowerCase() === currentTitle.toLowerCase();
    });

    const currentJobData = matchingRole
        ? jobData[matchingRole]
        : null;

    // Save the job information for Gap Analysis.
    const gapAnalysisJob = {
        title: currentTitle,
        company: savedJob ? savedJob.company : "",
        location: savedJob ? savedJob.location : "",
        skills: currentJobData
            ? currentJobData.skills
            : Array.from(
                requiredSkills.querySelectorAll("span")
            ).map(function (tag) {
                return tag.textContent.trim();
            })
    };

    sessionStorage.setItem(
        "gapAnalysisJob",
        JSON.stringify(gapAnalysisJob)
    );

    // Save the filename for display on the next page.
    sessionStorage.setItem("uploadedResumeName", file.name);

    // Open the Gap Analysis page.
    window.location.href = "gap-analysis.html";
});
