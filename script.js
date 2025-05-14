// Global variables
let timerInterval;
let currentTestDuration = 60;
let testInProgress = false;
let wordsCorrect = 0;
let wordsIncorrect = 0;
let wordsSubmitted = 0;
let currentWordIndex = 0;
let testWords = [];
let typedWords = [];
let caseSensitive = false;
let includePunctuation = false;

// Text data for different test options
const textData = {
    alphabetical: [
        "ability", "able", "about", "above", "accept", "according", "account", "across", 
        "act", "action", "activity", "actually", "add", "address", "administration", "admit", 
        "adult", "affect", "after", "again", "against", "age", "agency", "agent", "ago", 
        "agree", "agreement", "ahead", "air", "all", "allow", "almost", "alone", "along", 
        "already", "also", "although", "always", "American", "among", "amount", "analysis", 
        "and", "animal", "another", "answer", "any", "anyone", "anything", "appear", 
        "apply", "approach", "area", "argue", "arm", "around", "arrive", "art", "article", 
        "artist", "as", "ask", "assume", "at", "attack", "attention", "attorney", "audience", 
        "author", "authority", "available", "avoid", "away", "baby", "back", "bad", "bag", 
        "ball", "bank", "bar", "base", "be", "beat", "beautiful", "because", "become", "bed", 
        "before", "begin", "behavior", "behind", "believe", "benefit", "best", "better", 
        "between", "beyond", "big", "bill", "billion", "bit", "black", "blood", "blue", 
        "board", "body", "book", "born", "both", "box", "boy", "break", "bring", "brother", 
        "budget", "build", "building", "business", "but", "buy", "by", "call", "camera", 
        "campaign", "can", "cancer", "candidate", "capital", "car", "card", "care", "career"
    ],
    random: [
        "apple", "zebra", "tiger", "banana", "mango", "piano", "guitar", "ocean", "mountain", 
        "river", "forest", "desert", "computer", "keyboard", "monitor", "mouse", "speaker", 
        "camera", "phone", "tablet", "watch", "coffee", "pizza", "pasta", "salad", "burger", 
        "fries", "soda", "water", "juice", "moon", "star", "sun", "planet", "galaxy", 
        "universe", "earth", "mars", "venus", "jupiter", "saturn", "uranus", "neptune", 
        "pluto", "book", "page", "chapter", "story", "novel", "poem", "author", "writer", 
        "reader", "library", "school", "teacher", "student", "class", "lesson", "homework", 
        "test", "exam", "grade", "paper", "pen", "pencil", "marker", "crayon", "paint", 
        "canvas", "brush", "art", "music", "song", "dance", "movie", "film", "actor", 
        "director", "scene", "stage", "theater", "audience", "applause", "game", "play", 
        "win", "lose", "team", "player", "score", "goal", "field", "court", "ball", "bat", 
        "racket", "glove", "helmet", "uniform", "coach", "train", "exercise", "fitness", 
        "health", "doctor", "nurse", "patient", "hospital", "clinic", "medicine", "disease"
    ],
    custom: []
};

// Adding punctuation to words (when option is enabled)
const punctuations = [".", ",", "!", "?", ";", ":", "'", "\"", "-", "_", "(", ")", "[", "]", "{", "}"];
const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

// DOM ready event
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    generateTest();
});

