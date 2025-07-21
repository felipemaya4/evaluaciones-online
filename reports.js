document.addEventListener('DOMContentLoaded', () => {
    // --- Utility Functions ---
    function getFromLocalStorage(key, defaultValue = []) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    }

    // Fetches quizzes from pruebas.json
    async function loadQuizzesFromJsonFile() {
        try {
            const response = await fetch('pruebas.json');
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn("pruebas.json no encontrado. Se continuará sin cargar quices externos.");
                    return [];
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error al cargar pruebas.json en reports.js:", error);
            return [];
        }
    }

    // Combines quizzes from localStorage and pruebas.json, removing duplicates by ID
    function combineAndDeduplicateQuizzes(localQuizzes, fileQuizzes) {
        const combined = [...localQuizzes];
        const existingIds = new Set(localQuizzes.map(q => q.id));

        fileQuizzes.forEach(fileQuiz => {
            if (!existingIds.has(fileQuiz.id)) {
                combined.push(fileQuiz);
            }
        });
        return combined;
    }

    let allQuizzes = []; // Will be populated from localStorage and pruebas.json
    const localStorageQuizzes = getFromLocalStorage('allQuizzes'); // Get initial local quizzes
    const allQuizResults = getFromLocalStorage('allQuizResults');

    // --- Elements ---
    const quizSelector = document.getElementById('quizSelector');
    const resultsTableContainer = document.getElementById('resultsTableContainer');
    const selectedQuizNameSpan = document.getElementById('selectedQuizName');
    const resultsTableBody = document.querySelector('#resultsTable tbody');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Modal elements (replicated for reports.html for detail view)
    const detailsModal = document.getElementById('detailsModal');
    const modalCloseButton = detailsModal.querySelector('.close-button');
    const modalQuizName = document.getElementById('modalQuizName');
    const modalUserName = document.getElementById('modalUserName');
    const modalUserId = document.getElementById('modalUserId');
    const modalScore = document.getElementById('modalScore');
    const modalTotalQuestions = document.getElementById('modalTotalQuestions');
    const modalTimestamp = document.getElementById('modalTimestamp');
    const modalAnswersGiven = document.getElementById('modalAnswersGiven');

    // --- Functions ---

    // Populate the quiz selector dropdown
    function populateQuizSelector() {
        if (allQuizzes.length === 0) {
            quizSelector.innerHTML = '<option value="">No hay quices disponibles.</option>';
            quizSelector.disabled = true;
            return;
        }

        quizSelector.innerHTML = '<option value="">-- Selecciona un Quiz --</option>'; // Clear and re-add default
        allQuizzes.forEach(quiz => {
            const option = document.createElement('option');
            option.value = quiz.id;
            const source = localStorageQuizzes.some(q => q.id === quiz.id) ? '(Local)' : '(JSON)';
            option.textContent = `${quiz.name} ${source}`;
            quizSelector.appendChild(option);
        });
        quizSelector.disabled = false;
    }

    // Display results for the selected quiz
    function displayQuizResults(quizId) {
        resultsTableBody.innerHTML = ''; // Clear previous results

        if (!quizId) {
            resultsTableContainer.style.display = 'none';
            return;
        }

        const selectedQuiz = allQuizzes.find(q => q.id === quizId);
        if (!selectedQuiz) {
            resultsTableContainer.style.display = 'none';
            return;
        }

        selectedQuizNameSpan.textContent = selectedQuiz.name;
        const resultsForSelectedQuiz = allQuizResults.filter(result => result.quizId === quizId);

        if (resultsForSelectedQuiz.length === 0) {
            noResultsMessage.style.display = 'block';
            resultsTableContainer.style.display = 'block';
            return;
        } else {
            noResultsMessage.style.display = 'none';
        }

        resultsForSelectedQuiz.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by most recent

        resultsForSelectedQuiz.forEach(result => {
            const row = resultsTableBody.insertRow();
            row.insertCell().textContent = result.userName;
            row.insertCell().textContent = result.identificationNumber;
            row.insertCell().textContent = `${result.score}/${result.totalQuestions}`;
            row.insertCell().textContent = new Date(result.timestamp).toLocaleString();

            const detailsCell = row.insertCell();
            const detailsButton = document.createElement('button');
            detailsButton.textContent = 'Ver Detalles';
            detailsButton.classList.add('view-details-btn');
            detailsButton.addEventListener('click', () => showResultDetailsModal(result));
            detailsCell.appendChild(detailsButton);
        });

        resultsTableContainer.style.display = 'block';
    }

    function showResultDetailsModal(result) {
        modalQuizName.textContent = result.quizName;
        modalUserName.textContent = result.userName;
        modalUserId.textContent = result.identificationNumber;
        modalScore.textContent = result.score;
        modalTotalQuestions.textContent = result.totalQuestions;
        modalTimestamp.textContent = new Date(result.timestamp).toLocaleString();

        modalAnswersGiven.innerHTML = '<h3>Respuestas:</h3>'; // Clear previous content
        result.answersGiven.forEach((ans, idx) => {
            const questionDetailDiv = document.createElement('div');
            questionDetailDiv.classList.add('question-detail');

            let questionContentHtml = '';
            if (ans.isImage) {
                questionContentHtml = `<img src="assets/${ans.imageFileName}" alt="Pregunta ${idx + 1}">`;
                if (ans.questionText) {
                    questionContentHtml += `<p>${ans.questionText}</p>`;
                }
            } else {
                questionContentHtml = `<p>${ans.questionText}</p>`;
            }

            questionDetailDiv.innerHTML = `
                <p><strong>Pregunta ${idx + 1}:</strong> ${questionContentHtml}</p>
                <ul>
                    ${ans.options.map((option, oIdx) => `
                        <li class="answer-option ${oIdx === ans.correctAnswerIndex ? 'correct' : ''} ${oIdx === ans.userAnswerIndex && oIdx !== ans.correctAnswerIndex ? 'incorrect' : ''} ${oIdx === ans.userAnswerIndex && oIdx === ans.correctAnswerIndex ? 'user-selected' : ''}">
                            ${option}
                            ${oIdx === ans.correctAnswerIndex ? '(Correcta)' : ''}
                            ${oIdx === ans.userAnswerIndex && oIdx !== ans.correctAnswerIndex ? '(Tu respuesta: Incorrecta)' : ''}
                            ${oIdx === ans.userAnswerIndex && oIdx === ans.correctAnswerIndex ? '(Tu respuesta: Correcta)' : ''}
                        </li>
                    `).join('')}
                </ul>
            `;
            modalAnswersGiven.appendChild(questionDetailDiv);
        });

        detailsModal.style.display = 'block';
    }

    // --- Event Listeners ---
    quizSelector.addEventListener('change', (e) => {
        displayQuizResults(e.target.value);
    });

    modalCloseButton.addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });

    // --- Initial Load ---
    async function initializeReportData() {
        const fileQuizzes = await loadQuizzesFromJsonFile();
        allQuizzes = combineAndDeduplicateQuizzes(localStorageQuizzes, fileQuizzes);
        populateQuizSelector();
    }
    initializeReportData();
});