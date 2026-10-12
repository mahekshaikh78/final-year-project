
/* =========================
   LOAD SELECTED JOB
========================= */

const selectedJob = JSON.parse(
    sessionStorage.getItem("selectedJob") || "null"
);

const targetJobRole = document.getElementById("targetJobRole");
const matchedSkillsContainer = document.getElementById("matchedSkills");
const missingSkillsContainer = document.getElementById("missingSkills");
const matchedCount = document.getElementById("matchedCount");
const missingCount = document.getElementById("missingCount");
const matchedBadge = document.getElementById("matchedBadge");
const missingBadge = document.getElementById("missingBadge");
const matchPercentage = document.getElementById("matchPercentage");
const scoreCircle = document.getElementById("scoreCircle");

/* =========================
   SAMPLE SKILL DATA
========================= */

// Demo data only: this does not read or analyze the uploaded resume.
const sampleSkills = {
    python: {
        matched: ["Python", "HTML", "CSS", "JavaScript", "Git"],
        missing: ["Django", "SQL", "REST APIs"]
    },

    software: {
        matched: ["Python", "JavaScript", "HTML", "CSS"],
        missing: ["MySQL", "Git", "Testing"]
    },

    web: {
        matched: ["HTML", "CSS"],
        missing: ["JavaScript", "Responsive Design", "Git"]
    },

    default: {
        matched: ["HTML", "CSS", "JavaScript", "Git", "Python"],
        missing: ["Django", "SQL", "REST APIs"]
    }
};

/* =========================
   DISPLAY SKILL TAGS
========================= */

function displaySkills(container, skills) {
    container.replaceChildren();

    skills.forEach(function (skill) {
        const tag = document.createElement("span");
        tag.textContent = skill;
        container.appendChild(tag);
    });
}

/* =========================
   UPDATE THE ANALYSIS
========================= */

function updateAnalysis() {
    let skillsData = sampleSkills.default;

    if (selectedJob) {
        if (targetJobRole) {
            targetJobRole.textContent = selectedJob.title;
        }

        if (selectedJob.title === "Junior Python Developer") {
            skillsData = sampleSkills.python;
        } else if (selectedJob.title === "Graduate Software Developer") {
            skillsData = sampleSkills.software;
        } else if (selectedJob.title === "Web Development Intern") {
            skillsData = sampleSkills.web;
        }
    }

    const matched = skillsData.matched;
    const missing = skillsData.missing;
    const total = matched.length + missing.length;
    const percentage = total > 0
        ? Math.round((matched.length / total) * 100)
        : 0;

    displaySkills(matchedSkillsContainer, matched);
    displaySkills(missingSkillsContainer, missing);

    matchedCount.textContent = matched.length;
    missingCount.textContent = missing.length;

    matchedBadge.textContent = matched.length + " skills";
    missingBadge.textContent = missing.length + " skills";

    matchPercentage.textContent = percentage + "%";

    // Update the circular score if its CSS uses conic-gradient.
    scoreCircle.style.setProperty(
        "--match-percentage",
        percentage + "%"
    );
}

/* =========================
   FILTER COURSE CARDS
========================= */

const courseSkillFilter = document.getElementById("courseSkillFilter");
const courseCards = document.querySelectorAll(".course-card");
const noCoursesMessage = document.getElementById("noCoursesMessage");

courseSkillFilter.addEventListener("change", function () {
    const selectedSkill = courseSkillFilter.value;
    let visibleCourses = 0;

    courseCards.forEach(function (card) {
        const shouldShow =
            selectedSkill === "all" ||
            card.dataset.skill === selectedSkill;

        card.hidden = !shouldShow;

        if (shouldShow) {
            visibleCourses++;
        }
    });

    noCoursesMessage.hidden = visibleCourses !== 0;
});

/* =========================
   INITIALIZE PAGE
========================= */

updateAnalysis();
