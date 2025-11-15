// DOM Elements (only select if they exist)
const form = document.getElementById('ceo-form');
const questionInput = document.getElementById('question');
const askBtn = document.getElementById('ask-btn');
const loading = document.getElementById('loading');
const responseContainer = document.getElementById('response-container');
const responseMode = document.getElementById('response-mode');
const responseQuestion = document.getElementById('response-question');
const responseText = document.getElementById('response-text');
const modeDesc = document.getElementById('mode-desc');
const modeBtns = document.querySelectorAll('.mode-btn');

// Current mode
let currentMode = 'public';

// Mode descriptions
const modeDescriptions = {
    public: 'Public mode: Corporate PR-friendly responses',
    ceo: 'CEO mode: Direct, bottom-line focused responses',
    private: 'Private mode: Brutally honest, unfiltered responses'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Only setup mode buttons and form if they exist (index page only)
    if (modeBtns.length > 0) {
        setupModeButtons();
    }
    if (form) {
        setupForm();
    }
    // Always setup hamburger menu (exists on all pages)
    setupHamburgerMenu();
    // Setup LinkedIn panel (index page only)
    setupLinkedInPanel();
});

// Setup LinkedIn panel
function setupLinkedInPanel() {
    const toggleBtn = document.getElementById('linkedin-toggle');
    const closeBtn = document.getElementById('linkedin-close');
    const panel = document.getElementById('linkedin-panel');
    const overlay = document.getElementById('linkedin-overlay');
    
    if (toggleBtn && panel && overlay && closeBtn) {
        // Open panel
        toggleBtn.addEventListener('click', () => {
            panel.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent body scroll
        });
        
        // Close panel with close button
        closeBtn.addEventListener('click', closePanel);
        
        // Close panel with overlay click
        overlay.addEventListener('click', closePanel);
        
        function closePanel() {
            panel.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore body scroll
        }
    }
}

// Setup hamburger menu
function setupHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const menu = document.getElementById('menu');
    
    if (hamburgerBtn && menu) {
        hamburgerBtn.addEventListener('click', () => {
            menu.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburgerBtn.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
                hamburgerBtn.classList.remove('active');
            }
        });
    }
}

// Setup mode buttons
function setupModeButtons() {
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            modeBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Update current mode
            currentMode = btn.dataset.mode;
            
            // Update mode description
            modeDesc.textContent = modeDescriptions[currentMode];
        });
    });
}

// Setup form submission
function setupForm() {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const question = questionInput.value.trim();
        if (!question) return;
        
        // Show loading, hide response
        loading.classList.add('active');
        responseContainer.classList.remove('active');
        askBtn.disabled = true;
        
        try {
            const response = await askCEO(question, currentMode);
            displayResponse(question, currentMode, response);
        } catch (error) {
            displayError(error.message);
        } finally {
            loading.classList.remove('active');
            askBtn.disabled = false;
        }
    });
}

// Ask the CEO API
async function askCEO(question, mode) {
    const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question, mode })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
    }
    
    const data = await response.json();
    return data.response;
}

// Display response
function displayResponse(question, mode, response) {
    // Set mode badge
    responseMode.textContent = mode.toUpperCase();
    
    // Set question
    responseQuestion.textContent = question;
    
    // Set response text
    responseText.textContent = response;
    
    // Show response container
    responseContainer.classList.add('active');
    
    // Scroll to response
    responseContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Display error
function displayError(message) {
    responseMode.textContent = 'ERROR';
    responseMode.style.background = '#d93025';
    responseQuestion.textContent = 'Oops! Something went wrong';
    responseText.innerHTML = `<div class="error">${message}</div>`;
    responseContainer.classList.add('active');
}
