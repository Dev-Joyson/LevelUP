import { useState, useEffect, useCallback } from 'react'

// Types for our API responses
interface DashboardStats {
  students: { total: number; growth: number }
  companies: { total: number; growth: number }
  mentors: { total: number; growth: number }
  internships: { total: number; growth: number }
}

interface RegistrationTrend {
  period: string
  count: number
  type: string
}

interface InternshipAnalytic {
  category: string
  count: number
  avgSalary?: string
}

interface RecentActivity {
  id: string
  activityNo: string
  description: string
  name: string
  details: string
  type: string
  status: string
  date: string
  verified: boolean
}

interface ChartDataPoint {
  name: string
  value: number
  [key: string]: any
}

interface TopCompany {
  name: string
  internshipCount: number
  percentage: number
  color: string
  verified: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export const useDashboardData = () => {
  // State for dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  // State for chart data
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [chartLoading, setChartLoading] = useState(true)
  const [chartError, setChartError] = useState<string | null>(null)

  // State for activities
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [activitiesError, setActivitiesError] = useState<string | null>(null)

  // State for top companies
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([])
  const [companiesLoading, setCompaniesLoading] = useState(true)
  const [companiesError, setCompaniesError] = useState<string | null>(null)

  // Combined loading state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  }

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      console.log('🔄 Fetching dashboard stats...');
      setStatsLoading(true)
      setStatsError(null)

      const headers = getAuthHeaders();
      console.log('🔑 Auth headers:', headers);

      const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
        method: 'GET',
        headers
      })

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('📊 Dashboard data received:', data);
      
      if (data.success) {
        setStats(data.data)
        console.log('✅ Stats updated:', data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard stats')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      console.error('❌ Error fetching dashboard stats:', err)
      setStatsError(errorMessage)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  // Fetch registration trends
  const fetchRegistrationTrends = useCallback(async (type: string = 'students', period: string = 'monthly') => {
    try {
      setChartLoading(true)
      setChartError(null)

      const response = await fetch(
        `${API_BASE_URL}/api/admin/dashboard/trends?type=${type}&period=${period}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Transform data for chart consumption
        const transformedData = data.data.map((item: RegistrationTrend) => ({
          name: item.period,
          value: item.count,
          count: item.count
        }))
        setChartData(transformedData)
      } else {
        throw new Error(data.message || 'Failed to fetch registration trends')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setChartError(errorMessage)
      console.error('Error fetching registration trends:', err)
    } finally {
      setChartLoading(false)
    }
  }, [])

  // Fetch recent activities
  const fetchRecentActivities = useCallback(async (limit: number = 10) => {
    try {
      setActivitiesLoading(true)
      setActivitiesError(null)

      const response = await fetch(
        `${API_BASE_URL}/api/admin/dashboard/activities?limit=${limit}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setActivities(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch recent activities')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setActivitiesError(errorMessage)
      console.error('Error fetching recent activities:', err)
    } finally {
      setActivitiesLoading(false)
    }
  }, [])

  // Fetch internship analytics
  const fetchInternshipAnalytics = useCallback(async (type: string = 'status') => {
    try {
      setChartLoading(true)
      setChartError(null)

      const response = await fetch(
        `${API_BASE_URL}/api/admin/dashboard/analytics?type=${type}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Transform data for chart consumption
        const transformedData = data.data.map((item: InternshipAnalytic) => ({
          name: item.category,
          value: item.count,
          count: item.count,
          avgSalary: item.avgSalary
        }))
        setChartData(transformedData)
      } else {
        throw new Error(data.message || 'Failed to fetch internship analytics')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setChartError(errorMessage)
      console.error('Error fetching internship analytics:', err)
    } finally {
      setChartLoading(false)
    }
  }, [])

  // Fetch top companies
  const fetchTopCompanies = useCallback(async (limit: number = 5) => {
    try {
      console.log('🔄 Fetching top companies...');
      setCompaniesLoading(true)
      setCompaniesError(null)

      const response = await fetch(
        `${API_BASE_URL}/api/admin/dashboard/top-companies?limit=${limit}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )

      console.log('📡 Top companies response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('🏢 Top companies data received:', data);
      
      if (data.success) {
        setTopCompanies(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch top companies')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      console.error('❌ Error fetching top companies:', err)
      setCompaniesError(errorMessage)
    } finally {
      setCompaniesLoading(false)
    }
  }, [])

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch all initial data in parallel
        await Promise.all([
          fetchDashboardStats(),
          fetchRegistrationTrends('students', 'monthly'),
          fetchRecentActivities(5),
          fetchTopCompanies(5)
        ])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [fetchDashboardStats, fetchRegistrationTrends, fetchRecentActivities])

  // Update combined loading state
  useEffect(() => {
    setLoading(statsLoading || chartLoading || activitiesLoading || companiesLoading)
  }, [statsLoading, chartLoading, activitiesLoading, companiesLoading])

  // Update combined error state
  // useEffect(() => {
  //   const errors = [statsError, chartError, activitiesError, companiesError].filter(Boolean)
  //   setError(errors.length > 0 ? errors[0] : null)
  // }, [statsError, chartError, activitiesError, companiesError])

  // Refresh all data
  const refetchData = useCallback(async () => {
    await Promise.all([
      fetchDashboardStats(),
      fetchRegistrationTrends('students', 'monthly'),
      fetchRecentActivities(5),
      fetchTopCompanies(5)
    ])
  }, [fetchDashboardStats, fetchRegistrationTrends, fetchRecentActivities, fetchTopCompanies])

  // Migrate mentor verification field for existing mentors
  const migrateMentorVerification = useCallback(async () => {
    try {
      console.log('🔄 Starting mentor verification migration...');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/mentors/migrate-verification`, {
        method: 'POST',
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        console.log('✅ Mentor migration completed:', data.message);
        // Refresh activities data after migration
        fetchRecentActivities(5);
      } else {
        throw new Error(data.message || 'Failed to migrate mentor verification')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Migration failed'
      console.error('❌ Error during mentor migration:', err)
    }
  }, [fetchRecentActivities])

  return {
    // Data
    stats,
    chartData,
    activities,
    topCompanies,
    
    // Loading states
    loading,
    statsLoading,
    chartLoading,
    activitiesLoading,
    companiesLoading,
    
    // Error states
    error,
    statsError,
    chartError,
    activitiesError,
    companiesError,
    
    // Functions
    fetchDashboardStats,
    fetchRegistrationTrends,
    fetchRecentActivities,
    fetchInternshipAnalytics,
    fetchTopCompanies,
    refetchData,
    migrateMentorVerification
  }
}