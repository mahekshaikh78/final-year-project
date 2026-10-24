
/* =====================================
   LOAD SAVED JOBS AND PREFERENCES
===================================== */

function readSessionJSON(key, fallback) {
    try {
        const value = sessionStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.error("Could not read session data:", key, error);
        return fallback;
    }
}

const commonJobs = readSessionJSON("commonJobDescriptionJobs", []);
const savedPreferences = readSessionJSON("jobPreferences", {});

const ANALYSIS_WEBHOOK_URL =
    "https://n8n.bhuvisx.com/webhook/skillbridge-analyze";

console.log("Total fetched jobs:", commonJobs.length);
console.log("Fetched jobs:", commonJobs);

/* =====================================
   HTML ELEMENTS
===================================== */

const commonJobRole = document.getElementById("commonJobRole");
const commonJobCount = document.getElementById("commonJobCount");
const commonJobSummary = document.getElementById("commonJobSummary");
const commonResponsibilities = document.getElementById("commonResponsibilities");
const commonRequiredSkills = document.getElementById("commonRequiredSkills");
const commonJobMessage = document.getElementById("commonJobMessage");

const targetJobRole = document.getElementById("targetJobRole");
const matchedSkillsContainer = document.getElementById("matchedSkills");
const missingSkillsContainer = document.getElementById("missingSkills");
const matchedCount = document.getElementById("matchedCount");
const missingCount = document.getElementById("missingCount");
const matchedBadge = document.getElementById("matchedBadge");
const missingBadge = document.getElementById("missingBadge");
const matchPercentage = document.getElementById("matchPercentage");
const scoreCircle = document.getElementById("scoreCircle");
const analysisStatus = document.getElementById("analysisStatus");

const resumeUploadForm = document.getElementById("resumeUploadForm");
const resumeFile = document.getElementById("resumeFile");
const analyzeResumeButton = document.getElementById("analyzeResumeButton");
const selectedFileName = document.getElementById("selectedFileName");
const formMessage = document.getElementById("formMessage");

const skillAnalysisSection = document.getElementById("skillAnalysisSection");
const coursesSection = document.getElementById("coursesSection");
const roadmapSection = document.getElementById("roadmapSection");

/* =====================================
   HELPER FUNCTIONS
===================================== */

function displaySkills(container, skills) {
    if (!container) return;

    container.replaceChildren();

    skills.forEach(function (skill) {
        const tag = document.createElement("span");
        tag.textContent = skill;
        container.appendChild(tag);
    });
}

function setResultsVisible(visible) {
    if (skillAnalysisSection) {
        skillAnalysisSection.hidden = !visible;
    }

    if (coursesSection) {
        coursesSection.hidden = !visible;
    }

    if (roadmapSection) {
        roadmapSection.hidden = !visible;
    }
}


function getRole() {
    return savedPreferences.jobRole ||
        savedPreferences.role ||
        savedPreferences.targetRole ||
        "Your Target Role";
}


/* =====================================
   GENERATE COMMON JOB DESCRIPTION
===================================== */

