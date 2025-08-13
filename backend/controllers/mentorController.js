import mentorModel from '../models/mentorModel.js';
import userModel from '../models/userModel.js';

const mentorDashboard = (req, res) => {
    res.json({ message: "Welcome to the Mentor Dashboard", user: req.user });
  };
  
// Get session types for the logged-in mentor
const getSessionTypes = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const mentor = await mentorModel.findOne({ userId: mentorId });
    
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor profile not found' });
    }
    
    res.status(200).json({
      message: 'Session types retrieved successfully',
      sessionTypes: mentor.sessionTypes || []
    });
  } catch (error) {
    console.error('Error fetching session types:', error);
    res.status(500).json({ message: 'Error fetching session types' });
  }
};

// Update session types for the logged-in mentor
const updateSessionTypes = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { sessionTypes } = req.body;
    
    if (!Array.isArray(sessionTypes)) {
      return res.status(400).json({ message: 'Session types must be an array' });
    }
    
    // Validate session types
    for (const sessionType of sessionTypes) {
      if (!sessionType.name || sessionType.duration <= 0 || sessionType.price < 0) {
        return res.status(400).json({ 
          message: 'Invalid session type. Each session type must have a name, positive duration, and non-negative price.' 
        });
      }
    }
    
    const mentor = await mentorModel.findOne({ userId: mentorId });
    
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor profile not found' });
    }
    
    // Update session types
    mentor.sessionTypes = sessionTypes;
    await mentor.save();
    
    res.status(200).json({
      message: 'Session types updated successfully',
      sessionTypes: mentor.sessionTypes
    });
  } catch (error) {
    console.error('Error updating session types:', error);
    res.status(500).json({ message: 'Error updating session types' });
  }
};

// Add a single session type
const addSessionType = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { sessionType } = req.body;
    
    // Validate session type
    if (!sessionType || !sessionType.name || sessionType.duration <= 0 || sessionType.price < 0) {
      return res.status(400).json({ 
        message: 'Invalid session type. Session type must have a name, positive duration, and non-negative price.' 
      });
    }
    
    const mentor = await mentorModel.findOne({ userId: mentorId });
    
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor profile not found' });
    }
    
    // Create a new session type with MongoDB ObjectId
    const newSessionType = {
      ...sessionType,
      _id: new mongoose.Types.ObjectId()
    };
    
    // Add to session types array
    mentor.sessionTypes.push(newSessionType);
    await mentor.save();
    
    res.status(201).json({
      message: 'Session type added successfully',
      sessionType: newSessionType
    });
  } catch (error) {
    console.error('Error adding session type:', error);
    res.status(500).json({ message: 'Error adding session type' });
  }
};

// Update a specific session type
const updateSessionType = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { id } = req.params;
    const { sessionType } = req.body;
    
    // Validate session type
    if (!sessionType || !sessionType.name || sessionType.duration <= 0 || sessionType.price < 0) {
      return res.status(400).json({ 
        message: 'Invalid session type. Session type must have a name, positive duration, and non-negative price.' 
      });
    }
    
    const mentor = await mentorModel.findOne({ userId: mentorId });
    
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor profile not found' });
    }
    
    // Find the session type to update
    const sessionTypeIndex = mentor.sessionTypes.findIndex(
      type => type._id.toString() === id
    );
    
    if (sessionTypeIndex === -1) {
      return res.status(404).json({ message: 'Session type not found' });
    }
    
    // Update the session type
    mentor.sessionTypes[sessionTypeIndex] = {
      ...sessionType,
      _id: mentor.sessionTypes[sessionTypeIndex]._id // Preserve the original _id
    };
    
    await mentor.save();
    
    res.status(200).json({
      message: 'Session type updated successfully',
      sessionType: mentor.sessionTypes[sessionTypeIndex]
    });
  } catch (error) {
    console.error('Error updating session type:', error);
    res.status(500).json({ message: 'Error updating session type' });
  }
};

// Get all public mentors for the mentorship page
const getAllPublicMentors = async (req, res) => {
  try {
    // Find all mentors whose userId points to a verified user
    const mentors = await mentorModel.find({})
      .populate({
        path: 'userId',
        select: 'email isVerified',
        match: { isVerified: true } // Only get verified mentors
      })
      .select('-__v');
    
    // Filter out mentors where userId is null (user not found or not verified)
    const verifiedMentors = mentors.filter(m => m.userId);
    
    // Map mentors to the format expected by the frontend
    const mappedMentors = verifiedMentors.map(mentor => ({
      id: mentor._id,
      name: `${mentor.firstname || ''} ${mentor.lastname || ''}`.trim() || 'Mentor',
      title: mentor.expertise && mentor.expertise.length > 0 ? mentor.expertise[0] : 'Mentor',
      company: mentor.company || 'LevelUP',
      image: mentor.profileImage || '/placeholder.svg?height=120&width=120',
      description: mentor.bio || `Experienced mentor specializing in ${mentor.expertise?.join(', ') || 'various fields'}.`,
      skills: mentor.expertise || [],
      experience: mentor.experience || '3+ years',
      rating: 4.8, // Default rating
      reviewCount: Math.floor(Math.random() * 100) + 10, // Random review count for demo
      pricePerMonth: 3000, // Default price
      category: mentor.expertise || [],
      isQuickResponder: Math.random() > 0.5, // Random quick responder status
      location: mentor.location,
      languages: mentor.languages,
      about: mentor.about
    }));

    res.status(200).json({
      message: 'Mentors fetched successfully',
      mentors: mappedMentors
    });
  } catch (error) {
    console.error('Error fetching public mentors:', error);
    res.status(500).json({ message: 'Error fetching mentors' });
  }
};

