const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Function for signing up a new user
const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "user", // Default role is user
      },
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Function for logging in an existing user
const login = async (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  try {
    console.log(`Login attempt for email: ${email}`);
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`Login failed: No user found with email ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log(`User found: ${user.name} (ID: ${user.id})`);
    
    // Compare the entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log(`Login failed: Password does not match for user ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    console.log(`Password matches for user ${email}`);
    
    // Use JWT_SECRET from environment variable or fallback to a hardcoded value
    const jwtSecret = process.env.JWT_SECRET || '8c51647b1f5fb04e8f32efe1b7093d80a86e543fce8f67174c2c8fd0c35f60fe';
    
    console.log(`Using JWT secret: ${jwtSecret.substring(0, 10)}...`);
    
    // Generate a JWT token for the user
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role.toUpperCase() // Ensure role is always uppercase in token
      }, 
      jwtSecret, 
      {
        expiresIn: "1h", // Token expires in 1 hour
      }
    );

    console.log(`Token generated for user ${email}: ${token.substring(0, 20)}...`);
    
    // Send the token to the client
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(`Login error for ${email}:`, error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { signup, login };
