
const API_BASE_URL = 'http://localhost:8080/api';

// Global variables 
let currentUser = null;
let currentToken = null;
let selectedUser = null;
let wsConnection = null;
let users = [];

// DOM elements
const authPage = document.getElementById('authPage');
const chatApp = document.getElementById('chatApp');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const authMessage = document.getElementById('authMessage');
const logoutBtn = document.getElementById('logoutBtn');
const usersList = document.getElementById('usersList');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const currentChatName = document.getElementById('currentChatName');
const currentChatStatus = document.getElementById('currentChatStatus');
const currentChatAvatar = document.getElementById('currentChatAvatar');
const currentUserName = document.getElementById('currentUserName');
const userSearch = document.getElementById('userSearch');

// Initializing application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

// event listeners
function setupEventListeners() {
    // Authentication form events
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    signupTab.addEventListener('click', () => switchAuthTab('signup'));
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    // Chat application events
    logoutBtn.addEventListener('click', handleLogout);
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // User search
    userSearch.addEventListener('input', filterUsers);
}

// Initialize the application
function initializeApp() {
    // Check if user is already logged in (token in localStorage)
    const savedToken = localStorage.getItem('chatToken');
    const savedUser = localStorage.getItem('chatUser');
    
    if (savedToken && savedUser) {
        currentToken = savedToken;
        currentUser = JSON.parse(savedUser);
        startChatApplication();
    } else {
        showAuthPage();
    }
}

// Switch between login and signup tabs
function switchAuthTab(tab) {
    // Update active tab
    loginTab.classList.toggle('active', tab === 'login');
    signupTab.classList.toggle('active', tab === 'signup');
    
    // Show corresponding form
    loginForm.classList.toggle('active', tab === 'login');
    signupForm.classList.toggle('active', tab === 'signup');
    
    // Clear any existing messages
    clearAuthMessage();
}


function clearAuthMessage() {
    authMessage.textContent = '';
    authMessage.className = 'auth-message';
}


function showAuthPage() {
    authPage.style.display = 'flex';
    chatApp.style.display = 'none';
    clearAuthMessage();
}


function showChatApp() {
    authPage.style.display = 'none';
    chatApp.style.display = 'flex';
}

// Handle user login
async function handleLogin(event) {
    event.preventDefault();
    
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
   
    if (!username || !password) {
        showAuthMessage('Please enter both username and password', 'error');
        return;
    }
    
    try {
        
        showAuthMessage('Logging in...', '');
        
        // login API call
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        if (!response.ok) {
            throw new Error('Login failed - please check your credentials');
        }
        //get jwt token
        const token = await response.text();
        
        currentToken = token;
        currentUser = { username: username };
        
        // Save to localStorage 
        localStorage.setItem('chatToken', token);
        localStorage.setItem('chatUser', JSON.stringify(currentUser));
        
        
        startChatApplication();
        
    } catch (error) {
        console.error('Login error:', error);
        showAuthMessage(error.message, 'error');
    }
}


async function handleSignup(event) {
    event.preventDefault();
    
    // form values
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
 
    if (!username || !password) {
        showAuthMessage('Please enter both username and password', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAuthMessage('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        
        showAuthMessage('Creating your account...', '');
        
        // signup API call
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
       
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Signup failed');
        }
        
        
        const token = await response.text();
        
       
        currentToken = token;
        currentUser = { username: username };
        
       
        localStorage.setItem('chatToken', token);
        localStorage.setItem('chatUser', JSON.stringify(currentUser));
        
        
        startChatApplication();
        
    } catch (error) {
        console.error('Signup error:', error);
        showAuthMessage(error.message, 'error');
    }
}


function showAuthMessage(message, type) {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
}


function startChatApplication() {
    // Update UI
    showChatApp();
    currentUserName.textContent = currentUser.username;
    
    loadUsers();
    setupWebSocket();
}

// Load all users from the server
async function loadUsers() {
    try {
        usersList.innerHTML = '<div class="loading">Loading users...</div>';
        
        // Call users API with authentication token
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load users');
        }
        
        // Parsing response data
        users = await response.json();
        
        // Removing current user from data
        const otherUsers = users.filter(user => user.username !== currentUser.username);
        
        // Render users in the sidebar
        renderUsers(otherUsers);
        
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = '<div class="loading">Error loading users</div>';
    }
}

function renderUsers(users) {
    if (users.length === 0) {
        usersList.innerHTML = '<div class="loading">No other users found</div>';
        return;
    }
    
    usersList.innerHTML = '';
    
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.dataset.userId = user.id;
        userElement.dataset.username = user.username;
        
        userElement.innerHTML = `
            <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
            <div class="user-details">
                <div class="user-name">${user.username}</div>
                <div class="user-status">
                    <span class="status-indicator ${user.online ? 'status-online' : 'status-offline'}"></span>
                    ${user.online ? 'Online' : 'Offline'}
                </div>
            </div>
        `;
        
        // Add click event to select user
        userElement.addEventListener('click', () => selectUser(user));
        usersList.appendChild(userElement);
    });
}

