let questions = [];
let currentQuestion = 0;
let correctCount = 0;
let totalScore = 0;
let testName = '';
let isScoreBased = false;
let resultsDescription = [];

function loadTest() {
    const urlParams = new URLSearchParams(window.location.search);
    testName = urlParams.get('test') || 'english';
    const path = `data/${testName}.json`;
    const descPath = `data/${testName}_results.json`;

    fetch(path)
        .then(res => res.ok ? res.json() : Promise.reject(`File not found: ${path}`))
        .then(data => {
            if (data.length > 0) {
                // Detect if test is score-based or correct-answer based
                isScoreBased = !!data[0].options[0].score;
            }
            questions = getRandomQuestions(data, 20);
            showQuestion();
        })
        .catch(err => console.error("Error loading test:", err));

    fetch(descPath)
        .then(res => res.ok ? res.json() : Promise.reject(`File not found: ${descPath}`))
        .then(data => resultsDescription = data)
        .catch(err => console.warn("Result description file not found:", err));
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        goToResult();
        return;
    }

    const q = questions[currentQuestion];
    const qContainer = document.getElementById('question-container');
    const aContainer = document.getElementById('answers-container');

    qContainer.innerHTML = `<h3>Question ${currentQuestion + 1} of ${questions.length}</h3>
                            <h2>${q.question}</h2>`;
    aContainer.innerHTML = '';

    const optionIndexes = shuffleArray(q.options.map((_, i) => i));
    optionIndexes.forEach(i => {
        const option = q.options[i];
        const btn = document.createElement('button');
        btn.textContent = option.answer;

        if (isScoreBased) {
            btn.dataset.score = option.score;
        } else {
            btn.dataset.answer = i;
        }

        btn.classList.add('fade-in');
        btn.addEventListener('click', selectAnswer);
        aContainer.appendChild(btn);
    });
}

function selectAnswer(e) {
    const q = questions[currentQuestion];

    if (isScoreBased) {
        const score = parseInt(e.target.dataset.score);
        totalScore += score;
    } else {
        const selected = parseInt(e.target.dataset.answer);
        if (selected === q.answer) correctCount++;
    }

    document.querySelectorAll('#answers-container button').forEach(btn => btn.disabled = true);

    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 300);
}

function goToResult() {
    if (isScoreBased) {
        // Score-based test logic (as before)
    } else {
        // Correct-answer test
        const total = questions.length;
        const percentage = (correctCount / total) * 100;
        localStorage.setItem(`${testName}_score`, percentage.toFixed(1));

        // Load level descriptions dynamically
        fetch(`data/${testName}_levels.json`)
            .then(res => res.ok ? res.json() : [])
            .then(levels => {
                let levelInfo = { level: "Unknown", description: "" };
                for (let l of levels) {
                    if (percentage >= l.min && percentage <= l.max) {
                        levelInfo = l;
                        break;
                    }
                }
                localStorage.setItem(`${testName}_result_description`, `${levelInfo.level}: ${levelInfo.description}`);
                window.location.href = `result.html?test=${testName}`;
            })
            .catch(err => {
                console.warn("Level description file not found:", err);
                window.location.href = `result.html?test=${testName}`;
            });
    }
}


// Helpers
function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function getRandomQuestions(arr, n) {
    const shuffled = shuffleArray([...arr]);
    return shuffled.slice(0, Math.min(n, shuffled.length));
}

window.addEventListener('DOMContentLoaded', loadTest);