function generateCommonJobDescription() {
    if (!commonJobSummary) return;

    const role = getRole();

    if (commonJobRole) {
        commonJobRole.textContent = role;
    }

    if (commonJobs.length === 0) {
        commonJobSummary.textContent =
            "No fetched jobs were found. Return to the results page, search for jobs, and click Analyze My Skill Gap.";

        if (commonJobCount) commonJobCount.textContent = "0 jobs";

        if (commonJobMessage) {
            commonJobMessage.textContent =
                "Job listings are not available on this page.";
        }

        return;
    }

    const descriptions = commonJobs
        .map(function (job) {
            return String(job.description || "").trim();
        })
        .filter(function (description) {
            return description.length > 0;
        });

    if (commonJobCount) {
        commonJobCount.textContent = commonJobs.length + " fetched jobs";
    }

    if (descriptions.length === 0) {
        commonJobSummary.textContent =
            "Jobs were fetched, but their descriptions are unavailable.";

        if (commonJobMessage) {
            commonJobMessage.textContent =
                "Check that your backend includes job descriptions.";
        }

        return;
    }

    const skillDictionary = [
        "Python", "Java", "JavaScript", "HTML", "CSS",
        "React", "Django", "Flask", "FastAPI", "SQL",
        "MySQL", "PostgreSQL", "REST APIs", "Git", "GitHub",
        "Bootstrap", "Node.js", "Docker", "AWS", "Azure",
        "Machine Learning", "Data Structures",
        "Problem Solving", "Communication", "Testing"
    ];

    const commonSkills = skillDictionary.filter(function (skill) {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = new RegExp("\\b" + escaped + "\\b", "i");

        const count = descriptions.filter(function (description) {
            return pattern.test(description);
        }).length;

        return count >= Math.ceil(descriptions.length / 2);
    });

    const allSentences = [];

    descriptions.forEach(function (description) {
        const sentences = description
            .replace(/\r/g, "\n")
            .split(/\n+|(?<=[.!?])\s+/);

        sentences.forEach(function (sentence) {
            const cleaned = sentence
                .replace(/^[\s•\-*▪]+/, "")
                .replace(/\s+/g, " ")
                .trim();

            if (
                cleaned.length >= 35 &&
                cleaned.length <= 240 &&
                !allSentences.includes(cleaned)
            ) {
                allSentences.push(cleaned);
            }
        });
    });

    commonJobSummary.textContent =
        "This summary is based on " + descriptions.length +
        " available job descriptions out of " + commonJobs.length +
        " fetched listings. It combines recurring skills and requirements mentioned in those jobs.";

    if (commonResponsibilities) {
        commonResponsibilities.replaceChildren();

        const responsibilitySentences = allSentences.filter(function (sentence) {
            return /\b(develop|build|design|maintain|implement|test|create|manage|work with|collaborate|support|analy[sz]e|debug|deploy|program|write code)\b/i.test(sentence);
        }).slice(0, 8);

        if (responsibilitySentences.length > 0) {
            responsibilitySentences.forEach(function (sentence) {
                const item = document.createElement("li");
                item.textContent = sentence;
                commonResponsibilities.appendChild(item);
            });
        } else {
            const item = document.createElement("li");
            item.textContent =
                "Review the fetched job listings for their individual responsibilities.";
            commonResponsibilities.appendChild(item);
        }
    }

    displaySkills(commonRequiredSkills, commonSkills);

    if (commonJobMessage) {
        commonJobMessage.textContent = commonSkills.length
            ? "Skills shown were detected in at least half of the available descriptions. Resume analysis will use the skills supplied to the analysis workflow."
            : "No recurring skills from the current skill list were detected. The available job descriptions can still be reviewed.";
    }
}

/* =====================================
   INITIALIZE ANALYSIS PLACEHOLDERS
===================================== */

function initializeSkillAnalysis() {
    setResultsVisible(false);

    if (targetJobRole) targetJobRole.textContent = getRole();
    if (analysisStatus) analysisStatus.textContent = "Awaiting Resume Analysis";
    if (matchPercentage) matchPercentage.textContent = "--%";

    if (matchedCount) matchedCount.textContent = "0";
    if (missingCount) missingCount.textContent = "0";
    if (matchedBadge) matchedBadge.textContent = "0 skills";
    if (missingBadge) missingBadge.textContent = "0 skills";

    displaySkills(matchedSkillsContainer, []);
    displaySkills(missingSkillsContainer, []);

    if (scoreCircle) {
        scoreCircle.style.setProperty("--match-percentage", "0%");
    }
}

/* =====================================
   BUILD DYNAMIC REQUIRED SKILLS
===================================== */

function getRequiredSkills() {
    const descriptions = commonJobs
        .map(function (job) {
            return String(job.description || "").trim();
        })
        .filter(Boolean);

    const dictionary = [
        "Python", "Java", "JavaScript", "HTML", "CSS",
        "React", "Django", "Flask", "FastAPI", "SQL",
        "MySQL", "PostgreSQL", "REST API", "Git", "GitHub",
        "Bootstrap", "Node.js", "Docker", "AWS", "Azure",
        "Machine Learning", "Data Structures",
        "Problem Solving", "Communication", "Testing"
    ];

    return dictionary.filter(function (skill) {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const pattern = new RegExp("\\b" + escaped + "\\b", "i");

        const count = descriptions.filter(function (description) {
            return pattern.test(description);
        }).length;

        return descriptions.length > 0 &&
            count >= Math.ceil(descriptions.length / 2);
    });
}

function getCommonJobDescriptionText() {
    return commonJobs
        .map(function (job) {
            return String(job.description || "").trim();
        })
        .filter(Boolean)
        .join("\n\n");
}

