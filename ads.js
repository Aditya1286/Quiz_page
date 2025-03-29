// Global variables
let savedQuizzes = [];
let currentQuiz = null;
let currentQuestion = 0;
let userAnswers = [];
let timerInterval = null;
let timeRemaining = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Toggle mobile menu
    document.getElementById('mobileMenuButton').addEventListener('click', function() {
        document.getElementById('mobileMenu').classList.toggle('hidden');
    });
    
    // Tab switching functionality
    document.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab');
            
            // Update active tab styling
            document.querySelectorAll('[data-tab]').forEach(t => {
                t.classList.remove('tab-active', 'text-primary-500');
                t.classList.add('text-gray-600');
            });
            
            document.querySelectorAll(`[data-tab="${tabName}"]`).forEach(t => {
                t.classList.add('tab-active', 'text-primary-500');
                t.classList.remove('text-gray-600');
            });
            
            // Hide all dashboards
            document.getElementById('teacherDashboard').classList.add('hidden');
            document.getElementById('studentDashboard').classList.add('hidden');
            
            // Show selected dashboard
            document.getElementById(`${tabName}Dashboard`).classList.remove('hidden');
            
            // Hide mobile menu after selection
            document.getElementById('mobileMenu').classList.add('hidden');
            
            // If switching to student dashboard, load available quizzes
            if (tabName === 'student') {
                loadAvailableQuizzes();
            }
        });
    });
    
    // Initialize teacher dashboard
    initTeacherDashboard();
});

// Initialize teacher dashboard
function initTeacherDashboard() {
    const generateBtn = document.getElementById('generateQuestions');
    
    generateBtn.addEventListener('click', function() {
        const questionCount = parseInt(document.getElementById('questionCount').value);
        
        if (questionCount < 1 || questionCount > 20) {
            showNotification('Please enter a number between 1 and 20', 'error');
            return;
        }
        
        generateQuestionFields(questionCount);
    });
    
    // Generate default questions
    generateQuestionFields(4);
    
    // Load saved quizzes from localStorage
    loadSavedQuizzes();
}

// Generate question fields
function generateQuestionFields(count) {
    const questionsContainer = document.getElementById('questionsContainer');
    questionsContainer.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const questionHTML = `
            <div class="question-block bg-gray-50 p-6 rounded-lg shadow-md">
                <div class="mb-4">
                    <label class="block text-lg font-medium text-gray-700 mb-2">Question ${i}</label>
                    <textarea name="question_${i}" rows="2" required
                        class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter your question here"></textarea>
                </div>
                
                <div class="space-y-3">
                    <div class="flex items-center">
                        <input type="radio" id="correct_${i}_a" name="correct_${i}" value="a" required
                            class="w-5 h-5 text-primary-500 focus:ring-primary-400">
                        <input type="text" name="option_${i}_a" required
                            class="ml-3 flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Option A">
                    </div>
                    
                    <div class="flex items-center">
                        <input type="radio" id="correct_${i}_b" name="correct_${i}" value="b" required
                            class="w-5 h-5 text-primary-500 focus:ring-primary-400">
                        <input type="text" name="option_${i}_b" required
                            class="ml-3 flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Option B">
                    </div>
                    
                    <div class="flex items-center">
                        <input type="radio" id="correct_${i}_c" name="correct_${i}" value="c" required
                            class="w-5 h-5 text-primary-500 focus:ring-primary-400">
                        <input type="text" name="option_${i}_c" required
                            class="ml-3 flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Option C">
                    </div>
                    
                    <div class="flex items-center">
                        <input type="radio" id="correct_${i}_d" name="correct_${i}" value="d" required
                            class="w-5 h-5 text-primary-500 focus:ring-primary-400">
                        <input type="text" name="option_${i}_d" required
                            class="ml-3 flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Option D">
                    </div>
                </div>
            </div>
        `;
        
        questionsContainer.innerHTML += questionHTML;
    }
}

