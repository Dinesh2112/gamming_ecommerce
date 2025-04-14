import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { Navigate } from 'react-router-dom';
import './ProductManagement.css';

// Mock product data
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Gaming Laptop XR5000',
    price: 1299.99,
    description: 'High-performance gaming laptop with RTX 3080, 32GB RAM, and 1TB SSD.',
    imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1168&q=80',
    category: 'Laptops',
    stock: 15,
    specifications: {
      processor: 'Intel Core i9-12900H',
      graphics: 'NVIDIA GeForce RTX 3080',
      memory: '32GB DDR5',
      storage: '1TB NVMe SSD',
      display: '15.6" 4K OLED, 144Hz',
      operatingSystem: 'Windows 11 Pro'
    },
    features: ['RGB Keyboard', 'Thunderbolt 4', 'Wi-Fi 6E', 'Liquid Cooling'],
    compatibleWith: ['Most AAA Games', 'VR Headsets', 'External GPUs'],
    idealFor: ['Hardcore Gaming', 'Video Editing', '3D Rendering', 'Streaming']
  },
  {
    id: '2',
    name: 'Mechanical Gaming Keyboard',
    price: 149.99,
    description: 'RGB mechanical keyboard with custom switches for the ultimate gaming experience.',
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1176&q=80',
    category: 'Keyboards',
    stock: 42,
    specifications: {
      switchType: 'Cherry MX Red',
      connectionType: 'USB-C, Wireless',
      layout: 'Full-size, QWERTY',
      backlighting: 'RGB with 16.8 million colors',
      macroKeys: '6 programmable keys',
      mediaControls: 'Dedicated media controls',
      wristRest: 'Detachable magnetic wrist rest',
      antiGhosting: 'Full N-key rollover',
      keycapMaterial: 'Double-shot PBT'
    },
    features: ['Customizable RGB', 'Macro Keys', 'Wrist Rest', 'Anti-ghosting'],
    compatibleWith: ['Windows', 'Mac', 'Linux', 'PS5', 'Xbox Series X'],
    idealFor: ['Competitive Gaming', 'Programmers', 'Office Work', 'Multi-device Users']
  },
  {
    id: '3',
    name: 'Ultra-wide Gaming Monitor',
    price: 499.99,
    description: '34-inch curved ultra-wide monitor with 144Hz refresh rate and 1ms response time.',
    imageUrl: 'https://images.unsplash.com/photo-1616711906332-ec2e698b2663?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    category: 'Monitors',
    stock: 8,
    specifications: {
      panelType: 'IPS',
      resolution: '3440 x 1440 (UWQHD)',
      refreshRate: '144Hz',
      responseTime: '1ms GtG',
      aspectRatio: '21:9',
      screenSize: '34 inches',
      connectivity: 'HDMI 2.1, DisplayPort 1.4, USB-C',
      hdrSupport: 'HDR600',
      adaptiveSync: 'G-Sync Compatible'
    },
    features: ['G-Sync Compatible', 'HDR600', 'Picture-in-Picture', 'Blue Light Filter'],
    compatibleWith: ['Gaming PCs', 'PS5', 'Xbox Series X', 'MacBooks', 'Laptops with USB-C'],
    idealFor: ['Immersive Gaming', 'Content Creation', 'Multitasking', 'Productivity']
  },
  {
    id: '4',
    name: 'Pro Gaming Headset X7',
    price: 129.99,
    description: 'Premium gaming headset with 7.1 surround sound, noise-canceling microphone, and memory foam ear cushions for extended comfort during marathon gaming sessions.',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80',
    category: 'Headsets',
    stock: 25,
    specifications: {
      audioType: '7.1 Virtual Surround Sound',
      connectionType: 'USB / 3.5mm combo',
      microphoneType: 'Detachable Noise-Canceling',
      soundQuality: '20Hz-20kHz',
      impedance: '32 Ohm',
      frequencyResponse: '20Hz - 20kHz',
      noiseCancellation: 'Passive noise isolation',
      surroundSound: 'Virtual 7.1',
      weight: '320g'
    },
    features: ['7.1 Surround Sound', 'RGB Lighting', 'Memory Foam Ear Cushions', 'Detachable Microphone', 'On-ear Controls'],
    compatibleWith: ['PC', 'PS5', 'Xbox Series X/S', 'Nintendo Switch', 'Mobile'],
    idealFor: ['Competitive Gaming', 'Team Communication', 'Music Listening', 'Discord Calls']
  },
  {
    id: '5',
    name: 'NextGen Gaming Console',
    price: 499.99,
    description: 'Experience the future of gaming with stunning 4K graphics, raytracing support, and lightning-fast load times. Includes one wireless controller and a digital game.',
    imageUrl: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1627&q=80',
    category: 'Consoles',
    stock: 7,
    specifications: {
      generation: '9th Generation',
      storage: '1TB Custom NVMe SSD',
      resolution: 'Up to 4K at 120Hz',
      processor: 'Custom 8-core Zen 2',
      graphicsProcessor: 'Custom RDNA 2, 12 TFLOPs',
      connectivity: 'HDMI 2.1, 3x USB 3.1, Ethernet, Wi-Fi 6',
      includesController: 'Yes, 1 wireless controller',
      dimensions: '30cm x 15cm x 24cm',
      exclusiveFeatures: 'Ray tracing, Quick Resume, Smart Delivery'
    },
    features: ['4K Gaming', 'Ray Tracing', 'Quick Resume', '120Hz Support', 'Backward Compatibility'],
    compatibleWith: ['4K TVs', 'Gaming Headsets', 'External SSDs', 'Gaming Chairs'],
    idealFor: ['Console Gamers', 'Family Entertainment', 'Media Streaming', 'Digital Game Library']
  },
  {
    id: '6',
    name: 'Pro Wireless Gaming Mouse',
    price: 79.99,
    description: 'Ultra-responsive wireless gaming mouse with 25,000 DPI sensor, 100-hour battery life, and customizable weight system for the perfect gaming experience.',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1165&q=80',
    category: 'Mice',
    stock: 32,
    specifications: {
      sensor: 'Hero 25K',
      dpi: '100-25,000 adjustable',
      buttons: '8 programmable buttons',
      connectionType: 'Wireless (2.4GHz) / Bluetooth / USB-C',
      ergonomics: 'Right-handed',
      weight: '63g (adjustable +20g)',
      lighting: 'RGB with 2 zones',
      pollRate: '1000Hz / 1ms',
      batteryLife: 'Up to 100 hours'
    },
    features: ['Zero Latency Connection', 'Adjustable Weight System', 'On-board Memory Profiles', 'RGB Lighting', 'Button Tensioning System'],
    compatibleWith: ['Windows', 'macOS', 'Linux'],
    idealFor: ['FPS Gaming', 'MOBA Gaming', 'Precision Work', 'Portable Gaming Setups']
  },
  {
    id: '7',
    name: 'Premium Gaming Chair',
    price: 329.99,
    description: 'Ergonomic gaming chair with 4D armrests, multi-tilt mechanism, and premium PU leather. Designed for comfort during long gaming sessions with lumbar and neck support.',
    imageUrl: 'https://images.unsplash.com/photo-1666041866460-c9c55d8549c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1153&q=80',
    category: 'Chairs',
    stock: 12,
    specifications: {
      material: 'Premium PU Leather',
      maxWeight: '150kg / 330lbs',
      recline: '90°-165° adjustable',
      armrests: '4D Adjustable',
      heightAdjustment: 'Class 4 Gas Lift',
      lumbarSupport: 'Adjustable lumbar pillow',
      headrest: 'Memory foam neck pillow',
      wheelType: '60mm PU Casters',
      dimensions: '50cm x 55cm x 130cm'
    },
    features: ['4D Armrests', 'Full Recline', 'Memory Foam Padding', 'Cold-Cure Foam', 'Steel Frame', 'Breathable Material'],
    compatibleWith: ['Standard gaming desks', 'Office environments', 'Streaming setups'],
    idealFor: ['Long Gaming Sessions', 'Streamers', 'Office Work', 'Back Pain Relief']
  },
  {
    id: '8',
    name: 'VR Headset Pro X',
    price: 399.99,
    description: 'Immersive virtual reality headset with 4K per-eye resolution, 120Hz refresh rate, and precise motion tracking. Includes two controllers and built-in spatial audio.',
    imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    category: 'VR',
    stock: 9,
    specifications: {
      displayType: 'LCD',
      resolution: '2160 x 2160 per eye',
      refreshRate: '120Hz',
      fieldOfView: '110 degrees',
      tracking: '6DoF inside-out tracking',
      connectivity: 'USB-C, DisplayPort 1.4, Wireless (optional)',
      platform: 'PC VR / Standalone',
      controllers: 'Two motion controllers included',
      sensors: 'Accelerometer, gyroscope, magnetometer, proximity'
    },
    features: ['Wireless Capability', 'Hand Tracking', 'Passthrough Camera', 'Built-in Audio', 'Adjustable IPD', 'Comfort Padding'],
    compatibleWith: ['SteamVR', 'Major VR Platforms', 'Gaming PCs', 'Select Smartphones'],
    idealFor: ['VR Gaming', 'Virtual Workspaces', 'Social VR', 'Fitness', 'VR Development']
  },
  {
    id: '9',
    name: 'Streaming Microphone Kit',
    price: 149.99,
    description: 'Professional streaming microphone with shock mount, pop filter, and adjustable arm stand. Perfect for streamers, podcasters, and content creators demanding studio-quality audio.',
    imageUrl: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    category: 'StreamingGear',
    stock: 18,
    specifications: {
      type: 'Condenser microphone',
      resolution: '24-bit/96kHz',
      frameRate: 'N/A',
      connectivity: 'USB-C, 3.5mm monitoring',
      microphoneType: 'Cardioid, Omnidirectional, Bidirectional, Stereo',
      lighting: 'RGB indicators',
      mountType: 'Shock mount with boom arm',
      softwareSupport: 'Custom mixing software included'
    },
    features: ['4 Pickup Patterns', 'Zero-Latency Monitoring', 'Mute Button', 'Gain Control', 'Studio Quality Sound', 'Plug & Play'],
    compatibleWith: ['Windows', 'macOS', 'OBS', 'Streamlabs', 'Discord', 'Zoom'],
    idealFor: ['Streaming', 'Podcasting', 'Voice-overs', 'Music Recording', 'Discord Calls']
  },
  {
    id: '10',
    name: 'Premium Graphics Card RTX 4090',
    price: 1599.99,
    description: 'Ultra high-performance graphics card featuring the latest ray tracing technology, DLSS 3.0, and massive VRAM for the most demanding games and applications.',
    imageUrl: 'https://images.unsplash.com/photo-1555618254-5066abf12fad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    category: 'GPUs',
    stock: 5,
    specifications: {
      chipset: 'NVIDIA GeForce RTX 4090',
      memory: '24GB GDDR6X',
      memoryType: 'GDDR6X',
      baseClockSpeed: '2.2 GHz',
      boostClockSpeed: '2.5 GHz',
      outputs: '3x DisplayPort 1.4a, 1x HDMI 2.1',
      powerConsumption: '450W TDP',
      cooling: 'Triple fan design',
      length: '336mm'
    },
    features: ['Ray Tracing Cores', 'Tensor Cores', 'DLSS 3.0', 'PCIe 4.0', 'RGB Lighting', 'Metal Backplate'],
    compatibleWith: ['PCIe 4.0 Motherboards', 'Well-ventilated cases', '850W+ PSUs'],
    idealFor: ['4K Gaming', '8K Video Editing', 'AI Development', 'VR Gaming', '3D Rendering']
  }
];