/* =====================================
   ANALYZE RESUME WITH N8N
===================================== */

if (resumeFile && selectedFileName) {
    resumeFile.addEventListener("change", function () {
        const file = resumeFile.files[0];

        selectedFileName.textContent = file
            ? "Selected file: " + file.name
            : "Accepted formats: PDF or DOCX. Maximum size: 5 MB.";
    });
}

if (resumeUploadForm) {
    resumeUploadForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const file = resumeFile && resumeFile.files[0];

        if (!file) {
            if (formMessage) formMessage.textContent = "Please select your resume first.";
            return;
        }

        if (!file.name.toLowerCase().endsWith(".pdf")) {
            if (formMessage) {
                formMessage.textContent =
                    "Please upload a PDF for now. DOCX extraction is not yet configured in the n8n workflow.";
            }
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            if (formMessage) {
                formMessage.textContent = "Your resume must be smaller than 5 MB.";
            }
            return;
        }

        const commonJobDescription = getCommonJobDescriptionText();
        const requiredSkills = getRequiredSkills();

        if (!commonJobDescription) {
            if (formMessage) {
                formMessage.textContent =
                    "Job descriptions are unavailable. Please return to the results page and fetch jobs with descriptions.";
            }
            return;
        }

        if (requiredSkills.length === 0) {
            if (formMessage) {
                formMessage.textContent =
                    "No required skills could be extracted from the fetched job descriptions. Please check the available descriptions.";
            }
            return;
        }

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("commonJobDescription", commonJobDescription);
        formData.append("requiredSkills", requiredSkills.join(", "));

        if (formMessage) {
            formMessage.textContent = "Analyzing your resume. Please wait...";
        }

        if (analyzeResumeButton) {
            analyzeResumeButton.disabled = true;
            analyzeResumeButton.textContent = "Analyzing...";
        }

        try {
            const response = await fetch(ANALYSIS_WEBHOOK_URL, {
                method: "POST",
                body: formData
            });

            const responseText = await response.text();

            let result;

            try {
                result = JSON.parse(responseText);
            } catch (error) {
                throw new Error(
                    "The workflow did not return valid JSON. Check the n8n webhook response."
                );
            }

            if (!response.ok) {
                throw new Error(
                    result.message || "The analysis request failed. Please try again."
                );
            }

            // Some workflows return the result inside a data property.
            const analysis = result.data &&
                typeof result.data === "object"
                ? result.data
                : result;

            if (analysis.success !== true) {
                throw new Error(
                    analysis.message || "Resume analysis was not successful."
                );
            }

            if (
                !Array.isArray(analysis.matchedSkills) ||
                !Array.isArray(analysis.missingSkills) ||
                typeof analysis.matchPercentage !== "number"
            ) {
                throw new Error(
                    "The response is missing skill analysis fields. Check the n8n response node."
                );
            }

            showAnalysisResults(analysis);

            if (formMessage) {
                formMessage.textContent = "Resume analyzed successfully!";
            }
        } catch (error) {
            console.error("Resume analysis failed:", error);

            if (formMessage) {
                formMessage.textContent =
                    "Could not analyze your resume: " + error.message +
                    " If a CORS error appears in the browser console, the n8n webhook must allow your website's origin.";
            }

            if (analysisStatus) {
                analysisStatus.textContent = "Analysis Failed";
            }
        } finally {
            if (analyzeResumeButton) {
                analyzeResumeButton.disabled = false;
                analyzeResumeButton.textContent = "Analyze My Resume";
            }
        }
    });
}


/* =====================================
   PERSONALIZED COURSES AND ROADMAP
===================================== */