// Save quiz function
function saveQuiz(event) {
    event.preventDefault();
    
    const form = document.getElementById('quizForm');
    const questionCount = parseInt(document.getElementById('questionCount').value);
    const formData = new FormData(form);
    
    // Create quiz object
    const quiz = {
        id: Date.now().toString(),
        title: formData.get('quizTitle'),
        timeLimit: parseInt(formData.get('timeLimit')),
        questions: []
    };
    
    // Get question data
    for (let i = 1; i <= questionCount; i++) {
        const question = {
            question: formData.get(`question_${i}`),
            options: {
                a: formData.get(`option_${i}_a`),
                b: formData.get(`option_${i}_b`),
                c: formData.get(`option_${i}_c`),
                d: formData.get(`option_${i}_d`)
            },
            correct: formData.get(`correct_${i}`)
        };
        
        quiz.questions.push(question);
    }
    
    // Save to localStorage
    savedQuizzes.push(quiz);
    localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));
    
    // Update saved quizzes display
    loadSavedQuizzes();
    
    // Show success notification
    showNotification('Quiz saved successfully!', 'success');
    
    // Reset form
    form.reset();
    generateQuestionFields(4);
    
    return false;
}

// Load saved quizzes from localStorage
function loadSavedQuizzes() {
    const storedQuizzes = localStorage.getItem('savedQuizzes');
    savedQuizzes = storedQuizzes ? JSON.parse(storedQuizzes) : [];
    
    const savedQuizzesContainer = document.getElementById('savedQuizzes');
    
    if (savedQuizzes.length === 0) {
        savedQuizzesContainer.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                No quizzes created yet. Create your first quiz above!
            </div>
        `;
        return;
    }
    
    savedQuizzesContainer.innerHTML = '';
    
    savedQuizzes.forEach(quiz => {
        const quizCard = `
            <div class="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
                <div class="p-5">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800">${quiz.title}</h3>
                            <p class="text-gray-600 mt-1">${quiz.questions.length} questions • ${quiz.timeLimit} minutes</p>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="deleteQuiz('${quiz.id}')" class="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="mt-4 text-right">
                        <button onclick="editQuiz('${quiz.id}')" class="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            Edit
                        </button>
                        <button onclick="previewQuiz('${quiz.id}')" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                            Preview
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        savedQuizzesContainer.innerHTML += quizCard;
    });
}

// Delete quiz
function deleteQuiz(quizId) {
    if (confirm('Are you sure you want to delete this quiz?')) {
        savedQuizzes = savedQuizzes.filter(quiz => quiz.id !== quizId);
        localStorage.setItem('savedQuizzes', JSON.stringify(savedQuizzes));
        loadSavedQuizzes();
        showNotification('Quiz deleted successfully', 'success');
    }
}

// Edit quiz
function editQuiz(quizId) {
    const quiz = savedQuizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    // Fill form with quiz data
    document.getElementById('quizTitle').value = quiz.title;
    document.getElementById('timeLimit').value = quiz.timeLimit;
    document.getElementById('questionCount').value = quiz.questions.length;
    
    // Generate question fields
    generateQuestionFields(quiz.questions.length);
    
    setTimeout(() => {
        quiz.questions.forEach((question, index) => {
            const i = index + 1;
            document.querySelector(`textarea[name="question_${i}"]`).value = question.question;
            document.querySelector(`input[name="option_${i}_a"]`).value = question.options.a;
            document.querySelector(`input[name="option_${i}_b"]`).value = question.options.b;
            document.querySelector(`input[name="option_${i}_c"]`).value = question.options.c;
            document.querySelector(`input[name="option_${i}_d"]`).value = question.options.d;
            document.querySelector(`input[id="correct_${i}_${question.correct}"]`).checked = true;
        });
    }, 100);
    
    // Scroll to form
    document.getElementById('quizForm').scrollIntoView({ behavior: 'smooth' });
}

// Preview quiz (similar to taking a quiz)
function previewQuiz(quizId) {
    const quiz = savedQuizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    // Switch to student tab
    document.querySelectorAll('[data-tab="student"]').forEach(t => {
        t.click();
    });
    
    // Start the quiz
    startQuiz(quiz);
}

