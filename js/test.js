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

    // **Check answer correctly**
    if (selected === q.answer) {
        correctCount++;
    }

    // Disable all buttons to prevent multiple clicks
    const buttons = document.querySelectorAll('#answers-container button');
    buttons.forEach(btn => btn.disabled = true);

    // **Do NOT show correct answer**
    // Just move to next question after a short delay
    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 300); // shorter delay
}

function goToResult() {
    const totalQuestions = questions.length;
    const percentage = (correctCount / totalQuestions) * 100;

    // Determine result label
    let resultLabel;
    if (testName === 'english') {
        if (percentage >= 96) resultLabel = 'C2';
        else if (percentage >= 90) resultLabel = 'C1';
        else if (percentage >= 70) resultLabel = 'B2';
        else if (percentage >= 50) resultLabel = 'B1';
        else if (percentage >= 30) resultLabel = 'A2';
        else resultLabel = 'A1';
    } else if (testName === 'japanese') {
        if (percentage >= 96) resultLabel = 'N1';
        else if (percentage >= 90) resultLabel = 'N2';
        else if (percentage >= 60) resultLabel = 'N3';
        else if (percentage >= 30) resultLabel = 'N4';
        else resultLabel = 'N5';
    } else if (testName === 'personality') {
        if (percentage >= 80) resultLabel = 'Extrovert Dynamo';
        else if (percentage >= 20 && percentage < 80) resultLabel = 'Ambivert';
        else resultLabel = 'Deep Introvert';
    } else {
        resultLabel = 'Unknown';
    }

    localStorage.setItem(`${testName}_score`, percentage.toFixed(1));
    localStorage.setItem(`${testName}_result`, resultLabel);

    // Get Discord userId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId'); // should be passed by bot link
    if (userId) {
        // Send result to Vortexa bot server
        fetch('https://45.131.65.107:25864/submit-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                score: percentage.toFixed(1)
            })
        })
        .then(res => res.json())
        .then(data => console.log('Score saved:', data))
        .catch(err => console.error('Error saving score:', err));
    } else {
        console.warn('No userId found in URL. Score not sent to bot.');
    }

    // Redirect to result page
    window.location.href = `result.html?test=${testName}`;
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