// Curated resources for common skills.
// Unknown skills receive a general learning-resource search.
const learningResources = {
    "Python": {
        title: "Python Programming",
        category: "PROGRAMMING",
        duration: "2 weeks",
        description: "Practice Python syntax, functions, collections, OOP, and problem-solving.",
        url: "https://docs.python.org/3/tutorial/"
    },
    "JavaScript": {
        title: "JavaScript Fundamentals",
        category: "WEB DEVELOPMENT",
        duration: "2 weeks",
        description: "Learn variables, functions, arrays, objects, DOM manipulation, and asynchronous JavaScript.",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide"
    },
    "React": {
        title: "Learn React",
        category: "FRONTEND DEVELOPMENT",
        duration: "3 weeks",
        description: "Learn components, props, state, events, hooks, and building interactive interfaces.",
        url: "https://react.dev/learn"
    },
    "HTML": {
        title: "HTML Fundamentals",
        category: "WEB DEVELOPMENT",
        duration: "1 week",
        description: "Learn semantic HTML, forms, page structure, and accessible markup.",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content"
    },
    "CSS": {
        title: "CSS Fundamentals",
        category: "WEB DEVELOPMENT",
        duration: "1 week",
        description: "Practice selectors, layouts, Flexbox, Grid, responsive design, and styling.",
        url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics"
    },
    "Django": {
        title: "Django Web Development",
        category: "BACKEND DEVELOPMENT",
        duration: "3 weeks",
        description: "Learn URLs, views, models, templates, database operations, and CRUD applications.",
        url: "https://docs.djangoproject.com/en/stable/intro/tutorial01/"
    },
    "Flask": {
        title: "Flask Web Development",
        category: "BACKEND DEVELOPMENT",
        duration: "2 weeks",
        description: "Build Python web applications using routes, templates, and request handling.",
        url: "https://flask.palletsprojects.com/en/stable/tutorial/"
    },
    "FastAPI": {
        title: "FastAPI Fundamentals",
        category: "BACKEND DEVELOPMENT",
        duration: "2 weeks",
        description: "Create Python endpoints, validate data, and build web APIs.",
        url: "https://fastapi.tiangolo.com/tutorial/"
    },
    "SQL": {
        title: "SQL Fundamentals",
        category: "DATABASES",
        duration: "2 weeks",
        description: "Practice queries, filtering, joins, grouping, and database operations.",
        url: "https://www.w3schools.com/sql/"
    },
    "MySQL": {
        title: "MySQL Database Basics",
        category: "DATABASES",
        duration: "2 weeks",
        description: "Learn relational database design, queries, joins, and data manipulation.",
        url: "https://dev.mysql.com/doc/"
    },
    "PostgreSQL": {
        title: "PostgreSQL Fundamentals",
        category: "DATABASES",
        duration: "2 weeks",
        description: "Practice relational database design, SQL queries, joins, and PostgreSQL features.",
        url: "https://www.postgresql.org/docs/current/tutorial.html"
    },
    "REST API": {
        title: "REST API Development",
        category: "API DEVELOPMENT",
        duration: "2 weeks",
        description: "Understand HTTP methods, endpoints, status codes, JSON, and API testing.",
        url: "https://www.django-rest-framework.org/tutorial/quickstart/"
    },
    "REST APIs": {
        title: "REST API Development",
        category: "API DEVELOPMENT",
        duration: "2 weeks",
        description: "Understand HTTP methods, endpoints, status codes, JSON, and API testing.",
        url: "https://www.django-rest-framework.org/tutorial/quickstart/"
    },
    "Git": {
        title: "Git Version Control",
        category: "DEVELOPER TOOLS",
        duration: "1 week",
        description: "Learn commits, branches, merging, and tracking code changes.",
        url: "https://git-scm.com/book/en/v2"
    },
    "GitHub": {
        title: "GitHub Skills",
        category: "DEVELOPER TOOLS",
        duration: "1 week",
        description: "Practice repositories, commits, branches, pull requests, and collaboration.",
        url: "https://skills.github.com/"
    },
    "Bootstrap": {
        title: "Bootstrap Fundamentals",
        category: "FRONTEND DEVELOPMENT",
        duration: "1 week",
        description: "Build responsive layouts using Bootstrap's grid, components, and utilities.",
        url: "https://getbootstrap.com/docs/"
    },
    "Node.js": {
        title: "Node.js Fundamentals",
        category: "BACKEND DEVELOPMENT",
        duration: "2 weeks",
        description: "Learn JavaScript on the server, modules, asynchronous code, and HTTP servers.",
        url: "https://nodejs.org/en/learn"
    },
    "Docker": {
        title: "Docker Fundamentals",
        category: "CLOUD AND DEVOPS",
        duration: "2 weeks",
        description: "Learn containers, images, Dockerfiles, and running applications in containers.",
        url: "https://docs.docker.com/get-started/"
    },
    "AWS": {
        title: "AWS Cloud Fundamentals",
        category: "CLOUD COMPUTING",
        duration: "3 weeks",
        description: "Explore cloud concepts, core AWS services, security, and deployment basics.",
        url: "https://skillbuilder.aws/"
    },
    "Azure": {
        title: "Microsoft Azure Fundamentals",
        category: "CLOUD COMPUTING",
        duration: "3 weeks",
        description: "Learn cloud concepts, Azure services, identity, and basic cloud architecture.",
        url: "https://learn.microsoft.com/en-us/training/azure/"
    },
    "Machine Learning": {
        title: "Machine Learning Fundamentals",
        category: "ARTIFICIAL INTELLIGENCE",
        duration: "4 weeks",
        description: "Learn supervised learning, model evaluation, and practical ML workflows.",
        url: "https://www.coursera.org/learn/machine-learning"
    },
    "Data Structures": {
        title: "Data Structures and Algorithms",
        category: "COMPUTER SCIENCE",
        duration: "3 weeks",
        description: "Practice arrays, strings, linked lists, stacks, queues, trees, and complexity.",
        url: "https://www.geeksforgeeks.org/data-structures/"
    },
    "Problem Solving": {
        title: "Problem-Solving Practice",
        category: "CORE SKILLS",
        duration: "2 weeks",
        description: "Strengthen logical thinking by solving coding problems and reviewing solutions.",
        url: "https://leetcode.com/problemset/"
    },
    "Communication": {
        title: "Communication Skills",
        category: "PROFESSIONAL SKILLS",
        duration: "2 weeks",
        description: "Practice clear explanations, active listening, presentations, and interview answers.",
        url: "https://www.coursera.org/search?query=communication%20skills"
    },
    "Testing": {
        title: "Software Testing Fundamentals",
        category: "SOFTWARE ENGINEERING",
        duration: "2 weeks",
        description: "Learn test cases, unit testing, debugging, and testing strategies.",
        url: "https://docs.pytest.org/en/stable/getting-started.html"
    }
};