// Load available quizzes in student dashboard
function loadAvailableQuizzes() {
    const storedQuizzes = localStorage.getItem('savedQuizzes');
    const availableQuizzes = storedQuizzes ? JSON.parse(storedQuizzes) : [];
    
    const availableQuizzesContainer = document.getElementById('availableQuizzes');
    
    if (availableQuizzes.length === 0) {
        availableQuizzesContainer.innerHTML = `
            <div class="text-center text-gray-500 py-8 col-span-2">
                No quizzes available. Please check back later.
            </div>
        `;
        return;
    }
    
    availableQuizzesContainer.innerHTML = '';
    
    availableQuizzes.forEach(quiz => {
        const quizCard = `
            <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
                <div class="p-5">
                    <h3 class="text-xl font-semibold text-gray-800">${quiz.title}</h3>
                    <div class="flex items-center space-x-2 mt-2 text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>${quiz.questions.length} questions</span>
                    </div>
                    <div class="flex items-center space-x-2 mt-1 text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>${quiz.timeLimit} minutes</span>
                    </div>
                    <button onclick="startQuiz(${JSON.stringify(quiz).replace(/"/g, '&quot;')})" 
                        class="mt-4 w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                        Start Quiz
                    </button>
                </div>
            </div>
        `;
        
        availableQuizzesContainer.innerHTML += quizCard;
    });
}

// Start quiz
function startQuiz(quiz) {
    // Set current quiz
    currentQuiz = quiz;
    currentQuestion = 0;
    userAnswers = new Array(quiz.questions.length).fill(null);
    
    // Hide quiz selection
    document.getElementById('quizSelection').classList.add('hidden');
    
    // Update quiz title
    document.getElementById('activeQuizTitle').textContent = quiz.title;
    
    // Set up timer
    timeRemaining = quiz.timeLimit * 60;
    updateTimer();
    timerInterval = setInterval(updateTimerTick, 1000);
    
    // Show quiz container
    document.getElementById('quizContainer').classList.remove('hidden');
    
    // Load first question
    loadQuestion(0);
}

// Load question
function loadQuestion(index) {
    if (index < 0 || index >= currentQuiz.questions.length) return;
    
    currentQuestion = index;
    const question = currentQuiz.questions[index];
    
    // Update question counter
    document.getElementById('questionCounter').textContent = `Question ${index + 1} of ${currentQuiz.questions.length}`;
    
    // Update progress bar
    const progress = ((index + 1) / currentQuiz.questions.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
    
    // Update question text
    document.getElementById('questionText').textContent = question.question;
    
    // Generate options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    const options = ['a', 'b', 'c', 'd'];
    options.forEach(option => {
        const optionHTML = `
            <div class="quiz-option ${userAnswers[index] === option ? 'selected' : ''}"
                 onclick="selectOption('${option}')"
                 data-option="${option}">
                <div class="flex items-center p-4 rounded-lg border border-gray-300 cursor-pointer">
                    <div class="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full border-2 mr-3
                        ${userAnswers[index] === option ? 'border-primary-500 bg-primary-500 text-white' : 'border-gray-400'}">
                        ${userAnswers[index] === option ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>' : option.toUpperCase()}
                    </div>
                    <span class="text-gray-800">${question.options[option]}</span>
                </div>
            </div>
        `;
        
        optionsContainer.innerHTML += optionHTML;
    });
    
    // Update navigation buttons
    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').textContent = index === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next';
    document.getElementById('nextBtn').disabled = userAnswers[index] === null;
}

// Select option
function selectOption(option) {
    userAnswers[currentQuestion] = option;
    
    // Update UI
    document.querySelectorAll('.quiz-option').forEach(optDiv => {
        optDiv.classList.remove('selected');
        const optOption = optDiv.getAttribute('data-option');
        const circle = optDiv.querySelector('div.flex-shrink-0');
        
        if (optOption === option) {
            optDiv.classList.add('selected');
            circle.classList.add('border-primary-500', 'bg-primary-500', 'text-white');
            circle.classList.remove('border-gray-400');
            circle.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
        } else {
            circle.classList.remove('border-primary-500', 'bg-primary-500', 'text-white');
            circle.classList.add('border-gray-400');
            circle.textContent = optOption.toUpperCase();
        }
    });
    
    // Enable next button
    document.getElementById('nextBtn').disabled = false;
}

// Navigation functions
document.getElementById('prevBtn').addEventListener('click', function() {
    loadQuestion(currentQuestion - 1);
});

document.getElementById('nextBtn').addEventListener('click', function() {
    if (currentQuestion === currentQuiz.questions.length - 1) {
        finishQuiz();
    } else {
        loadQuestion(currentQuestion + 1);
    }
});

// Update timer
function updateTimer() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer').textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Timer tick
function updateTimerTick() {
    timeRemaining--;
    updateTimer();
    
    if (timeRemaining <= 0) {
        finishQuiz();
    }
}

// Finish quiz
function finishQuiz() {
    // Clear timer
    clearInterval(timerInterval);
    
    // Calculate results
    const results = calculateResults();
    
    // Update results UI
    document.getElementById('finalScore').textContent = `${results.percentage}%`;
    document.getElementById('scoreDetails').textContent = `You answered ${results.correct} out of ${results.total} questions correctly`;
    
    document.getElementById('totalQuestionsResult').textContent = results.total;
    document.getElementById('correctAnswersResult').textContent = results.correct;
    document.getElementById('incorrectAnswersResult').textContent = results.incorrect;
    
    // Hide quiz container
    document.getElementById('quizContainer').classList.add('hidden');
    
    // Show results container
    document.getElementById('resultsContainer').classList.remove('hidden');
}

// Calculate results
function calculateResults() {
    let correct = 0;
    let incorrect = 0;
    
    currentQuiz.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correct) {
            correct++;
        } else if (userAnswers[index] !== null) {
            incorrect++;
        }
    });
    
    const total = currentQuiz.questions.length;
    const unanswered = total - correct - incorrect;
    const percentage = Math.round((correct / total) * 100);
    
    return {
        total,
        correct,
        incorrect,
        unanswered,
        percentage
    };
}

