// User Dashboard JavaScript

// Global variables
let selectedSpot = null;
let currentBooking = null;
let parkingHistory = [];

// Sample parking spots data (A1-A20, B1-B20)
const parkingSpots = {
    'A1': 'available', 'A2': 'occupied', 'A3': 'available', 'A4': 'available', 'A5': 'occupied',
    'A6': 'available', 'A7': 'available', 'A8': 'occupied', 'A9': 'available', 'A10': 'available',
    'A11': 'occupied', 'A12': 'available', 'A13': 'available', 'A14': 'occupied', 'A15': 'available',
    'A16': 'available', 'A17': 'occupied', 'A18': 'available', 'A19': 'available', 'A20': 'occupied',
    'B1': 'available', 'B2': 'available', 'B3': 'occupied', 'B4': 'available', 'B5': 'available',
    'B6': 'occupied', 'B7': 'available', 'B8': 'available', 'B9': 'occupied', 'B10': 'available',
    'B11': 'available', 'B12': 'occupied', 'B13': 'available', 'B14': 'available', 'B15': 'occupied',
    'B16': 'available', 'B17': 'available', 'B18': 'occupied', 'B19': 'available', 'B20': 'available'
};

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    generateParkingSpots();
    loadParkingHistory();
    loadCurrentBooking();
    setupEventListeners();
});

// Load user data from session storage
function loadUserData() {
    let userData = null;
    
    try {
        // Try to get user data from sessionStorage
        userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
    } catch (error) {
        console.log('SessionStorage not available, checking fallback');
        // Fallback: check if data exists in global variable
        if (window.tempUserData) {
            userData = window.tempUserData;
        }
    }
    
    if (userData && userData.name && userData.email) {
        // User data found, update UI
        document.getElementById('userName').textContent = userData.name;
        document.getElementById('userAvatar').textContent = userData.name.charAt(0).toUpperCase();
        
        // Store user data globally for other functions
        window.currentUser = userData;
        
        console.log('User loaded:', userData.name);
    } else {
        // No valid user data found, redirect to login
        alert('Please login first to access the dashboard.');
        window.location.href = 'userlogin.html';
    }
}

// Generate parking spots grid
function generateParkingSpots() {
    const spotsContainer = document.getElementById('parkingSpots');
    spotsContainer.innerHTML = '';
    
    Object.keys(parkingSpots).forEach(spotId => {
        const spotElement = document.createElement('div');
        spotElement.className = `spot ${parkingSpots[spotId]}`;
        spotElement.textContent = spotId;
        spotElement.onclick = () => selectSpot(spotId);
        spotsContainer.appendChild(spotElement);
    });
}

// Select parking spot
function selectSpot(spotId) {
    if (parkingSpots[spotId] === 'occupied') return;
    
    // Remove previous selection
    document.querySelectorAll('.spot').forEach(spot => {
        spot.classList.remove('selected');
    });
    
    // Add selection to clicked spot
    event.target.classList.add('selected');
    selectedSpot = spotId;
    
    // Enable book button
    document.getElementById('bookBtn').disabled = false;
}

// Book selected spot
function bookSpot() {
    if (!selectedSpot) {
        alert('Please select a parking spot first.');
        return;
    }
    
    document.getElementById('selectedSpotDisplay').textContent = selectedSpot;
    showPaymentModal();
}

// Show payment modal
function showPaymentModal() {
    document.getElementById('paymentModal').style.display = 'block';
    updatePaymentSummary();
}

// Close payment modal
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// Update payment summary
function updatePaymentSummary() {
    const duration = document.getElementById('duration').value;
    const durationText = document.getElementById('duration').selectedOptions[0].text;
    const price = durationText.split(' - ')[1];
    
    document.getElementById('durationDisplay').textContent = durationText.split(' - ')[0];
    document.getElementById('totalAmount').textContent = price;
}

// Setup event listeners
function setupEventListeners() {
    // Duration change listener
    document.getElementById('duration').addEventListener('change', updatePaymentSummary);
    
    // Payment form submission
    document.getElementById('paymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        processPayment();
    });
    
    // History filter
    document.getElementById('historyFilter').addEventListener('change', filterHistory);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('paymentModal');
        if (e.target === modal) {
            closePaymentModal();
        }
    });
}

