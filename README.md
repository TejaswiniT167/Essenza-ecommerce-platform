# Essenza e-commerce platform

Essenza is a Full stack application for a comprehensive e-commerce platform developed using the MERN stack (MongoDB, Express.js, React.js, Node.js) and styled with TailwindCSS. It offers a seamless online shopping experience with features like user authentication, product management, shopping cart functionality, secure payment processing, and analytics.

## Technologies Used

- **Frontend:** React.js, TailwindCSS, Zustand
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Caching:** Redis
- **Payment Gateway:** Stripe
- **Media Management:** Cloudinary

## Features

1. **User Authentication and Authorization**
   - Implemented secure user registration and login using JWT (JSON Web Token).
   - Access and refresh tokens are generated to manage user sessions, with refresh tokens securely stored in Redis for fast and efficient session management.
   - User passwords are securely hashed using bcryptjs before being stored in the database, ensuring strong protection against unauthorized access and safeguarding user data.
   - Middleware ensures that sensitive routes are protected and accessible only to authorized users.


2. **Product Management**
   - Comprehensive product catalog enabling admin with CRUD operations to add, update, delete, and display products.
   - Categorized products allow users to browse by category, with featured products cached in Redis for faster retrieval and enhanced user experience.

3. **Shopping Cart and Order Processing**
   - Users can add, update, and remove items from their cart dynamically.
   - The cart system integrates seamlessly with the order summary, coupon application and checkout process, ensuring a smooth user journey.
   - Cart states are stored efficiently, enabling users to resume shopping without losing progress.

4. **Coupon and Discount Management**
   - A flexible coupon system allows admins to create and manage discount codes.
   - Users can apply these coupons at checkout, with validation to ensure usage criteria are met.

5. **Secure Payment Integration**
   - Integrated with Stripe for secure and reliable payment processing.
   - Supports multiple payment methods (currently using card option), ensuring users can complete transactions effortlessly.

6. **Real-Time Analytics**
   - Admins have access to an analytics dashboard that tracks user activity, sales performance, and product trends.
   - Data is aggregated and displayed in an actionable format, aiding in informed decision-making.

7. **Optimized Performance with Redis**
   - Redis is used as an in-memory data store for caching frequently accessed data, such as featured products and user sessions.
   - JWT refresh tokens are stored in Redis to enable fast and secure session validation, reducing database load and improving scalability.

8. **Cloudinary Integration for Media Management**
   - Product images are uploaded and managed via Cloudinary, ensuring fast delivery and optimized image quality.
   - This integration minimizes storage and bandwidth concerns while maintaining high performance.

9. **Responsive and Modern UI**
   - The frontend, built with React.js and styled using TailwindCSS, provides a responsive, modern interface.
   - Users enjoy an intuitive design, making it easy to browse, search, and purchase products across devices.

10. **Robust State Management**
    - Zustand is used for global state management, ensuring efficient handling of application states like user data, cart contents, and product listings.
    - State persistence allows users to experience a smooth interaction with the platform.


## Project Structure


### Backend

- **server.js:** Sets up the Express server, configures middleware, and defines API routes.
- **controllers:** Contains business logic for various functionalities utilized by different endpoint services.
- **routes:** Defines API endpoints and associates them with corresponding controller functions.
- **middleware:** Contains middleware functions to protect routes and ensure only authenticated users can access certain endpoints.
- **models:** Defines Mongoose schemas and models for data entities.
- **lib:** Contains configuration files for third-party services.

### Frontend

- **components:** Reusable UI components such as `NavBar`, `ProductCard`, `CartItem`, and `AnalyticsTab`.
- **pages:** React components representing different pages of the application.
- **stores:** Utilizes Zustand for state management.
- **lib:** Configures Axios for API requests to the backend.

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/TejaswiniT167/Essenza-ecommerce-platform.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd Essenza-ecommerce-platform
   ```

3. **Install dependencies:**

    ```
    npm install
    ```

4. **Set up environment variables:**

Create a .env file in the root directory and add the following variables, replace the values with actual credentials:

```
PORT=5000
MONGO_URI=your_mongo_uri
UPSTASH_REDIS_URL=your_redis_url
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development

```

5. **Build the application:**

```
npm run build
```

6. **Start the application:**

```
npm start
```

7. **Access the application:** Open your browser and navigate to http://localhost:5000.