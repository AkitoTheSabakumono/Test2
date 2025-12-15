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

    // Store numeric score
    localStorage.setItem(`${testName}_score`, percentage.toFixed(1));

    // Determine the result label (level or personality)
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
        if (percentage >= 67) resultLabel = 'Deep Introvert';
        else if (percentage >= 37) resultLabel = 'Ambivert';
        else resultLabel = 'Extrovert Dynamo';
    } else {
        resultLabel = 'Unknown';
    }

    localStorage.setItem(`${testName}_result`, resultLabel);

    // Now fetch description dynamically
    // English/Japanese → levels JSON
    // Personality/IQ → results JSON
    let descriptionFile = '';
    if (testName === 'english' || testName === 'japanese') {
        descriptionFile = `data/${testName}_levels.json`;
    } else {
        descriptionFile = `data/${testName}_results.json`;
    }

    fetch(descriptionFile)
        .then(res => {
            if (!res.ok) throw new Error(`File not found: ${descriptionFile}`);
            return res.json();
        })
        .then(data => {
            let description = 'No description available';
            
            // Correct-answer tests (levels) have min/max by percentage
            if (testName === 'english' || testName === 'japanese') {
                for (let item of data) {
                    if (percentage >= item.min && percentage <= item.max) {
                        description = item.description;
                        break;
                    }
                }
            } else {
                // Score-based tests (personality/IQ) use score
                const totalScore = questions.reduce((sum, q) => {
                    const selectedOption = q.options.find(opt => opt.selected);
                    return sum + (selectedOption ? selectedOption.score : 0);
                }, 0);
                for (let item of data) {
                    if (totalScore >= item.min && totalScore <= item.max) {
                        description = item.text;
                        break;
                    }
                }
            }

            localStorage.setItem(`${testName}_result_description`, description);
            // Redirect to result page
            window.location.href = `result.html?test=${testName}`;
        })
        .catch(err => {
            console.error("Error loading description:", err);
            localStorage.setItem(`${testName}_result_description`, '');
            window.location.href = `result.html?test=${testName}`;
        });
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
