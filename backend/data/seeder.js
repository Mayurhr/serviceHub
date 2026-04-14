const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Category = require('../models/Category');
const Service = require('../models/Service');
const Provider = require('../models/Provider');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/servease-pro';

const categories = [
  { name: 'Home Services', slug: 'home-services', icon: '🏠', emoji: '🏠', description: 'Professional home maintenance and repair', color: '#f59e0b', gradientFrom: '#f59e0b', gradientTo: '#d97706', order: 1 },
  { name: 'Tech Services', slug: 'tech-services', icon: '💻', emoji: '💻', description: 'Expert tech repair and installations', color: '#6366f1', gradientFrom: '#6366f1', gradientTo: '#4f46e5', order: 2 },
  { name: 'Education', slug: 'education', icon: '📚', emoji: '📚', description: 'Quality tutoring and skill development', color: '#10b981', gradientFrom: '#10b981', gradientTo: '#059669', order: 3 },
  { name: 'Personal Care', slug: 'personal-care', icon: '✂️', emoji: '✂️', description: 'Beauty, fitness and wellness services', color: '#ec4899', gradientFrom: '#ec4899', gradientTo: '#db2777', order: 4 },
  { name: 'Vehicle Services', slug: 'vehicle-services', icon: '🚗', emoji: '🚗', description: 'Car and bike maintenance at home', color: '#3b82f6', gradientFrom: '#3b82f6', gradientTo: '#2563eb', order: 5 },
  { name: 'Event Services', slug: 'event-services', icon: '🎉', emoji: '🎉', description: 'Make your events unforgettable', color: '#8b5cf6', gradientFrom: '#8b5cf6', gradientTo: '#7c3aed', order: 6 },
];

const timeSlots = [
  '08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM','07:00 PM'
].map(t => ({ time: t, available: true }));