function setupEventListeners() {
    // Duration and text type selection
    document.getElementById('testDuration').addEventListener('change', function() {
        currentTestDuration = parseInt(this.value);
        document.getElementById('time').textContent = currentTestDuration;
    });
    
    document.getElementById('textOption').addEventListener('change', function() {
        const selectedOption = this.value;
        const customTextContainer = document.getElementById('customTextContainer');
        
        // Show/hide custom text input based on selection
        if (selectedOption === 'custom') {
            customTextContainer.classList.remove('hidden');
        } else {
            customTextContainer.classList.add('hidden');
            generateTest();
        }
    });
    
    // Option checkboxes
    document.getElementById('caseSensitive').addEventListener('change', function() {
        caseSensitive = this.checked;
        // Important: We need to update this value immediately
        console.log("Case sensitive set to:", caseSensitive);
    });
    
    document.getElementById('includePunctuation').addEventListener('change', function() {
        includePunctuation = this.checked;
        generateTest();
    });
    
    // Custom text
    document.getElementById('customText').addEventListener('input', function() {
        textData.custom = this.value.split(/\s+/).filter(word => word.length > 0);
    });
    
    document.getElementById('applyCustomTextBtn').addEventListener('click', function() {
        if (textData.custom.length > 0) {
            generateTest();
        }
    });
    
    // User input
    document.getElementById('userInput').addEventListener('input', checkInput);
    document.getElementById('userInput').addEventListener('keydown', function(e) {
        if (e.key === ' ' && this.value.trim() !== '') {
            e.preventDefault();
            submitWord();
        }
    });
    
    // Buttons
    document.getElementById('resetBtn').addEventListener('click', resetTest);
    document.getElementById('tryAgainBtn').addEventListener('click', function() {
        document.getElementById('resultsContainer').classList.add('hidden');
        document.querySelector('.container').classList.remove('hidden');
        resetTest();
    });
}

function generateTest() {
    const textOption = document.getElementById('textOption').value;
    let wordList = textData[textOption];
    
    // If no custom text is available, use random words as fallback
    if (textOption === 'custom' && (!wordList || wordList.length === 0)) {
        wordList = textData.random;
    }
    
    testWords = [];
    typedWords = [];
    
    // Generate at least 200 words (more than anyone can type in the given time)
    for (let i = 0; i < 200; i++) {
        let word = wordList[Math.floor(Math.random() * wordList.length)];
        
        // Add punctuation or numbers if enabled
        if (includePunctuation && Math.random() < 0.3) {
            if (Math.random() < 0.5) {
                // Add punctuation
                word += punctuations[Math.floor(Math.random() * punctuations.length)];
            } else {
                // Add number
                word += numbers[Math.floor(Math.random() * numbers.length)];
            }
        }
        
        testWords.push(word);
    }
    
    // Reset test stats
    currentWordIndex = 0;
    wordsCorrect = 0;
    wordsIncorrect = 0;
    wordsSubmitted = 0;
    updateStats();
    renderTestPreview();
}

function renderTestPreview() {
    const previewElement = document.getElementById('testPreview');
    
    // Display words from current position up to current + 20 (or end of list)
    const displayWords = testWords.slice(currentWordIndex, currentWordIndex + 30);
    let html = '';
    
    // Render past words with correct/incorrect styling
    for (let i = 0; i < typedWords.length; i++) {
        html += `<span class="${typedWords[i].isCorrect ? 'correct-word' : 'incorrect-word'}">${typedWords[i].word}</span> `;
    }
    
    // Render current and upcoming words
    displayWords.forEach((word, index) => {
        if (index === 0) {
            html += `<span class="current-word">${word}</span> `;
        } else {
            html += `<span>${word}</span> `;
        }
    });
    
    previewElement.innerHTML = html;
}

function checkInput() {
    if (!testInProgress) {
        startTest();
    }
}

function submitWord() {
    const inputElement = document.getElementById('userInput');
    const currentTypedWord = inputElement.value.trim();
    const currentWord = testWords[currentWordIndex];
    
    // Check if the word is correct based on case sensitivity setting
    let isCorrect;
    
    // Get the current case sensitivity state directly from the checkbox
    // This ensures we're using the most up-to-date value
    const caseSensitiveCheck = document.getElementById('caseSensitive').checked;
    
    if (caseSensitiveCheck) {
        // Case sensitive comparison (exact match)
        isCorrect = currentTypedWord === currentWord;
    } else {
        // Case insensitive comparison
        isCorrect = currentTypedWord.toLowerCase() === currentWord.toLowerCase();
    }
    
    // Update statistics
    wordsSubmitted++;
    if (isCorrect) {
        wordsCorrect++;
    } else {
        wordsIncorrect++;
    }
    
    // Store the typed word and its correctness
    typedWords.push({
        word: currentWord,
        typedWord: currentTypedWord,
        isCorrect: isCorrect
    });
    
    // Move to the next word
    currentWordIndex++;
    inputElement.value = '';
    updateStats();
    renderTestPreview();
}