const ProductManagement = () => {
  const { user } = useContext(UserContext);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    category: '',
    stock: '',
    specifications: {
      // Generic specs that will be filled based on category selection
    },
    features: [],
    compatibleWith: [],
    idealFor: []
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [mockProductsState, setMockProductsState] = useState([...MOCK_PRODUCTS]);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if backend server is running first
        const response = await fetch('/api/products', {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          },
          // Set a timeout to prevent hanging requests
          signal: AbortSignal.timeout(5000)
        });
        
        // Check content type for proper error handling
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // We can safely parse JSON
          const data = await response.json();
          
          if (response.ok) {
            console.log('Successfully fetched products from API:', data.length);
            setProducts(data);
            setApiAvailable(true);
            return; // Exit early on success
          } else {
            throw new Error(data.message || 'Failed to fetch products');
          }
        } else {
          // Not JSON response, API might be unavailable
          throw new Error('Backend API returned non-JSON response');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(`${error.message}. Using mock data instead.`);
        // Fall back to mock data
        fallbackToMockData();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback to using mock data
  const fallbackToMockData = () => {
    console.log('Using mock product data');
    setApiAvailable(false);
    setProducts(mockProductsState);
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchProducts();
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: value
    });
  };

  // Handle category change to update specification fields
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setCurrentProduct({
      ...currentProduct,
      category,
      specifications: getSpecificationFields(category)
    });
  };

  // Handle specification change
  const handleSpecificationChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      specifications: {
        ...currentProduct.specifications,
        [name]: value
      }
    });
  };

  // Handle comma-separated list inputs (features, compatibility, ideal for)
  const handleListChange = (e) => {
    const { name, value } = e.target;
    // Split by commas and trim whitespace
    const list = value.split(',').map(item => item.trim()).filter(item => item);
    setCurrentProduct({
      ...currentProduct,
      [name]: list
    });
  };

  // Handle product form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError(null);
      
      // Format the data for the API
      const productData = {
        ...currentProduct,
        price: parseFloat(currentProduct.price),
        stock: parseInt(currentProduct.stock)
      };
      
      if (!apiAvailable) {
        // Handle mock product data
        if (isEditMode) {
          // Update existing product
          const updatedMockProducts = mockProductsState.map(product => 
            product.id === currentProduct.id ? { ...productData } : product
          );
          setMockProductsState(updatedMockProducts);
          setProducts(updatedMockProducts);
          console.log(`Mock product ${isEditMode ? 'updated' : 'added'} successfully`);
        } else {
          // Add new product
          const newProduct = {
            ...productData,
            id: Date.now().toString()
          };
          const newMockProducts = [...mockProductsState, newProduct];
          setMockProductsState(newMockProducts);
          setProducts(newMockProducts);
        }
        setIsModalOpen(false);
        resetForm();
        return;
      }
      
      // Real API call
      const url = isEditMode 
        ? `/api/products/${currentProduct.id}` 
        : '/api/products';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify(productData),
          // Set a timeout to prevent hanging requests
          signal: AbortSignal.timeout(8000)
        });
        
        // Check content type for proper error handling
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // We can safely parse JSON
          const data = await response.json();
          
          if (response.ok) {
            // Refresh product list
            fetchProducts();
            // Close modal
            setIsModalOpen(false);
            // Reset form
            resetForm();
          } else {
            throw new Error(data.message || `Failed to ${isEditMode ? 'update' : 'add'} product`);
          }
        } else {
          // Not JSON response, API might be unavailable
          throw new Error('Backend API returned non-JSON response');
        }
      } catch (error) {
        console.error('Error with API call:', error);
        setError(`${error.message}. Switching to mock data mode.`);
        
        // Switch to mock data mode
        setApiAvailable(false);
        
        // Handle the operation with mock data
        if (isEditMode) {
          // Update existing product in mock data
          const updatedMockProducts = mockProductsState.map(product => 
            product.id === currentProduct.id ? { ...productData } : product
          );
          setMockProductsState(updatedMockProducts);
          setProducts(updatedMockProducts);
        } else {
          // Add new product to mock data
          const newProduct = {
            ...productData,
            id: Date.now().toString()
          };
          const newMockProducts = [...mockProductsState, newProduct];
          setMockProductsState(newMockProducts);
          setProducts(newMockProducts);
        }
        
        // Close modal
        setIsModalOpen(false);
        // Reset form
        resetForm();
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
      console.error('Error in form submission:', error);
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      setError(null);
      
      if (!apiAvailable) {
        // Handle mock product deletion
        const filteredProducts = mockProductsState.filter(product => product.id !== id);
        setMockProductsState(filteredProducts);
        setProducts(filteredProducts);
        console.log('Mock product deleted successfully');
        return;
      }
      
      // Real API call
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: 'DELETE',
          headers: {
            'x-auth-token': localStorage.getItem('token')
          },
          // Set a timeout to prevent hanging requests
          signal: AbortSignal.timeout(5000)
        });
        
        // Check content type for proper error handling
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // We can safely parse JSON
          const data = await response.json();
          
          if (response.ok) {
            // Refresh product list
            fetchProducts();
          } else {
            throw new Error(data.message || 'Failed to delete product');
          }
        } else if (response.ok) {
          // If deletion was successful but no JSON response
          fetchProducts();
        } else {
          // Not JSON response and not OK, API might be unavailable
          throw new Error('Backend API returned non-JSON error response');
        }
      } catch (error) {
        console.error('Error with delete API call:', error);
        setError(`${error.message}. Switching to mock data mode.`);
        
        // Switch to mock data mode
        setApiAvailable(false);
        
        // Delete from mock data
        const filteredProducts = mockProductsState.filter(product => product.id !== id);
        setMockProductsState(filteredProducts);
        setProducts(filteredProducts);
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
      console.error('Error in product deletion:', error);
    }
  };

  // Open modal to add new product
  const handleAddProduct = () => {
    setIsEditMode(false);
    resetForm();
    setIsModalOpen(true);
  };

  // Open modal to edit product
  const handleEditProduct = (product) => {
    setIsEditMode(true);
    setCurrentProduct({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock.toString(),
      specifications: product.specifications || {},
      features: product.features || [],
      compatibleWith: product.compatibleWith || [],
      idealFor: product.idealFor || []
    });
    setIsModalOpen(true);
  };

  // Reset form fields
  const resetForm = () => {
    setCurrentProduct({
      name: '',
      price: '',
      description: '',
      imageUrl: '',
      category: '',
      stock: '',
      specifications: {},
      features: [],
      compatibleWith: [],
      idealFor: []
    });
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // Helper function to determine stock status CSS class
  const getStockClass = (stock) => {
    if (stock <= 0) return 'out';
    if (stock < 10) return 'low';
    if (stock < 25) return 'medium';
    return 'high';
  };

  // Helper to get specification fields based on category
  const getSpecificationFields = (category) => {
    switch (category.toLowerCase()) {
      case 'laptops':
        return {
          processor: '',
          graphics: '',
          memory: '',
          storage: '',
          display: '',
          refreshRate: '',
          operatingSystem: '',
          batteryLife: '',
          weight: ''
        };
      case 'desktops':
        return {
          processor: '',
          graphics: '',
          memory: '',
          storage: '',
          motherboard: '',
          powerSupply: '',
          cooling: '',
          operatingSystem: '',
          dimensions: ''
        };
      case 'monitors':
        return {
          panelType: '',
          resolution: '',
          refreshRate: '',
          responseTime: '',
          aspectRatio: '',
          screenSize: '',
          connectivity: '',
          hdrSupport: '',
          adaptiveSync: ''
        };
      case 'consoles':
        return {
          generation: '',
          storage: '',
          resolution: '',
          processor: '',
          graphicsProcessor: '',
          connectivity: '',
          includesController: '',
          dimensions: '',
          exclusiveFeatures: ''
        };
      case 'vr':
        return {
          displayType: '',
          resolution: '',
          refreshRate: '',
          fieldOfView: '',
          tracking: '',
          connectivity: '',
          platform: '',
          controllers: '',
          sensors: ''
        };
      case 'controllers':
        return {
          compatibility: '',
          connectivity: '',
          batteryLife: '',
          specialFeatures: '',
          layout: '',
          weight: '',
          customizable: '',
          vibration: ''
        };
      case 'keyboards':
        return {
          switchType: '',
          connectionType: '',
          layout: '',
          backlighting: '',
          macroKeys: '',
          mediaControls: '',
          wristRest: '',
          antiGhosting: '',
          keycapMaterial: ''
        };
      case 'mice':
        return {
          sensor: '',
          dpi: '',
          buttons: '',
          connectionType: '',
          ergonomics: '',
          weight: '',
          lighting: '',
          pollRate: '',
          batteryLife: ''
        };
      case 'headsets':
        return {
          audioType: '',
          connectionType: '',
          microphoneType: '',
          soundQuality: '',
          impedance: '',
          frequencyResponse: '',
          noiseCancellation: '',
          surroundSound: '',
          weight: ''
        };
      case 'chairs':
        return {
          material: '',
          maxWeight: '',
          recline: '',
          armrests: '',
          heightAdjustment: '',
          lumbarSupport: '',
          headrest: '',
          wheelType: '',
          dimensions: ''
        };
      case 'gpus':
        return {
          chipset: '',
          memory: '',
          memoryType: '',
          baseClockSpeed: '',
          boostClockSpeed: '',
          outputs: '',
          powerConsumption: '',
          cooling: '',
          length: ''
        };
      case 'cpus':
        return {
          socket: '',
          cores: '',
          threads: '',
          baseClockSpeed: '',
          boostClockSpeed: '',
          cache: '',
          tdp: '',
          integratedGraphics: '',
          architecture: ''
        };
      case 'ram':
        return {
          capacity: '',
          type: '',
          speed: '',
          casLatency: '',
          voltage: '',
          heatspreader: '',
          rgbLighting: '',
          profile: '',
          timing: ''
        };
      case 'storage':
        return {
          type: '',
          capacity: '',
          readSpeed: '',
          writeSpeed: '',
          interface: '',
          formFactor: '',
          cache: '',
          lifespan: '',
          encryption: ''
        };
      case 'motherboards':
        return {
          chipset: '',
          socket: '',
          formFactor: '',
          memorySlots: '',
          maxMemory: '',
          pciSlots: '',
          sataConnectors: '',
          m2Slots: '',
          wifi: ''
        };
      case 'cooling':
        return {
          type: '',
          compatibility: '',
          fanSize: '',
          radiatorSize: '',
          airflow: '',
          noiseLevel: '',
          lighting: '',
          controlMethod: '',
          dimensions: ''
        };
      case 'powersupplies':
        return {
          wattage: '',
          formFactor: '',
          efficiency: '',
          modular: '',
          connectors: '',
          cooling: '',
          protection: '',
          certification: ''
        };
      case 'accessories':
        return {
          type: '',
          compatibility: '',
          connectivity: '',
          material: '',
          dimensions: '',
          weight: '',
          specialFeatures: '',
          powerRequirements: ''
        };
      case 'streaminggear':
        return {
          type: '',
          resolution: '',
          frameRate: '',
          connectivity: '',
          microphoneType: '',
          lighting: '',
          mountType: '',
          softwareSupport: ''
        };
      case 'merchandise':
        return {
          type: '',
          franchise: '',
          size: '',
          material: '',
          official: '',
          ageRating: '',
          careInstructions: '',
          exclusive: ''
        };
      default:
        return {
          type: '',
          specifications: '',
          dimensions: '',
          weight: '',
          material: '',
          compatibility: '',
          warranty: ''
        };
    }
  };

  // Render specification fields based on category
  const renderSpecificationFields = () => {
    if (!currentProduct.category) return null;
    
    const specs = currentProduct.specifications;
    return (
      <div className="specifications-section">
        <h3>Technical Specifications</h3>
        {Object.keys(specs).map(key => (
          <div className="form-group" key={key}>
            <label htmlFor={key}>
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              type="text"
              id={key}
              name={key}
              value={specs[key] || ''}
              onChange={handleSpecificationChange}
              placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
            />
          </div>
        ))}
      </div>
    );
  };

  // Format specifications for display
  const formatSpecifications = (specs) => {
    if (!specs || Object.keys(specs).length === 0) {
      return 'No specifications available';
    }
    
    return Object.entries(specs)
      .map(([key, value]) => {
        // Format key with spaces and capitalize first letter
        const formattedKey = key.charAt(0).toUpperCase() + 
          key.slice(1).replace(/([A-Z])/g, ' $1');
        return `${formattedKey}: ${value}`;
      })
      .join('\n');
  };

  // Format lists for display
  const formatList = (list) => {
    if (!list || list.length === 0) {
      return 'None specified';
    }
    return list.join(', ');
  };

  // Tooltip component for additional info
  const DetailTooltip = ({ title, children }) => {
    return (
      <div className="detail-tooltip">
        <span className="info-icon">ℹ️</span>
        <div className="tooltip-content">
          <h4>{title}</h4>
          <div className="tooltip-body">{children}</div>
        </div>
      </div>
    );
  };

  // Show product details in modal
  const handleViewDetails = (product) => {
    // Create a modal to display all product information
    const productDetailsHTML = `
      <div class="product-details-view">
        <div class="product-image">
          <img src="${product.imageUrl}" alt="${product.name}" />
        </div>
        
        <div class="product-info">
          <h2>${product.name}</h2>
          <div class="product-meta">
            <span class="price">₹${product.price.toFixed(2)}</span>
            <span class="stock">Stock: ${product.stock}</span>
          </div>
          
          <div class="product-category">
            <span class="label">Category:</span>
            <span class="value">${product.category}</span>
          </div>
          
          <div class="product-description">
            <h3>Description</h3>
            <p>${product.description}</p>
          </div>
          
          <div class="product-specs">
            <h3>Technical Specifications</h3>
            <table>
              ${Object.entries(product.specifications || {}).map(([key, value]) => `
                <tr>
                  <td class="spec-key">${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</td>
                  <td class="spec-value">${value}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          <div class="product-features">
            <h3>Key Features</h3>
            <ul>
              ${(product.features || []).map(feature => `<li>${feature}</li>`).join('')}
            </ul>
          </div>
          
          <div class="product-compatibility">
            <h3>Compatible With</h3>
            <p>${formatList(product.compatibleWith)}</p>
          </div>
          
          <div class="product-use-cases">
            <h3>Ideal For</h3>
            <p>${formatList(product.idealFor)}</p>
          </div>
        </div>
      </div>
    `;
    
    // Show the modal with product details
    const detailsModalContainer = document.createElement('div');
    detailsModalContainer.className = 'modal-overlay';
    detailsModalContainer.innerHTML = `
      <div class="product-details-modal">
        <div class="modal-header">
          <h2>Product Details</h2>
          <button class="close-modal-btn">×</button>
        </div>
        <div class="modal-content">
          ${productDetailsHTML}
        </div>
      </div>
    `;
    
    document.body.appendChild(detailsModalContainer);
    
    // Add event listener to close the modal
    detailsModalContainer.querySelector('.close-modal-btn').addEventListener('click', () => {
      document.body.removeChild(detailsModalContainer);
    });
  };

  // Redirect if not admin
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="product-management">
      <div className="management-header">
        <h1>Product Management</h1>
        <button className="add-product-btn" onClick={handleAddProduct}>
          Add New Product
        </button>
      </div>

      {!apiAvailable && (
        <div className="api-notice">
          <p>
            <strong>Note:</strong> Backend API for product management is not available. 
            Changes will be stored temporarily in mock data mode.
          </p>
          <div className="api-guidance">
            <p>To enable persistent storage of products:</p>
            <ol>
              <li>Ensure your backend server is running at <code>http://localhost:5000</code></li>
              <li>Check your database connection in the <code>.env</code> file</li>
              <li>Verify your authentication token is valid</li>
              <li>Click the "Retry" button to attempt reconnection</li>
            </ol>
          </div>
        </div>
      )}

      {error && (
        <div className="management-error">
          <p>{error}</p>
          <button onClick={fetchProducts} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="loading-spinner">Loading products...</div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-products">
                    No products found. Add your first product!
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="product-thumbnail" 
                      />
                    </td>
                    <td>
                      <div className="product-name-with-tooltip">
                        <span>{product.name}</span>
                        {(product.features && product.features.length > 0) && (
                          <DetailTooltip title="Features">
                            <ul className="tooltip-list">
                              {product.features.map((feature, i) => (
                                <li key={i}>{feature}</li>
                              ))}
                            </ul>
                          </DetailTooltip>
                        )}
                      </div>
                    </td>
                    <td>₹{product.price.toFixed(2)}</td>
                    <td>{product.category}</td>
                    <td className={`stock-${getStockClass(product.stock)}`}>{product.stock}</td>
                    <td>
                      <button 
                        className="view-details-btn" 
                        onClick={() => handleViewDetails(product)}
                      >
                        View
                      </button>
                    </td>
                    <td className="action-buttons">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="product-modal">
            <div className="modal-header">
              <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="close-modal-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={currentProduct.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price (₹)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={currentProduct.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="stock">Stock</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    min="0"
                    value={currentProduct.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={currentProduct.category}
                  onChange={handleCategoryChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Laptops">Gaming Laptops</option>
                  <option value="Desktops">Gaming PCs & Desktops</option>
                  <option value="Monitors">Gaming Monitors</option>
                  <option value="Consoles">Gaming Consoles</option>
                  <option value="VR">Virtual Reality Hardware</option>
                  <option value="Controllers">Controllers & Gamepads</option>
                  <option value="Keyboards">Gaming Keyboards</option>
                  <option value="Mice">Gaming Mice</option>
                  <option value="Headsets">Gaming Headsets</option>
                  <option value="Chairs">Gaming Chairs</option>
                  <option value="GPUs">Graphics Cards</option>
                  <option value="CPUs">Processors</option>
                  <option value="RAM">Memory (RAM)</option>
                  <option value="Storage">Storage Devices</option>
                  <option value="Motherboards">Motherboards</option>
                  <option value="Cooling">Cooling Systems</option>
                  <option value="PowerSupplies">Power Supplies</option>
                  <option value="Accessories">Gaming Accessories</option>
                  <option value="StreamingGear">Streaming Equipment</option>
                  <option value="Merchandise">Gaming Merchandise</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="imageUrl">Image URL</label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={currentProduct.imageUrl}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={currentProduct.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Provide a detailed description of the product. Include major selling points and key features."
                />
              </div>
              
              {/* Dynamic specification fields based on category */}
              {currentProduct.category && renderSpecificationFields()}
              
              <div className="form-group">
                <label htmlFor="features">Key Features</label>
                <textarea
                  id="features"
                  name="features"
                  rows="3"
                  value={currentProduct.features.join(', ')}
                  onChange={handleListChange}
                  placeholder="Enter key features separated by commas (e.g., RGB Lighting, Mechanical Switches, Programmable Buttons)"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="compatibleWith">Compatible With</label>
                <textarea
                  id="compatibleWith"
                  name="compatibleWith"
                  rows="3"
                  value={currentProduct.compatibleWith.join(', ')}
                  onChange={handleListChange}
                  placeholder="Enter compatibility information separated by commas (e.g., Windows, MacOS, PS5, Xbox)"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="idealFor">Ideal For</label>
                <textarea
                  id="idealFor"
                  name="idealFor"
                  rows="3"
                  value={currentProduct.idealFor.join(', ')}
                  onChange={handleListChange}
                  placeholder="Enter ideal use cases separated by commas (e.g., Gaming, Streaming, Video Editing, Office Work)"
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {isEditMode ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement; 