// Get a specific mentor by ID for the mentorship detail page
const getMentorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the mentor by ID and populate user data
    const mentor = await mentorModel.findById(id)
      .populate({
        path: 'userId',
        select: 'email isVerified',
      })
      .select('-__v');
    
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    // Map mentor to the format expected by the frontend
    const mappedMentor = {
      id: mentor._id,
      name: `${mentor.firstname || ''} ${mentor.lastname || ''}`.trim() || 'Mentor',
      email: mentor.userId?.email || '',
      phone: mentor.phone || '',
      location: mentor.location || 'Remote',
      avatar: mentor.profileImage || '/placeholder.svg?height=120&width=120',
      bio: mentor.bio || `Experienced mentor specializing in ${mentor.expertise?.join(', ') || 'various fields'}.`,
      expertise: mentor.expertise || [],
      experience: mentor.experience || '3+ years',
      education: mentor.education || 'Not specified',
      rating: 4.8, // Default rating
      totalSessions: Math.floor(Math.random() * 100) + 20, // Random session count for demo
      totalMentees: Math.floor(Math.random() * 20) + 5, // Random mentee count for demo
      joinedDate: mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2024',
      availability: mentor.availability || ['Monday 9:00-17:00', 'Wednesday 9:00-17:00', 'Friday 9:00-15:00'],
      certifications: mentor.certifications || ['Professional Certification'],
      title: mentor.title || (mentor.expertise && mentor.expertise.length > 0 ? mentor.expertise[0] + ' Specialist' : 'Mentor'),
      company: mentor.company || 'LevelUP',
      skills: mentor.skills || mentor.expertise || [],
      reviewCount: Math.floor(Math.random() * 100) + 10, // Random review count for demo
      pricePerMonth: mentor.pricePerMonth || 3000, // Default price
      isQuickResponder: Math.random() > 0.5, // Random quick responder status
      languages: mentor.languages || ['English'],
      about: mentor.about || mentor.bio || `Experienced mentor specializing in ${mentor.expertise?.join(', ') || 'various fields'}.`,
      // Include active session types
      sessionTypes: mentor.sessionTypes?.filter(type => type.isActive) || [
        {
          name: 'Free Introduction',
          description: 'A short 15-minute session to get to know each other and discuss potential mentorship',
          duration: 15,
          price: 0
        },
        {
          name: 'Expert Session',
          description: 'A comprehensive 60-minute session focused on specific topics or challenges',
          duration: 60,
          price: 2000
        }
      ]
    };

    res.status(200).json({
      message: 'Mentor fetched successfully',
      mentor: mappedMentor
    });
  } catch (error) {
    console.error('Error fetching mentor by ID:', error);
    res.status(500).json({ message: 'Error fetching mentor details' });
  }
};

// Schedule a session with a mentor
const scheduleSession = async (req, res) => {
  try {
    const { mentorId, date, time, sessionType, message } = req.body;
    const studentId = req.user.id; // Assuming this comes from auth middleware
    
    // Find the mentor
    const mentor = await mentorModel.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    // Create a new session
    const sessionData = {
      studentId,
      date: new Date(`${date}T${time}`),
      sessionType,
      notes: message || '',
      status: 'pending' // pending, confirmed, completed, cancelled
    };
    
    // Add session to mentor's sessions array
    mentor.sessions.push(sessionData);
    await mentor.save();
    
    res.status(201).json({
      message: 'Session scheduled successfully',
      session: {
        id: mentor.sessions[mentor.sessions.length - 1]._id,
        mentorId,
        mentorName: `${mentor.firstname || ''} ${mentor.lastname || ''}`.trim(),
        date: sessionData.date,
        sessionType,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error scheduling session:', error);
    res.status(500).json({ message: 'Error scheduling session' });
  }
};
  
export { 
  mentorDashboard, 
  getAllPublicMentors, 
  getMentorById, 
  scheduleSession,
  getSessionTypes,
  updateSessionTypes,
  addSessionType,
  updateSessionType
};