/* ========================================
AI Assessment Monitor — Main Script
Works on both index.html and exam.html
======================================== */

// ── Sample Questions ──────────────────────
const questions = [
    {
        question: "What does HTML stand for?",
        options: [
            "Hyper Text Markup Language",
            "High Tech Modern Language",
            "Hyper Transfer Markup Language",
            "Home Tool Markup Language"
        ],
        correctAnswer: "Hyper Text Markup Language"
    },
    {
        question: "Which CSS property is used to change the text color of an element?",
        options: [
            "font-color",
            "text-color",
            "color",
            "foreground-color"
        ],
        correctAnswer: "color"
    },
    {
        question: "Which keyword is used to declare a variable in modern JavaScript?",
        options: [
            "var",
            "let",
            "define",
            "dim"
        ],
        correctAnswer: "let"
    },
    {
        question: "What does CSS stand for?",
        options: [
            "Cascading Style Sheets",
            "Computer Style Sheets",
            "Creative Style System",
            "Colorful Style Sheets"
        ],
        correctAnswer: "Cascading Style Sheets"
    },
    {
        question: "Which HTML tag is used to create an unordered list?",
        options: [
            "<ol>",
            "<li>",
            "<ul>",
            "<list>"
        ],
        correctAnswer: "<ul>"
    },
    {
        question: "Which method is used to select an element by its ID in JavaScript?",
        options: [
            "document.querySelector()",
            "document.getElementById()",
            "document.findElement()",
            "document.getElement()"
        ],
        correctAnswer: "document.getElementById()"
    },
    {
        question: "What is the correct way to write a comment in JavaScript?",
        options: [
            "<!-- comment -->",
            "// comment",
            "** comment **",
            "%% comment"
        ],
        correctAnswer: "// comment"
    },
    {
        question: "Which CSS property controls the size of text?",
        options: [
            "text-style",
            "font-size",
            "text-size",
            "font-style"
        ],
        correctAnswer: "font-size"
    },
    {
        question: "What does the DOM stand for?",
        options: [
            "Document Object Model",
            "Data Object Management",
            "Digital Ordinance Map",
            "Document Oriented Middleware"
        ],
        correctAnswer: "Document Object Model"
    },
    {
        question: "Which HTML element is used to embed a JavaScript file?",
        options: [
            "<javascript>",
            "<script>",
            "<code>",
            "<js>"
        ],
        correctAnswer: "<script>"
    },
    {
        question: "Which CSS layout model replaced floats for creating page layouts?",
        options: [
            "Table layout",
            "Flexbox",
            "Grid layout",
            "Both Flexbox and Grid"
        ],
        correctAnswer: "Both Flexbox and Grid"
    },
    {
        question: "What is the output of typeof null in JavaScript?",
        options: [
            "\"null\"",
            "\"undefined\"",
            "\"object\"",
            "\"boolean\""
        ],
        correctAnswer: "\"object\""
    }
];

// ── Page Detection ────────────────────────
function isIndexPage() {
    return !!document.getElementById("loginForm");
}

function isExamPage() {
    return !!document.getElementById("cameraVideo");
}

// ===========================================
// INDEX PAGE LOGIC
// ===========================================
function initIndexPage() {
    const form = document.getElementById("loginForm");
    const idInput = document.getElementById("studentId");
    const nameInput = document.getElementById("studentName");
    const idError = document.getElementById("studentIdError");
    const nameError = document.getElementById("studentNameError");

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let valid = true;

        // Validate Student ID
        if (!idInput.value.trim()) {
            idError.classList.add("visible");
            idInput.classList.add("input-error");
            valid = false;
        } else {
            idError.classList.remove("visible");
            idInput.classList.remove("input-error");
        }

        // Validate Student Name
        if (!nameInput.value.trim()) {
            nameError.classList.add("visible");
            nameInput.classList.add("input-error");
            valid = false;
        } else {
            nameError.classList.remove("visible");
            nameInput.classList.remove("input-error");
        }

        if (!valid) return;

        // Save to sessionStorage
        sessionStorage.setItem("studentId", idInput.value.trim());
        sessionStorage.setItem("studentName", nameInput.value.trim());

        // TODO: Send student info to backend API for session creation.

        window.location.href = "exam.html";
    });

    // Clear errors on input
    idInput.addEventListener("input", function () {
        if (idInput.value.trim()) {
            idError.classList.remove("visible");
            idInput.classList.remove("input-error");
        }
    });

    nameInput.addEventListener("input", function () {
        if (nameInput.value.trim()) {
            nameError.classList.remove("visible");
            nameInput.classList.remove("input-error");
        }
    });
}