// Process payment
function processPayment() {
    const duration = document.getElementById('duration').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    const totalAmount = document.getElementById('totalAmount').textContent;
    
    // Simulate payment processing
    const loadingBtn = document.querySelector('.pay-btn');
    const originalText = loadingBtn.textContent;
    loadingBtn.textContent = 'Processing...';
    loadingBtn.disabled = true;
    
    setTimeout(() => {
        // Create booking
        const booking = {
            id: 'BK' + Date.now(),
            spot: selectedSpot,
            duration: parseInt(duration),
            amount: totalAmount,
            paymentMethod: paymentMethod,
            startTime: new Date(),
            endTime: new Date(Date.now() + (parseInt(duration) * 60 * 60 * 1000)),
            status: 'active'
        };
        
        // Update parking spot status
        parkingSpots[selectedSpot] = 'occupied';
        
        // Set current booking
        currentBooking = booking;
        
        // Add to history
        parkingHistory.unshift(booking);
        
        // Save to storage
        saveData();
        
        // Update UI
        generateParkingSpots();
        updateCurrentBooking();
        loadParkingHistory();
        
        // Close modal
        closePaymentModal();
        
        // Reset button
        loadingBtn.textContent = originalText;
        loadingBtn.disabled = false;
        
        // Reset selection
        selectedSpot = null;
        document.getElementById('bookBtn').disabled = true;
        
        alert(`Payment successful! Your parking spot ${booking.spot} is booked for ${duration} hour(s).`);
    }, 2000);
}

// Update current booking display
function updateCurrentBooking() {
    const bookingContainer = document.getElementById('currentBooking');
    
    if (currentBooking && currentBooking.status === 'active') {
        const timeRemaining = Math.max(0, currentBooking.endTime - new Date());
        const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        
        bookingContainer.innerHTML = `
            <div class="booking-info">
                <h3>Spot ${currentBooking.spot}</h3>
                <p><strong>Duration:</strong> ${currentBooking.duration} hour(s)</p>
                <p><strong>Time Remaining:</strong> ${hoursRemaining}h ${minutesRemaining}m</p>
                <p><strong>Amount Paid:</strong> ${currentBooking.amount}</p>
                <button class="end-booking-btn" onclick="endBooking()">End Booking</button>
            </div>
        `;
        
        // Auto-refresh every minute
        if (timeRemaining > 0) {
            setTimeout(updateCurrentBooking, 60000);
        } else {
            endBooking();
        }
    } else {
        bookingContainer.innerHTML = '<p class="no-booking">No active booking</p>';
    }
}

// End current booking
function endBooking() {
    if (currentBooking) {
        // Update booking status
        currentBooking.status = 'completed';
        currentBooking.actualEndTime = new Date();
        
        // Free up the parking spot
        parkingSpots[currentBooking.spot] = 'available';
        
        // Clear current booking
        currentBooking = null;
        
        // Save and update UI
        saveData();
        generateParkingSpots();
        updateCurrentBooking();
        loadParkingHistory();
        
        alert('Booking ended successfully!');
    }
}

// Load parking history
function loadParkingHistory() {
    loadData();
    filterHistory();
}

// Filter history based on selected period
function filterHistory() {
    const filter = document.getElementById('historyFilter').value;
    const historyContainer = document.getElementById('historyList');
    
    let filteredHistory = parkingHistory;
    const now = new Date();
    
    if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredHistory = parkingHistory.filter(booking => new Date(booking.startTime) >= weekAgo);
    } else if (filter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredHistory = parkingHistory.filter(booking => new Date(booking.startTime) >= monthAgo);
    }
    
    if (filteredHistory.length === 0) {
        historyContainer.innerHTML = '<p class="no-history">No parking history found</p>';
        return;
    }
    
    historyContainer.innerHTML = filteredHistory.map(booking => `
        <div class="history-item">
            <h4>Spot ${booking.spot} - ${booking.status}</h4>
            <p><strong>Date:</strong> ${new Date(booking.startTime).toLocaleDateString()}</p>
            <p><strong>Duration:</strong> ${booking.duration} hour(s)</p>
            <p><strong>Amount:</strong> ${booking.amount}</p>
            <p><strong>Payment:</strong> ${booking.paymentMethod}</p>
        </div>
    `).join('');
}

// Quick action functions
function extendParking() {
    if (!currentBooking) {
        alert('No active booking to extend.');
        return;
    }
    
    const additionalHours = prompt('How many additional hours? (1-8)', '1');
    if (additionalHours && parseInt(additionalHours) > 0 && parseInt(additionalHours) <= 8) {
        const additionalCost = parseInt(additionalHours) * 50;
        if (confirm(`Extend parking by ${additionalHours} hour(s) for ₱${additionalCost}?`)) {
            currentBooking.duration += parseInt(additionalHours);
            currentBooking.endTime = new Date(currentBooking.endTime.getTime() + (parseInt(additionalHours) * 60 * 60 * 1000));
            currentBooking.amount = `₱${parseInt(currentBooking.amount.replace('₱', '')) + additionalCost}`;
            
            saveData();
            updateCurrentBooking();
            alert('Parking extended successfully!');
        }
    }
}

