/**
 * Availability Service
 * 
 * This service handles the management of mentor availability data.
 * In a real application, this would interact with your backend API.
 * For now, it uses localStorage for demonstration purposes.
 */

// Types
interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface DaySchedule {
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface SpecificDateOverride {
  date: string;
  isAvailable: boolean;
  timeSlots?: TimeSlot[];
}

export interface MentorAvailability {
  mentorId: string;
  weeklySchedule: WeeklySchedule;
  dateOverrides: SpecificDateOverride[];
  sessionDurations: number[];
  bufferBetweenSessions: number;
  advanceBookingLimit: number;
  timezone: string;
}

export interface Booking {
  id: string;
  mentorId: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  sessionType: string;
  sessionDuration: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
}

// Default time slots
const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { startTime: "09:00", endTime: "10:00", isAvailable: true },
  { startTime: "10:00", endTime: "11:00", isAvailable: true },
  { startTime: "11:00", endTime: "12:00", isAvailable: true },
  { startTime: "13:00", endTime: "14:00", isAvailable: true },
  { startTime: "14:00", endTime: "15:00", isAvailable: true },
  { startTime: "15:00", endTime: "16:00", isAvailable: true },
  { startTime: "16:00", endTime: "17:00", isAvailable: true },
];

// Default day schedule
const DEFAULT_DAY_SCHEDULE: DaySchedule = {
  isAvailable: true,
  timeSlots: DEFAULT_TIME_SLOTS,
};

// Default weekend schedule
const DEFAULT_WEEKEND_SCHEDULE: DaySchedule = {
  isAvailable: false,
  timeSlots: DEFAULT_TIME_SLOTS,
};

// Default weekly schedule
const DEFAULT_WEEKLY_SCHEDULE: WeeklySchedule = {
  monday: DEFAULT_DAY_SCHEDULE,
  tuesday: DEFAULT_DAY_SCHEDULE,
  wednesday: DEFAULT_DAY_SCHEDULE,
  thursday: DEFAULT_DAY_SCHEDULE,
  friday: DEFAULT_DAY_SCHEDULE,
  saturday: DEFAULT_WEEKEND_SCHEDULE,
  sunday: DEFAULT_WEEKEND_SCHEDULE,
};

/**
 * Get a mentor's availability
 */
export async function getMentorAvailability(mentorId: string): Promise<MentorAvailability> {
  // In a real app, this would be an API call
  // For now, we'll use localStorage
  try {
    const storedData = localStorage.getItem(`mentor-availability-${mentorId}`);
    
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // Return default availability if none is stored
    const defaultAvailability: MentorAvailability = {
      mentorId,
      weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
      dateOverrides: [],
      sessionDurations: [30, 60],
      bufferBetweenSessions: 15,
      advanceBookingLimit: 30,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    
    return defaultAvailability;
  } catch (error) {
    console.error("Error getting mentor availability:", error);
    throw error;
  }
}

/**
 * Save a mentor's availability
 */
export async function saveMentorAvailability(availability: MentorAvailability): Promise<void> {
  // In a real app, this would be an API call
  // For now, we'll use localStorage
  try {
    localStorage.setItem(`mentor-availability-${availability.mentorId}`, JSON.stringify(availability));
  } catch (error) {
    console.error("Error saving mentor availability:", error);
    throw error;
  }
}

/**
 * Get bookings for a mentor
 */
export async function getMentorBookings(mentorId: string): Promise<Booking[]> {
  // In a real app, this would be an API call
  // For now, we'll use localStorage
  try {
    const storedData = localStorage.getItem(`mentor-bookings-${mentorId}`);
    
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    return [];
  } catch (error) {
    console.error("Error getting mentor bookings:", error);
    throw error;
  }
}

/**
 * Get bookings for a student
 */
export async function getStudentBookings(studentId: string): Promise<Booking[]> {
  // In a real app, this would be an API call
  // For now, we'll use localStorage
  try {
    const storedData = localStorage.getItem(`student-bookings-${studentId}`);
    
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    return [];
  } catch (error) {
    console.error("Error getting student bookings:", error);
    throw error;
  }
}

/**
 * Create a new booking
 */
export async function createBooking(bookingData: Omit<Booking, "id" | "createdAt" | "status">): Promise<Booking> {
  // In a real app, this would be an API call
  // For now, we'll use localStorage
  try {
    // Generate a unique ID
    const id = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create the booking
    const booking: Booking = {
      ...bookingData,
      id,
      status: "confirmed", // Auto-confirm for demo
      createdAt: new Date().toISOString(),
    };
    
    // Save to mentor's bookings
    const mentorBookings = await getMentorBookings(booking.mentorId);
    mentorBookings.push(booking);
    localStorage.setItem(`mentor-bookings-${booking.mentorId}`, JSON.stringify(mentorBookings));
    
    // Save to student's bookings
    const studentBookings = await getStudentBookings(booking.studentId);
    studentBookings.push(booking);
    localStorage.setItem(`student-bookings-${booking.studentId}`, JSON.stringify(studentBookings));
    
    return booking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

/**
 * Update a booking's status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled" | "completed"
): Promise<void> {
  // In a real app, this would be an API call
  // For now, we'll use localStorage
  try {
    // Find the booking in mentor's bookings
    const allMentorIds = Object.keys(localStorage)
      .filter(key => key.startsWith("mentor-bookings-"))
      .map(key => key.replace("mentor-bookings-", ""));
    
    for (const mentorId of allMentorIds) {
      const mentorBookings = await getMentorBookings(mentorId);
      const bookingIndex = mentorBookings.findIndex(b => b.id === bookingId);
      
      if (bookingIndex !== -1) {
        // Update the booking
        mentorBookings[bookingIndex].status = status;
        localStorage.setItem(`mentor-bookings-${mentorId}`, JSON.stringify(mentorBookings));
        
        // Also update in student's bookings
        const studentId = mentorBookings[bookingIndex].studentId;
        const studentBookings = await getStudentBookings(studentId);
        const studentBookingIndex = studentBookings.findIndex(b => b.id === bookingId);
        
        if (studentBookingIndex !== -1) {
          studentBookings[studentBookingIndex].status = status;
          localStorage.setItem(`student-bookings-${studentId}`, JSON.stringify(studentBookings));
        }
        
        return;
      }
    }
    
    throw new Error(`Booking with ID ${bookingId} not found`);
  } catch (error) {
    console.error("Error updating booking status:", error);
    throw error;
  }
}