// Filter users based on search input
function filterUsers() {
    const searchTerm = userSearch.value.toLowerCase();
    const userItems = usersList.querySelectorAll('.user-item');
    
    userItems.forEach(item => {
        const userName = item.dataset.username.toLowerCase();
        if (userName.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Select a user to chat with
function selectUser(user) {
    // Remove active class from all users
    document.querySelectorAll('.user-item').forEach(el => {
        el.classList.remove('active');
    });
    
    // Add active class to selected user
    const userElement = document.querySelector(`[data-user-id="${user.id}"]`);
    if (userElement) {
        userElement.classList.add('active');
    }
    
    // Set selected user
    selectedUser = user;
    
    // Update chat header
    currentChatName.textContent = user.username;
    currentChatAvatar.textContent = user.username.charAt(0).toUpperCase();
    currentChatStatus.textContent = user.online ? 'Online' : 'Offline';
    
    // Enable message input
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
    
    // Load messages with this user
    loadMessages(user.id);
}

async function loadMessages(otherUserId) {
    try {
        messagesContainer.innerHTML = '<div class="loading">Loading messages...</div>';
        
        // Call messages API
        const response = await fetch(
            `${API_BASE_URL}/chat/messages?user1=${currentUser.username}&user2=${selectedUser.username}`, 
            {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error('Failed to load messages');
        }
        
        // Parse response data
        const messages = await response.json();
        
        // Render messages in the chat area
        renderMessages(messages);
        
    } catch (error) {
        console.error('Error loading messages:', error);
        messagesContainer.innerHTML = '<div class="loading">Error loading messages</div>';
    }
}


function renderMessages(messages) {
    messagesContainer.innerHTML = '';
    
    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
        return;
    }
    
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        const isSent = message.senderId === currentUser.username;
        
        messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
        messageElement.innerHTML = `
            <div class="message-content">${message.content}</div>
            <div class="message-time">${formatTime(message.timestamp)}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
    });
    
    // Scroll to the bottom of the messages
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

//timestamp 
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


async function sendMessage() {
    const content = messageInput.value.trim();
   
    if (!content || !selectedUser) {
        return;
    }
    
    try {
        
        sendButton.disabled = true;
        
        // Send message by API
        const response = await fetch(
            `${API_BASE_URL}/chat/send?senderId=${currentUser.username}&receiverId=${selectedUser.username}&content=${encodeURIComponent(content)}`, 
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            }
        );
        
        
        if (!response.ok) {
            throw new Error('Failed to send message');
        }
        
        // Clear input field
        messageInput.value = '';
        
        // Reload messages to show the new one
        loadMessages(selectedUser.id);
        
        // sending via WebSocket for real-time delivery
        if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
            const wsMessage = {
                from: currentUser.username,
                to: selectedUser.username,
                content: content
            };
            
            wsConnection.send(JSON.stringify(wsMessage));
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    } finally {
        
        sendButton.disabled = false;
    }
}

// WebSocket connection 
function setupWebSocket() {
    try {
        // Create WebSocket connection with username as query parameter
        const wsUrl = `ws://localhost:8080/ws/chat?username=${currentUser.username}`;
        wsConnection = new WebSocket(wsUrl);
        
        // Handle connection open
        wsConnection.onopen = function() {
            console.log('WebSocket connection established');
        };
        
        // Handle incoming messages
        wsConnection.onmessage = function(event) {
            const message = JSON.parse(event.data);
            
            // If the message is for the currently selected user, update the UI
            if (selectedUser && message.from === selectedUser.username) {
                // Create and add the message to the chat
                const messageElement = document.createElement('div');
                messageElement.className = 'message received';
                messageElement.innerHTML = `
                    <div class="message-content">${message.content}</div>
                    <div class="message-time">Just now</div>
                `;
                
                messagesContainer.appendChild(messageElement);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        };
        
        // connection errors
        wsConnection.onerror = function(error) {
            console.error('WebSocket error:', error);
        };
        
        // connection close
        wsConnection.onclose = function() {
            console.log('WebSocket connection closed');
            // Try to reconnect after 5 seconds
            setTimeout(setupWebSocket, 5000);
        };
        
    } catch (error) {
        console.error('Error setting up WebSocket:', error);
    }
}

// user logout
function handleLogout() {
    // Close WebSocket connection
    if (wsConnection) {
        wsConnection.close();
    }
    
    // Clear stored data
    localStorage.removeItem('chatToken');
    localStorage.removeItem('chatUser');
    
    // Reset application state
    currentUser = null;
    currentToken = null;
    selectedUser = null;
    users = [];
    
    // Show authentication page
    showAuthPage();
    
    // Clear forms
    loginForm.reset();
    signupForm.reset();
    switchAuthTab('login');
}