function findMySpot() {
    if (!currentBooking) {
        alert('No active booking found.');
        return;
    }
    
    alert(`Your parking spot is: ${currentBooking.spot}\nLocation: ${currentBooking.spot.startsWith('A') ? 'Section A' : 'Section B'}`);
}

function reportIssue() {
    const issue = prompt('Please describe the issue:');
    if (issue) {
        alert('Thank you for reporting the issue. Our support team will address it shortly.\n\nIssue: ' + issue);
    }
}

// Save data to storage
function saveData() {
    const data = {
        currentBooking: currentBooking,
        parkingHistory: parkingHistory,
        parkingSpots: parkingSpots
    };
    // In a real app, this would be saved to a database
    // For demo purposes, we'll use localStorage (though we should avoid this in production)
    try {
        localStorage.setItem('parkingData', JSON.stringify(data));
    } catch (e) {
        console.log('Storage not available, data will be lost on refresh');
    }
}

// Load data from storage
function loadData() {
    try {
        const savedData = localStorage.getItem('parkingData');
        if (savedData) {
            const data = JSON.parse(savedData);
            currentBooking = data.currentBooking;
            parkingHistory = data.parkingHistory || [];
            
            // Convert date strings back to Date objects
            if (currentBooking) {
                currentBooking.startTime = new Date(currentBooking.startTime);
                currentBooking.endTime = new Date(currentBooking.endTime);
                if (currentBooking.actualEndTime) {
                    currentBooking.actualEndTime = new Date(currentBooking.actualEndTime);
                }
            }
            
            parkingHistory.forEach(booking => {
                booking.startTime = new Date(booking.startTime);
                booking.endTime = new Date(booking.endTime);
                if (booking.actualEndTime) {
                    booking.actualEndTime = new Date(booking.actualEndTime);
                }
            });
        }
    } catch (e) {
        console.log('Error loading data:', e);
        // Initialize with empty data if loading fails
        currentBooking = null;
        parkingHistory = [];
    }
}

// Load current booking on page load
function loadCurrentBooking() {
    loadData();
    updateCurrentBooking();
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            // Clear session data
            sessionStorage.removeItem('userData');
            
            // Clear global variable if exists
            if (window.tempUserData) {
                delete window.tempUserData;
            }
            if (window.currentUser) {
                delete window.currentUser;
            }
            
            // Clear any parking data associated with this session
            sessionStorage.removeItem('currentBooking');
            
            alert('Logged out successfully!');
        } catch (error) {
            console.log('Error during logout:', error);
        }
        
        // Redirect to login page
        window.location.href = 'userlogin.html';
    }
}

// Auto-refresh parking spots every 30 seconds to simulate real-time updates
setInterval(() => {
    // Randomly change some spot statuses for demo purposes
    const spots = Object.keys(parkingSpots);
    const randomSpot = spots[Math.floor(Math.random() * spots.length)];
    
    // Only change available spots to occupied (simulate other users booking)
    if (parkingSpots[randomSpot] === 'available' && Math.random() < 0.1) {
        parkingSpots[randomSpot] = 'occupied';
        generateParkingSpots();
        
        // If the changed spot was selected, deselect it
        if (selectedSpot === randomSpot) {
            selectedSpot = null;
            document.getElementById('bookBtn').disabled = true;
        }
    }
}, 30000);

// Initialize sample parking history for demo
function initializeSampleHistory() {
    if (parkingHistory.length === 0) {
        const sampleHistory = [
            {
                id: 'BK001',
                spot: 'A5',
                duration: 2,
                amount: '₱90',
                paymentMethod: 'gcash',
                startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
                status: 'completed'
            },
            {
                id: 'BK002',
                spot: 'B12',
                duration: 4,
                amount: '₱160',
                paymentMethod: 'maya',
                startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
                endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
                status: 'completed'
            },
            {
                id: 'BK003',
                spot: 'A18',
                duration: 1,
                amount: '₱50',
                paymentMethod: 'card',
                startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
                endTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
                status: 'completed'
            }
        ];
        
        parkingHistory = sampleHistory;
        saveData();
    }
}

// Call this when the page loads to add sample data
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeSampleHistory, 1000);
});