// Data Management
const SuggestionManager = {
    STORAGE_KEY: 'museum_suggestions',

    getAllSuggestions() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    },

    getSuggestions(chamber) {
        const allData = this.getAllSuggestions();
        return allData[chamber] || [];
    },

    addSuggestion(chamber, suggestion) {
        const allData = this.getAllSuggestions();
        if (!allData[chamber]) {
            allData[chamber] = [];
        }
        allData[chamber].push({
            ...suggestion,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allData));
    },

    clearChamber(chamber) {
        const allData = this.getAllSuggestions();
        delete allData[chamber];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allData));
    },

    deleteSuggestion(chamber, index) {
        const allData = this.getAllSuggestions();
        if (allData[chamber]) {
            allData[chamber].splice(index, 1);
            if (allData[chamber].length === 0) {
                delete allData[chamber];
            }
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allData));
        }
    },

    moveSuggestion(fromChamber, index, toChamber) {
        const allData = this.getAllSuggestions();
        if (allData[fromChamber] && allData[fromChamber][index]) {
            const suggestion = allData[fromChamber][index];
            
            // Remove from current chamber
            allData[fromChamber].splice(index, 1);
            if (allData[fromChamber].length === 0) {
                delete allData[fromChamber];
            }
            
            // Add to new chamber
            if (!allData[toChamber]) {
                allData[toChamber] = [];
            }
            allData[toChamber].push(suggestion);
            
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allData));
        }
    }
};

