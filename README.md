# Gaming E-commerce Platform

A full-stack e-commerce application for gaming products with an AI shopping assistant.

## Features

- **User Authentication**: Secure login and registration
- **Product Catalog**: Browse and search gaming products by category
- **Shopping Cart**: Add, update, and remove items
- **Order Management**: View order history and status
- **Admin Dashboard**: Manage products, users, and orders
- **AI Shopping Assistant**: Get personalized recommendations and help with building gaming PCs
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

### Frontend
- React.js
- CSS3 with responsive design
- Axios for API requests
- FontAwesome for icons

### Backend
- Node.js with Express
- Prisma ORM
- JWT Authentication
- Google Generative AI integration for the AI assistant

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB or other database supported by Prisma

### Setup Steps

1. Clone the repository
   ```
   git clone https://github.com/yourusername/gamming-ecommerce.git
   cd gamming-ecommerce
   ```

2. Install backend dependencies
   ```
   npm install
   ```

3. Install frontend dependencies
   ```
   cd client
   npm install
   cd ..
   ```

4. Set up environment variables
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     DATABASE_URL="your-database-connection-string"
     JWT_SECRET="your-jwt-secret"
     GEMINI_API_KEY="your-gemini-api-key"
     ```

5. Run database migrations
   ```
   npx prisma migrate dev
   ```

6. Start the application
   ```
   # Start backend server
   npm run server
   
   # In another terminal, start the frontend
   cd client
   npm run dev
   ```

## Usage

- Access the application at `http://localhost:5173`
- Admin dashboard is available at `/admin` (requires admin privileges)
- AI Assistant is available at `/ai-assistant` (requires login)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