function getLearningResource(skill) {
    const normalizedSkill = String(skill).trim().toLowerCase();

    const matchedKey = Object.keys(learningResources).find(function (key) {
        return key.toLowerCase() === normalizedSkill;
    });

    if (matchedKey) {
        return learningResources[matchedKey];
    }

    // Fallback for skills not explicitly listed above.
    return {
        title: "Learn " + skill,
        category: "SKILL DEVELOPMENT",
        duration: "1–2 weeks",
        description: "Study the fundamentals of " + skill +
            ", practise with exercises, and apply your learning in a small project.",
        url: "https://www.google.com/search?q=" +
            encodeURIComponent(skill + " official documentation tutorial")
    };
}

function renderPersonalizedCourses(missingSkills) {
    const coursesContainer = document.getElementById("recommendedCourses");
    const filter = document.getElementById("courseSkillFilter");
    const emptyMessage = document.getElementById("noCoursesMessage");

    if (!coursesContainer || !filter) return;

    coursesContainer.replaceChildren();
    filter.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Missing Skills";
    filter.appendChild(allOption);

    const uniqueSkills = Array.from(new Set(
        missingSkills
            .map(function (skill) {
                return String(skill).trim();
            })
            .filter(Boolean)
    ));

    uniqueSkills.forEach(function (skill) {
        const option = document.createElement("option");
        option.value = skill;
        option.textContent = skill;
        filter.appendChild(option);

        const resource = getLearningResource(skill);
        const card = document.createElement("article");
        card.className = "course-card";
        card.dataset.skill = skill;

        const top = document.createElement("div");
        top.className = "course-card-top";

        const category = document.createElement("span");
        category.className = "course-category";
        category.textContent = resource.category;

        const level = document.createElement("span");
        level.className = "course-level";
        level.textContent = "Start here";

        top.append(category, level);

        const title = document.createElement("h3");
        title.textContent = resource.title;

        const description = document.createElement("p");
        description.textContent = resource.description;

        const details = document.createElement("div");
        details.className = "course-details";

        const skillLabel = document.createElement("span");
        skillLabel.textContent = "Skill: " + skill;

        const duration = document.createElement("span");
        duration.textContent = "Suggested: " + resource.duration;

        details.append(skillLabel, duration);

        const link = document.createElement("a");
        link.href = resource.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "course-link";
        link.textContent = "Explore Learning Resource ↗";

        card.append(top, title, description, details, link);
        coursesContainer.appendChild(card);
    });

    if (emptyMessage) {
        emptyMessage.hidden = uniqueSkills.length !== 0;
        emptyMessage.textContent = uniqueSkills.length
            ? "No courses found for this skill."
            : "Great! No missing skills were returned. Keep practising and building projects.";
    }

    filter.onchange = function () {
        const selectedSkill = filter.value;
        let visibleCount = 0;

        coursesContainer.querySelectorAll(".course-card").forEach(function (card) {
            const shouldShow =
                selectedSkill === "all" ||
                card.dataset.skill === selectedSkill;

            card.hidden = !shouldShow;

            if (shouldShow) visibleCount++;
        });

        if (emptyMessage) {
            emptyMessage.hidden = visibleCount !== 0;
            if (visibleCount === 0) {
                emptyMessage.textContent =
                    "No learning resources found for this skill.";
            }
        }
    };
}