// UI Manager
const UIManager = {
    chambersSection: document.querySelector('.chambers-section'),
    suggestionsSection: document.getElementById('suggestionsSection'),
    chamberTitle: document.getElementById('chamberTitle'),
    commentsList: document.getElementById('commentsList'),
    suggestionForm: document.getElementById('suggestionForm'),
    backBtn: document.getElementById('backBtn'),
    chambersSelector: document.getElementById('chambersSelector'),
    targetChamber: document.getElementById('targetChamber'),
    confirmMoveBtn: document.getElementById('confirmMoveBtn'),
    cancelMoveBtn: document.getElementById('cancelMoveBtn'),
    currentChamber: null,
    pendingMoveIndex: null,

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

        // Event delegation for delete and move buttons on comments
        this.commentsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const index = parseInt(e.target.dataset.index);
                this.deleteSuggestion(index);
            } else if (e.target.classList.contains('move-btn')) {
                const index = parseInt(e.target.dataset.index);
                this.showMoveDialog(index);
            } else if (e.target.classList.contains('confirm-move-btn')) {
                const index = parseInt(e.target.dataset.index);
                this.confirmMove(index);
            } else if (e.target.classList.contains('cancel-move-btn')) {
                const index = parseInt(e.target.dataset.index);
                this.cancelMove(index);
            }
        });
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

        // Load and display comments
        this.displayComments(chamber);

        // Scroll to top of suggestions
        this.suggestionsSection.scrollIntoView({ behavior: 'smooth' });
    },

    displayComments(chamber) {
        const suggestions = SuggestionManager.getSuggestions(chamber);
        
        if (suggestions.length === 0) {
            this.commentsList.innerHTML = '<p class="no-comments">No suggestions yet. Be the first to share!</p>';
            return;
        }

        this.commentsList.innerHTML = suggestions
            .reverse()
            .map((suggestion, index) => this.createCommentHTML(suggestion, index))
            .join('');
    },

    createCommentHTML(suggestion, index) {
        const date = new Date(suggestion.timestamp);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const nameDisplay = suggestion.visitorName || 'Anonymous';
        const ratingDisplay = suggestion.rating 
            ? `${'★'.repeat(suggestion.rating)}${'☆'.repeat(5 - suggestion.rating)}`
            : 'Not rated';

        return `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-name">${this.escapeHTML(nameDisplay)}</span>
                    <span class="comment-rating">${ratingDisplay}</span>
                </div>
                <p class="comment-text">${this.escapeHTML(suggestion.suggestion)}</p>
                <p class="comment-date">${formattedDate}</p>
                <div class="comment-actions">
                    <button type="button" class="action-btn move-btn" data-index="${index}">Move to Another Chamber</button>
                    <button type="button" class="action-btn delete-btn" data-index="${index}">Delete</button>
                </div>
                <div class="chambers-selector" style="display: none;" data-index="${index}">
                    <label>Move to chamber:</label>
                    <select class="target-chamber-select">
                        <option value="">Select a chamber...</option>
                        <option value="Solar System">Solar System</option>
                        <option value="Rwanda Profile">Rwanda Profile</option>
                        <option value="Energy">Energy</option>
                        <option value="Pollution">Pollution</option>
                        <option value="Human-Environment Relationship">Human-Environment Relationship</option>
                        <option value="Environmental Protection Strategies">Environmental Protection Strategies</option>
                        <option value="Natural Resources">Natural Resources</option>
                        <option value="Medicinal Plants">Medicinal Plants' Botanical Garden</option>
                        <option value="East-African Black-Mud Turtles">East-African Black-Mud Turtles</option>
                    </select>
                    <button type="button" class="action-btn confirm-move-btn" data-index="${index}">Confirm</button>
                    <button type="button" class="action-btn cancel-move-btn" data-index="${index}">Cancel</button>
                </div>
            </div>
        `;
    },

    handleFormSubmit(e) {
        e.preventDefault();

        const visitorName = document.getElementById('visitorName').value.trim();
        const email = document.getElementById('email').value.trim();
        const rating = document.querySelector('input[name="rating"]:checked')?.value || null;
        const suggestion = document.getElementById('suggestion').value.trim();

        if (!suggestion) {
            alert('Please enter a suggestion before submitting.');
            return;
        }

        // Add suggestion to storage
        SuggestionManager.addSuggestion(this.currentChamber, {
            visitorName: visitorName || 'Anonymous',
            email: email || '',
            rating: rating ? parseInt(rating) : null,
            suggestion: suggestion
        });

        // Show success message
        alert('Thank you for your suggestion! Your feedback has been recorded.');

        // Refresh comments display
        this.displayComments(this.currentChamber);

        // Reset form
        this.suggestionForm.reset();
        document.querySelectorAll('.rating-container input').forEach(input => {
            input.checked = false;
        });
    },

    escapeHTML(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },

    deleteSuggestion(index) {
        if (confirm('Are you sure you want to delete this suggestion?')) {
            const suggestions = SuggestionManager.getSuggestions(this.currentChamber);
            const reversedIndex = suggestions.length - 1 - index;
            SuggestionManager.deleteSuggestion(this.currentChamber, reversedIndex);
            this.displayComments(this.currentChamber);
        }
    },

    showMoveDialog(index) {
        const selector = document.querySelector(`.chambers-selector[data-index="${index}"]`);
        if (selector) {
            selector.style.display = 'block';
            selector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    },

    confirmMove(index) {
        const selector = document.querySelector(`.chambers-selector[data-index="${index}"]`);
        const targetSelect = selector.querySelector('.target-chamber-select');
        const toChamber = targetSelect.value;

        if (!toChamber) {
            alert('Please select a chamber to move this suggestion to.');
            return;
        }

        if (toChamber === this.currentChamber) {
            alert('Please select a different chamber.');
            return;
        }

        const suggestions = SuggestionManager.getSuggestions(this.currentChamber);
        const reversedIndex = suggestions.length - 1 - index;
        
        SuggestionManager.moveSuggestion(this.currentChamber, reversedIndex, toChamber);
        this.displayComments(this.currentChamber);
        alert(`Suggestion moved to "${toChamber}" successfully!`);
    },

    cancelMove(index) {
        const selector = document.querySelector(`.chambers-selector[data-index="${index}"]`);
        if (selector) {
            selector.style.display = 'none';
            const targetSelect = selector.querySelector('.target-chamber-select');
            targetSelect.value = '';
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});