function updateStats() {
    document.getElementById('wordsCorrect').textContent = wordsCorrect;
    document.getElementById('wordsIncorrect').textContent = wordsIncorrect;
    document.getElementById('wordsSubmitted').textContent = wordsSubmitted;
    document.getElementById('accuracyPercent').textContent = wordsSubmitted > 0 
        ? Math.round((wordsCorrect / wordsSubmitted) * 100) 
        : 0;
}

function startTest() {
    if (testInProgress) return;
    testInProgress = true;
    
    document.getElementById('time').textContent = currentTestDuration;
    timerInterval = setInterval(() => {
        const timeElement = document.getElementById('time');
        const currentTime = parseInt(timeElement.textContent);
        if (currentTime <= 1) {
            clearInterval(timerInterval);
            endTest();
            timeElement.textContent = '0';
        } else {
            timeElement.textContent = currentTime - 1;
        }
    }, 1000);
}

function endTest() {
    testInProgress = false;
    document.getElementById('userInput').disabled = true;
    
    // Calculate and display results
    document.getElementById('resultWPM').textContent = Math.round((wordsCorrect / currentTestDuration) * 60);
    document.getElementById('resultAccuracy').textContent = wordsSubmitted > 0 
        ? Math.round((wordsCorrect / wordsSubmitted) * 100) + '%' 
        : '0%';
    document.getElementById('resultCorrect').textContent = wordsCorrect;
    document.getElementById('resultIncorrect').textContent = wordsIncorrect;
    
    // Display correct and incorrect words
    displayWordResults();
    
    // Show results, hide test
    document.querySelector('.container').classList.add('hidden');
    document.getElementById('resultsContainer').classList.remove('hidden');
}

function displayWordResults() {
    const correctWordsList = document.getElementById('correctWordsList');
    const incorrectWordsList = document.getElementById('incorrectWordsList');
    
    // Clear previous results
    correctWordsList.innerHTML = '';
    incorrectWordsList.innerHTML = '';
    
    // Group words by correctness
    const correctWords = [];
    const incorrectWords = [];
    
    typedWords.forEach(item => {
        if (item.isCorrect) {
            correctWords.push(item.word);
        } else {
            incorrectWords.push(item);
        }
    });
    
    // Display correct words
    if (correctWords.length > 0) {
        correctWords.forEach(word => {
            const wordElement = document.createElement('span');
            wordElement.className = 'correct-word-badge';
            wordElement.textContent = word;
            correctWordsList.appendChild(wordElement);
        });
    } else {
        correctWordsList.innerHTML = '<p>No words typed correctly</p>';
    }
    
    // Display incorrect words with what was typed
    if (incorrectWords.length > 0) {
        incorrectWords.forEach(item => {
            const wordContainer = document.createElement('div');
            wordContainer.style.marginBottom = '8px';
            
            const wordElement = document.createElement('span');
            wordElement.className = 'incorrect-word-badge';
            wordElement.textContent = item.word;
            
            const typedElement = document.createElement('span');
            typedElement.className = 'typed-word';
            typedElement.textContent = `(you typed: ${item.typedWord})`;
            
            wordContainer.appendChild(wordElement);
            wordContainer.appendChild(typedElement);
            incorrectWordsList.appendChild(wordContainer);
        });
    } else {
        incorrectWordsList.innerHTML = '<p>No words typed incorrectly</p>';
    }
}

function resetTest() {
    clearInterval(timerInterval);
    testInProgress = false;
    
    // Reset variables
    wordsCorrect = 0;
    wordsIncorrect = 0;
    wordsSubmitted = 0;
    currentWordIndex = 0;
    typedWords = [];
    
    // Reset UI
    document.getElementById('time').textContent = currentTestDuration;
    document.getElementById('userInput').value = '';
    document.getElementById('userInput').disabled = false;
    
    // Update stats and generate new test
    updateStats();
    generateTest();
}