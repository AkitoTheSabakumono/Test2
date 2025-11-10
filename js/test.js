let questions = [];
let currentQuestion = 0;
let correctCount = 0;
let testName = '';

function loadTest() {
    const urlParams = new URLSearchParams(window.location.search);
    testName = urlParams.get('test') || 'english';
    const path = `data/${testName}.json`;

    fetch(path)
        .then(response => {
            if (!response.ok) throw new Error(`File not found: ${path}`);
            return response.json();
        })
        .then(data => {
            questions = getRandomQuestions(data, 20);
            showQuestion();
        })
        .catch(err => console.error("Error loading test:", err));
}

function showQuestion() {
    if (currentQuestion >= questions.length) {
        goToResult();
        return;
    }

    const q = questions[currentQuestion];
    const qContainer = document.getElementById('question-container');
    const aContainer = document.getElementById('answers-container');

    // Add progress
    qContainer.innerHTML = `<h3>Question ${currentQuestion + 1} of ${questions.length}</h3>
                            <h2>${q.question}</h2>`;
    aContainer.innerHTML = '';

    const optionIndexes = shuffleArray(q.options.map((_, i) => i));
    optionIndexes.forEach(i => {
        const btn = document.createElement('button');
        btn.textContent = q.options[i];
        btn.dataset.answer = i;
        btn.classList.add('fade-in');
        btn.addEventListener('click', selectAnswer);
        aContainer.appendChild(btn);
    });
}

function selectAnswer(e) {
    const selected = parseInt(e.target.dataset.answer);
    const q = questions[currentQuestion];

    // Animate selection
    const buttons = document.querySelectorAll('#answers-container button');
    buttons.forEach(btn => btn.disabled = true); // prevent double clicks

    if (selected === q.answer) {
        correctCount++;
        e.target.style.background = 'linear-gradient(135deg, #00c853, #b2ff59)'; // green gradient
    } else {
        e.target.style.background = 'linear-gradient(135deg, #d50000, #ff5252)'; // red gradient
        // highlight correct answer
        buttons.forEach(btn => {
            if (parseInt(btn.dataset.answer) === q.answer)
                btn.style.background = 'linear-gradient(135deg, #00c853, #b2ff59)';
        });
    }

    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 700); // wait for animation
}

function goToResult() {
    const total = questions.length;
    const percentage = (correctCount / total) * 100;
    let result;

    if (testName === 'english') {
        if (percentage >= 90) result = 'C2';
        else if (percentage >= 75) result = 'C1';
        else if (percentage >= 60) result = 'B2';
        else if (percentage >= 45) result = 'B1';
        else if (percentage >= 30) result = 'A2';
        else result = 'A1';
    } else if (testName === 'japanese') {
        if (percentage >= 90) result = 'N1';
        else if (percentage >= 75) result = 'N2';
        else if (percentage >= 60) result = 'N3';
        else if (percentage >= 45) result = 'N4';
        else result = 'N5';
    } else {
        result = 'Unknown';
    }

    localStorage.setItem(`${testName}_result`, result);
    localStorage.setItem(`${testName}_score`, percentage.toFixed(1));
    window.location.href = `result.html?test=${testName}`;
}

// Home page button
document.getElementById('next-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Helper functions
function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function getRandomQuestions(arr, n) {
    const shuffled = shuffleArray([...arr]);
    return shuffled.slice(0, Math.min(n, shuffled.length));
}

window.addEventListener('DOMContentLoaded', loadTest);
