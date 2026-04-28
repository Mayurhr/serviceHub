const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config({ path: '../.env' });

const User     = require('../models/User');
const Category = require('../models/Category');
const Service  = require('../models/Service');
const Provider = require('../models/Provider');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/servease-pro';

const CITIES = [
  'Davanagere','Shivamogga','Honnali','Sagar','Bhadravathi',
  'Chitradurga','Tumkur','Mysuru','Mangaluru','Hubballi',
  'Dharwad','Belagavi','Vijayapura','Ballari','Raichur',
  'Kalaburagi','Udupi','Hassan','Mandya','Chikkamagaluru',
];

const categories = [
  { name:'Home Services',   slug:'home-services',   icon:'🏠', emoji:'🏠', description:'Professional home maintenance', color:'#f59e0b', gradientFrom:'#f59e0b', gradientTo:'#d97706', order:1 },
  { name:'Tech Services',   slug:'tech-services',   icon:'💻', emoji:'💻', description:'Expert tech repair',           color:'#6366f1', gradientFrom:'#6366f1', gradientTo:'#4f46e5', order:2 },
  { name:'Education',       slug:'education',       icon:'📚', emoji:'📚', description:'Quality tutoring',            color:'#10b981', gradientFrom:'#10b981', gradientTo:'#059669', order:3 },
  { name:'Personal Care',   slug:'personal-care',   icon:'✂️', emoji:'✂️', description:'Beauty and wellness',         color:'#ec4899', gradientFrom:'#ec4899', gradientTo:'#db2777', order:4 },
  { name:'Vehicle Services',slug:'vehicle-services',icon:'🚗', emoji:'🚗', description:'Car and bike maintenance',    color:'#3b82f6', gradientFrom:'#3b82f6', gradientTo:'#2563eb', order:5 },
  { name:'Event Services',  slug:'event-services',  icon:'🎉', emoji:'🎉', description:'Make events unforgettable',   color:'#8b5cf6', gradientFrom:'#8b5cf6', gradientTo:'#7c3aed', order:6 },
];

const timeSlots = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM','07:00 PM']
  .map(t => ({ time: t, available: true }));

const IMG = {
  // Home Services — each photo directly matches the service activity
  cleaning:  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format',  // mop & bucket cleaning
  ac:        'https://images.unsplash.com/photo-1631545806609-52e5c02c70de?w=600&auto=format',  // technician servicing AC unit
  elec:      'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&auto=format',  // electrician wiring a panel
  plumb:     'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&auto=format',  // plumber fixing under-sink pipe
  pest:      'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=600&auto=format',  // pest control spraying
  paint:     'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&auto=format',     // painter rolling wall
  carpenter: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format',  // carpenter with wood tools
  // Tech Services
  laptop:    'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=600&auto=format',  // laptop repair close-up
  mobile:    'https://images.unsplash.com/photo-1551808525-51a94da548ce?w=600&auto=format',     // phone screen repair
  wifi:      'https://images.unsplash.com/photo-1516044734145-07ca8eef8731?w=600&auto=format',  // router/wifi setup
  cctv:      'https://images.unsplash.com/photo-1557597774-9d475d5a937e?w=600&auto=format',     // CCTV camera mounted
  // Education
  tuition:   'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format',  // tutor with student books
  coding:    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format',  // programming on laptop
  english:   'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format',  // classroom spoken english
  // Personal Care
  salon:     'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format',     // beauty salon at home
  fitness:   'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format',  // personal trainer workout
  yoga:      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format',     // yoga pose at home
  // Vehicle & Events
  carwash:   'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format',  // car being washed/detailed
  photo:     'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&auto=format',  // photographer at event

  decor:     'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format',
};

