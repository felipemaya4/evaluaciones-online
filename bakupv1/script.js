document.addEventListener('DOMContentLoaded', () => {
    // --- Utility Functions ---
    function getFromLocalStorage(key, defaultValue = []) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    }

    function saveToLocalStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // --- Global Data Stores ---
    let allQuizzes = getFromLocalStorage('allQuizzes');
    let allUsers = getFromLocalStorage('users', []);
    let currentUser = getFromLocalStorage('currentUserSession', null);
    let allQuizResults = getFromLocalStorage('allQuizResults', []);

    let currentEditingQuizQuestions = []; // Stores questions for the quiz currently being edited
    let currentQuizTaking = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];

    // --- Elements for Quiz Creator (index.html) ---
    const quizNameInput = document.getElementById('quizName');
    const questionForm = document.getElementById('questionForm');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const saveQuizBtn = document.getElementById('saveQuizBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const existingQuizzesDiv = document.getElementById('existingQuizzes');

    // --- Elements for Quiz Taker (quiz.html) ---
    const pageTitle = document.getElementById('pageTitle');
    const identificationSection = document.getElementById('identificationSection');
    const identificationForm = document.getElementById('identificationForm');
    const userNameInput = document.getElementById('userName');
    const identificationNumberInput = document.getElementById('identificationNumber');
    const startSessionBtn = document.getElementById('startSessionBtn');
    const identificationMessage = document.getElementById('identificationMessage');

    const quizSelectionSection = document.getElementById('quizSelectionSection');
    const identifiedUserSpan = document.getElementById('identifiedUser');
    const availableQuizzesDiv = document.getElementById('availableQuizzes');
    const changeUserBtn = document.getElementById('changeUserBtn');
    const previousResultsDiv = document.getElementById('previousResults');

    const quizTakingSection = document.getElementById('quizTakingSection');
    const currentQuizTitle = document.getElementById('currentQuizTitle');
    const quizContent = document.getElementById('quizContent');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitQuizBtn = document.getElementById('submitQuizBtn');

    const resultsContainer = document.getElementById('resultsContainer');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const totalQuestionsDisplay = document.getElementById('totalQuestionsDisplay');
    const retakeQuizBtn = document.getElementById('retakeQuizBtn');
    const backToSelectionBtn = document.getElementById('backToSelectionBtn');

    // --- Quiz Creator Logic (if on index.html) ---
    if (questionForm) {
        let questionCounter = 0; // Global counter for unique IDs across all question blocks

        // Sets up the toggle for question type (text/image)
        function setupQuestionTypeToggle(questionBlock, blockIndex) {
            const textRadio = questionBlock.querySelector(`#questionTypeText${blockIndex}`);
            const imageRadio = questionBlock.querySelector(`#questionTypeImage${blockIndex}`);
            const textGroup = questionBlock.querySelector('.question-text-group');
            const imageGroup = questionBlock.querySelector('.question-image-group');

            // Set initial visibility and required attributes based on current state
            const toggleVisibility = () => {
                if (textRadio.checked) {
                    textGroup.style.display = 'block';
                    textGroup.querySelector('textarea').setAttribute('required', 'required');
                    imageGroup.style.display = 'none';
                    imageGroup.querySelector('input').removeAttribute('required');
                } else {
                    textGroup.style.display = 'none';
                    textGroup.querySelector('textarea').removeAttribute('required');
                    imageGroup.style.display = 'block';
                    imageGroup.querySelector('input').setAttribute('required', 'required');
                }
            };

            textRadio.addEventListener('change', toggleVisibility);
            imageRadio.addEventListener('change', toggleVisibility);
            toggleVisibility(); // Apply initial visibility
        }


        // Add a new question block to the form
        function addQuestionBlock(question = { question: '', answers: ['', '', '', ''], correctAnswer: null, isImage: false, imageFileName: '' }) {
            const blockIndex = questionCounter; // Use current counter for this new block
            questionCounter++; // Increment for the next question

            const questionBlock = document.createElement('div');
            questionBlock.classList.add('question-block');
            questionBlock.innerHTML = `
                <div class="form-group">
                    <label>Tipo de Pregunta:</label>
                    <div class="radio-group">
                        <input type="radio" name="questionType${blockIndex}" value="text" id="questionTypeText${blockIndex}" ${!question.isImage ? 'checked' : ''}>
                        <label for="questionTypeText${blockIndex}">Texto</label>
                        <input type="radio" name="questionType${blockIndex}" value="image" id="questionTypeImage${blockIndex}" ${question.isImage ? 'checked' : ''}>
                        <label for="questionTypeImage${blockIndex}">Imagen</label>
                    </div>
                </div>

                <div class="form-group question-text-group">
                    <label for="questionText${blockIndex}">Pregunta (Texto):</label>
                    <textarea id="questionText${blockIndex}" ${!question.isImage ? 'required' : ''}>${question.question}</textarea>
                </div>
                <div class="form-group question-image-group" style="display: ${question.isImage ? 'block' : 'none'};">
                    <label for="questionImage${blockIndex}">Nombre de Archivo de Imagen (en carpeta assets/):</label>
                    <input type="text" id="questionImage${blockIndex}" placeholder="Ej: mi_imagen.png" value="${question.imageFileName || ''}" ${question.isImage ? 'required' : ''}>
                    <small>Solo el nombre del archivo, ej: \`bandera.jpg\`. La ruta es \`assets/\`</small>
                </div>

                <div class="answers-group">
                    <label>Respuestas:</label>
                    <div class="answer-item">
                        <input type="text" class="answer-input" placeholder="Respuesta A" value="${question.answers[0] || ''}" required>
                        <input type="radio" name="correctAnswer${blockIndex}" class="correct-radio" value="0" ${question.correctAnswer === 0 ? 'checked' : ''}> Correcta
                    </div>
                    <div class="answer-item">
                        <input type="text" class="answer-input" placeholder="Respuesta B" value="${question.answers[1] || ''}" required>
                        <input type="radio" name="correctAnswer${blockIndex}" class="correct-radio" value="1" ${question.correctAnswer === 1 ? 'checked' : ''}> Correcta
                    </div>
                    <div class="answer-item">
                        <input type="text" class="answer-input" placeholder="Respuesta C" value="${question.answers[2] || ''}">
                        <input type="radio" name="correctAnswer${blockIndex}" class="correct-radio" value="2" ${question.correctAnswer === 2 ? 'checked' : ''}> Correcta
                    </div>
                    <div class="answer-item">
                        <input type="text" class="answer-input" placeholder="Respuesta D" value="${question.answers[3] || ''}">
                        <input type="radio" name="correctAnswer${blockIndex}" class="correct-radio" value="3" ${question.correctAnswer === 3 ? 'checked' : ''}> Correcta
                    </div>
                </div>
            `;
            // Insert the new question block before the "Add New Question" button
            questionForm.insertBefore(questionBlock, addQuestionBtn);
            setupQuestionTypeToggle(questionBlock, blockIndex); // Set up toggle for the newly created block
        }

        // Load existing quiz data into the form for editing
        function loadQuizForEditing(quizId) {
            const quizToEdit = allQuizzes.find(q => q.id === quizId);
            if (!quizToEdit) return;

            quizNameInput.value = quizToEdit.name;
            currentEditingQuizQuestions = quizToEdit.questions; // Store questions for current editing session

            // --- CORRECTION START ---
            // Clear all existing question blocks first
            document.querySelectorAll('.question-block').forEach(block => block.remove());
            questionCounter = 0; // Reset counter for unique IDs

            // Add all questions from the quizToEdit dynamically
            if (quizToEdit.questions.length > 0) {
                quizToEdit.questions.forEach(question => {
                    addQuestionBlock(question);
                });
            } else {
                // If the quiz has no questions, add a default empty block
                addQuestionBlock();
            }
            // --- CORRECTION END ---
        }

        // Render the list of existing quizzes
        function renderExistingQuizzes() {
            if (allQuizzes.length === 0) {
                existingQuizzesDiv.innerHTML = '<p>No hay quices creados.</p>';
                return;
            }

            const ul = document.createElement('ul');
            allQuizzes.forEach(quiz => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${quiz.name} (${quiz.questions.length} preguntas)</span>
                    <div>
                        <button class="edit-quiz-btn" data-id="${quiz.id}">Editar</button>
                        <button class="delete-quiz-btn" data-id="${quiz.id}">Eliminar</button>
                    </div>
                `;
                ul.appendChild(li);
            });
            existingQuizzesDiv.innerHTML = '';
            existingQuizzesDiv.appendChild(ul);

            document.querySelectorAll('.edit-quiz-btn').forEach(button => {
                button.addEventListener('click', (e) => loadQuizForEditing(e.target.dataset.id));
            });
            document.querySelectorAll('.delete-quiz-btn').forEach(button => {
                button.addEventListener('click', (e) => deleteQuiz(e.target.dataset.id));
            });
        }

        // Delete a quiz
        function deleteQuiz(quizId) {
            if (confirm('¿Estás seguro de que quieres eliminar este quiz?')) {
                allQuizzes = allQuizzes.filter(q => q.id !== quizId);
                saveToLocalStorage('allQuizzes', allQuizzes);
                allQuizResults = allQuizResults.filter(r => r.quizId !== quizId);
                saveToLocalStorage('allQuizResults', allQuizResults);

                renderExistingQuizzes();
                alert('Quiz eliminado.');
                clearForm(); // Clear the form if the deleted quiz was being edited
            }
        }

        // Clear the form to create a new quiz
        function clearForm() {
            quizNameInput.value = '';
            // --- CORRECTION START ---
            // Remove all existing question blocks
            document.querySelectorAll('.question-block').forEach(block => block.remove());
            questionCounter = 0; // Reset the counter for new questions
            // Add one fresh, empty question block to start with
            addQuestionBlock();
            // --- CORRECTION END ---
        }

        // Initial setup for the question creator page
        // Instead of initializeQuestionBlockNames, we just add one empty block
        // if the form is empty, or load quizzes.
        if (document.querySelectorAll('.question-block').length === 0) { // Check if there's an initial block in HTML
             addQuestionBlock(); // Add the first block dynamically if not present
        }
        renderExistingQuizzes();

        addQuestionBtn.addEventListener('click', () => addQuestionBlock());
        clearFormBtn.addEventListener('click', clearForm);

        questionForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const quizName = quizNameInput.value.trim();
            if (!quizName) {
                alert('Por favor, ingresa un nombre para el quiz.');
                return;
            }

            const questionsForThisQuiz = [];
            let isValid = true;
            // Iterate through all dynamically created question blocks
            document.querySelectorAll('.question-block').forEach((block, index) => {
                // Get the 'name' attribute from the radio buttons to determine their current index
                const questionTypeRadios = block.querySelector('.radio-group input[type="radio"]:checked');
                const isImage = questionTypeRadios ? questionTypeRadios.value === 'image' : false; // Default to false if no radio is checked
                
                const questionText = block.querySelector('textarea[id^="questionText"]').value.trim();
                const imageFileName = block.querySelector('input[id^="questionImage"]').value.trim();

                const answerInputs = block.querySelectorAll('.answer-input');
                const correctRadio = block.querySelector(`input[name^="correctAnswer"]:checked`); // Use name^ for dynamic ID

                if (!isImage && !questionText) {
                    alert(`Por favor, ingresa el texto de la pregunta ${index + 1}.`);
                    isValid = false;
                    return;
                }
                if (isImage && !imageFileName) {
                    alert(`Por favor, ingresa el nombre de archivo de la imagen para la pregunta ${index + 1}.`);
                    isValid = false;
                    return;
                }

                const answers = [];
                answerInputs.forEach(input => {
                    const answer = input.value.trim();
                    if (answer) {
                        answers.push(answer);
                    }
                });

                if (answers.length < 2) {
                    alert(`Por favor, ingresa al menos dos respuestas para la pregunta ${index + 1}.`);
                    isValid = false;
                    return;
                }

                if (!correctRadio) {
                    alert(`Por favor, selecciona la respuesta correcta para la pregunta ${index + 1}.`);
                    isValid = false;
                    return;
                }

                const correctAnswerIndex = parseInt(correctRadio.value);

                questionsForThisQuiz.push({
                    question: questionText,
                    isImage: isImage,
                    imageFileName: imageFileName,
                    answers: answers,
                    correctAnswer: correctAnswerIndex
                });
            });

            if (!isValid) {
                return;
            }

            if (questionsForThisQuiz.length === 0) {
                alert('No hay preguntas para guardar en este quiz.');
                return;
            }

            const existingQuizIndex = allQuizzes.findIndex(q => q.name === quizName);

            if (existingQuizIndex > -1) {
                allQuizzes[existingQuizIndex].questions = questionsForThisQuiz;
                alert(`Quiz "${quizName}" actualizado exitosamente.`);
            } else {
                const newQuizId = Date.now().toString();
                allQuizzes.push({
                    id: newQuizId,
                    name: quizName,
                    questions: questionsForThisQuiz
                });
                alert(`Quiz "${quizName}" creado exitosamente.`);
            }

            saveToLocalStorage('allQuizzes', allQuizzes);
            renderExistingQuizzes();
            clearForm();
        });
    }

    // --- Quiz Taker Logic (if on quiz.html) ---
    if (identificationSection) {
        updateUIBasedOnIdentification();

        function updateUIBasedOnIdentification() {
            if (currentUser) {
                identificationSection.style.display = 'none';
                quizSelectionSection.style.display = 'block';
                identifiedUserSpan.textContent = `Identificado como: ${currentUser.name} (ID: ${currentUser.identification})`;
                renderAvailableQuizzes();
                renderPreviousResults();
                pageTitle.textContent = 'Selecciona un Quiz';
            } else {
                identificationSection.style.display = 'block';
                quizSelectionSection.style.display = 'none';
                quizTakingSection.style.display = 'none';
                resultsContainer.style.display = 'none';
                pageTitle.textContent = 'Bienvenido al Sistema de Quices';
            }
        }

        function renderAvailableQuizzes() {
            if (allQuizzes.length === 0) {
                availableQuizzesDiv.innerHTML = '<p>No hay quices disponibles. Pide al administrador que cree algunos.</p>';
                return;
            }

            const ul = document.createElement('ul');
            allQuizzes.forEach(quiz => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${quiz.name} (${quiz.questions.length} preguntas)</span>
                    <button class="start-quiz-btn" data-id="${quiz.id}">Tomar Quiz</button>
                `;
                ul.appendChild(li);
            });
            availableQuizzesDiv.innerHTML = '';
            availableQuizzesDiv.appendChild(ul);

            document.querySelectorAll('.start-quiz-btn').forEach(button => {
                button.addEventListener('click', (e) => startQuiz(e.target.dataset.id));
            });
        }

        function renderPreviousResults() {
            const userResults = allQuizResults.filter(result => result.identificationNumber === currentUser.identification);

            if (userResults.length === 0) {
                previousResultsDiv.innerHTML = '<p>No has tomado quices aún.</p>';
                return;
            }

            const ul = document.createElement('ul');
            userResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            userResults.forEach(result => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>
                        <strong>${result.quizName}</strong> - Puntuación: <span class="score">${result.score}/${result.totalQuestions}</span>
                        <br>
                        <small>Fecha: ${new Date(result.timestamp).toLocaleString()}</small>
                    </span>
                    <button class="view-details-btn" data-result-id="${result.id}">Ver Detalles</button>
                `;
                ul.appendChild(li);
            });
            previousResultsDiv.innerHTML = '';
            previousResultsDiv.appendChild(ul);

            document.querySelectorAll('.view-details-btn').forEach(button => {
                button.addEventListener('click', (e) => showResultDetails(e.target.dataset.resultId));
            });
        }

        function showResultDetails(resultId) {
            const result = allQuizResults.find(r => r.id === resultId);
            if (!result) return;

            const modal = document.createElement('div');
            modal.classList.add('modal');
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <h2>Detalles del Quiz: ${result.quizName}</h2>
                    <p><strong>Usuario:</strong> ${result.userName} (ID: ${result.identificationNumber})</p>
                    <p><strong>Puntuación Final:</strong> ${result.score} de ${result.totalQuestions}</p>
                    <p><strong>Fecha:</strong> ${new Date(result.timestamp).toLocaleString()}</p>
                    <hr>
                    <div class="modal-body">
                        <h3>Respuestas:</h3>
                        ${result.answersGiven.map((ans, idx) => `
                            <div class="question-detail">
                                ${ans.isImage ? `<p><strong>Pregunta ${idx + 1}:</strong> <img src="assets/${ans.imageFileName}" alt="Pregunta ${idx + 1}"></p>` : `<p><strong>Pregunta ${idx + 1}:</strong> ${ans.questionText}</p>`}
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
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.style.display = 'block';

            modal.querySelector('.close-button').addEventListener('click', () => {
                modal.style.display = 'none';
                modal.remove();
            });

            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                    modal.remove();
                }
            });
        }


        function startQuiz(quizId) {
            currentQuizTaking = allQuizzes.find(q => q.id === quizId);
            if (!currentQuizTaking) {
                alert('Quiz no encontrado.');
                return;
            }
            if (currentQuizTaking.questions.length === 0) {
                alert('Este quiz no tiene preguntas. Intenta con otro.');
                return;
            }

            currentQuestionIndex = 0;
            userAnswers = new Array(currentQuizTaking.questions.length).fill(null);
            quizSelectionSection.style.display = 'none';
            quizTakingSection.style.display = 'block';
            resultsContainer.style.display = 'none';
            currentQuizTitle.textContent = currentQuizTaking.name;
            displayQuestion();
        }

        function displayQuestion() {
            const question = currentQuizTaking.questions[currentQuestionIndex];
            let questionHtml = '';
            if (question.isImage) {
                questionHtml = `<img src="assets/${question.imageFileName}" alt="Pregunta ${currentQuestionIndex + 1}">`;
                if (question.question) {
                    questionHtml += `<p>${question.question}</p>`;
                }
            } else {
                questionHtml = `<p>${question.question}</p>`;
            }

            let answersHtml = '';
            question.answers.forEach((answer, index) => {
                const checked = userAnswers[currentQuestionIndex] === index ? 'checked' : '';
                answersHtml += `
                    <div class="quiz-answer-item">
                        <input type="radio" name="quizAnswer" id="answer${index}" value="${index}" ${checked}>
                        <label for="answer${index}">${answer}</label>
                    </div>
                `;
            });

            quizContent.innerHTML = `
                <div id="questionDisplay">${currentQuestionIndex + 1}. ${questionHtml}</div>
                <div class="answers-group-quiz">
                    ${answersHtml}
                </div>
            `;

            document.querySelectorAll('input[name="quizAnswer"]').forEach(radio => {
                radio.addEventListener('change', (event) => {
                    userAnswers[currentQuestionIndex] = parseInt(event.target.value);
                });
            });

            prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
            nextBtn.style.display = currentQuestionIndex < currentQuizTaking.questions.length - 1 ? 'block' : 'none';
            submitQuizBtn.style.display = currentQuestionIndex === currentQuizTaking.questions.length - 1 ? 'block' : 'none';
        }

        function goToNextQuestion() {
            if (currentQuestionIndex < currentQuizTaking.questions.length - 1) {
                currentQuestionIndex++;
                displayQuestion();
            }
        }

        function goToPreviousQuestion() {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                displayQuestion();
            }
        }

        function submitQuiz() {
            let score = 0;
            const detailedAnswers = [];

            currentQuizTaking.questions.forEach((question, index) => {
                const userAnswerIndex = userAnswers[index];
                const isCorrect = (userAnswerIndex !== null && userAnswerIndex === question.correctAnswer);
                if (isCorrect) {
                    score++;
                }

                detailedAnswers.push({
                    questionText: question.question,
                    isImage: question.isImage,
                    imageFileName: question.imageFileName,
                    options: question.answers,
                    correctAnswerIndex: question.correctAnswer,
                    userAnswerIndex: userAnswerIndex,
                    isCorrect: isCorrect
                });
            });

            const newResult = {
                id: Date.now().toString(),
                userName: currentUser.name,
                identificationNumber: currentUser.identification,
                quizId: currentQuizTaking.id,
                quizName: currentQuizTaking.name,
                score: score,
                totalQuestions: currentQuizTaking.questions.length,
                timestamp: new Date().toISOString(),
                answersGiven: detailedAnswers
            };
            allQuizResults.push(newResult);
            saveToLocalStorage('allQuizResults', allQuizResults);

            quizTakingSection.style.display = 'none';
            resultsContainer.style.display = 'block';
            scoreDisplay.textContent = score;
            totalQuestionsDisplay.textContent = currentQuizTaking.questions.length;
        }

        function retakeQuiz() {
            startQuiz(currentQuizTaking.id);
        }

        function backToQuizSelection() {
            quizTakingSection.style.display = 'none';
            resultsContainer.style.display = 'none';
            quizSelectionSection.style.display = 'block';
            renderPreviousResults();
        }

        // --- User Identification Logic ---
        identificationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userName = userNameInput.value.trim();
            const identificationNumber = identificationNumberInput.value.trim();

            if (!userName || !identificationNumber) {
                identificationMessage.textContent = 'Por favor, ingresa tu nombre y número de identificación.';
                return;
            }

            let userFound = allUsers.find(u => u.identification === identificationNumber);

            if (!userFound) {
                userFound = { name: userName, identification: identificationNumber };
                allUsers.push(userFound);
                saveToLocalStorage('users', allUsers);
                identificationMessage.textContent = '¡Identificación exitosa! Nuevo usuario creado.';
                identificationMessage.style.color = 'green';
            } else if (userFound.name !== userName) {
                userFound.name = userName;
                saveToLocalStorage('users', allUsers);
                identificationMessage.textContent = 'Nombre actualizado y sesión iniciada.';
                identificationMessage.style.color = 'orange';
            } else {
                identificationMessage.textContent = 'Identificación exitosa.';
                identificationMessage.style.color = 'green';
            }

            currentUser = userFound;
            saveToLocalStorage('currentUserSession', currentUser);
            updateUIBasedOnIdentification();
        });

        changeUserBtn.addEventListener('click', () => {
            currentUser = null;
            saveToLocalStorage('currentUserSession', null);
            userNameInput.value = '';
            identificationNumberInput.value = '';
            identificationMessage.textContent = '';
            updateUIBasedOnIdentification();
        });

        nextBtn.addEventListener('click', goToNextQuestion);
        prevBtn.addEventListener('click', goToPreviousQuestion);
        submitQuizBtn.addEventListener('click', submitQuiz);
        retakeQuizBtn.addEventListener('click', retakeQuiz);
        backToSelectionBtn.addEventListener('click', backToQuizSelection);
    }
});