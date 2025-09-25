// =======================================================
// 1. VARIABEL PENTING (DOM ELEMENTS)
// =======================================================
const startScreen = document.getElementById('start-screen');
const cardSelectionScreen = document.getElementById('card-selection-screen');
const questionScreen = document.getElementById('question-screen');
const answerScreen = document.getElementById('answer-screen');

const startButton = document.getElementById('start-button');
const selectableCards = document.querySelectorAll('.card-deck .card'); 
const nextToAnswerButton = document.getElementById('next-to-answer-button');

const answerCards = document.querySelectorAll('.answer-deck .answer-card');
const feedbackMessage = document.getElementById('feedback-message');
const scoreDisplay = document.getElementById('score-display');
const mistakeCountDisplay = document.getElementById('mistake-count');


// =======================================================
// 2. VARIABEL LOGIKA GAME & DATA
// =======================================================
let currentScore = 0;
let currentMistakes = 0;
let isAnsweredCorrectly = false;
let currentQuestionIndex = 0;
let questionStartTime = 0;
let timerInterval; // Untuk mengontrol timer

// Data Soal Lengkap
const allQuestions = [
    {
        questionText: "Berapakah hasil dari 3 + 5?",
        options: ["13", "11", "12", "8"],
        correctAnswer: "8",
        color: "blue"
    },
    {
        questionText: "Siapa penemu teori relativitas?",
        options: ["Isaac Newton", "Nikola Tesla", "Albert Einstein", "Thomas Edison"],
        correctAnswer: "Albert Einstein",
        color: "green"
    },
    {
        questionText: "Apa gas yang paling banyak di atmosfer bumi?",
        options: ["Oksigen", "Nitrogen", "Argon", "Karbon Dioksida"],
        correctAnswer: "Nitrogen",
        color: "yellow"
    }
];


// =======================================================
// 3. FUNGSI UTAMA GAME
// =======================================================

/**
 * Fungsi untuk berpindah layar
 */
function switchScreen(activeScreen) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
        screen.classList.add('hidden');
    });
    activeScreen.classList.remove('hidden');
    activeScreen.classList.add('active');
}

/**
 * Timer 6 menit (360 detik)
 */
function startTimer(duration, display, onTimeout) {
    let timeRemaining = duration;
    const timerDisplay = document.getElementById(display);
    
    // Hentikan timer sebelumnya jika ada
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
        const seconds = String(timeRemaining % 60).padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            onTimeout();
        }
        timeRemaining--;
    }, 1000);
}

/**
 * 1. Menangani klik tombol MULAI.
 */
function handleStartGame() {
    currentScore = 0;
    currentQuestionIndex = 0;
    currentMistakes = 0;
    scoreDisplay.textContent = currentScore;
    mistakeCountDisplay.textContent = currentMistakes;
    switchScreen(cardSelectionScreen);
}

/**
 * 2. Menangani klik 3 kartu awal.
 */
function handleCardSelection(event) {
    if (currentQuestionIndex >= allQuestions.length) return; 

    const selectedCard = event.currentTarget;
    const questionData = allQuestions[currentQuestionIndex]; 
    
    selectableCards.forEach(card => card.style.pointerEvents = 'none');

    selectedCard.classList.remove('back');
    selectedCard.classList.add('open', questionData.color);
    selectedCard.innerHTML = `<span>SOAL ${currentQuestionIndex + 1}!</span>`;

    setTimeout(() => {
        document.getElementById('question-text').textContent = questionData.questionText;
        document.getElementById('question-number').textContent = `Soal ${currentQuestionIndex + 1}`;
        switchScreen(questionScreen);
        questionStartTime = new Date().getTime(); 
        
        // MULAI TIMER 6 MENIT untuk mencatat soal
        startTimer(360, 'timer-display', handleTimeout); 
    }, 1500);
}

/**
 * 3. Menangani waktu habis (Timeout)
 */
function handleTimeout() {
    if (!isAnsweredCorrectly) {
        // Hanya beri poin 5 jika waktu habis dan belum dijawab benar
        currentScore += 5;
        scoreDisplay.textContent = currentScore;
        alert(`Waktu habis! Soal dilewati. Poin +5.`);
    }
    loadNextQuestion();
}