// Return to quiz selection
function returnToQuizSelection() {
    document.getElementById('resultsContainer').classList.add('hidden');
    document.getElementById('reviewContainer').classList.add('hidden');
    document.getElementById('quizSelection').classList.remove('hidden');
}

// Review quiz answers
function reviewQuizAnswers() {
    // Hide results
    document.getElementById('resultsContainer').classList.add('hidden');
    
    // Generate review content
    const reviewContent = document.getElementById('reviewContent');
    reviewContent.innerHTML = '';
    
    currentQuiz.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correct;
        
        const reviewHTML = `
            <div class="p-5 ${isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'} rounded-md">
                <h3 class="text-lg font-medium text-gray-800">
                    ${index + 1}. ${question.question}
                </h3>
                
                <div class="mt-3 space-y-2">
                    ${Object.entries(question.options).map(([key, value]) => {
                        let classes = 'p-3 rounded-lg border';
                        
                        if (key === question.correct) {
                            classes += ' bg-green-100 border-green-300';
                        } else if (key === userAnswer) {
                            classes += ' bg-red-100 border-red-300';
                        } else {
                            classes += ' bg-white border-gray-300';
                        }
                        
                        return `
                            <div class="${classes}">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full mr-2 
                                        ${key === question.correct ? 'bg-green-500 text-white' : (key === userAnswer ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700')}">
                                        ${key.toUpperCase()}
                                    </div>
                                    <span>${value}</span>
                                    ${key === question.correct ? '<span class="ml-auto text-green-600">Correct Answer</span>' : ''}
                                    ${key === userAnswer && key !== question.correct ? '<span class="ml-auto text-red-600">Your Answer</span>' : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        reviewContent.innerHTML += reviewHTML;
    });
    
    // Show review container
    document.getElementById('reviewContainer').classList.remove('hidden');
}

// Return to results
function returnToResults() {
    document.getElementById('reviewContainer').classList.add('hidden');
    document.getElementById('resultsContainer').classList.remove('hidden');
}

// Show notification
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notificationMessage');
    const successIcon = document.getElementById('successIcon');
    const errorIcon = document.getElementById('errorIcon');
    
    // Set message
    notificationMessage.textContent = message;
    
    // Set icon
    successIcon.classList.add('hidden');
    errorIcon.classList.add('hidden');
    
    if (type === 'success') {
        notification.classList.remove('bg-red-50');
        notification.classList.add('bg-green-50');
        successIcon.classList.remove('hidden');
    } else {
        notification.classList.remove('bg-green-50');
        notification.classList.add('bg-red-50');
        errorIcon.classList.remove('hidden');
    }
    
    // Show notification
    notification.classList.remove('translate-x-full');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
    }, 3000);
}
