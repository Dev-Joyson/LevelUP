import mentorModel from '../models/mentorModel.js';
import userModel from '../models/userModel.js';
import sessionModel from '../models/sessionModel.js';
import studentModel from '../models/studentModel.js';
import mongoose from 'mongoose';

const mentorDashboard = (req, res) => {
    res.json({ message: "Welcome to the Mentor Dashboard", user: req.user });
  };
  
// Get session types for the logged-in mentor
const getSessionTypes = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    let mentor = await mentorModel.findOne({ userId: mentorId });
    
    // If no mentor profile exists, create one with default session types
    if (!mentor) {
      console.log(`Creating new mentor profile for user: ${mentorId}`);
      mentor = new mentorModel({
        userId: mentorId,
        firstname: 'Mentor',
        lastname: 'User',
        expertise: ['General Mentoring'],
        availability: [],
        // Default session types will be added from the model schema
      });
      await mentor.save();
      console.log('New mentor profile created successfully');
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
    const mentorId = req.user.userId;
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
    
    let mentor = await mentorModel.findOne({ userId: mentorId });
    
    // If no mentor profile exists, create one
    if (!mentor) {
      console.log(`Creating new mentor profile for user: ${mentorId}`);
      mentor = new mentorModel({
        userId: mentorId,
        firstname: 'Mentor',
        lastname: 'User',
        expertise: ['General Mentoring'],
        availability: [],
      });
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
    const mentorId = req.user.userId;
    const { sessionType } = req.body;
    
    // Validate session type
    if (!sessionType || !sessionType.name || sessionType.duration <= 0 || sessionType.price < 0) {
      return res.status(400).json({ 
        message: 'Invalid session type. Session type must have a name, positive duration, and non-negative price.' 
      });
    }
    
    let mentor = await mentorModel.findOne({ userId: mentorId });
    
    // If no mentor profile exists, create one
    if (!mentor) {
      console.log(`Creating new mentor profile for user: ${mentorId}`);
      mentor = new mentorModel({
        userId: mentorId,
        firstname: 'Mentor',
        lastname: 'User',
        expertise: ['General Mentoring'],
        availability: [],
      });
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
    const mentorId = req.user.userId;
    const { id } = req.params;
    const { sessionType } = req.body;
    
    // Validate session type
    if (!sessionType || !sessionType.name || sessionType.duration <= 0 || sessionType.price < 0) {
      return res.status(400).json({ 
        message: 'Invalid session type. Session type must have a name, positive duration, and non-negative price.' 
      });
    }
    
    let mentor = await mentorModel.findOne({ userId: mentorId });
    
    // If no mentor profile exists, create one
    if (!mentor) {
      console.log(`Creating new mentor profile for user: ${mentorId}`);
      mentor = new mentorModel({
        userId: mentorId,
        firstname: 'Mentor',
        lastname: 'User',
        expertise: ['General Mentoring'],
        availability: [],
      });
      await mentor.save();
      return res.status(404).json({ message: 'Session type not found in new profile' });
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

// Test endpoint to check mentor data
// Get current logged-in mentor's complete profile (same format as public API)
const getCurrentMentorProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find mentor by userId and populate user data
    const mentor = await mentorModel.findOne({ userId })
      .populate({
        path: 'userId',
        select: 'email isVerified',
      })
      .select('-__v');
    
    if (!mentor) {
      // Create mentor profile if it doesn't exist
      console.log(`Creating new mentor profile for user: ${userId}`);
      const newMentor = new mentorModel({
        userId: userId,
        firstname: 'Mentor',
        lastname: 'User',
        expertise: ['General Mentoring'],
        availability: [],
      });
      await newMentor.save();
      
      // Fetch the newly created mentor with populated data
      const createdMentor = await mentorModel.findOne({ userId })
        .populate({
          path: 'userId',
          select: 'email isVerified',
        })
        .select('-__v');
        
      return res.status(200).json(formatMentorProfile(createdMentor));
    }
    
    res.status(200).json(formatMentorProfile(mentor));
  } catch (error) {
    console.error('Error fetching current mentor profile:', error);
    res.status(500).json({ message: 'Error fetching mentor profile' });
  }
};

// Helper function to format mentor profile (same as getMentorById)
const formatMentorProfile = (mentor) => {
  return {
    id: mentor._id,
    name: `${mentor.firstname || ''} ${mentor.lastname || ''}`.trim() || 'Mentor',
    title: mentor.title || (mentor.expertise && mentor.expertise.length > 0 ? mentor.expertise[0] + ' Specialist' : 'Mentor'),
    company: mentor.company || 'LevelUP',
    image: mentor.profileImage || '/placeholder.svg?height=120&width=120',
    description: mentor.bio || `Experienced mentor specializing in ${mentor.expertise?.join(', ') || 'various fields'}.`,
    skills: mentor.skills?.length > 0 ? mentor.skills : mentor.expertise || [],
    experience: mentor.experience || '3+ years',
    rating: mentor.rating || 4.8,
    reviewCount: mentor.reviewCount || 0,
    pricePerMonth: mentor.pricePerMonth || 3000,
    category: mentor.expertise || [],
    isQuickResponder: mentor.isQuickResponder || false,
    location: mentor.location || 'Remote',
    languages: mentor.languages || ['English'],
    about: mentor.about || mentor.bio || `Experienced mentor specializing in ${mentor.expertise?.join(', ') || 'various fields'}.`,
    
    // Additional fields for detailed view
    email: mentor.userId?.email || '',
    phone: mentor.phone || '',
    avatar: mentor.profileImage || '/placeholder.svg?height=120&width=120',
    bio: mentor.bio || `Experienced mentor specializing in ${mentor.expertise?.join(', ') || 'various fields'}.`,
    expertise: mentor.expertise || [],
    education: mentor.education || 'Not specified',
    totalSessions: mentor.totalSessions || 0,
    totalMentees: mentor.totalMentees || 0,
    joinedDate: mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2024',
    availability: mentor.availability || [],
    certifications: mentor.certifications || [],
    sessionTypes: mentor.sessionTypes || [],
    
    // For navbar display
    firstname: mentor.firstname || 'Mentor',
    lastname: mentor.lastname || 'User'
  };
};

const testMentorData = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    
    const mentor = await mentorModel.findOne({ userId: mentorId });
    
    res.status(200).json({
      message: 'Mentor test data',
      mentorId,
      mentor: mentor ? {
        _id: mentor._id,
        firstname: mentor.firstname,
        lastname: mentor.lastname,
        availability: mentor.availability,
        availabilityCount: mentor.availability ? mentor.availability.length : 0
      } : null
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ message: 'Error in test endpoint' });
  }
};