/**
 * 4. Menangani klik tombol SUDAH CATAT, LANJUT!
 */
function handleNextToAnswer() {
    clearInterval(timerInterval); // Hentikan timer pencatatan
    switchScreen(answerScreen);
    displayAnswers(allQuestions[currentQuestionIndex]);
}

/**
 * Fungsi untuk mengatur dan menampilkan pilihan jawaban.
 */
function displayAnswers(question) {
    const shuffledOptions = question.options.sort(() => Math.random() - 0.5);

    answerCards.forEach((card, index) => {
        const optionText = shuffledOptions[index];
        card.querySelector('span').textContent = optionText;
        card.setAttribute('data-answer-text', optionText);
        card.classList.remove('correct', 'wrong', 'selected');
        card.style.pointerEvents = 'auto';
    });
    feedbackMessage.textContent = "Pilih jawaban terbaikmu!";
}

/**
 * Fungsi untuk menghitung poin berdasarkan aturan.
 */
function calculateScore() {
    let points = 0;
    const timeElapsed = (new Date().getTime() - questionStartTime) / 1000; // Total waktu sejak soal muncul

    // Matikan timer jika masih berjalan
    clearInterval(timerInterval);

    if (currentMistakes === 0) {
        if (timeElapsed <= 180) { // Bonus: kurang dari 3 menit (180 detik)
            points = 20; 
        } else {
            points = 10;
        }
        feedbackMessage.textContent = `BENAR! Poin +${points}! Anda cepat!`;
    } else {
        points = 8;
        feedbackMessage.textContent = `BENAR setelah ${currentMistakes} kali salah. Poin +${points}.`;
    }
    
    currentScore += points;
    scoreDisplay.textContent = currentScore;
    isAnsweredCorrectly = true;
    
    answerCards.forEach(card => card.style.pointerEvents = 'none');

    // Lanjut ke soal berikutnya
    setTimeout(loadNextQuestion, 2000);
}

/**
 * Menangani klik pada kartu jawaban.
 */
function handleAnswerClick(event) {
    const selectedText = event.currentTarget.getAttribute('data-answer-text');
    event.currentTarget.classList.add('selected');

    if (isAnsweredCorrectly) return; 

    if (selectedText === allQuestions[currentQuestionIndex].correctAnswer) {
        // JAWABAN BENAR
        event.currentTarget.classList.add('correct');
        calculateScore();
    } else {
        // JAWABAN SALAH
        currentMistakes++;
        mistakeCountDisplay.textContent = currentMistakes;
        feedbackMessage.textContent = "SALAH! Kartu ini dibuang, coba kartu lain.";
        event.currentTarget.classList.add('wrong');
        event.currentTarget.style.pointerEvents = 'none'; // Kartu yang salah dinonaktifkan
    }
}

/**
 * Pindah ke soal berikutnya (simulasi).
 */
function loadNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= allQuestions.length) {
        // GAME SELESAI
        clearInterval(timerInterval);
        alert(`Permainan Selesai! Skor Akhir Anda: ${currentScore}`);
        switchScreen(startScreen); // Kembali ke awal
        return;
    }
    
    // Reset status untuk soal baru
    currentMistakes = 0;
    mistakeCountDisplay.textContent = currentMistakes;
    isAnsweredCorrectly = false;
    
    // Kembali ke layar pilih kartu 
    switchScreen(cardSelectionScreen);
    selectableCards.forEach(card => {
         card.classList.add('back');
         // Hapus semua kelas warna dan status
         card.classList.remove('open', 'blue', 'green', 'yellow', 'red'); 
         card.innerHTML = `<span>?</span>`;
         card.style.pointerEvents = 'auto';
    });
}


// =======================================================
// 4. EVENT LISTENERS (KONEKSI KLIK)
// =======================================================

startButton.addEventListener('click', handleStartGame); 

selectableCards.forEach(card => {
    card.addEventListener('click', handleCardSelection);
});

nextToAnswerButton.addEventListener('click', handleNextToAnswer);

answerCards.forEach(card => {
    card.addEventListener('click', handleAnswerClick);
});


// 5. INISIASI AWAL
switchScreen(startScreen);