function renderPersonalizedRoadmap(missingSkills) {
    const roadmap = document.getElementById("learningRoadmap");
    if (!roadmap) return;

    roadmap.replaceChildren();

    const uniqueSkills = Array.from(new Set(
        missingSkills
            .map(function (skill) {
                return String(skill).trim();
            })
            .filter(Boolean)
    ));

    const steps = uniqueSkills.map(function (skill) {
        const resource = getLearningResource(skill);

        return {
            title: "Learn " + skill,
            description: resource.description,
            duration: resource.duration
        };
    });

    // Finish with a practical project to apply the new skills.
    steps.push({
        title: "Build a Project for Your Target Role",
        description: "Create a practical project that applies the skills you learned. Test it, document it, and add it to your portfolio.",
        duration: "2–3 weeks"
    });

    steps.forEach(function (step, index) {
        const item = document.createElement("article");
        item.className = "roadmap-item";

        const number = document.createElement("span");
        number.className = "roadmap-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const content = document.createElement("div");

        const heading = document.createElement("h3");
        heading.textContent = step.title;

        const description = document.createElement("p");
        description.textContent = step.description;

        const duration = document.createElement("span");
        duration.className = "roadmap-duration";
        duration.textContent = "Suggested duration: " + step.duration;

        content.append(heading, description, duration);
        item.append(number, content);
        roadmap.appendChild(item);
    });
}

function renderPersonalizedLearning(missingSkills) {
    renderPersonalizedCourses(missingSkills);
    renderPersonalizedRoadmap(missingSkills);
}

/* =====================================
   DISPLAY REAL ANALYSIS RESULTS
===================================== */

function showAnalysisResults(analysis) {
    const matched = analysis.matchedSkills;
    const missing = analysis.missingSkills;
    const percentage = Math.max(
        0,
        Math.min(100, Math.round(analysis.matchPercentage))
    );

    if (targetJobRole) targetJobRole.textContent = getRole();

    if (analysisStatus) {
        analysisStatus.textContent = "Analysis Complete";
    }

    if (matchPercentage) {
        matchPercentage.textContent = percentage + "%";
    }

    if (matchedCount) matchedCount.textContent = String(matched.length);
    if (missingCount) missingCount.textContent = String(missing.length);

    if (matchedBadge) matchedBadge.textContent = matched.length + " skills";
    if (missingBadge) missingBadge.textContent = missing.length + " skills";

    displaySkills(matchedSkillsContainer, matched);
    displaySkills(missingSkillsContainer, missing);
    renderPersonalizedLearning(missing);

    if (scoreCircle) {
        scoreCircle.style.setProperty(
            "--match-percentage",
            percentage + "%"
        );
    }

    setResultsVisible(true);

    if (skillAnalysisSection) {
        skillAnalysisSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

/* =====================================
   COURSE FILTER
===================================== */

const courseSkillFilter = document.getElementById("courseSkillFilter");
const courseCards = document.querySelectorAll(".course-card");
const noCoursesMessage = document.getElementById("noCoursesMessage");

if (courseSkillFilter) {
    courseSkillFilter.addEventListener("change", function () {
        const selectedSkill = courseSkillFilter.value;
        let visibleCourses = 0;

        courseCards.forEach(function (card) {
            const shouldShow =
                selectedSkill === "all" ||
                card.dataset.skill === selectedSkill;

            card.hidden = !shouldShow;

            if (shouldShow) visibleCourses++;
        });

        if (noCoursesMessage) {
            noCoursesMessage.hidden = visibleCourses !== 0;
        }
    });
}

/* =====================================
   INITIALIZE PAGE
===================================== */

generateCommonJobDescription();
initializeSkillAnalysis();