// Save mentor availability 
const saveMentorAvailability = async (req, res) => {
  try {
    const mentorId = req.user.userId;
    const { schedule } = req.body;
    
    if (!Array.isArray(schedule)) {
      return res.status(400).json({ message: 'Schedule must be an array' });
    }
    
    let mentor = await mentorModel.findOne({ userId: mentorId });
    
    // If no mentor profile exists, create one
    if (!mentor) {
      console.log(`Creating new mentor profile for user: ${mentorId}`);
      mentor = new mentorModel({
        userId: mentorId,
        firstname: 'Mentor',
        lastname: 'User',
        expertise: ['General Mentoring'],
        availability: [],
      });
    }
    
    // Convert schedule to availability format
    const availability = schedule.map(item => JSON.stringify(item));
    mentor.availability = availability;
    await mentor.save();
    
    res.status(200).json({
      message: 'Availability saved successfully',
      availability: mentor.availability
    });
  } catch (error) {
    console.error('Error saving mentor availability:', error);
    res.status(500).json({ message: 'Error saving mentor availability' });
  }
};

// Get mentor availability for booking
const getMentorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("🔍 FETCHING AVAILABILITY FOR MENTOR ID:", id);
    
    const mentor = await mentorModel.findById(id)
      .populate({
        path: 'userId',
        select: 'isVerified',
      })
      .select('availability firstname lastname');
    
    if (!mentor) {
      console.log("❌ MENTOR NOT FOUND");
      return res.status(404).json({ message: 'Mentor not found' });
    }
    
    console.log("📅 RAW MENTOR AVAILABILITY:", mentor.availability);
    console.log("📅 AVAILABILITY TYPE:", typeof mentor.availability);
    console.log("📅 AVAILABILITY LENGTH:", mentor.availability ? mentor.availability.length : 0);
    
    // Convert mentor availability to the format expected by frontend
    const availability = {
      mentorId: mentor._id,
      weeklySchedule: {
        monday: { isAvailable: false, timeSlots: [] },
        tuesday: { isAvailable: false, timeSlots: [] },
        wednesday: { isAvailable: false, timeSlots: [] },
        thursday: { isAvailable: false, timeSlots: [] },
        friday: { isAvailable: false, timeSlots: [] },
        saturday: { isAvailable: false, timeSlots: [] },
        sunday: { isAvailable: false, timeSlots: [] }
      },
      dateOverrides: [],
      sessionDurations: [15, 30, 60],
      bufferBetweenSessions: 15,
      advanceBookingLimit: 30,
      timezone: "Asia/Colombo"
    };
    
    // Parse availability from mentor data
    // Handle both date-specific format (from SimpleScheduler) and day-of-week format
    if (mentor.availability && mentor.availability.length > 0) {
      console.log("🔄 PARSING AVAILABILITY SLOTS...");
      
      mentor.availability.forEach((slot, index) => {
        console.log(`📝 PROCESSING SLOT ${index}:`, slot);
        
        try {
          // Try parsing as JSON (date-specific format from SimpleScheduler)
          const scheduleItem = JSON.parse(slot);
          console.log("✅ PARSED AS JSON:", scheduleItem);
          
          if (scheduleItem.date && scheduleItem.timeSlots) {
            // FOR DATE-SPECIFIC SCHEDULES: Add as dateOverrides instead of converting to weekly
            console.log(`📅 ADDING DATE-SPECIFIC OVERRIDE: ${scheduleItem.date}`);
            console.log("⏰ TIME SLOTS:", scheduleItem.timeSlots);
            
            if (scheduleItem.timeSlots.length > 0) {
              availability.dateOverrides.push({
                date: scheduleItem.date,
                isAvailable: true,
                timeSlots: scheduleItem.timeSlots.map(ts => ({
                  startTime: ts.startTime,
                  endTime: ts.endTime,
                  isAvailable: true
                }))
              });
              console.log(`✅ ADDED DATE OVERRIDE FOR ${scheduleItem.date}`);
            }
          } else {
            console.log("❌ MISSING date OR timeSlots in schedule item");
          }
        } catch (e) {
          console.log("❌ JSON PARSE FAILED, TRYING OLD FORMAT:", e.message);
          
          // Fallback to old format: "Monday 09:00-17:00" - these go to weekly schedule
          const parts = slot.split(' ');
          console.log("📝 PARTS:", parts);
          
          if (parts.length >= 2) {
            const dayName = parts[0].toLowerCase();
            const timeRange = parts[1];
            
            console.log(`📅 OLD FORMAT - DAY: ${dayName}, TIME: ${timeRange}`);
            
            if (availability.weeklySchedule[dayName] && timeRange.includes('-')) {
              const [startTime, endTime] = timeRange.split('-');
              availability.weeklySchedule[dayName] = {
                isAvailable: true,
                timeSlots: [{ startTime, endTime, isAvailable: true }]
              };
              console.log(`✅ UPDATED ${dayName.toUpperCase()} (OLD FORMAT):`, availability.weeklySchedule[dayName]);
            }
          }
        }
      });
    } else {
      console.log("❌ NO AVAILABILITY DATA TO PARSE - mentor.availability is empty or null");
    }
    
    console.log("✅ FINAL AVAILABILITY OBJECT:");
    console.log("   - Date Overrides:", availability.dateOverrides.length);
    console.log("   - Weekly Schedule Days:", Object.keys(availability.weeklySchedule).filter(day => availability.weeklySchedule[day].isAvailable).length);
    
    res.status(200).json({
      message: 'Mentor availability retrieved successfully',
      availability
    });
  } catch (error) {
    console.error('Error fetching mentor availability:', error);
    res.status(500).json({ message: 'Error fetching mentor availability' });
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
      title: mentor.title || (mentor.expertise && mentor.expertise.length > 0 ? mentor.expertise[0] + ' Specialist' : 'Mentor'),
      company: mentor.company || 'LevelUP',
      image: mentor.profileImage || '/placeholder.svg?height=120&width=120',
      description: mentor.bio || `Experienced mentor specializing in ${mentor.expertise?.join(', ') || 'various fields'}.`,
      skills: mentor.skills?.length > 0 ? mentor.skills : mentor.expertise || [],
      experience: mentor.experience || '3+ years',
      rating: mentor.rating || 4.8,
      reviewCount: mentor.reviewCount || 0,
      pricePerMonth: mentor.pricePerMonth || 3000,
      category: mentor.expertise || [],
      isQuickResponder: mentor.isQuickResponder || false,
      location: mentor.location || 'Remote',
      languages: mentor.languages || ['English'],
      about: mentor.about || mentor.bio || `Experienced mentor specializing in ${mentor.expertise?.join(', ') || 'various fields'}.`
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
    title: mentor.title || (mentor.expertise && mentor.expertise.length > 0 ? mentor.expertise[0] + ' Specialist' : 'Mentor'),
    company: mentor.company || 'LevelUP',
    image: mentor.profileImage || '/placeholder.svg?height=120&width=120',
    description: mentor.bio || `Experienced mentor specializing in ${mentor.expertise?.join(', ') || 'various fields'}.`,
    skills: mentor.skills?.length > 0 ? mentor.skills : mentor.expertise || [],
    experience: mentor.experience || '3+ years',
    rating: mentor.rating || 4.8,
    reviewCount: mentor.reviewCount || 0,
    pricePerMonth: mentor.pricePerMonth || 3000,
    category: mentor.expertise || [],
    isQuickResponder: mentor.isQuickResponder || false,
    location: mentor.location || 'Remote',
    languages: mentor.languages || ['English'],
    about: mentor.about || mentor.bio || `Experienced mentor specializing in ${mentor.expertise?.join(', ') || 'various fields'}.`,
    
    // Additional fields for detailed view
    email: mentor.userId?.email || '',
    phone: mentor.phone || '',
    avatar: mentor.profileImage || '/placeholder.svg?height=120&width=120',
    bio: mentor.bio || `Experienced mentor specializing in ${mentor.expertise?.join(', ') || 'various fields'}.`,
    expertise: mentor.expertise || [],
    education: mentor.education || 'Not specified',
    totalSessions: mentor.totalSessions || 0,
    totalMentees: mentor.totalMentees || 0,
    joinedDate: mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'January 2024',
    availability: mentor.availability || [],
    certifications: mentor.certifications || [],
    
    // Include active session types
    sessionTypes: mentor.sessionTypes?.filter(type => type.isActive) || []
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
    const studentId = req.user.userId; // Assuming this comes from auth middleware
    
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

// Get mentor's booked sessions
const getMentorSessions = async (req, res) => {
  try {
    console.log('=== GET MENTOR SESSIONS FUNCTION STARTED ===');
    
    // Find the mentor
    const mentor = await mentorModel.findOne({ userId: req.user.userId });
    if (!mentor) {
      return res.status(404).json({ message: 'Mentor not found' });
    }
    console.log('Mentor found:', mentor._id);

    // Fetch all sessions for this mentor with student information
    const sessions = await sessionModel.find({ mentorId: mentor._id })
      .populate({
        path: 'studentId',
        model: 'student',
        select: 'firstname lastname',
        populate: {
          path: 'userId',
          model: 'user',
          select: 'email'
        }
      })
      .sort({ date: -1 }); // Sort by date, newest first

    console.log('Found sessions:', sessions.length);

    // Map sessions to match frontend interface
    const formattedSessions = sessions.map(session => {
      const student = session.studentId;
      const studentUser = student?.userId;
      
      // Combine date and startTime to create session date
      const sessionDate = new Date(session.date);
      const [hours, minutes] = session.startTime.split(':');
      sessionDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Calculate session end time for duration display
      const sessionEndTime = new Date(sessionDate.getTime() + (session.duration * 60000));
      const now = new Date();

      // Determine session status based on time and current status
      let sessionStatus = session.status;
      if (sessionStatus === 'confirmed') {
        if (now > sessionEndTime) {
          sessionStatus = 'completed';
          // Update the session in database (fire and forget)
          sessionModel.findByIdAndUpdate(session._id, { status: 'completed' }).catch(err => 
            console.error('Error updating session status:', err)
          );
        } else if (now >= sessionDate && now <= sessionEndTime) {
          sessionStatus = 'in-progress';
        } else {
          sessionStatus = 'upcoming';
        }
      }

      // Format time for display
      const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
      };

      return {
        id: session._id.toString(),
        studentName: student ? `${student.firstname || ''} ${student.lastname || ''}`.trim() : 'Unknown Student',
        studentEmail: studentUser ? studentUser.email : 'No email',
        studentAvatar: '', // Add avatar field if needed in student model
        sessionDate: sessionDate.toISOString().split('T')[0], // YYYY-MM-DD format
        sessionTime: formatTime(sessionDate),
        duration: session.duration,
        status: sessionStatus,
        topic: session.sessionTypeName,
        type: 'one-on-one', // Default to one-on-one for mentor sessions
        meetingLink: '', // Can be added later if needed
        notes: session.notes || '',
        createdAt: session.createdAt ? session.createdAt.toISOString().split('T')[0] : sessionDate.toISOString().split('T')[0]
      };
    });

    // Calculate statistics
    const stats = {
      total: formattedSessions.length,
      upcoming: formattedSessions.filter(s => s.status === 'upcoming').length,
      completed: formattedSessions.filter(s => s.status === 'completed').length,
      inProgress: formattedSessions.filter(s => s.status === 'in-progress').length,
      cancelled: formattedSessions.filter(s => s.status === 'cancelled').length
    };

    console.log('Session stats:', stats);

    res.status(200).json({
      message: 'Sessions retrieved successfully',
      sessions: formattedSessions,
      stats: stats
    });

  } catch (error) {
    console.error('Get mentor sessions error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch sessions',
      error: error.message 
    });
  }
};
  
export { 
  mentorDashboard, 
  getAllPublicMentors, 
  getMentorById,
  getCurrentMentorProfile,
  getMentorAvailability,
  saveMentorAvailability,
  testMentorData,
  scheduleSession,
  getSessionTypes,
  updateSessionTypes,
  addSessionType,
  updateSessionType,
  getMentorSessions
};