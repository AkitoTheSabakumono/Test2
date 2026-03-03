let questions = [];
let currentQuestion = 0;
let correctCount = 0;
let testName = '';

function loadTest() {
    const urlParams = new URLSearchParams(window.location.search);
    const testName = urlParams.get('test') || 'english';
    const userId = urlParams.get('userId'); // for bot submission later

    // Correct relative path from JS folder
    const path = `../data/${testName}.json`;

    fetch(path)
        .then(response => {
            if (!response.ok) throw new Error(`File not found: ${path}`);
            return response.json();
        })
        .then(data => {
            questions = getRandomQuestions(data, 20);
            showQuestion(userId);
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

function goToResult(userId) {
    const totalQuestions = questions.length;
    const percentage = (correctCount / totalQuestions) * 100;

    localStorage.setItem(`${testName}_score`, percentage.toFixed(1));

    // Send score to your bot via fetch
    if (userId) {
        fetch('https://45.131.65.107:25864/submit-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, score: percentage })
})
.then(res => console.log('Score sent to bot', res.status))
.catch(err => console.error('Error sending score:', err));
        }).then(res => console.log('Score sent to bot', res.status))
          .catch(err => console.error('Error sending score:', err));
    }

    window.location.href = `result.html?test=${testName}&score=${percentage}`;
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
