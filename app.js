// ========================================
// LUMYN BAND - CLIENT-SIDE FORM HANDLER
// ========================================

const signupForm = document.getElementById('signupForm');
const emailInput = document.getElementById('emailInput');
const formMessage = document.getElementById('formMessage');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Form submission handler
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    // Client-side validation
    if (!email) {
        showMessage('Please enter your email address', 'error');
        return;
    }
    
    if (!emailRegex.test(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Disable button during submission
    const button = signupForm.querySelector('.cta-button');
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Processing...';
    
    try {
        // Send request to backend serverless function
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('✓ Early access unlocked! Check your email.', 'success');
            emailInput.value = '';
            emailInput.blur();
            
            // Keep button disabled for 2 seconds to show success state
            setTimeout(() => {
                button.disabled = false;
                button.textContent = originalText;
            }, 2000);
        } else {
            showMessage(data.message || 'Something went wrong. Please try again.', 'error');
            button.disabled = false;
            button.textContent = originalText;
        }
    } catch (error) {
        console.error('Signup error:', error);
        showMessage('Network error. Please check your connection and try again.', 'error');
        button.disabled = false;
        button.textContent = originalText;
    }
});

// Utility function to display messages
function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = `form-message ${type}`;
    
    // Auto-clear error messages after 5 seconds
    if (type === 'error') {
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.className = 'form-message';
        }, 5000);
    }
}
