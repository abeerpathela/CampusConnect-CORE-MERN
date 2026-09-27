const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env
dotenv.config();

// Load models
const User = require('./models/User');
const Club = require('./models/Club');
const Event = require('./models/Event');
const Announcement = require('./models/Announcement');
const Registration = require('./models/Registration');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusconnect';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Club.deleteMany();
    await Event.deleteMany();
    await Announcement.deleteMany();
    await Registration.deleteMany();
    console.log('🧹 Cleaned existing database collections...');

    // 1. Create Default Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'Dr. Rajesh Verma',
      email: 'admin@chitkara.edu.in',
      password: hashedPassword,
      role: 'admin',
      rollNo: 'FAC-DSA-001',
      department: 'Dean of Student Affairs',
      semester: 'Faculty',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      joinedClubs: [],
      registeredEvents: [],
    });

    const studentUser = await User.create({
      name: 'Aarav Sharma',
      email: 'student@chitkara.edu.in',
      password: hashedPassword,
      role: 'student',
      rollNo: '2310990001',
      department: 'Computer Science & Engineering',
      semester: '4th Semester',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      joinedClubs: [],
      registeredEvents: [],
    });

    const studentUser2 = await User.create({
      name: 'Rhea Kapoor',
      email: 'rhea.kapoor@chitkara.edu.in',
      password: hashedPassword,
      role: 'student',
      rollNo: '2310990045',
      department: 'Computer Science & Engineering',
      semester: '4th Semester',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      joinedClubs: [],
      registeredEvents: [],
    });

    console.log('👤 Created default users (Admin: admin@chitkara.edu.in, Student: student@chitkara.edu.in - Password: password123)');

    // 2. Create Clubs
    const clubsData = [
      {
        slug: 'ignite',
        name: 'Ignite',
        category: 'Hostel Committee',
        tagline: 'Hostel Committee — building community, comfort, and campus life for residents.',
        description: 'Ignite is the official Hostel Committee of Chitkara University. We organize hostel festivals, indoor tournaments, movie nights, festival celebrations, and work closely with the administration to address student welfare and residential concerns.',
        leadCoordinator: 'Ananya Gupta (Lead)',
        facultyAdvisor: 'Dr. Meena Sood',
        email: 'ignite.hostel@chitkara.edu.in',
        foundedYear: 2018,
        membersCount: 420,
        bannerImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80',
        logo: '🏠',
        tags: ['HostelLife', 'Community', 'Residential', 'Festivals'],
        meetingSchedule: 'Every Friday, 6:00 PM - Hostel Common Hall',
        socialLinks: { instagram: 'https://instagram.com' },
        featured: true,
      },
      {
        slug: 'chromatic',
        name: 'Chromatic',
        category: 'Art and Craft',
        tagline: 'Art and Craft Club — colors, creativity, and canvas come together.',
        description: 'Chromatic nurtures the artistic spirit on campus through sketching sessions, canvas painting workshops, origami meets, poster-making competitions, craft exhibitions, and live collaborative murals across university walls.',
        leadCoordinator: 'Mehak Verma',
        facultyAdvisor: 'Prof. Rashmi Khanna',
        email: 'chromatic.arts@chitkara.edu.in',
        foundedYear: 2019,
        membersCount: 168,
        bannerImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80',
        logo: '🎨',
        tags: ['Painting', 'Sketching', 'Craft', 'Exhibitions'],
        meetingSchedule: 'Every Wednesday, 4:00 PM - Fine Arts Studio',
        socialLinks: { instagram: 'https://instagram.com' },
        featured: true,
      },
      {
        slug: 'nexora',
        name: 'Nexora',
        category: 'Entrepreneurship',
        tagline: 'Entrepreneurship Cell — from campus ideas to viable startups.',
        description: 'Nexora is the university Entrepreneurship Cell. We run startup pitch nights, B-plan competitions, founder talks, incubation office hours, E-Summit annually, and connect students with mentors and seed-funding networks.',
        leadCoordinator: 'Raghav Chhabra',
        facultyAdvisor: 'Dr. S.K. Batra',
        email: 'nexora.ecell@chitkara.edu.in',
        foundedYear: 2020,
        membersCount: 195,
        bannerImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=80',
        logo: '🚀',
        tags: ['Startup', 'Pitch', 'Funding', 'Mentorship'],
        meetingSchedule: 'Every Tuesday, 5:00 PM - Incubation Center',
        socialLinks: { linkedin: 'https://linkedin.com', instagram: 'https://instagram.com' },
        featured: true,
      },
      {
        slug: 'techitkara',
        name: 'TeChitkara',
        category: 'Technical',
        tagline: 'Premier Coding & Technical Innovation Club.',
        description: 'TeChitkara is the flagship technical student community organizing hackathons, open-source sprints, algorithmic coding contests, and developer bootcamps.',
        leadCoordinator: 'Arnav Singhal',
        facultyAdvisor: 'Dr. Neeraj Kumar',
        email: 'techitkara.club@chitkara.edu.in',
        foundedYear: 2017,
        membersCount: 512,
        bannerImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
        logo: '💻',
        tags: ['Coding', 'Hackathons', 'WebDev', 'AI/ML'],
        meetingSchedule: 'Every Saturday, 3:00 PM - CS Lab 4',
        socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
        featured: true,
      },
      {
        slug: 'madian',
        name: 'Madian',
        category: 'Sports',
        tagline: 'University Sports & Athletics Council — Grit, Glory, Gold.',
        description: 'Madian manages inter-hostel leagues, state varsity tournaments, football fixtures, basketball face-offs, athletics meets, and daily fitness drills.',
        leadCoordinator: 'Kabir Dhillon',
        facultyAdvisor: 'Coach Gurdeep Singh',
        email: 'madian.sports@chitkara.edu.in',
        foundedYear: 2016,
        membersCount: 340,
        bannerImage: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&auto=format&fit=crop&q=80',
        logo: '🏆',
        tags: ['Football', 'Basketball', 'Athletics', 'Tournaments'],
        meetingSchedule: 'Every Day, 5:30 PM - Sports Complex',
        socialLinks: { instagram: 'https://instagram.com' },
        featured: false,
      },
    ];

    const createdClubs = await Club.insertMany(clubsData);
    console.log(`🏰 Seeded ${createdClubs.length} clubs`);

    // Map clubs by slug for easy lookup
    const clubMap = {};
    createdClubs.forEach((c) => {
      clubMap[c.slug] = c;
    });

    // 3. Create Events
    const eventsData = [
      {
        title: 'TechNexus 2026: 36-Hour National Hackathon',
        clubId: clubMap['techitkara']._id,
        clubName: clubMap['techitkara'].name,
        category: 'Technical',
        shortDescription: '36-hour non-stop codeathon with 10 lakh prize pool, VC mentors, and fast-track hiring rounds.',
        description: 'TechNexus is the flagship national hackathon bringing together 800+ developers, designers, and innovators across India. Tracks include GenAI, Web3, FinTech, and IoT.',
        date: '2026-10-12',
        endDate: '2026-10-14',
        time: '09:00 AM',
        venue: 'Turing Innovation Lab & Central Auditorium',
        capacity: 250,
        registeredCount: 0,
        bannerImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
        fee: 'Free',
        isRegistrationOpen: true,
        tags: ['Hackathon', 'AI', 'Coding', 'Prizes'],
        requirements: ['Laptop', 'Student ID Card', 'Team of 2-4 members'],
        speaker: 'Satya Nadella (Keynote Virtual)',
      },
      {
        title: 'Spardha: Inter-Department Futsal Champions Trophy',
        clubId: clubMap['madian']._id,
        clubName: clubMap['madian'].name,
        category: 'Sports',
        shortDescription: '16 department teams clash under floodlights for the coveted Inter-Department Futsal Cup.',
        description: 'Spardha Futsal Championship features fast-paced 5v5 action over 4 nights. Refreshments, live commentary, rolling subs, and gold-plated trophy for champions.',
        date: '2026-10-18',
        endDate: '2026-10-21',
        time: '06:00 PM',
        venue: 'Floodlit AstroTurf Arena',
        capacity: 60,
        registeredCount: 0,
        bannerImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
        fee: 'Free',
        isRegistrationOpen: true,
        tags: ['Futsal', 'Football', 'Championship'],
        requirements: ['Sports kit', 'Studs/Turf shoes'],
        speaker: 'Coach Gurdeep Singh',
      },
      {
        title: 'Canvas & Coffee: Live Oil & Acrylic Painting Workshop',
        clubId: clubMap['chromatic']._id,
        clubName: clubMap['chromatic'].name,
        category: 'Cultural',
        shortDescription: 'Guided live canvas painting session with premium supplies, artisan coffee, and take-home artwork.',
        description: 'Immerse yourself in 3 hours of therapeutic painting guided by master artist Prof. Khanna. Canvas, easel, acrylic paints, and freshly brewed cappuccino provided.',
        date: '2026-10-05',
        endDate: '2026-10-05',
        time: '03:00 PM',
        venue: 'Fine Arts Studio Block 3',
        capacity: 35,
        registeredCount: 0,
        bannerImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80',
        fee: 'Free',
        isRegistrationOpen: true,
        tags: ['Art', 'Painting', 'Workshop'],
        requirements: ['No prior painting experience needed'],
        speaker: 'Prof. Rashmi Khanna',
      },
      {
        title: 'E-Summit 2026: Pitch Tank & Angel Investor Connect',
        clubId: clubMap['nexora']._id,
        clubName: clubMap['nexora'].name,
        category: 'Entrepreneurship',
        shortDescription: 'Pitch your startup directly to angel investors, seed funds, and startup ecosystem leaders.',
        description: 'Nexora presents the annual E-Summit featuring 15 shortlisted campus startups pitching for seed grants up to 50 Lakh INR.',
        date: '2026-10-25',
        endDate: '2026-10-26',
        time: '10:00 AM',
        venue: 'Incubation Center Main Auditorium',
        capacity: 150,
        registeredCount: 0,
        bannerImage: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&auto=format&fit=crop&q=80',
        fee: 'Free',
        isRegistrationOpen: true,
        tags: ['Startup', 'Pitch', 'Funding', 'VC'],
        requirements: ['Pitch Deck (PDF)'],
        speaker: 'Dr. S.K. Batra & Guest Angels',
      },
    ];

    const createdEvents = await Event.insertMany(eventsData);
    console.log(`📅 Seeded ${createdEvents.length} events`);

    // 4. Create Announcements
    const announcementsData = [
      {
        title: 'TechNexus 2026 Hackathon Shortlist Announcement & Team Confirmation',
        content: 'All shortlisted teams for the TechNexus Hackathon must confirm their physical presence by October 8th at 5:00 PM on the portal. Bring student IDs for badge collection at Turing Block.',
        priority: 'Urgent',
        author: 'TeChitkara Core Committee',
        targetAudience: 'All Registered Participants',
        isPinned: true,
      },
      {
        title: 'Call for Trials: Madian Spardha Inter-University Sports League',
        content: 'Trials for university teams in Basketball, Football, Volleyball, and Badminton commence this Monday at 6:00 AM at the Indoor Sports Complex.',
        priority: 'Event Alert',
        author: 'Madian Sports Council',
        targetAudience: 'Athletes & Sports Enthusiasts',
        isPinned: false,
      },
      {
        title: 'Annual Central Club Recruitment Fair 2026 - Orientation Schedule',
        content: 'The Central Club Orientation Fair will take place at the Central Plaza. First-year and second-year students are encouraged to visit club booths.',
        priority: 'General',
        author: 'Dean of Student Affairs',
        targetAudience: 'All Students',
        isPinned: true,
      },
      {
        title: 'Place Era Aptitude Bootcamp Series - Enrollment Open',
        content: 'Place Era announces the 4-week intensive Aptitude & Interview Bootcamp for pre-final & final year students. Limited seats available.',
        priority: 'Academic',
        author: 'Dean of Student Affairs',
        targetAudience: 'Final & Pre-Final Year Students',
        isPinned: false,
      },
    ];

    const createdAnnouncements = await Announcement.insertMany(announcementsData);
    console.log(`📢 Seeded ${createdAnnouncements.length} announcements`);

    // 5. Create Initial Event Registrations
    const firstEvent = createdEvents[0];
    const secondEvent = createdEvents[1];

    const reg1 = await Registration.create({
      ticketNumber: 'CC-TECH-9041',
      eventId: firstEvent._id,
      eventTitle: firstEvent.title,
      eventDate: firstEvent.date,
      eventTime: firstEvent.time,
      eventVenue: firstEvent.venue,
      userId: studentUser._id,
      studentName: studentUser.name,
      studentEmail: studentUser.email,
      rollNo: studentUser.rollNo,
      department: studentUser.department,
      status: 'Confirmed',
      qrCodeData: `CAMPUSCONNECT-TICKET-CC-TECH-9041-${studentUser.name.toUpperCase().replace(/\s+/g, '-')}`,
    });

    const reg2 = await Registration.create({
      ticketNumber: 'CC-SPOR-4412',
      eventId: secondEvent._id,
      eventTitle: secondEvent.title,
      eventDate: secondEvent.date,
      eventTime: secondEvent.time,
      eventVenue: secondEvent.venue,
      userId: studentUser._id,
      studentName: studentUser.name,
      studentEmail: studentUser.email,
      rollNo: studentUser.rollNo,
      department: studentUser.department,
      status: 'Confirmed',
      qrCodeData: `CAMPUSCONNECT-TICKET-CC-SPOR-4412-${studentUser.name.toUpperCase().replace(/\s+/g, '-')}`,
    });

    // Update event registration counters and user references
    firstEvent.registeredCount = 1;
    await firstEvent.save();
    secondEvent.registeredCount = 1;
    await secondEvent.save();

    studentUser.joinedClubs = [clubMap['techitkara']._id, clubMap['madian']._id];
    studentUser.registeredEvents = [firstEvent._id, secondEvent._id];
    await studentUser.save();

    console.log('🎟️ Seeded initial event registrations and user relations');
    console.log('✨ Data Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
