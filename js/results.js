
/* =========================
   RESULTS PAGE JAVASCRIPT
========================= */


/* =========================
   DEMO ANALYSIS DATA
========================= */

const analysisData = {
    matchPercentage: 72,
    targetRole: "Full Stack Developer",

    matchedSkills: [
        "Python",
        "Django",
        "HTML",
        "CSS",
        "JavaScript",
        "MySQL",
        "REST API"
    ],

    skillGaps: [
        "Docker",
        "AWS",
        "React",
        "CI/CD"
    ],

    courses: [
        {
            category: "DevOps",
            level: "Beginner",
            title: "Docker Fundamentals",
            description:
                "Learn containers, images, Dockerfiles, and deployment basics.",
            duration: "4 Weeks"
        },
        {
            category: "Cloud",
            level: "Beginner",
            title: "AWS Cloud Essentials",
            description:
                "Understand the fundamentals of cloud computing and AWS services.",
            duration: "5 Weeks"
        },
        {
            category: "Frontend",
            level: "Intermediate",
            title: "React for Developers",
            description:
                "Build modern interactive interfaces using React and reusable components.",
            duration: "6 Weeks"
        }
    ]
};


/* =========================
   UPDATE MATCH PERCENTAGE
========================= */

const score = document.querySelector(".score-circle strong");

if (score) {
    score.textContent = `${analysisData.matchPercentage}%`;
}


/* =========================
   UPDATE TARGET ROLE
========================= */

const targetRoleElement =
    document.querySelector(".target-role strong");

if (targetRoleElement) {
    targetRoleElement.textContent = analysisData.targetRole;
}


/* =========================
   UPDATE MATCHED SKILLS
========================= */

const matchedSkillsContainer =
    document.querySelector(".skill-panel.matched .skill-tags");

if (matchedSkillsContainer) {
    matchedSkillsContainer.innerHTML = "";

    analysisData.matchedSkills.forEach(function (skill) {
        const skillElement = document.createElement("span");
        skillElement.textContent = skill;
        matchedSkillsContainer.appendChild(skillElement);
    });
}


/* =========================
   UPDATE SKILL GAPS
========================= */

const skillGapsContainer =
    document.querySelector(".skill-panel.gaps .skill-tags");

if (skillGapsContainer) {
    skillGapsContainer.innerHTML = "";

    analysisData.skillGaps.forEach(function (skill) {
        const skillElement = document.createElement("span");
        skillElement.textContent = skill;
        skillGapsContainer.appendChild(skillElement);
    });
}


/* =========================
   UPDATE COURSES
========================= */

const coursesContainer = document.querySelector(".courses-grid");

if (coursesContainer) {
    coursesContainer.innerHTML = "";

    analysisData.courses.forEach(function (course) {
        const courseCard = document.createElement("div");
        courseCard.className = "course-card";

        const courseTop = document.createElement("div");
        courseTop.className = "course-top";

        const category = document.createElement("span");
        category.className = "course-category";
        category.textContent = course.category;

        const level = document.createElement("span");
        level.className = "course-level";
        level.textContent = course.level;

        courseTop.appendChild(category);
        courseTop.appendChild(level);

        const title = document.createElement("h3");
        title.textContent = course.title;

        const description = document.createElement("p");
        description.textContent = course.description;

        const courseBottom = document.createElement("div");
        courseBottom.className = "course-bottom";

        const duration = document.createElement("span");
        duration.textContent = `⏱ ${course.duration}`;

        const learnMore = document.createElement("a");
        learnMore.href = "#";
        learnMore.textContent = "Learn More →";

        courseBottom.appendChild(duration);
        courseBottom.appendChild(learnMore);

        courseCard.appendChild(courseTop);
        courseCard.appendChild(title);
        courseCard.appendChild(description);
        courseCard.appendChild(courseBottom);

        coursesContainer.appendChild(courseCard);
    });
}


/* =========================
   DEMO JOB FALLBACKS
========================= */

