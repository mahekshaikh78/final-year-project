
/* =========================
   LOAD SELECTED LIVE JOB
========================= */

function readSessionJSON(key) {
    try {
        return JSON.parse(sessionStorage.getItem(key) || "null");
    } catch (error) {
        console.error("Unable to read saved job:", error);
        return null;
    }
}

const savedJob = readSessionJSON("selectedJob");

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
   EXTRACT REAL JOB DETAILS
========================= */


function cleanJobText(text) {
    return String(text || "")
        .replace(/\r/g, "\n")
        .replace(/\\n/g, "\n")
        .replace(/\*\*/g, "")
        .replace(/\\\*/g, "")
        .replace(/\s+/g, " ")
        .trim();
}


function extractResponsibilities(description) {
    const text = cleanJobText(description);

    const startPattern =
        /(?:key responsibilities|responsibilities|what you will do|what you'll do|duties)\s*:?\s*/i;

    const endPattern =
        /(?:required skills\s*&?\s*qualifications|required qualifications|qualifications|preferred qualifications|minimum qualifications|about us|about the company)\s*:?\s*/i;

    const start = text.match(startPattern);

    if (!start || start.index === undefined) {
        return [];
    }

    const contentStart = start.index + start[0].length;
    const remaining = text.slice(contentStart);
    const end = remaining.match(endPattern);
    const section = end
        ? remaining.slice(0, end.index)
        : remaining;

    return section
        .split(/\s+\*\s+|\s+•\s+|(?<=\.)\s+(?=[A-Z])/)
        .map(function (item) {
            return item.replace(/^[\s*•-]+/, "").trim();
        })
        .filter(function (item) {
            return item.length > 15;
        });
}



function extractSkills(description, suppliedSkills) {
    if (Array.isArray(suppliedSkills) && suppliedSkills.length > 0) {
        return suppliedSkills
            .map(function (skill) {
                return String(skill).trim();
            })
            .filter(Boolean);
    }

    const text = String(description || "")
        .replace(/\*\*/g, "")
        .replace(/\r/g, "\n")
        .replace(/\\n/g, "\n");

    const skills = [
        "Python", "Java", "C#", "Go", "Kotlin",
        "JavaScript", "TypeScript", "SQL",
        "PostgreSQL", "SQL Server", "MySQL",
        "REST APIs", "event-driven integrations",
        "distributed systems", "microservices",
        "system design", "design patterns",
        "automated testing", "unit testing",
        "integration testing", "contract testing",
        "Docker", "Kubernetes", "AWS", "Azure", "GCP",
        "CI/CD", "GitHub", "Agile",
        "AI-assisted development tools",
        "LLM APIs", "intelligent automation",
        "agentic workflows", "observability",
        "production operations"
    ];

    const foundSkills = [];

    skills.forEach(function (skill) {
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = new RegExp("\\b" + escapedSkill + "\\b", "i");

        if (pattern.test(text)) {
            foundSkills.push(skill);
        }
    });

    return foundSkills;
}




/* =========================
   DISPLAY SELECTED JOB
========================= */

function displayJobDetails(job) {
    if (!job) {
        return;
    }

    const title = job.title || job.jobTitle || "Selected Job";
    const description = String(job.description || "").trim();

    if (roleTitle) {
        roleTitle.textContent = title;
    }

    if (roleSelect) {
        const matchingOption = Array.from(roleSelect.options).find(
            function (option) {
                return option.value.trim().toLowerCase() ===
                    title.trim().toLowerCase() ||
                    option.textContent.trim().toLowerCase() ===
                    title.trim().toLowerCase();
            }
        );

        // Do not change the live job title if the dropdown
        // contains only general role categories.
        if (matchingOption) {
            roleSelect.value = matchingOption.value;
        }
    }

    if (descriptionText) {
        descriptionText.textContent = description ||
            "The source did not provide a full description for this listing. Please use the original job listing to review its details.";
    }

    if (descriptionType) {
        descriptionType.textContent = description
            ? "Live Job Description"
            : "Description Unavailable";
    }

    if (responsibilitiesList) {
        responsibilitiesList.replaceChildren();

        const responsibilities = extractResponsibilities(description);

        if (responsibilities.length > 0) {
            responsibilities.forEach(function (item) {
                const li = document.createElement("li");
                li.textContent = item;
                responsibilitiesList.appendChild(li);
            });
        } else {
            const li = document.createElement("li");
            li.textContent =
                "Separate responsibilities could not be identified in the source description.";
            responsibilitiesList.appendChild(li);
        }
    }

    if (requiredSkills) {
        requiredSkills.replaceChildren();

        const skills = extractSkills(description, job.skills);

        if (skills.length > 0) {
            skills.forEach(function (skill) {
                const tag = document.createElement("span");
                tag.textContent = skill;
                requiredSkills.appendChild(tag);
            });
        } else {
            const message = document.createElement("p");
            message.textContent =
                "Specific skills were not supplied separately by the job source.";
            requiredSkills.appendChild(message);
        }
    }

    // Update the browser tab title for the selected listing.
    document.title = title + " | Job Details";

    if (formMessage) {
        formMessage.textContent = "";
    }
}


/* =========================
   ROLE DROPDOWN
========================= */

if (roleSelect) {
    roleSelect.addEventListener("change", function () {
        // The dropdown is a preference, not a replacement
        // for the actual live job selected from the results.
        if (roleTitle && !savedJob) {
            roleTitle.textContent = roleSelect.value;
        }
    });
}


/* =========================
   INITIALIZE SELECTED JOB
========================= */

if (savedJob) {
    displayJobDetails(savedJob);
} else {
    if (roleTitle) {
        roleTitle.textContent = "No job selected";
    }

    if (descriptionText) {
        descriptionText.textContent =
            "Please return to the results page and select a job first.";
    }

    if (descriptionType) {
        descriptionType.textContent = "No Job Selected";
    }
}


/* =========================
   RESUME VALIDATION
========================= */

if (resumeFile) {
    resumeFile.addEventListener("change", function () {
        if (formMessage) {
            formMessage.textContent = "";
        }

        const file = resumeFile.files[0];

        if (!file) {
            if (selectedFileName) {
                selectedFileName.textContent = "No file selected";
            }
            return;
        }

        const validExtension = /\.(pdf|docx)$/i.test(file.name);

        const validType =
            file.type === "application/pdf" ||
            file.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        if (!validExtension || !validType) {
            if (selectedFileName) {
                selectedFileName.textContent = "No file selected";
            }

            if (formMessage) {
                formMessage.textContent =
                    "Please select a valid PDF or DOCX resume.";
            }

            resumeFile.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            if (selectedFileName) {
                selectedFileName.textContent = "No file selected";
            }

            if (formMessage) {
                formMessage.textContent =
                    "Your resume must be smaller than 5 MB.";
            }

            resumeFile.value = "";
            return;
        }

        if (selectedFileName) {
            selectedFileName.textContent = file.name;
        }
    });
}


/* =========================
   CONNECT TO GAP ANALYSIS
========================= */

if (resumeForm) {
    resumeForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const file = resumeFile ? resumeFile.files[0] : null;

        if (!file) {
            if (formMessage) {
                formMessage.style.color = "#fca5a5";
                formMessage.textContent =
                    "Please upload your resume first.";
            }
            return;
        }

        if (!savedJob) {
            if (formMessage) {
                formMessage.style.color = "#fca5a5";
                formMessage.textContent =
                    "Please select a job from the results page first.";
            }
            return;
        }

        sessionStorage.setItem(
            "gapAnalysisJob",
            JSON.stringify(savedJob)
        );

        sessionStorage.setItem("uploadedResumeName", file.name);

        // This stores the filename, not the file contents.
        window.location.href = "gap-analysis.html";
    });
}