// ===========================================
// EXAM PAGE LOGIC
// ===========================================
function initExamPage() {
    const studentId = sessionStorage.getItem("studentId");
    const studentName = sessionStorage.getItem("studentName");

    // Redirect if no student info
    if (!studentId || !studentName) {
        window.location.href = "index.html";
        return;
    }

    // Populate header — two-line student info
    document.getElementById("headerStudentName").textContent = studentName;
    document.getElementById("headerStudentId").textContent = "ID: " + studentId;

    // Avatar initials
    var avatarEl = document.getElementById("headerAvatar");
    var nameParts = studentName.trim().split(/\s+/);
    var initials = nameParts[0].charAt(0).toUpperCase();
    if (nameParts.length > 1) {
        initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    }
    avatarEl.textContent = initials;

    // ── Camera & Microphone ───────────────
    let mediaStream = null;

    const videoEl = document.getElementById("cameraVideo");
    const cameraStatusEl = document.getElementById("cameraStatus");
    const micStatusEl = document.getElementById("micStatus");
    const statusMessageEl = document.getElementById("statusMessage");

    function setCameraStatus(status, text) {
        cameraStatusEl.className = "status-row status-item--" + status;
        cameraStatusEl.querySelector(".status-dot").className = "status-dot status-dot--" + status;
        cameraStatusEl.querySelector(".status-row__text").textContent = "Camera: " + text;
    }

    function setMicStatus(status, text) {
        micStatusEl.className = "status-row status-item--" + status;
        micStatusEl.querySelector(".status-dot").className = "status-dot status-dot--" + status;
        micStatusEl.querySelector(".status-row__text").textContent = "Microphone: " + text;
    }

    function setStatusMessage(type, text) {
        statusMessageEl.className = "status-message status-message--" + type;
        statusMessageEl.textContent = text;
    }

    // ===========================================
    // FACE DETECTION
    // ===========================================

    let faceDetector = null;
    let lastVideoTime = -1;

    // ===========================================
    // RISK SCORING ENGINE
    // ===========================================

    let riskScore = 0;
    let riskLevel = "LOW";
    let riskEvents = [];

    const RISK_POINTS = {
    FACE_ABSENT: 10,
    MULTIPLE_FACES: 25,
    TAB_SWITCH: 15,
    WINDOW_BLUR: 10,
    LOOKING_AWAY: 5,
    SUSPICIOUS_SCREEN: 20,
    MIC_ANOMALY: 10
    };

    function getRiskLevel(score) {

    if (score >= 75) {
        return "CRITICAL";
    }

    if (score >= 50) {
        return "HIGH";
    }

    if (score >= 20) {
        return "MEDIUM";
    }

    return "LOW";
    }

    function addRiskEvent(type, message) {

    const points = RISK_POINTS[type] || 0;

    riskScore += points;

    if (riskScore > 100) {
        riskScore = 100;
    }

    const event = {
        type: type,
        message: message,
        points: points,
        timestamp: new Date().toISOString()
    };

    riskEvents.push(event);

    console.log("⚠️ Risk Event:", event);
    console.log("Risk Score:", riskScore);
    console.log("Risk Level:", getRiskLevel(riskScore));

    sendRiskUpdate();
    }

    addRiskEvent(
    "FACE_ABSENT",
    "Face not detected for more than 3 seconds"
    );
    
    let faceAbsentStartTime = null;
    let multipleFaceStartTime = null;

    let faceAbsentReported = false;
    let multipleFaceReported = false;

    function addRiskPoints(points, reason) {
        riskScore += points;

        riskEvents.push({
            points: points,
            reason: reason,
            time: new Date().toLocaleTimeString()
        });

        updateRiskLevel();

        sessionStorage.setItem("riskScore", riskScore);
        sessionStorage.setItem("riskLevel", riskLevel);
        sessionStorage.setItem("riskEvents", JSON.stringify(riskEvents));

        console.log("Risk Points Added:", points, "| Reason:", reason, "| Current Risk Score:", riskScore);
    }

    function updateRiskLevel() {
        if (riskScore <= 20) {
            riskLevel = "LOW";
        } else if (riskScore <= 50) {
            riskLevel = "MEDIUM";
        } else if (riskScore <= 75) {
            riskLevel = "HIGH";
        } else {
            riskLevel = "CRITICAL";
        }

        updateRiskDisplay();
    }

    function updateRiskDisplay() {
        let riskElement = document.getElementById("riskScore");

        if (!riskElement) {
            return;
        }

        riskElement.textContent = "Risk Score: " + riskScore + " (" + riskLevel + ")";
    }

    let currentMonitoringStatus = "NORMAL";

    function updateMonitoringStatus(status, message) {
        currentMonitoringStatus = status;

        if (status === "NORMAL") {
            statusMessageEl.textContent = "AI monitoring active. Face detected.";
            statusMessageEl.className = "status-message status-message--success";
        } else if (status === "FACE_ABSENT") {
            statusMessageEl.textContent = message;
            statusMessageEl.className = "status-message status-message--error";
        } else if (status === "MULTIPLE_FACES") {
            statusMessageEl.textContent = message;
            statusMessageEl.className = "status-message status-message--error";
        }
    }

    // ===========================================
    // START FACE DETECTOR
    // ===========================================

    async function startFaceDetection() {
        try {
            console.log("Starting MediaPipe Face Detector...");

            const { FaceDetector, FilesetResolver } = await import(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/+esm"
            );

            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
            );

            faceDetector = await FaceDetector.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite"
                },
                runningMode: "VIDEO",
                minDetectionConfidence: 0.5
            });

            console.log("Face detector initialized successfully");

            detectFace();
        } catch (error) {
            console.error("Face detector initialization error:", error);
        }
    }

    // ===========================================
    // DETECT FACE
    // (single, non-duplicated logic path)
    // ===========================================

    function detectFace() {
        if (!faceDetector) {
            requestAnimationFrame(detectFace);
            return;
        }

        if (videoEl.readyState >= 2 && videoEl.currentTime !== lastVideoTime) {
            lastVideoTime = videoEl.currentTime;

            const result = faceDetector.detectForVideo(videoEl, performance.now());
            const faceCount = result.detections.length;
            const currentTime = Date.now();

            if (faceCount === 0) {
                // ── No face detected ──
                multipleFaceStartTime = null;
                multipleFaceReported = false;

                if (faceAbsentStartTime === null) {
                    faceAbsentStartTime = currentTime;
                }

                const absentDuration = (currentTime - faceAbsentStartTime) / 1000;

               if (absentDuration >= 3) {

    updateMonitoringStatus(
        "FACE_ABSENT",
        "⚠️ Face not detected. Please remain visible to the camera."
    );

    if (!riskEvents.some(event => event.type === "FACE_ABSENT")) {
        addRiskEvent(
            "FACE_ABSENT",
            "Face not detected for more than 3 seconds"
        );
    }
    }   

            } else if (faceCount === 1) {
                // ── Exactly one face — normal ──
                faceAbsentStartTime = null;
                multipleFaceStartTime = null;
                faceAbsentReported = false;
                multipleFaceReported = false;

                updateMonitoringStatus("NORMAL", "Face detected. Monitoring normally.");
            } else {
                // ── Multiple faces detected ──
                faceAbsentStartTime = null;
                faceAbsentReported = false;

                if (multipleFaceStartTime === null) {
                    multipleFaceStartTime = currentTime;
                }

                const multipleFaceDuration = (currentTime - multipleFaceStartTime) / 1000;

                if (multipleFaceDuration >= 2) {
                    if (!multipleFaceReported) {
                        addRiskPoints(20, "Multiple faces detected for more than 2 seconds");
                        multipleFaceReported = true;
                    }
                    updateMonitoringStatus(
                        "MULTIPLE_FACES",
                        "⚠️ Multiple faces detected. Please ensure only the student is visible."
                    );
                }
            }
        }

        requestAnimationFrame(detectFace);
    }

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(function (stream) {
            mediaStream = stream;
            videoEl.srcObject = stream;

            startFaceDetection();

            // Hide camera placeholder once video is playing
            videoEl.addEventListener("playing", function () {
                var placeholder = document.getElementById("cameraPlaceholder");
                if (placeholder) placeholder.classList.add("hidden");
            });

            // Check video tracks
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                setCameraStatus("connected", "Connected");
            } else {
                setCameraStatus("error", "No video track");
            }

            // Check audio tracks
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                setMicStatus("connected", "Connected");
            } else {
                setMicStatus("denied", "No audio track");
            }

            setStatusMessage("success", "Camera and microphone are active.");

            // TODO: Send webcam frames to backend for AI-based vision/proctoring analysis.
            // TODO: Send microphone/audio data to backend for audio/proctoring analysis.
        })
        .catch(function (err) {
            console.warn("Media access error:", err);

            setCameraStatus("denied", "Denied");
            setMicStatus("denied", "Denied");
            setStatusMessage("error",
                "Camera/microphone access was denied. Please allow permissions and reload."
            );
        });

    // ── Question Rendering ────────────────
    let currentQuestion = 0;
    const answers = [];

    const questionHeader = document.getElementById("questionHeader");
    const questionText = document.getElementById("questionText");
    const optionsList = document.getElementById("optionsList");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");
    const progressFill = document.getElementById("progressFill");

    const letters = ["A", "B", "C", "D"];

    function renderQuestion(index) {
        const q = questions[index];
        const total = questions.length;

        questionHeader.textContent = "Question " + (index + 1) + " of " + total;
        questionText.textContent = q.question;

        // Update progress bar
        var progressPercent = ((index + 1) / total) * 100;
        progressFill.style.width = progressPercent + "%";

        optionsList.innerHTML = "";

        q.options.forEach(function (opt, i) {
            var li = document.createElement("li");
            li.className = "option-item";

            var inputId = "option_" + index + "_" + i;

            li.innerHTML =
                '<input type="radio" id="' + inputId + '" name="question_' + index + '" value="' + i + '">' +
                '<label class="option-label" for="' + inputId + '">' +
                    '<span class="option-letter">' + letters[i] + '</span>' +
                    '<span>' + opt + '</span>' +
                '</label>';

            optionsList.appendChild(li);
        });

        // Restore previously selected answer if exists
        if (answers[index] !== undefined) {
            var savedRadio = document.getElementById("option_" + index + "_" + answers[index]);
            if (savedRadio) {
                savedRadio.checked = true;
                nextBtn.disabled = false;
            }
        } else {
            nextBtn.disabled = true;
        }

        // Show/hide Next and Submit buttons
        if (index === total - 1) {
            nextBtn.classList.add("btn--hidden");
            submitBtn.classList.remove("btn--hidden");
            submitBtn.disabled = answers[index] === undefined;
        } else {
            nextBtn.classList.remove("btn--hidden");
            submitBtn.classList.add("btn--hidden");
        }

        // Listen for option selection
        var radios = optionsList.querySelectorAll('input[type="radio"]');
        radios.forEach(function (radio) {
            radio.addEventListener("change", function () {
                answers[currentQuestion] = parseInt(radio.value);
                nextBtn.disabled = false;
                if (currentQuestion === questions.length - 1) {
                    submitBtn.disabled = false;
                }
            });
        });
    }

    // Next button
    nextBtn.addEventListener("click", function () {
        if (nextBtn.disabled) return;
        currentQuestion++;
        renderQuestion(currentQuestion);
    });

    // Submit button
    submitBtn.addEventListener("click", function () {
        if (submitBtn.disabled) return;

        // TODO: Send answers to backend API on assessment submission.
        // TODO: Send assessment metadata and student information to backend.

        console.log("Submitted answers:", answers);

        // Store answers in sessionStorage
        sessionStorage.setItem("assessmentAnswers", JSON.stringify(answers));

        // Stop media tracks
        if (mediaStream) {
            mediaStream.getTracks().forEach(function (track) {
                track.stop();
            });
        }

        // Show confirmation overlay
        document.getElementById("submissionOverlay").classList.add("visible");

        // Disable buttons to prevent double submit
        submitBtn.disabled = true;
        nextBtn.disabled = true;
    });

    // Render first question
    renderQuestion(0);
}

// ===========================================
// INIT — Detect page and run appropriate logic
// ===========================================
document.addEventListener("DOMContentLoaded", function () {
    if (isIndexPage()) {
        initIndexPage();
    } else if (isExamPage()) {
        initExamPage();
    }
});