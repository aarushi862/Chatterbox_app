# 💬 ChatterBox - Real-time Chat Application

<div align="center">

![ChatterBox Logo](https://img.shields.io/badge/ChatterBox-Real--time%20Chat-22C55E?style=for-the-badge&logo=chat&logoColor=white)

**A modern, secure, and feature-rich real-time chat application built with MERN stack**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-22C55E?style=for-the-badge)](https://chatterbox-frontend-svqb.onrender.com)
[![Backend API](https://img.shields.io/badge/Backend%20API-Active-16A34A?style=for-the-badge)](https://chatterbox-backend-4v4p.onrender.com)

</div>

---

## 🌟 Features

### 💬 **Real-time Messaging**
- Instant message delivery using Socket.io
- Live typing indicators
- Online/Offline status tracking
- Message read receipts (Blue ticks like WhatsApp)

### 🔒 **Security & Privacy**
- End-to-end encryption (AES-256-CBC)
- JWT-based authentication
- Secure password hashing with bcrypt
- Protected API routes

### 🎨 **Modern UI/UX**
- WhatsApp-inspired dark theme
- Professional gradient designs
- Smooth animations and transitions
- Responsive design (Mobile & Desktop)
- Emoji picker integration

### 👥 **User Management**
- User registration and login
- Profile avatars with initials
- Contact list management
- User search functionality

### 💬 **Chat Features**
- One-on-one private chats
- Group chat rooms
- Create and manage rooms
- Invite users to rooms
- Member count display

### ✨ **Additional Features**
- Message timestamps
- Delivered/Read status indicators
- Connection status monitoring
- Auto-reconnection on network issues
- Toast notifications for events

---

## 🚀 Live Demo

**Frontend:** [https://chatterbox-frontend-svqb.onrender.com](https://chatterbox-frontend-svqb.onrender.com)

**Backend API:** [https://chatterbox-backend-4v4p.onrender.com](https://chatterbox-backend-4v4p.onrender.com)

> **Note:** First load may take 30-50 seconds as the free tier services spin up from sleep mode.

---

## 🛠️ Tech Stack

### **Frontend**
- **React.js** - UI library
- **Vite** - Build tool and dev server
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Emoji Picker React** - Emoji support
- **React Icons** - Icon library

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Crypto** - Message encryption

### **Deployment**
- **Frontend:** Render (Static Site)
- **Backend:** Render (Web Service)
- **Database:** MongoDB Atlas (Cloud)

---

## 📋 Prerequisites

Before running this project locally, make sure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas account)
- **Git**

---

## 🔧 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/aarushi862/Chatterbox_app.git
cd Chatterbox_app
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_32_byte_hex_encryption_key
CLIENT_URL=http://localhost:5173
```

Start the backend server:

```bash
npm start
```

Backend will run on `http://localhost:5000`

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Update `frontend/src/api/axios.js` with your backend URL:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000',
});
```

Start the frontend dev server:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🏗️ Project Structure

```
Chatterbox_app/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── messageController.js  # Message handling
│   │   ├── roomController.js     # Room management
│   │   └── uploadController.js   # File uploads
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Room.js               # Room schema
│   │   ├── Message.js            # Message schema
│   │   └── Invite.js             # Invite schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── roomRoutes.js
│   │   └── inviteRoutes.js
│   ├── socket/
│   │   └── socketHandler.js      # Socket.io events
│   ├── utils/
│   │   └── encryption.js         # E2E encryption
│   ├── .env
│   ├── server.js                 # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js          # API configuration
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx    # Main chat interface
│   │   │   ├── Sidebar.jsx       # User/Room list
│   │   │   ├── MessageInput.jsx  # Message composer
│   │   │   ├── TypingIndicator.jsx
│   │   │   ├── CreateRoomModal.jsx
│   │   │   └── InviteModal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Auth state management
│   │   │   └── SocketContext.jsx # Socket connection
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   └── InvitePage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css             # Global styles
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🔐 Security Features

### **End-to-End Encryption**
- Messages are encrypted using **AES-256-CBC** algorithm
- Each message has a unique initialization vector (IV)
- Encryption key stored securely on the server
- Messages encrypted before saving to database
- Decrypted only when displaying to users

### **Authentication**
- JWT tokens with 7-day expiration
- Password hashing with bcrypt (10 salt rounds)
- Protected API routes with middleware
- Secure HTTP-only cookies (optional)

### **Data Protection**
- MongoDB connection with authentication
- Environment variables for sensitive data
- CORS configuration for allowed origins
- Input validation and sanitization

---

## 📱 Features in Detail

### **Message Read Receipts**
- ✓ Single gray tick: Message sent
- ✓✓ Double gray tick: Message delivered
- ✓✓ Double blue tick: Message read

### **Real-time Updates**
- Instant message delivery
- Live typing indicators
- Online/offline status changes
- Auto-mark messages as read

### **User Experience**
- Smooth animations and transitions
- Loading states and error handling
- Toast notifications for events
- Connection status monitoring
- Auto-reconnection on disconnect

---

## 🎨 UI/UX Design

- **Color Scheme:** Dark theme with green accents (#22C55E)
- **Typography:** Inter font family
- **Message Bubbles:** WhatsApp-style with rounded corners
- **Responsive:** Works on mobile, tablet, and desktop
- **Accessibility:** Proper contrast ratios and focus states

---

## 🚀 Deployment

### **Frontend (Render)**
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment variables: None required

### **Backend (Render)**
1. Connect GitHub repository
2. Build command: `npm install`
3. Start command: `npm start`
4. Environment variables:
   - `PORT`
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ENCRYPTION_KEY`
   - `CLIENT_URL`

### **Database (MongoDB Atlas)**
1. Create free M0 cluster
2. Create database user
3. Whitelist IP: `0.0.0.0/0` (allow from anywhere)
4. Get connection string
5. Add to backend environment variables

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Aarushi Pandey**

- GitHub: [@aarushi862](https://github.com/aarushi862)
- Email: aarushipandey1810@gmail.com

---

## 🙏 Acknowledgments

- Socket.io for real-time communication
- MongoDB for database
- Render for hosting
- React community for amazing tools
- WhatsApp for UI/UX inspiration

---

## 📞 Support

If you have any questions or need help, feel free to:

- Open an issue on GitHub
- Contact via email
- Check the live demo

---

<div align="center">

**Made with ❤️ by Aarushi Pandey**

⭐ Star this repo if you like it!

</div>
