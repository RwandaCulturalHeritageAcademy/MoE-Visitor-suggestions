// Firebase Integration for Visitor Suggestions
const SuggestionManager = {
    async addSuggestion(chamber, suggestion) {
        function getDB() {
            console.debug('getDB: window._firebaseConfigLoaded=', window._firebaseConfigLoaded, 'window.db=', window.db, 'typeof firebase=', typeof firebase);
            if (typeof window !== 'undefined' && window.db) return window.db;
            try {
                if (typeof firebase !== 'undefined' && firebase.firestore) {
                    // initialize and cache
                    window.db = firebase.firestore();
                    console.debug('getDB: initialized firebase.firestore() and cached on window.db');
                    return window.db;
                }
            } catch (err) {
                console.error('getDB: error while creating firebase.firestore():', err);
            }
            return null;
        }

        const database = getDB();
        if (!database) {
            const err = new Error('Firestore not initialized');
            console.error('SuggestionManager.addSuggestion: Firestore not initialized. window._firebaseConfigLoaded=', window._firebaseConfigLoaded, 'window.db=', window.db, 'firebase=', typeof firebase !== 'undefined' ? firebase : firebase);
            throw err;
        }

        try {
            const timestamp = (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue)
                ? firebase.firestore.FieldValue.serverTimestamp()
                : new Date();

            await database.collection('suggestions').add({
                chamber: chamber,
                visitorName: suggestion.visitorName,
                email: suggestion.email,
                rating: suggestion.rating,
                suggestion: suggestion.suggestion,
                timestamp: timestamp
            });
            return true;
        } catch (error) {
            console.error('Error adding suggestion:', error);
            throw error;
        }
    }
};

// UI Manager
const UIManager = {
    chambersSection: document.querySelector('.chambers-section'),
    suggestionsSection: document.getElementById('suggestionsSection'),
    chamberTitle: document.getElementById('chamberTitle'),
    suggestionForm: document.getElementById('suggestionForm'),
    backBtn: document.getElementById('backBtn'),
    currentChamber: null,

    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Chamber card clicks
        document.querySelectorAll('.chamber-card').forEach(card => {
            card.addEventListener('click', () => {
                const chamber = card.getAttribute('data-chamber');
                this.showChamberSuggestions(chamber);
            });
        });

        // Back button
        this.backBtn.addEventListener('click', () => this.showChambers());

        // Form submission
        this.suggestionForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    },

    showChambers() {
        this.chambersSection.style.display = 'block';
        this.suggestionsSection.style.display = 'none';
        this.currentChamber = null;
    },

    showChamberSuggestions(chamber) {
        this.currentChamber = chamber;
        this.chambersSection.style.display = 'none';
        this.suggestionsSection.style.display = 'block';
        this.chamberTitle.textContent = chamber;

        // Reset form
        this.suggestionForm.reset();
        document.querySelectorAll('.rating-container input').forEach(input => {
            input.checked = false;
        });
        document.getElementById('successMessage').style.display = 'none';

        // Scroll to top of suggestions
        this.suggestionsSection.scrollIntoView({ behavior: 'smooth' });
    },

    async handleFormSubmit(e) {
        e.preventDefault();

        const visitorName = document.getElementById('visitorName').value.trim();
        const email = document.getElementById('email').value.trim();
        const rating = document.querySelector('input[name="rating"]:checked')?.value || null;
        const suggestion = document.getElementById('suggestion').value.trim();

        if (!suggestion) {
            alert('Please enter a suggestion before submitting.');
            return;
        }

        try {
            // Add suggestion to Firebase
            await SuggestionManager.addSuggestion(this.currentChamber, {
                visitorName: visitorName || 'Anonymous',
                email: email || '',
                rating: rating ? parseInt(rating) : null,
                suggestion: suggestion
            });

            // Show success message
            const successMsg = document.getElementById('successMessage');
            successMsg.style.display = 'block';

            // Reset form
            this.suggestionForm.reset();
            document.querySelectorAll('.rating-container input').forEach(input => {
                input.checked = false;
            });

            // Hide success message after 3 seconds
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 3000);

        } catch (error) {
            alert('Error submitting feedback: ' + error.message);
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});
