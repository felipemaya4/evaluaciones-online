document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('DOMContentLoaded', () => {
    const questionForm = document.getElementById('questionForm');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const saveQuestionsBtn = document.getElementById('saveQuestionsBtn');
    let questionCounter = 0; // To ensure unique radio button names

    // Function to add a new question block
    function addQuestionBlock() {
        questionCounter++; // Increment for the new block

        const questionBlock = document.createElement('div');
        questionBlock.classList.add('question-block');
        questionBlock.innerHTML = `
            <div class="form-group">
                <label for="questionText${questionCounter}">Pregunta:</label>
                <textarea id="questionText${questionCounter}" required></textarea>
            </div>
            <div class="answers-group">
                <label>Respuestas:</label>
                <div class="answer-item">
                    <input type="text" class="answer-input" placeholder="Respuesta A" required>
                    <input type="radio" name="correctAnswer${questionCounter}" class="correct-radio" value="0"> Correcta
                </div>
                <div class="answer-item">
                    <input type="text" class="answer-input" placeholder="Respuesta B" required>
                    <input type="radio" name="correctAnswer${questionCounter}" class="correct-radio" value="1"> Correcta
                </div>
                <div class="answer-item">
                    <input type="text" class="answer-input" placeholder="Respuesta C" required>
                    <input type="radio" name="correctAnswer${questionCounter}" class="correct-radio" value="2"> Correcta
                </div>
                <div class="answer-item">
                    <input type="text" class="answer-input" placeholder="Respuesta D" required>
                    <input type="radio" name="correctAnswer${questionCounter}" class="correct-radio" value="3"> Correcta
                </div>
            </div>
        `;
        // Insert the new question block before the buttons
        questionForm.insertBefore(questionBlock, addQuestionBtn);
    }

    // Add event listener for "Add New Question" button
    addQuestionBtn.addEventListener('click', addQuestionBlock);

    // Event listener for form submission (save questions)
    questionForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent default form submission

        const allQuestions = [];
        const questionBlocks = document.querySelectorAll('.question-block');

        questionBlocks.forEach((block, index) => {
            const questionText = block.querySelector('textarea').value.trim();
            const answerInputs = block.querySelectorAll('.answer-input');
            const correctRadio = block.querySelector(`input[name="correctAnswer${index}"]:checked`);

            if (!questionText) {
                alert(`Por favor, ingresa el texto de la pregunta ${index + 1}.`);
                return; // Skip this question if no text
            }

            const answers = [];
            answerInputs.forEach(input => {
                const answer = input.value.trim();
                if (answer) {
                    answers.push(answer);
                }
            });

            if (answers.length < 2) { // Ensure at least two answers for a multiple choice
                alert(`Por favor, ingresa al menos dos respuestas para la pregunta ${index + 1}.`);
                return;
            }

            if (!correctRadio) {
                alert(`Por favor, selecciona la respuesta correcta para la pregunta ${index + 1}.`);
                return;
            }

            const correctAnswerIndex = parseInt(correctRadio.value);

            const questionData = {
                question: questionText,
                answers: answers,
                correctAnswer: correctAnswerIndex
            };
            allQuestions.push(questionData);
        });

        if (allQuestions.length > 0) {
            localStorage.setItem('quizQuestions', JSON.stringify(allQuestions));
            alert('¡Preguntas guardadas exitosamente en el LocalStorage!');
            questionForm.reset(); // Clear the form
            // Optionally, remove dynamically added blocks to start fresh
            document.querySelectorAll('.question-block:not(:first-child)').forEach(block => block.remove());
            questionCounter = 0; // Reset counter for new session
        } else {
            alert('No hay preguntas para guardar.');
        }
    });

    // Initialize with one question block if it's the first load
    if (document.querySelectorAll('.question-block').length === 0) {
        addQuestionBlock(); // Add the initial block if not already present in HTML
    }
});  
  // --- Elements for the Quiz Creator (index.html) ---
    const questionForm = document.getElementById('questionForm');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    // saveQuestionsBtn is handled by the form's submit event listener

    // --- Elements for the Quiz Taker (quiz.html) ---
    const quizContainer = document.getElementById('quizContainer');
    const noQuestionsMessage = document.getElementById('noQuestionsMessage');
    const quizControls = document.getElementById('quizControls');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitQuizBtn = document.getElementById('submitQuizBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const totalQuestionsDisplay = document.getElementById('totalQuestionsDisplay');
    const retakeQuizBtn = document.getElementById('retakeQuizBtn');
    const createMoreQuestionsBtn = document.getElementById('createMoreQuestionsBtn');

    let questions = []; // Array to store quiz questions
    let currentQuestionIndex = 0;
    let userAnswers = []; // To store user's selected answers for each question

    // --- Quiz Creator Logic (if on index.html) ---
    if (questionForm) { // Check if we are on the question creation page
        let questionCounter = 0; // To ensure unique radio button names

        // Function to add a new question block
        function addQuestionBlock() {
            // Only increment if we're not dealing with the very first block that's already in HTML
            // (or if we're programmatically adding the first one)
            if (document.querySelectorAll('.question-block').length > 0) {
                 questionCounter++;
            }
            

            const questionBlock = document.createElement('div');
            questionBlock.classList.add('question-block');
            // Using a unique ID for the textarea and name for radio buttons based on questionCounter
            questionBlock.innerHTML = `
                <div class="form-group">
                    <label for="questionText${questionCounter}">Pregunta:</label>
                    <textarea id="questionText${questionCounter}" required></textarea>
                </div>
                <div class="answers-group">
                    <label>Respuestas:</label>
                    <div class="answer-item">
                        <input type="text" class="answer-input" placeholder="Respuesta A" required>
                        <input type="radio" name="correctAnswer${questionCounter}" class="correct-radio" value="0"> Correcta
                    </div>
                    <div class="answer-item">
                        <input type="text" class="answer-input" placeholder="Respuesta B" required>
                        <input type="radio" name="correctAnswer${questionCounter}" class="correct-radio" value="1"> Correcta
                    </div>
                    <div class="answer-item">
                        <input type="text" class="answer-input" placeholder="Respuesta C" required>
                        <input type="radio" name="correctAnswer${questionCounter}" class="correct-radio" value="2"> Correcta
                    </div>
                    <div class="answer-item">
                        <input type="text" class="answer-input" placeholder="Respuesta D" required>
                        <input type="radio" name="correctAnswer${questionCounter}" class="correct-radio" value="3"> Correcta
                    </div>
                </div>
            `;
            // Insert the new question block before the buttons
            questionForm.insertBefore(questionBlock, addQuestionBtn);
        }

        // Add event listener for "Add New Question" button
        addQuestionBtn.addEventListener('click', addQuestionBlock);

        // Event listener for form submission (save questions)
        questionForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission

            const allQuestions = [];
            const questionBlocks = document.querySelectorAll('.question-block');

            // Validate and collect data from each question block
            let isValid = true;
            questionBlocks.forEach((block, index) => {
                const questionText = block.querySelector('textarea').value.trim();
                const answerInputs = block.querySelectorAll('.answer-input');
                // Use `name` attribute to find the correct radio button for this specific block
                const correctRadio = block.querySelector(`input[name="correctAnswer${index}"]:checked`); 

                if (!questionText) {
                    alert(`Por favor, ingresa el texto de la pregunta ${index + 1}.`);
                    isValid = false;
                    return; // Skip this iteration
                }

                const answers = [];
                answerInputs.forEach(input => {
                    const answer = input.value.trim();
                    if (answer) { // Only add non-empty answers
                        answers.push(answer);
                    }
                });

                if (answers.length < 2) { // Ensure at least two answers for a multiple choice
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

                const questionData = {
                    question: questionText,
                    answers: answers,
                    correctAnswer: correctAnswerIndex
                };
                allQuestions.push(questionData);
            });

            if (!isValid) {
                return; // Stop submission if any validation failed
            }

            if (allQuestions.length > 0) {
                localStorage.setItem('quizQuestions', JSON.stringify(allQuestions));
                alert('¡Preguntas guardadas exitosamente en el LocalStorage!');
                questionForm.reset(); // Clear the form
                // Remove dynamically added blocks, keeping only the initial structure if it exists
                document.querySelectorAll('.question-block:not(:first-child)').forEach(block => block.remove());
                // Reset the first block if it exists (e.g., clear inputs and reset radio)
                const firstBlockTextarea = document.querySelector('.question-block:first-child textarea');
                if (firstBlockTextarea) {
                    firstBlockTextarea.value = '';
                }
                const firstBlockRadios = document.querySelectorAll('.question-block:first-child .correct-radio');
                firstBlockRadios.forEach(radio => radio.checked = false);
                const firstBlockAnswerInputs = document.querySelectorAll('.question-block:first-child .answer-input');
                firstBlockAnswerInputs.forEach(input => input.value = '');

                questionCounter = 0; // Reset counter for new session
            } else {
                alert('No hay preguntas para guardar.');
            }
        });

        // Initialize with one question block if the page loads without any already defined
        if (document.querySelectorAll('.question-block').length === 0) {
            addQuestionBlock(); // Add the initial block if not already present in HTML
        } else {
            // If there's already one block from HTML, ensure its radio buttons have name "correctAnswer0"
            const initialRadios = document.querySelectorAll('.question-block:first-child .correct-radio');
            initialRadios.forEach(radio => radio.name = "correctAnswer0");
        }
    }

    // --- Quiz Taker Logic (if on quiz.html) ---
    if (quizContainer) { // Check if we are on the quiz taking page
        loadQuestions();

        function loadQuestions() {
            const storedQuestions = localStorage.getItem('quizQuestions');
            if (storedQuestions) {
                questions = JSON.parse(storedQuestions);
                if (questions.length > 0) {
                    noQuestionsMessage.style.display = 'none';
                    quizControls.style.display = 'flex';
                    userAnswers = new Array(questions.length).fill(null); // Initialize user answers
                    displayQuestion();
                } else {
                    quizContainer.innerHTML = ''; // Clear container
                    noQuestionsMessage.style.display = 'block';
                    quizControls.style.display = 'none';
                }
            } else {
                quizContainer.innerHTML = ''; // Clear container
                noQuestionsMessage.style.display = 'block';
                quizControls.style.display = 'none';
            }
        }

        function displayQuestion() {
            resultsContainer.style.display = 'none'; // Hide results if visible
            quizContainer.style.display = 'flex'; // Show quiz container

            if (questions.length === 0) {
                quizContainer.innerHTML = '';
                noQuestionsMessage.style.display = 'block';
                quizControls.style.display = 'none';
                return;
            }

            const question = questions[currentQuestionIndex];
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

            quizContainer.innerHTML = `
                <div id="questionDisplay">${currentQuestionIndex + 1}. ${question.question}</div>
                <div class="answers-group-quiz" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
                    ${answersHtml}
                </div>
            `;

            // Add event listeners to radio buttons to record answers
            document.querySelectorAll('input[name="quizAnswer"]').forEach(radio => {
                radio.addEventListener('change', (event) => {
                    userAnswers[currentQuestionIndex] = parseInt(event.target.value);
                });
            });

            // Update button visibility
            prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
            nextBtn.style.display = currentQuestionIndex < questions.length - 1 ? 'block' : 'none';
            submitQuizBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'block' : 'none';
        }

        function goToNextQuestion() {
            if (currentQuestionIndex < questions.length - 1) {
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
            questions.forEach((question, index) => {
                if (userAnswers[index] !== null && userAnswers[index] === question.correctAnswer) {
                    score++;
                }
            });

            quizContainer.style.display = 'none';
            quizControls.style.display = 'none';
            resultsContainer.style.display = 'block';
            scoreDisplay.textContent = score;
            totalQuestionsDisplay.textContent = questions.length;
        }

        function retakeQuiz() {
            currentQuestionIndex = 0;
            userAnswers = new Array(questions.length).fill(null); // Reset answers
            displayQuestion();
        }

        // Event Listeners for Quiz Navigation
        nextBtn.addEventListener('click', goToNextQuestion);
        prevBtn.addEventListener('click', goToPreviousQuestion);
        submitQuizBtn.addEventListener('click', submitQuiz);
        retakeQuizBtn.addEventListener('click', retakeQuiz);
        createMoreQuestionsBtn.addEventListener('click', () => {
            window.location.href = 'index.html'; // Navigate back to question creation
        });
    }
});