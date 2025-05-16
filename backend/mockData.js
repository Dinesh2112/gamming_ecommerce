// Mock data to use when the database is unavailable
const mockProducts = [
  {
    id: 1,
    name: "NVIDIA GeForce RTX 3080",
    description: "High-end graphics card for 4K gaming and content creation",
    price: 69999,
    imageUrl: "https://placehold.co/600x400/333/FFF?text=RTX+3080",
    stock: 15,
    category: { name: "GPUs" },
    brand: "NVIDIA",
    model: "RTX 3080",
    additionalSpecs: {
      architecture: "Ampere",
      memoryType: "GDDR6X",
      cores: 8704,
      vram: 10
    },
    tags: ["RTX", "4K Gaming", "Ray Tracing", "DLSS", "VR Ready"]
  },
  {
    id: 2,
    name: "AMD Radeon RX 6800 XT",
    description: "High-performance graphics card for gaming enthusiasts",
    price: 59999,
    imageUrl: "https://placehold.co/600x400/333/FFF?text=RX+6800+XT",
    stock: 8,
    category: { name: "GPUs" },
    brand: "AMD",
    model: "RX 6800 XT",
    additionalSpecs: {
      architecture: "RDNA 2",
      memoryType: "GDDR6",
      cores: 4608,
      vram: 16
    },
    tags: ["RDNA", "4K Gaming", "Ray Tracing", "Gaming", "Content Creation"]
  },
  {
    id: 3,
    name: "Intel Core i9-12900K",
    description: "High-end desktop processor for gaming and content creation",
    price: 39999,
    imageUrl: "https://placehold.co/600x400/333/FFF?text=i9-12900K",
    stock: 12,
    category: { name: "CPUs" },
    brand: "Intel",
    model: "i9-12900K",
    additionalSpecs: {
      cores: 16,
      threads: 24,
      baseClock: "3.2 GHz",
      boostClock: "5.2 GHz",
      cacheSize: "30 MB"
    },
    tags: ["Gaming", "Content Creation", "Streaming", "Overclocking"]
  }
];

const mockUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    password: "$2a$10$HGWGMGXC6j7cMR5OvEV7JOguzjl9T0.J.g.9XR0zCpyGcMWBhLpB2", // password: admin123
    role: "ADMIN"
  },
  {
    id: 2,
    name: "Dinesh Rajan",
    email: "dineshrajan2112@gmail.com",
    password: "$2a$10$HGWGMGXC6j7cMR5OvEV7JOguzjl9T0.J.g.9XR0zCpyGcMWBhLpB2", // password: dinesh123
    role: "ADMIN"
  },
  {
    id: 3,
    name: "Test User",
    email: "user@example.com",
    password: "$2a$10$HGWGMGXC6j7cMR5OvEV7JOguzjl9T0.J.g.9XR0zCpyGcMWBhLpB2", // password: user123
    role: "USER"
  }
];

const mockOrders = [
  {
    id: 1,
    userId: 3,
    totalAmount: 129998,
    status: "DELIVERED",
    paymentStatus: "COMPLETED",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    items: [
      {
        id: 1,
        productId: 1,
        quantity: 1,
        price: 69999
      },
      {
        id: 2,
        productId: 2,
        quantity: 1,
        price: 59999
      }
    ]
  }
];

module.exports = {
  mockProducts,
  mockUsers,
  mockOrders
}; 