const demoJobs = {
    python: {
        title: "Junior Python Developer",
        company: "Example Technology Company",
        location: "Pune",
        skills: ["Python", "Django", "SQL"]
    },

    software: {
        title: "Graduate Software Developer",
        company: "Example Software Solutions",
        location: "Bengaluru",
        skills: ["Python", "JavaScript", "MySQL"]
    },

    web: {
        title: "Web Development Intern",
        company: "Example Digital Studio",
        location: "Remote",
        skills: ["HTML", "CSS", "JavaScript"]
    }
};


/* =========================
   DYNAMIC JOB RESULTS
========================= */

const jobsGrid = document.getElementById("jobsGrid");
const jobsMessage = document.getElementById("jobsMessage");
const noJobsMessage = document.getElementById("noJobsMessage");

function readSessionJSON(key) {
    try {
        return JSON.parse(sessionStorage.getItem(key) || "null");
    } catch (error) {
        console.error(`Unable to read ${key} from session storage.`, error);
        return null;
    }
}

const savedPreferences = readSessionJSON("jobPreferences");
const savedResponse = readSessionJSON("jobResults");


/* =========================
   UPDATE SEARCH SUMMARY
========================= */

if (savedPreferences) {
    const selectedRole = document.getElementById("selectedRole");
    const selectedExperience =
        document.getElementById("selectedExperience");
    const selectedLocation =
        document.getElementById("selectedLocation");
    const selectedPlatform =
        document.getElementById("selectedPlatform");

    if (selectedRole) {
        selectedRole.textContent =
            savedPreferences.jobRole ||
            savedPreferences.role ||
            "Not specified";
    }

    if (selectedExperience) {
        selectedExperience.textContent =
            savedPreferences.experienceLevel || "Not specified";
    }

    if (selectedLocation) {
        selectedLocation.textContent =
            savedPreferences.jobLocation ||
            savedPreferences.location ||
            "Not specified";
    }

    if (selectedPlatform) {
        const platform =
            savedPreferences.jobPlatform ||
            savedPreferences.platform ||
            "";

        selectedPlatform.textContent = platform
            ? platform.charAt(0).toUpperCase() +
              platform.slice(1).toLowerCase()
            : "Not specified";
    }
}


/* =========================
   READ LIVE JOB RESPONSE
========================= */

const returnedJobs =
    savedResponse && Array.isArray(savedResponse.jobs)
        ? savedResponse.jobs
        : [];

let activeJob = null;


/* =========================
   FORMAT PLATFORM NAME
========================= */

function formatPlatformName(platform) {
    const value = String(platform || "").trim();

    if (!value) {
        return "Platform not specified";
    }

    const normalized = value.toLowerCase();

    const platformNames = {
        linkedin: "LinkedIn",
        indeed: "Indeed",
        naukri: "Naukri"
    };

    return platformNames[normalized] ||
        normalized.charAt(0).toUpperCase() + normalized.slice(1);
}


/* =========================
   DISPLAY JOB CARDS
========================= */

