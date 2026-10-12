// =========================
// RESULTS PAGE JAVASCRIPT
// =========================


// Demo analysis data
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


// =========================
// UPDATE MATCH PERCENTAGE
// =========================

const score = document.querySelector(".score-circle strong");

if (score) {
    score.textContent =
        `${analysisData.matchPercentage}%`;
}


// =========================
// UPDATE TARGET ROLE
// =========================

const targetRole = document.querySelector(".target-role strong");

if (targetRole) {
    targetRole.textContent =
        analysisData.targetRole;
}


// =========================
// UPDATE MATCHED SKILLS
// =========================

const matchedSkillsContainer =
    document.querySelector(".skill-panel.matched .skill-tags");

if (matchedSkillsContainer) {

    matchedSkillsContainer.innerHTML = "";

    analysisData.matchedSkills.forEach(function (skill) {

        const skillElement =
            document.createElement("span");

        skillElement.textContent = skill;

        matchedSkillsContainer.appendChild(
            skillElement
        );

    });
}


// =========================
// UPDATE SKILL GAPS
// =========================

const skillGapsContainer =
    document.querySelector(".skill-panel.gaps .skill-tags");

if (skillGapsContainer) {

    skillGapsContainer.innerHTML = "";

    analysisData.skillGaps.forEach(function (skill) {

        const skillElement =
            document.createElement("span");

        skillElement.textContent = skill;

        skillGapsContainer.appendChild(
            skillElement
        );

    });
}


// =========================
// UPDATE COURSES
// =========================

const coursesContainer =
    document.querySelector(".courses-grid");

if (coursesContainer) {

    coursesContainer.innerHTML = "";

    analysisData.courses.forEach(function (course) {

        const courseCard =
            document.createElement("div");

        courseCard.className = "course-card";

        courseCard.innerHTML = `

            <div class="course-top">

                <span class="course-category">
                    ${course.category}
                </span>

                <span class="course-level">
                    ${course.level}
                </span>

            </div>


            <h3>
                ${course.title}
            </h3>


            <p>
                ${course.description}
            </p>


            <div class="course-bottom">

                <span>
                    ⏱ ${course.duration}
                </span>

                <a href="#">
                    Learn More →
                </a>

            </div>

        `;

        coursesContainer.appendChild(
            courseCard
        );

    });

}


/* =========================
   COMMON JOB BUTTONS
========================= */

const jobs = {
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

const jobCards = document.querySelectorAll(".job-card");
const viewSelectedJobButton =
    document.getElementById("viewSelectedJob");
const analyzeSelectedJobButton =
    document.getElementById("analyzeSelectedJob");

// Use the previously saved job, or default to the first job.
let selectedJob = JSON.parse(
    sessionStorage.getItem("selectedJob") || "null"
);

if (!selectedJob) {
    selectedJob = jobs.python;

    sessionStorage.setItem(
        "selectedJob",
        JSON.stringify(selectedJob)
    );
}

// Allow the user to select a different job card.
jobCards.forEach(function (card) {
    card.style.cursor = "pointer";

    card.addEventListener("click", function (event) {
        if (event.target.closest("button, a")) {
            return;
        }

        const titleElement = card.querySelector("h3");

        if (!titleElement) {
            return;
        }

        const title = titleElement.textContent.trim();

        const matchingJob = Object.values(jobs).find(
            function (job) {
                return job.title === title;
            }
        );

        if (!matchingJob) {
            return;
        }

        selectedJob = matchingJob;

        sessionStorage.setItem(
            "selectedJob",
            JSON.stringify(selectedJob)
        );

        // Highlight the selected card.
        jobCards.forEach(function (item) {
            item.style.borderColor =
                "rgba(255, 255, 255, 0.08)";
        });

        card.style.borderColor = "#8b5cf6";
    });
});

// View Details works even without selecting a card.
if (viewSelectedJobButton) {
    viewSelectedJobButton.addEventListener(
        "click",
        function () {
            sessionStorage.setItem(
                "selectedJobAction",
                "view"
            );

            window.location.href = "job-details.html";
        }
    );
}

// Analyze Skill Gap also works without selecting a card.
if (analyzeSelectedJobButton) {
    analyzeSelectedJobButton.addEventListener(
        "click",
        function () {
            sessionStorage.setItem(
                "selectedJobAction",
                "analyze"
            );

            window.location.href = "job-details.html";
        }
    );
}