// 20 provider name pools — one per service type (different names for each city)
const PROVIDER_NAMES = {
  'deep-home-cleaning':   ['Anita Sharma','Sunita Reddy','Kavitha Nair','Meena Joshi','Roja Kumari','Padma Bai','Shubha Rao','Savitha Gowda','Lakshmi Devi','Bhavna Patil','Suma Hegde','Rekha Iyengar','Priya Menon','Saroja Nayak','Veena Desai','Usha Pillai','Nalini Shetty','Geetha Murthy','Kamla Bhat','Indira Rajan'],
  'ac-repair-service':    ['Suresh Patil','Ravi Kumar','Mohan Das','Ganesh Babu','Kiran Rao','Ajith Nair','Santosh Singh','Mahesh Reddy','Vinod Sharma','Praveen Gowda','Harish Bhat','Ramesh Naik','Deepak Shetty','Sanjay Pillai','Kishore Menon','Arun Joshi','Naresh Kumar','Sathish Nayak','Pradeep Iyengar','Shiva Murthy'],
  'electrician-home':     ['Rajesh Kumar','Basavaraj Meti','Nagesh Murthy','Prakash Iyengar','Venkatesha Rao','Girish Naik','Sunil Shetty','Anand Bhat','Lokesh Gowda','Manjunath Reddy','Shashidhara Nair','Umesh Patil','Raju Sharma','Satish Kumar','Dinesh Singh','Ashok Rajan','Bharat Menon','Chandrashekar Naidu','Dayananda Pillai','Eshwar Deshpande'],
  'plumbing-services':    ['Venkatesh Reddy','Srinivas Rao','Babu Lal','Krishnamurthy P','Narayana Das','Murugan Pillai','Eswaran Nair','Balaji Shetty','Chidambaram','Palani Kumar','Ramalingam Naidu','Sekar Gowda','Thambidurai','Annamalai Bhat','Karuppasamy','Shanmugam Rao','Periasamy Naik','Muthusamy Reddy','Selvam Sharma','Velusamy Patil'],
  'pest-control':         ['Suma Hegde','Anitha Rao','Jayalakshmi','Shanthi Bhat','Umarani Nair','Vijayalakshmi','Kumari Shetty','Meenakshi','Durgadevi','Maheswari','Bhuvana Gowda','Chitra Reddy','Gomathi Pillai','Hema Naik','Indumathi','Janaki Sharma','Kalpana Bai','Lalitha Menon','Mangala Rao','Nirmala Patil'],
  'home-painting':        ['Lakshmi Prasad','Nagendra Rao','Ramakrishna','Shivaramaiah','Thimmaiah','Venkataramaiah','Basavaiah Gowda','Chandrashekhar','Doddaiah Nayak','Eranna Shetty','Fakeeraiah Bhat','Gangadhara Rao','Hanumaiah Naik','Iranna Patil','Jayaramaiah','Kantarajaiah','Lokadevaiah','Muddaiah Reddy','Nanjaiah Kumar','Obaiah Singh'],
  'carpentry-services':   ['Ravi Gowda','Shivu Naik','Thimma Shetty','Krishnappa Bhat','Siddaiah Rao','Mallaiah Pillai','Ningaraju Nair','Puttaiah Kumar','Ramaiah Reddy','Shekharaiah Sharma','Tirumalaiah','Umesh Naidu','Veeraiah Menon','Yellaiah Gowda','Zafar Ahmed','Abdul Rahim','Imran Khan','Karim Basha','Latif Pasha','Muneer Sharif'],
  'laptop-repair':        ['Vikram Singh','Arjun Mehta','Dev Prakash','Eshan Verma','Farhan Ali','Gaurav Mishra','Harsh Agarwal','Ishaan Kapoor','Jayesh Patel','Kunal Shah','Lokesh Trivedi','Manish Gupta','Nikhil Joshi','Omkar Kulkarni','Prakhar Saxena','Rahul Bhatt','Sumit Chauhan','Tarun Pandey','Ujjwal Roy','Vivek Tiwari'],
  'mobile-repair':        ['Sunil DSouza','Rajan Pillai','Sathish Babu','Thomas Mathew','Uday Shankar','Vimal Raj','Wilson Joseph','Xavier Fernandez','Yadav Rathod','Zaid Hussain','Abishek Nair','Biju Varghese','Clement Anthony','Denny George','Emmanuel Paul','Francis Mathew','George Abraham','Henry Joseph','Ignatius Xavier','Jacob Thomas'],
  'wifi-setup':           ['Shivakumar Biradar','Nagendra Patil','Omkar Rao','Prasad Kulkarni','Quamar Uddin','Riyaz Ahmed','Saleem Khan','Tanveer Pasha','Usman Siddiqui','Vaqar Hussain','Waseem Ahmad','Yakub Shaikh','Zaheer Abbas','Altaf Hussain','Bilal Qureshi','Danish Raza','Furqan Ali','Hamid Sheikh','Irfan Malik','Junaid Ansari'],
  'cctv-installation':    ['Nagesh Murthy','Pavan Kumar','Qadri Hasan','Roshan Shetty','Sachin Nayak','Tilak Raj','Utkarsh Mishra','Vinayak Joshi','Wasim Aktar','Xender Kumar','Yash Bhattacharya','Zahir Ahmed','Amit Srivastava','Bhushan Shukla','Chetan Agarwal','Dinesh Sharma','Eklavya Singh','Faisal Ahmad','Govind Yadav','Hitesh Patel'],
  'home-tuition':         ['Priya Nair','Sowmya Rao','Rekha Sharma','Tanu Gupta','Uma Venkatesan','Varsha Iyer','Wanda Fernandez','Ximena Lobo','Yashoda Bhat','Zubeda Khan','Amitha Gowda','Bhavani Reddy','Chandana Naik','Deepa Shetty','Esha Pillai','Fatima Siddiqui','Gauri Joshi','Hiral Shah','Isha Patel','Jayanthi Menon'],
  'programming-classes':  ['Arjun Mehta','Bhaskar Rao','Chandan Verma','Deepak Nair','Elan Suresh','Farhan Rashid','Girish Kamath','Harish Bhat','Ishwar Raju','Jagadish Kumar','Kartik Sharma','Lokesh Jain','Mayank Agarwal','Naveen Singh','Om Prakash','Preetham Gowda','Quentin DSa','Rohan Patil','Sudhir Naik','Trivikram Rao'],
  'spoken-english':       ['Shanthi Bhat','Rachel Fernandez','Sarah Thomas','Tina Joseph','Uma Mathew','Veena Philip','Winnie George','Xena Rodrigues','Yasmin Lobo','Zenia Barretto','Alicia Pereira','Bella DSouza','Clara Sequeira','Dolly Cardozo','Ella Mascarenhas','Flora Pinto','Grace Menezes','Helen Gomes','Iris Noronha','Julia Almeida'],
  'salon-home':           ['Kavitha Reddy','Reshma Sheikh','Meera Kapoor','Nisha Sharma','Poonam Verma','Rani Gupta','Simran Kaur','Tejal Mehta','Urvashi Patel','Vandana Singh','Anjali Bose','Bindu Nair','Chanda Roy','Divya Pillai','Ekta Srivastava','Falguni Shah','Geeta Joshi','Heena Agarwal','Ipshita Banerjee','Jyoti Yadav'],
  'fitness-trainer':      ['Meena Rao','Divya Krishnamurthy','Pooja Sharma','Ritika Singh','Sonal Verma','Tanisha Gupta','Usha Pillai','Vidya Nair','Wini Thomas','Xena Shetty','Yashwini Gowda','Zara Khan','Aishwarya Patil','Bhavna Joshi','Chaitali Roy','Diya Mehta','Eva Fernandez','Fiona DSouza','Gayathri Menon','Harini Naidu'],
  'yoga-trainer':         ['Savitha Rangaswamy','Annapurna Devi','Bhavana Rao','Chethana Gowda','Devika Nair','Ezhilarasi','Gomathi Shetty','Hamsa Bai','Indrani Pillai','Janani Suresh','Kamakshi Iyer','Lalitha Reddy','Malathi Sharma','Nalina Bhat','Oomana Thomas','Pavithra Naik','Radhika Menon','Saranya Pillai','Thilaga Kumar','Uma Priya'],
  'car-wash-detailing':   ['Deepak Nayak','Santosh Patkar','Raju Shetty','Mahesh Gowda','Nitin Kumar','Pavan Raj','Qasim Khan','Rajiv Sharma','Salman Ahmed','Tanvir Hussain','Umair Abbas','Vasim Sheikh','Waqas Ahmad','Xafar Ali','Yaseen Pasha','Zubair Khan','Akram Siddiqui','Basheer Ahmad','Chand Basha','Dawood Shareef'],
  'photography':          ['Arun Joshi','Praveen Nayak','Mohan Shetty','Rajesh Fernandez','Sunil Varghese','Thomas Mathew','Uday Raj','Vivek Kumar','Wilson George','Xavier Philip','Yatin Sharma','Zanele Pillai','Adith Menon','Bhavin Shah','Chintan Patel','Divyesh Mehta','Eshan Joglekar','Farooq Shaikh','Ganesh Kadam','Hemant Deshpande'],
  'event-decoration':     ['Bindu Shetty','Chaitra Nayak','Dhanya Pillai','Eswari Gowda','Farida Banu','Gulnaz Begum','Haseena Bi','Ismat Ara','Jabeen Sultana','Kaneez Fatima','Laila Begum','Mariam Bi','Nasreen Khan','Ozma Parveen','Parvin Sultana','Quaiser Jahan','Rubina Khatoon','Shaheen Begum','Tabassum Ali','Uzma Shaikh'],
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany();
    await Category.deleteMany();
    await Service.deleteMany();
    await Provider.deleteMany();

    // Users
    await User.create({ name:'Admin User',   email:'admin@servease.com',  password:'admin123',    role:'admin', phone:'9800000001', city:'Davanagere' });
    await User.create({ name:'Rahul Sharma', email:'rahul@example.com',   password:'password123', phone:'9800000002', city:'Davanagere', address:'MCC B Block, Davanagere' });
    await User.create({ name:'Priya Patel',  email:'priya@example.com',   password:'password123', phone:'9800000003', city:'Shivamogga', address:'Shivappa Nagar, Shivamogga' });
    console.log('✅ Users created');

    const cats = await Category.insertMany(categories);
    const catMap = {};
    cats.forEach(c => { catMap[c.slug] = c._id; });
    console.log('✅ Categories created');

    const serviceList = [
      { name:'Deep Home Cleaning',      slug:'deep-home-cleaning',   category:'home-services',    img:IMG.cleaning, includes:['All rooms','Kitchen','Bathroom','Windows','Eco-friendly products'], tags:['cleaning','home'],        priceRange:{min:299,max:999,unit:'starting'},  duration:180, isFeatured:true,  isPopular:true,  rating:4.8, numReviews:42, totalBookings:89 },
      { name:'AC Repair & Service',     slug:'ac-repair-service',    category:'home-services',    img:IMG.ac,       includes:['Filter cleaning','Coil cleaning','Leak check','Gas top-up'],      tags:['AC','repair'],            priceRange:{min:499,max:1999,unit:'starting'}, duration:90,  isFeatured:true,  isPopular:false, rating:4.7, numReviews:38, totalBookings:67 },
      { name:'Electrician at Home',     slug:'electrician-home',     category:'home-services',    img:IMG.elec,     includes:['Free diagnosis','Safety check','All tools'],                       tags:['electrician','wiring'],   priceRange:{min:199,max:799,unit:'starting'},  duration:60,  isFeatured:false, isPopular:true,  rating:4.6, numReviews:29, totalBookings:54 },
      { name:'Plumbing Services',       slug:'plumbing-services',    category:'home-services',    img:IMG.plumb,    includes:['Leak detection','Pipe repair','Drain cleaning'],                   tags:['plumbing','pipe'],        priceRange:{min:199,max:999,unit:'starting'},  duration:60,  isFeatured:false, isPopular:false, rating:4.5, numReviews:21, totalBookings:43 },
      { name:'Pest Control',            slug:'pest-control',         category:'home-services',    img:IMG.pest,     includes:['All pests','Approved chemicals','3-month guarantee'],               tags:['pest'],                   priceRange:{min:799,max:2999,unit:'starting'}, duration:120, isFeatured:false, isPopular:false, rating:4.6, numReviews:18, totalBookings:31 },
      { name:'Home Painting',           slug:'home-painting',        category:'home-services',    img:IMG.paint,    includes:['Wall prep','Quality paint','Clean finish'],                         tags:['painting','interior'],    priceRange:{min:999,max:9999,unit:'starting'}, duration:480, isFeatured:false, isPopular:false, rating:4.5, numReviews:15, totalBookings:27 },
      { name:'Carpentry Services',      slug:'carpentry-services',   category:'home-services',    img:IMG.carpenter,includes:['Furniture repair','Custom work','All tools'],                       tags:['carpenter','furniture'],  priceRange:{min:299,max:1999,unit:'starting'}, duration:120, isFeatured:false, isPopular:false, rating:4.4, numReviews:12, totalBookings:22 },
      { name:'Laptop Repair',           slug:'laptop-repair',        category:'tech-services',    img:IMG.laptop,   includes:['Free diagnosis','Data backup','30-day warranty'],                  tags:['laptop'],                 priceRange:{min:499,max:2999,unit:'starting'}, duration:120, isFeatured:true,  isPopular:true,  rating:4.6, numReviews:33, totalBookings:57 },
      { name:'Mobile Phone Repair',     slug:'mobile-repair',        category:'tech-services',    img:IMG.mobile,   includes:['Genuine parts','Screen replacement','15-day warranty'],            tags:['mobile','screen'],        priceRange:{min:299,max:1999,unit:'starting'}, duration:60,  isFeatured:false, isPopular:true,  rating:4.5, numReviews:48, totalBookings:103 },
      { name:'WiFi & Network Setup',    slug:'wifi-setup',           category:'tech-services',    img:IMG.wifi,     includes:['Router config','Range optimization','Security setup'],              tags:['wifi','network'],         priceRange:{min:199,max:999,unit:'starting'},  duration:60,  isFeatured:false, isPopular:false, rating:4.4, numReviews:15, totalBookings:28 },
      { name:'CCTV Installation',       slug:'cctv-installation',    category:'tech-services',    img:IMG.cctv,     includes:['Camera mounting','DVR setup','Mobile app','1-year warranty'],      tags:['CCTV','security'],        priceRange:{min:999,max:4999,unit:'starting'}, duration:180, isFeatured:true,  isPopular:false, rating:4.7, numReviews:12, totalBookings:19 },
      { name:'Home Tuition',            slug:'home-tuition',         category:'education',        img:IMG.tuition,  includes:['All subjects','Study material','Doubt clearing'],                  tags:['tutor','education'],      priceRange:{min:300,max:800,unit:'hourly'},    duration:60,  isFeatured:true,  isPopular:true,  rating:4.9, numReviews:55, totalBookings:124 },
      { name:'Programming Classes',     slug:'programming-classes',  category:'education',        img:IMG.coding,   includes:['Live coding','Projects','Code review','Certificate'],              tags:['coding','programming'],   priceRange:{min:500,max:1500,unit:'hourly'},   duration:90,  isFeatured:true,  isPopular:false, rating:4.8, numReviews:24, totalBookings:46 },
      { name:'Spoken English Classes',  slug:'spoken-english',       category:'education',        img:IMG.english,  includes:['Pronunciation','Conversation','Grammar'],                           tags:['english'],                priceRange:{min:300,max:1000,unit:'hourly'},   duration:60,  isFeatured:false, isPopular:false, rating:4.7, numReviews:17, totalBookings:33 },
      { name:'Salon at Home',           slug:'salon-home',           category:'personal-care',    img:IMG.salon,    includes:['All tools','Premium products','Trained beautician'],                tags:['salon','beauty'],         priceRange:{min:299,max:1499,unit:'starting'}, duration:60,  isFeatured:true,  isPopular:true,  rating:4.7, numReviews:67, totalBookings:145 },
      { name:'Personal Fitness Trainer',slug:'fitness-trainer',      category:'personal-care',    img:IMG.fitness,  includes:['Fitness assessment','Custom plan','Diet consultation'],            tags:['fitness','trainer'],      priceRange:{min:500,max:2000,unit:'hourly'},   duration:60,  isFeatured:true,  isPopular:false, rating:4.8, numReviews:29, totalBookings:57 },
      { name:'Yoga Trainer at Home',    slug:'yoga-trainer',         category:'personal-care',    img:IMG.yoga,     includes:['All levels','Meditation','Breathing exercises'],                   tags:['yoga','meditation'],      priceRange:{min:300,max:1200,unit:'hourly'},   duration:60,  isFeatured:false, isPopular:false, rating:4.9, numReviews:22, totalBookings:39 },
      { name:'Car Wash & Detailing',    slug:'car-wash-detailing',   category:'vehicle-services', img:IMG.carwash,  includes:['Exterior wash','Interior cleaning','Dashboard polish'],            tags:['car','wash'],             priceRange:{min:199,max:599,unit:'starting'},  duration:90,  isFeatured:false, isPopular:true,  rating:4.6, numReviews:38, totalBookings:79 },
      { name:'Photography & Videography',slug:'photography',         category:'event-services',   img:IMG.photo,    includes:['HD photos','Video coverage','Online gallery','48hr delivery'],    tags:['photography','wedding'],  priceRange:{min:1999,max:9999,unit:'starting'}, duration:300, isFeatured:true,  isPopular:true,  rating:4.9, numReviews:44, totalBookings:57 },
      { name:'Event Decoration',        slug:'event-decoration',     category:'event-services',   img:IMG.decor,    includes:['Theme setup','Balloon decor','Flowers','Lighting'],                tags:['decoration','event'],     priceRange:{min:2999,max:15000,unit:'starting'},duration:240, isFeatured:false, isPopular:false, rating:4.7, numReviews:16, totalBookings:24 },
    ];

    const createdServices = await Service.insertMany(serviceList.map(s => ({
      name: s.name, slug: s.slug,
      category: catMap[s.category],
      description: `Professional ${s.name.toLowerCase()} service with experienced providers.`,
      shortDescription: s.name,
      priceRange: s.priceRange,
      duration: s.duration,
      includes: s.includes,
      timeSlots,
      tags: s.tags,
      images: [s.img],
      isFeatured: s.isFeatured,
      isPopular: s.isPopular,
      rating: s.rating,
      numReviews: s.numReviews,
      totalBookings: s.totalBookings,
      isActive: true,
    })));

    const sMap = {};
    createdServices.forEach(s => { sMap[s.slug] = s._id; });
    const slugList = serviceList.map(s => s.slug);
    const allServiceIds = slugList.map(slug => sMap[slug]);

    console.log(`✅ ${createdServices.length} Services created`);

    // Service → category mapping for providers
    const slugToCat = {};
    serviceList.forEach(s => { slugToCat[s.slug] = s.category; });

    // Build providers: for every city, create 1 provider per service (20 providers per city)
    const providerDocs = [];
    const ratings    = [4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.3, 4.5, 4.7, 4.6, 4.8, 4.5, 4.6, 4.7, 4.4, 4.8, 4.9, 4.5, 4.7, 4.6];
    const experiences= [3, 5, 7, 4, 8, 6, 9, 2, 5, 7, 4, 6, 8, 3, 5, 10, 4, 7, 6, 5];
    const trustScores= [82, 85, 88, 92, 90, 87, 94, 80, 86, 91, 84, 88, 92, 83, 87, 95, 89, 86, 90, 85];
    const jobsDone   = [28, 45, 67, 52, 88, 71, 103, 19, 55, 79, 43, 66, 92, 35, 58, 112, 48, 73, 82, 61];

    let emailIdx = 1;
    for (const city of CITIES) {
      for (let i = 0; i < slugList.length; i++) {
        const slug = slugList[i];
        const names = PROVIDER_NAMES[slug];
        const cityIdx = CITIES.indexOf(city);
        const name = names[cityIdx];                    // unique name per city per service
        const catSlug = slugToCat[slug];
        const completed = Math.floor(jobsDone[i] * 0.92);

        providerDocs.push({
          name,
          email: `provider${emailIdx}@servease.com`,   // unique email
          phone: `98${String(1000000 + emailIdx).slice(1)}`, // unique 10-digit phone
          password: 'provider123',                     // will be hashed below before insertMany
          bio: `Expert ${serviceList[i].name} provider in ${city} with ${experiences[i]} years of experience.`,
          experience: experiences[i],
          skills: serviceList[i].tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)),
          categories: [catMap[catSlug]],
          services: [sMap[slug]],                       // ONLY their own service
          city,
          trustScore: trustScores[i],
          rating: ratings[i],
          numReviews: Math.floor(jobsDone[i] * 0.4),
          totalJobs: jobsDone[i],
          completedJobs: completed,
          cancelledJobs: jobsDone[i] - completed,
          isStudent: false,
          isVerified: trustScores[i] >= 88,
          isFeatured: trustScores[i] >= 92,
          availabilityStatus: i % 5 === 3 ? 'busy' : 'online',
          availableFrom: '08:00',
          availableTo: '20:00',
          availableDays: ['Mon','Tue','Wed','Thu','Fri','Sat'],
          priceMultiplier: 1.0,
          isActive: true,
        });
        emailIdx++;
      }
    }

    // Hash passwords before insertMany (insertMany bypasses Mongoose pre-save hooks)
    const hashedPassword = await bcrypt.hash('provider123', 10);
    const hashedDocs = providerDocs.map(p => ({ ...p, password: hashedPassword }));
    await Provider.insertMany(hashedDocs);
    console.log(`✅ ${providerDocs.length} Providers created (${CITIES.length} cities × ${slugList.length} services = ${providerDocs.length})`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Admin:    admin@servease.com  / admin123');
    console.log('📧 User:     rahul@example.com   / password123');
    console.log('📧 Provider: provider1@servease.com / provider123');
    console.log(`📍 ${CITIES.length} cities × ${slugList.length} services = ${providerDocs.length} providers total`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (e) {
    console.error('❌ Seeding error:', e.message);
    process.exit(1);
  }
}

seed();