if (jobsGrid) {
    jobsGrid.innerHTML = "";

    if (returnedJobs.length === 0) {
        if (jobsMessage) {
            jobsMessage.textContent =
                "No job results were received. Please try a new search.";
        }

        if (noJobsMessage) {
            noJobsMessage.hidden = false;
        }
    } else {
        if (jobsMessage) {
            jobsMessage.textContent =
                `${returnedJobs.length} live job listing(s) returned by SkillBridge AI.`;
        }

        if (noJobsMessage) {
            noJobsMessage.hidden = true;
        }

        returnedJobs.forEach(function (job) {
            const card = document.createElement("article");
            card.className = "job-card";
            card.style.cursor = "pointer";

            /* Job type / selected search preference */
            const jobType = document.createElement("span");
            jobType.className = "job-type";
            jobType.textContent =
                savedPreferences?.experienceLevel ||
                "Experience preference not specified";

            /* Platform */
            const jobPlatform = document.createElement("span");
            jobPlatform.className = "job-platform";

            const platformValue =
                job.platform ||
                job.site ||
                job.source ||
                savedPreferences?.jobPlatform ||
                savedPreferences?.platform ||
                "";

            jobPlatform.textContent = formatPlatformName(platformValue);

            const cardTop = document.createElement("div");
            cardTop.className = "job-card-top";
            cardTop.appendChild(jobType);
            cardTop.appendChild(jobPlatform);

            /* Job title */
            const title = document.createElement("h3");
            title.className = "job-title";
            title.textContent =
                job.title || job.jobTitle || "Untitled role";

            /* Company */
            const company = document.createElement("p");
            company.className = "company-name";
            company.textContent =
                job.company || "Company not specified";

            /* Location and employer requirements */
            const meta = document.createElement("div");
            meta.className = "job-meta";

            const location = document.createElement("span");
            location.className = "job-location";
            location.textContent =
                `📍 ${job.location || "Location not specified"}`;

            const experience = document.createElement("span");
            experience.className = "job-experience";

            const employerExperience =
                job.experienceLevel ||
                job.experience_level ||
                job.experience ||
                "";

            experience.textContent = employerExperience
                ? `🎓 ${employerExperience}`
                : "🎓 Employer requirements not verified";

            meta.appendChild(location);
            meta.appendChild(experience);

            /* Description */
           
/* Short description preview on job card */
const description = document.createElement("p");
description.className = "job-description";

const fullDescription = String(job.description || "").trim();

if (fullDescription) {
    description.textContent =
        fullDescription.length > 220
            ? fullDescription.substring(0, 220).trimEnd() + "..."
            : fullDescription;
} else {
    description.textContent =
        "Description unavailable. Open the original job listing for more details.";
}


            /* Skills */
            const skillsContainer = document.createElement("div");
            skillsContainer.className = "job-skills";

            const skills = Array.isArray(job.skills) ? job.skills : [];

            skills.forEach(function (skill) {
                const tag = document.createElement("span");
                tag.textContent = skill;
                skillsContainer.appendChild(tag);
            });

            /* Actions */
            const actions = document.createElement("div");
            actions.className = "job-card-actions";

            const viewButton = document.createElement("button");
            viewButton.type = "button";
            viewButton.className = "secondary-button view-job-button";
            viewButton.textContent = "View Details →";

            actions.appendChild(viewButton);

            card.appendChild(cardTop);
            card.appendChild(title);
            card.appendChild(company);
            card.appendChild(meta);
            card.appendChild(description);
            card.appendChild(skillsContainer);
            card.appendChild(actions);

            function selectJob() {
                activeJob = job;

                sessionStorage.setItem(
                    "selectedJob",
                    JSON.stringify(activeJob)
                );

                jobsGrid.querySelectorAll(".job-card").forEach(
                    function (item) {
                        item.style.borderColor =
                            "rgba(255, 255, 255, 0.08)";
                    }
                );

                card.style.borderColor = "#8b5cf6";
            }

            card.addEventListener("click", function (event) {
                if (event.target.closest("button, a")) {
                    return;
                }

                selectJob();
            });

            viewButton.addEventListener("click", function () {
                selectJob();

                sessionStorage.setItem("selectedJobAction", "view");
                window.location.href = "job-details.html";
            });

            jobsGrid.appendChild(card);
        });

        /* Select the first live job by default */
        const firstCard = jobsGrid.querySelector(".job-card");

        if (firstCard) {
            firstCard.click();
        }
    }
}


/* =========================
   SELECTED JOB ACTION BUTTONS
========================= */

const viewSelectedJobButton =
    document.getElementById("viewSelectedJob");

const analyzeSelectedJobButton =
    document.getElementById("analyzeSelectedJob");


if (viewSelectedJobButton) {
    viewSelectedJobButton.addEventListener("click", function () {
        const selectedJob = readSessionJSON("selectedJob");

        if (!selectedJob) {
            alert("Please select a job first.");
            return;
        }

        sessionStorage.setItem("selectedJobAction", "view");
        window.location.href = "job-details.html";
    });
}



if (analyzeSelectedJobButton) {
    analyzeSelectedJobButton.addEventListener("click", function () {
        if (returnedJobs.length === 0) {
            alert("Please search for jobs first.");
            return;
        }

        sessionStorage.setItem(
            "commonJobDescriptionJobs",
            JSON.stringify(returnedJobs)
        );

        sessionStorage.setItem(
            "selectedJobAction",
            "analyze"
        );

        window.location.href = "gap-analysis.html";
    });
}