const IMG = {
  cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format',
  ac:       'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format',
  elec:     'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&auto=format',
  plumb:    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&auto=format',
  pest:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format',
  laptop:   'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=600&auto=format',
  mobile:   'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=600&auto=format',
  wifi:     'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format',
  cctv:     'https://images.unsplash.com/photo-1557597774-9d475d5a937e?w=600&auto=format',
  tuition:  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format',
  coding:   'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format',
  english:  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format',
  salon:    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format',
  fitness:  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format',
  yoga:     'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format',
  carwash:  'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format',
  bike:     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format',
  photo:    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&auto=format',
  decor:    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format',
  catering: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format',
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    await User.deleteMany(); await Category.deleteMany(); await Service.deleteMany(); await Provider.deleteMany();

    // Users — password auto-hashed by pre-save hook
    await User.create({ name: 'Admin User', email: 'admin@servease.com', password: 'admin123', role: 'admin', phone: '9800000001', city: 'Davanagere' });
    await User.create({ name: 'Rahul Sharma', email: 'rahul@example.com', password: 'password123', phone: '9800000002', city: 'Davanagere', address: 'MCC B Block, Davanagere' });
    await User.create({ name: 'Priya Patel', email: 'priya@example.com', password: 'password123', phone: '9800000003', city: 'Shivamogga', address: 'Shivappa Nagar, Shivamogga' });
    console.log('✅ Users created (passwords hashed)');

    const cats = await Category.insertMany(categories);
    const catMap = {}; cats.forEach(c => catMap[c.slug] = c._id);
    console.log('✅ Categories created');

    const services = [
      { name: 'Deep Home Cleaning', slug: 'deep-home-cleaning', category: catMap['home-services'], description: 'Comprehensive deep cleaning for your entire home using eco-friendly products.', shortDescription: 'Professional deep cleaning with eco-friendly products', priceRange: { min: 299, max: 999, unit: 'starting', note: 'Based on home size' }, duration: 180, includes: ['All rooms cleaning', 'Kitchen degreasing', 'Bathroom sanitization', 'Window cleaning', 'Eco-friendly products'], timeSlots, tags: ['cleaning', 'home'], images: [IMG.cleaning], isFeatured: true, isPopular: true, rating: 4.8, numReviews: 42, totalBookings: 89 },
      { name: 'AC Repair & Service', slug: 'ac-repair-service', category: catMap['home-services'], description: 'Expert AC repair, cleaning, and servicing for all brands. Gas refilling, coil cleaning.', shortDescription: 'AC repair and servicing for all brands', priceRange: { min: 499, max: 1999, unit: 'starting', note: 'Depends on issue' }, duration: 90, includes: ['Filter cleaning', 'Coil cleaning', 'Leak check', 'Gas top-up if needed'], timeSlots, tags: ['AC', 'repair'], images: [IMG.ac], isFeatured: true, rating: 4.7, numReviews: 38, totalBookings: 67 },
      { name: 'Electrician at Home', slug: 'electrician-home', category: catMap['home-services'], description: 'Licensed electrician for wiring, MCB faults, fan/light installation, switchboard repair.', shortDescription: 'Licensed electrician for all home electrical needs', priceRange: { min: 199, max: 799, unit: 'starting', note: 'Service charge only' }, duration: 60, includes: ['Free diagnosis', 'Safety check', 'All tools'], timeSlots, tags: ['electrician', 'wiring'], images: [IMG.elec], isPopular: true, rating: 4.6, numReviews: 29, totalBookings: 54 },
      { name: 'Plumbing Services', slug: 'plumbing-services', category: catMap['home-services'], description: 'Expert plumbing for leaking pipes, tap repair, drain cleaning, bathroom fittings.', shortDescription: 'Expert plumbing with emergency support', priceRange: { min: 199, max: 999, unit: 'starting' }, duration: 60, includes: ['Leak detection', 'Pipe repair', 'Drain cleaning'], timeSlots, tags: ['plumbing', 'pipe'], images: [IMG.plumb], rating: 4.5, numReviews: 21, totalBookings: 43 },
      { name: 'Pest Control', slug: 'pest-control', category: catMap['home-services'], description: 'Professional pest control for cockroaches, bedbugs, termites, mosquitoes.', shortDescription: 'Safe pest control with approved chemicals', priceRange: { min: 799, max: 2999, unit: 'starting' }, duration: 120, includes: ['All pests covered', 'Approved chemicals', '3-month guarantee'], timeSlots, tags: ['pest'], images: [IMG.pest], rating: 4.6, numReviews: 18, totalBookings: 31 },
      { name: 'Laptop Repair', slug: 'laptop-repair', category: catMap['tech-services'], description: 'Expert laptop repair for all brands — screen, motherboard, virus removal, SSD upgrade.', shortDescription: 'Expert laptop repair with 30-day warranty', priceRange: { min: 499, max: 2999, unit: 'starting' }, duration: 120, includes: ['Free diagnosis', 'Data backup', '30-day warranty'], timeSlots, tags: ['laptop'], images: [IMG.laptop], isFeatured: true, isPopular: true, rating: 4.6, numReviews: 33, totalBookings: 57 },
      { name: 'Mobile Phone Repair', slug: 'mobile-repair', category: catMap['tech-services'], description: 'Quick mobile repair — screen, battery, charging port. Genuine parts, 15-day warranty.', shortDescription: 'Fast mobile repair with genuine parts', priceRange: { min: 299, max: 1999, unit: 'starting' }, duration: 60, includes: ['Genuine parts', 'Screen replacement', '15-day warranty'], timeSlots, tags: ['mobile', 'screen'], images: [IMG.mobile], isPopular: true, rating: 4.5, numReviews: 48, totalBookings: 103 },
      { name: 'WiFi & Network Setup', slug: 'wifi-setup', category: catMap['tech-services'], description: 'Professional WiFi setup, router configuration, network troubleshooting.', shortDescription: 'Expert WiFi and network configuration', priceRange: { min: 199, max: 999, unit: 'starting' }, duration: 60, includes: ['Router config', 'Range optimization', 'Security setup'], timeSlots, tags: ['wifi', 'network'], images: [IMG.wifi], rating: 4.4, numReviews: 15, totalBookings: 28 },
      { name: 'CCTV Installation', slug: 'cctv-installation', category: catMap['tech-services'], description: 'Professional CCTV camera installation with DVR/NVR setup and mobile viewing app.', shortDescription: 'CCTV setup with mobile monitoring', priceRange: { min: 999, max: 4999, unit: 'starting' }, duration: 180, includes: ['Camera mounting', 'DVR setup', 'Mobile app config', '1-year warranty'], timeSlots, tags: ['CCTV', 'security'], images: [IMG.cctv], isFeatured: true, rating: 4.7, numReviews: 12, totalBookings: 19 },
      { name: 'Home Tuition', slug: 'home-tuition', category: catMap['education'], description: 'Expert home tutors for all subjects for Class 1-12 and competitive exams.', shortDescription: 'Expert tutors for all grades and subjects', priceRange: { min: 300, max: 800, unit: 'hourly' }, duration: 60, includes: ['All subjects', 'Study material', 'Doubt clearing'], timeSlots, tags: ['tutor', 'education'], images: [IMG.tuition], isFeatured: true, isPopular: true, rating: 4.9, numReviews: 55, totalBookings: 124 },
      { name: 'Programming Classes', slug: 'programming-classes', category: catMap['education'], description: 'Learn Python, JavaScript, React, Java, C++ from industry experts.', shortDescription: 'Coding classes with industry experts', priceRange: { min: 500, max: 1500, unit: 'hourly' }, duration: 90, includes: ['Live coding', 'Projects', 'Code review', 'Certificate'], timeSlots, tags: ['coding', 'programming'], images: [IMG.coding], isFeatured: true, rating: 4.8, numReviews: 24, totalBookings: 46 },
      { name: 'Spoken English Classes', slug: 'spoken-english', category: catMap['education'], description: 'Build fluency and confidence in spoken English. Pronunciation, grammar, vocabulary.', shortDescription: 'Spoken English for fluency and confidence', priceRange: { min: 300, max: 1000, unit: 'hourly' }, duration: 60, includes: ['Pronunciation', 'Conversation practice', 'Grammar'], timeSlots, tags: ['english'], images: [IMG.english], rating: 4.7, numReviews: 17, totalBookings: 33 },
      { name: 'Salon at Home', slug: 'salon-home', category: catMap['personal-care'], description: 'Full salon services at your doorstep — haircut, facial, threading, waxing, bridal packages.', shortDescription: 'Full salon services at your doorstep', priceRange: { min: 299, max: 1499, unit: 'starting' }, duration: 60, includes: ['All tools', 'Premium products', 'Trained beautician'], timeSlots, tags: ['salon', 'beauty', 'hair'], images: [IMG.salon], isFeatured: true, isPopular: true, rating: 4.7, numReviews: 67, totalBookings: 145 },
      { name: 'Personal Fitness Trainer', slug: 'fitness-trainer', category: catMap['personal-care'], description: 'Certified personal trainer for weight loss, muscle building, HIIT. Custom diet plans.', shortDescription: 'Certified trainer for your fitness goals', priceRange: { min: 500, max: 2000, unit: 'hourly' }, duration: 60, includes: ['Fitness assessment', 'Custom plan', 'Diet consultation'], timeSlots, tags: ['fitness', 'trainer'], images: [IMG.fitness], isFeatured: true, rating: 4.8, numReviews: 29, totalBookings: 57 },
      { name: 'Yoga Trainer at Home', slug: 'yoga-trainer', category: catMap['personal-care'], description: 'Experienced yoga instructor for all levels from beginner to advanced.', shortDescription: 'Experienced yoga instructor at your home', priceRange: { min: 300, max: 1200, unit: 'hourly' }, duration: 60, includes: ['All levels welcome', 'Meditation', 'Breathing exercises'], timeSlots, tags: ['yoga', 'meditation'], images: [IMG.yoga], rating: 4.9, numReviews: 22, totalBookings: 39 },
      { name: 'Car Wash & Detailing', slug: 'car-wash-detailing', category: catMap['vehicle-services'], description: 'Professional car wash and full detailing at your doorstep. Interior, exterior, polish.', shortDescription: 'Complete car wash and detailing at home', priceRange: { min: 199, max: 599, unit: 'starting' }, duration: 90, includes: ['Exterior wash', 'Interior cleaning', 'Dashboard polish', 'Tire shine'], timeSlots, tags: ['car', 'wash'], images: [IMG.carwash], isPopular: true, rating: 4.6, numReviews: 38, totalBookings: 79 },
      { name: 'Bike Service at Home', slug: 'bike-service', category: catMap['vehicle-services'], description: 'Complete two-wheeler service at your doorstep. Oil change, brakes, chain, engine.', shortDescription: 'Complete bike service at your doorstep', priceRange: { min: 499, max: 1499, unit: 'starting' }, duration: 90, includes: ['Oil change', 'Chain lube', 'Brake check', 'Engine tune'], timeSlots, tags: ['bike', 'motorcycle'], images: [IMG.bike], rating: 4.5, numReviews: 27, totalBookings: 56 },
      { name: 'Photography & Videography', slug: 'photography', category: catMap['event-services'], description: 'Professional photography and videography for weddings, birthdays, corporate events.', shortDescription: 'Professional event photography and videography', priceRange: { min: 1999, max: 9999, unit: 'starting' }, duration: 300, includes: ['HD photos', 'Video coverage', 'Online gallery', '48hr delivery'], timeSlots, tags: ['photography', 'wedding'], images: [IMG.photo], isFeatured: true, isPopular: true, rating: 4.9, numReviews: 44, totalBookings: 57 },
      { name: 'Event Decoration', slug: 'event-decoration', category: catMap['event-services'], description: 'Creative event decoration for birthdays, anniversaries, weddings.', shortDescription: 'Creative event decoration for all occasions', priceRange: { min: 2999, max: 15000, unit: 'starting' }, duration: 240, includes: ['Theme setup', 'Balloon decor', 'Flower arrangements', 'Lighting'], timeSlots, tags: ['decoration', 'event'], images: [IMG.decor], rating: 4.7, numReviews: 16, totalBookings: 24 },
      { name: 'Catering Services', slug: 'catering', category: catMap['event-services'], description: 'Complete catering for all events. North Indian, South Indian, Continental menus.', shortDescription: 'Complete catering for all occasions', priceRange: { min: 200, max: 800, unit: 'per_plate', note: 'Per plate, minimum 50 plates' }, duration: 480, includes: ['Menu customization', 'Serving staff', 'Utensils', 'Setup & cleanup'], timeSlots, tags: ['catering', 'food'], images: [IMG.catering], rating: 4.6, numReviews: 11, totalBookings: 18 },
    ];

    const createdServices = await Service.insertMany(services);
    const sMap = {}; createdServices.forEach(s => sMap[s.slug] = s._id);
    console.log('✅ Services created');

    // Providers — password auto-hashed by pre-save hook (no manual bcrypt needed)
    // avatar left empty — controller generates initials-based SVG avatar
    const providers = [
      { name: 'Rajesh Kumar',   email: 'rajesh@provider.com',  phone: '9812345601', password: 'provider123', bio: 'Licensed electrician with 8 years experience in residential wiring and MCB installations.', experience: 8, skills: ['Wiring', 'MCB', 'Fan Installation', 'Inverter Setup'], categories: [catMap['home-services']], services: [sMap['electrician-home'], sMap['ac-repair-service']], city: 'Davanagere', trustScore: 92, rating: 4.8, numReviews: 46, totalJobs: 84, completedJobs: 79, cancelledJobs: 5, availabilityStatus: 'online', isVerified: true, isFeatured: true },
      { name: 'Suresh Patil',   email: 'suresh@provider.com',  phone: '9812345602', password: 'provider123', bio: 'Certified plumber and AC technician with 10 years expertise. Same-day service available.', experience: 10, skills: ['Plumbing', 'AC Repair', 'Pipe Fitting', 'Leak Detection'], categories: [catMap['home-services']], services: [sMap['plumbing-services'], sMap['ac-repair-service']], city: 'Shivamogga', trustScore: 88, rating: 4.7, numReviews: 38, totalJobs: 67, completedJobs: 62, cancelledJobs: 5, availabilityStatus: 'online', isVerified: true },
      { name: 'Anita Desai',    email: 'anita@provider.com',   phone: '9812345603', password: 'provider123', bio: 'Professional cleaning and pest control specialist. Eco-friendly products.', experience: 5, skills: ['Deep Cleaning', 'Pest Control', 'Sanitization'], categories: [catMap['home-services']], services: [sMap['deep-home-cleaning'], sMap['pest-control']], city: 'Davanagere', trustScore: 94, rating: 4.9, numReviews: 52, totalJobs: 98, completedJobs: 94, cancelledJobs: 4, availabilityStatus: 'online', isVerified: true, isFeatured: true },
      { name: 'Vikram Singh',   email: 'vikram@provider.com',  phone: '9812345604', password: 'provider123', bio: 'Tech expert specializing in laptop and mobile repair. Quick turnaround with genuine parts.', experience: 7, skills: ['Laptop Repair', 'Mobile Repair', 'Data Recovery', 'Virus Removal'], categories: [catMap['tech-services']], services: [sMap['laptop-repair'], sMap['mobile-repair']], city: 'Honnali', trustScore: 85, rating: 4.6, numReviews: 61, totalJobs: 112, completedJobs: 103, cancelledJobs: 9, availabilityStatus: 'busy', isVerified: true },
      { name: 'Priya Nair',     email: 'priya.n@provider.com', phone: '9812345605', password: 'provider123', bio: 'Mathematics and Science tutor with 12 years experience. CBSE, ICSE, competitive exam specialist.', experience: 12, skills: ['Mathematics', 'Physics', 'Chemistry', 'IIT-JEE'], categories: [catMap['education']], services: [sMap['home-tuition']], city: 'Davanagere', trustScore: 97, rating: 4.9, numReviews: 75, totalJobs: 134, completedJobs: 131, cancelledJobs: 3, availabilityStatus: 'online', isVerified: true, isFeatured: true },
      { name: 'Arjun Mehta',    email: 'arjun@provider.com',   phone: '9812345606', password: 'provider123', bio: 'Full-stack developer with 6 years of teaching experience. Python, JavaScript, React.', experience: 6, skills: ['Python', 'JavaScript', 'React', 'Node.js', 'DSA'], categories: [catMap['education']], services: [sMap['programming-classes']], city: 'Shivamogga', trustScore: 91, rating: 4.8, numReviews: 34, totalJobs: 62, completedJobs: 59, cancelledJobs: 3, availabilityStatus: 'online', isVerified: true, isFeatured: true },
      { name: 'Meera Joshi',    email: 'meera@provider.com',   phone: '9812345607', password: 'provider123', bio: 'Certified fitness trainer and yoga instructor with 9 years experience.', experience: 9, skills: ['Fitness Training', 'Yoga', 'HIIT', 'Meditation', 'Nutrition'], categories: [catMap['personal-care']], services: [sMap['fitness-trainer'], sMap['yoga-trainer']], city: 'Davanagere', trustScore: 96, rating: 4.9, numReviews: 47, totalJobs: 89, completedJobs: 87, cancelledJobs: 2, availabilityStatus: 'online', isVerified: true, isFeatured: true },
      { name: 'Kavya Reddy',    email: 'kavya@provider.com',   phone: '9812345608', password: 'provider123', bio: 'Professional beautician with 8 years experience. Expert in bridal makeup and advanced facials.', experience: 8, skills: ['Makeup', 'Hair Styling', 'Facial', 'Bridal', 'Waxing'], categories: [catMap['personal-care']], services: [sMap['salon-home']], city: 'Bhadravathi', trustScore: 93, rating: 4.8, numReviews: 83, totalJobs: 148, completedJobs: 142, cancelledJobs: 6, availabilityStatus: 'online', isVerified: true },
      { name: 'Mohammed Khalid',email: 'khalid@provider.com',  phone: '9812345609', password: 'provider123', bio: 'Professional photographer and videographer with 10 years. 200+ events in Karnataka.', experience: 10, skills: ['Wedding Photography', 'Portrait', 'Videography', 'Editing'], categories: [catMap['event-services']], services: [sMap['photography']], city: 'Shivamogga', trustScore: 95, rating: 4.9, numReviews: 58, totalJobs: 99, completedJobs: 96, cancelledJobs: 3, availabilityStatus: 'online', isVerified: true, isFeatured: true },
      { name: 'Deepak Sharma',  email: 'deepak@provider.com',  phone: '9812345610', password: 'provider123', bio: 'Certified car detailing expert and bike mechanic with 6 years experience.', experience: 6, skills: ['Car Wash', 'Detailing', 'Bike Service'], categories: [catMap['vehicle-services']], services: [sMap['car-wash-detailing'], sMap['bike-service']], city: 'Sagar', trustScore: 82, rating: 4.5, numReviews: 44, totalJobs: 83, completedJobs: 76, cancelledJobs: 7, availabilityStatus: 'online', isVerified: true },
      { name: 'Riya Kapoor',    email: 'riya@provider.com',    phone: '9812345611', password: 'provider123', bio: 'Engineering student offering affordable coding classes. Python, web dev, DSA.', experience: 2, skills: ['Python', 'HTML/CSS', 'JavaScript', 'DSA basics'], categories: [catMap['education']], services: [sMap['programming-classes']], city: 'Davanagere', trustScore: 72, rating: 4.3, numReviews: 12, totalJobs: 23, completedJobs: 21, cancelledJobs: 2, availabilityStatus: 'online', isVerified: false, isStudent: true, priceMultiplier: 0.7 },
      { name: 'Amaan Khan',     email: 'amaan@provider.com',   phone: '9812345612', password: 'provider123', bio: 'Engineering student with hands-on skills in mobile and laptop repair. Affordable rates.', experience: 1, skills: ['Mobile Repair', 'Laptop Basics', 'Screen Replacement'], categories: [catMap['tech-services']], services: [sMap['mobile-repair'], sMap['wifi-setup']], city: 'Honnali', trustScore: 68, rating: 4.2, numReviews: 9, totalJobs: 19, completedJobs: 17, cancelledJobs: 2, availabilityStatus: 'online', isVerified: false, isStudent: true, priceMultiplier: 0.65 },
      { name: 'Sunita Verma',   email: 'sunita@provider.com',  phone: '9812345613', password: 'provider123', bio: 'Local beautician with 4 years experience. Affordable salon services. Mehndi and threading specialist.', experience: 4, skills: ['Mehndi', 'Threading', 'Basic Makeup', 'Hair Cut'], categories: [catMap['personal-care']], services: [sMap['salon-home']], city: 'Honnali', trustScore: 78, rating: 4.5, numReviews: 18, totalJobs: 36, completedJobs: 34, cancelledJobs: 2, availabilityStatus: 'offline', isVerified: true, priceMultiplier: 0.8 },
      { name: 'Nikhil Bose',    email: 'nikhil@provider.com',  phone: '9812345614', password: 'provider123', bio: 'Networking engineer offering WiFi setup and CCTV installation. Smart home automation expert.', experience: 5, skills: ['WiFi Setup', 'CCTV', 'Network Config'], categories: [catMap['tech-services']], services: [sMap['wifi-setup'], sMap['cctv-installation']], city: 'Bhadravathi', trustScore: 86, rating: 4.6, numReviews: 14, totalJobs: 28, completedJobs: 26, cancelledJobs: 2, availabilityStatus: 'busy', isVerified: true },
      { name: 'Pooja Iyer',     email: 'pooja@provider.com',   phone: '9812345615', password: 'provider123', bio: 'Certified caterer and event decorator with 12 years. Weddings, corporate events, parties.', experience: 12, skills: ['Catering', 'Event Decoration', 'Menu Planning'], categories: [catMap['event-services']], services: [sMap['catering'], sMap['event-decoration']], city: 'Sagar', trustScore: 90, rating: 4.7, numReviews: 23, totalJobs: 47, completedJobs: 44, cancelledJobs: 3, availabilityStatus: 'online', isVerified: true },
    ];

    // Use insertMany with ordered:false so pre-save hooks fire on each
    for (const p of providers) {
      await new Provider(p).save();
    }

    console.log('✅ 15 Providers created (passwords hashed by model hook)');
    console.log('\n🎉 ===== SEED COMPLETE =====');
    console.log('Admin:    admin@servease.com   / admin123');
    console.log('User 1:   rahul@example.com    / password123');
    console.log('Provider: rajesh@provider.com  / provider123');
    console.log('================================\n');
    process.exit(0);
  } catch (err) { console.error('❌ Seed error:', err.message); process.exit(1); }
}
seed();
