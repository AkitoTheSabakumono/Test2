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
            questions = getRandomQuestions(data.questions, 20);
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

    qContainer.innerHTML = `<h3>Question ${currentQuestion + 1} of ${questions.length}</h3>
                            <h2>${q.question}</h2>`;
    aContainer.innerHTML = '';

    const optionIndexes = shuffleArray(q.options.map((_, i) => i));
    optionIndexes.forEach(i => {
        const btn = document.createElement('button');
        btn.textContent = q.options[i].answer; // display text correctly
        btn.dataset.answer = i;
        btn.classList.add('fade-in');
        btn.addEventListener('click', selectAnswer);
        aContainer.appendChild(btn);
    });
}

function selectAnswer(e) {
    const selected = parseInt(e.target.dataset.answer);
    const q = questions[currentQuestion];

    if (testName === 'personality') {
        // Add points for personality test
        correctCount += q.options[selected].score;
    } else {
        // English/Japanese tests: check correct answer
        if (selected === q.answer) {
            correctCount++;
        }
    }

    // Disable all buttons to prevent multiple clicks
    const buttons = document.querySelectorAll('#answers-container button');
    buttons.forEach(btn => btn.disabled = true);

    // Move to next question after a short delay
    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 300);
}

function goToResult() {
    let percentage;

    if (testName === 'personality') {
        // Max possible score for personality test
        const maxScore = questions.reduce((sum, q) => {
            const scores = q.options.map(opt => opt.score);
            return sum + Math.max(...scores);
        }, 0);
        percentage = (correctCount / maxScore) * 100;
    } else {
        percentage = (correctCount / questions.length) * 100;
    }

    localStorage.setItem(`${testName}_score`, percentage.toFixed(1));

    let result;
    if (testName === 'english') {
        if (percentage >= 96) result = 'C2';
        else if (percentage >= 90) result = 'C1';
        else if (percentage >= 70) result = 'B2';
        else if (percentage >= 50) result = 'B1';
        else if (percentage >= 30) result = 'A2';
        else result = 'A1';
    } else if (testName === 'japanese') {
        if (percentage >= 96) result = 'N1';
        else if (percentage >= 90) result = 'N2';
        else if (percentage >= 60) result = 'N3';
        else if (percentage >= 30) result = 'N4';
        else result = 'N5';
    } else if (testName === 'personality') {
        if (percentage >= 67) result = 'Deep Introvert';
        else if (percentage >= 37) result = 'Ambivert';
        else result = 'Extrovert Dynamo';
    } else {
        result = 'Unknown';
    }

    localStorage.setItem(`${testName}_result`, result);
    window.location.href = `result.html?test=${testName}`;
}

// Home page button
document.getElementById('next-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Helpers
function shuffleArray(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function getRandomQuestions(arr, n) {
    const shuffled = shuffleArray([...arr]);
    return shuffled.slice(0, Math.min(n, shuffled.length));
}

window.addEventListener('DOMContentLoaded', loadTest);
