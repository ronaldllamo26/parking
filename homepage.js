// Show modal when admin login button is clicked
document.getElementById('adminLoginBtn').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('adminLoginModal').style.display = 'block';
});

// Close modal when X is clicked
document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('adminLoginModal').style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('adminLoginModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Form submission
document.querySelector('.login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    // Here you would normally validate and send the data to server
    // For now, we'll just log it and close the modal
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    console.log('Login attempted with:', { username, password });
    
    // Close modal (in real app, you would wait for server response first)
    document.getElementById('adminLoginModal').style.display = 'none';
    
    // Clear form
    this.reset();
});