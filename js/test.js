// test.js

let questions = [];
let currentQuestion = 0;
let correctCount = 0;
let testName = '';

// ------------------------
// Load Test Questions
// ------------------------

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
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error("No questions found in JSON.");
            }
            questions = getRandomQuestions(data, 20);
            showQuestion();
        })
        .catch(err => console.error("Error loading test:", err));
}

// ------------------------
// Show Question
// ------------------------

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
        const btn = document.createElement('button');
        btn.textContent = q.options[i];
        btn.dataset.correct = i === q.answer;
        btn.classList.add('fade-in');
        btn.addEventListener('click', selectAnswer);
        aContainer.appendChild(btn);
    });
}

// ------------------------
// Select Answer
// ------------------------

function selectAnswer(e) {
    const isCorrect = e.target.dataset.correct === 'true';
    if (isCorrect) correctCount++;

    const buttons = document.querySelectorAll('#answers-container button');
    buttons.forEach(btn => btn.disabled = true);

    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 300);
}

// ------------------------
// Calculate Result & Submit
// ------------------------

function goToResult() {
    const total = questions.length;
    const percentage = (correctCount / total) * 100;

    let result;
    if (testName === 'english') {
        if (percentage >= 96) result = 'C2';
        else if (percentage >= 90) result = 'C1';
        else if (percentage >= 70) result = 'B2';
        else if (percentage >= 60) result = 'B1';
        else if (percentage >= 30) result = 'A2';
        else result = 'A1';
    } else if (testName === 'japanese') {
        if (percentage >= 96) result = 'N1';
        else if (percentage >= 90) result = 'N2';
        else if (percentage >= 60) result = 'N3';
        else if (percentage >= 30) result = 'N4';
        else result = 'N5';
    } else if (testName === 'personality') {
        if  (percentage >= 70) result = 'Extrovert';
        else if (percentage >= 30) result = 'Ambivert';
        else result = 'Introvert';
    } else {
        result = 'Unknown';
    }

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    if (userId) {
        fetch('https://node.premium.vortexa.cloud/submit-result', { // ⚠️ <-- Your full public URL here
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                testType: testName,
                score: percentage.toFixed(1),
                level: result
            })
        })
        .then(res => res.json())
        .then(data => console.log('Result saved:', data))
        .catch(err => console.error('Failed to send test result:', err));
    }

    localStorage.setItem(`${testName}_score`, percentage.toFixed(1));
    localStorage.setItem(`${testName}_result`, result);

    window.location.href = `result.html?test=${testName}`;
}

// ------------------------
// Home button
// ------------------------

document.getElementById('next-btn')?.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// ------------------------
// Helpers
// ------------------------

function shuffleArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getRandomQuestions(arr, n) {
    const shuffled = shuffleArray(arr);
    return shuffled.slice(0, Math.min(n, shuffled.length));
}

// ------------------------
// Start test
// ------------------------

window.addEventListener('DOMContentLoaded', loadTest);
