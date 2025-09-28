"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export function MinimalProfileCompletion() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [missingCount, setMissingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we have a user and token
    if (user && token) {
      fetchProfileCompletion();
    }
  }, [user, token]);

  const fetchProfileCompletion = async () => {
    try {
      setLoading(true);
      setError(null);
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

      if (!token) {
        console.log("No token available");
        setError("Please log in to view profile completion");
        setPercentage(0);
        setMissingCount(10);
        return;
      }

      if (!user || user.role !== 'mentor') {
        console.log("User is not a mentor");
        setError("Only mentors can view profile completion");
        setPercentage(0);
        setMissingCount(0);
        return;
      }

      // Fetch actual mentor profile data
      const response = await axios.get(`${API_BASE_URL}/api/mentor/me`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.data) {
        const profile = response.data;
        
        // Calculate profile completion based on actual data
        const fields = [
          profile.firstname,
          profile.lastname, 
          profile.title,
          profile.company,
          profile.bio,
          profile.about,
          profile.experience,
          profile.location,
          profile.expertise?.length > 0,
          profile.skills?.length > 0,
          profile.languages?.length > 0,
          profile.pricePerMonth > 0,
          profile.availability?.length > 0,
          profile.certifications?.length > 0
        ];

        const completedFields = fields.filter(field => 
          field && field !== '' && field !== 0
        ).length;
        
        const completionPercentage = Math.round((completedFields / fields.length) * 100);
        const missing = fields.length - completedFields;

        setPercentage(completionPercentage);
        setMissingCount(missing);
      } else {
        // No profile data found
        setPercentage(0);
        setMissingCount(14);
      }
    } catch (error: any) {
      console.error("Error fetching profile data:", error);
      
      // Handle different error types
      if (error.response?.status === 403) {
        console.log("Access forbidden - user might not be a mentor");
        setError("Access denied. Please ensure you have mentor privileges.");
        setPercentage(0);
        setMissingCount(10);
      } else if (error.response?.status === 401) {
        console.log("Unauthorized - token might be invalid");
        setError("Authentication expired. Please log in again.");
        setPercentage(0);
        setMissingCount(10);
      } else if (error.response?.status === 404) {
        console.log("Profile not found - new mentor");
        setError(null); // Not really an error, just a new profile
        setPercentage(10);
        setMissingCount(13);
      } else {
        // Network or other errors
        setError("Unable to load profile data. Please try again.");
        setPercentage(20);
        setMissingCount(8);
      }
    } finally {
      setLoading(false);
    }
  };

  const getCompletionColor = () => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <Card className="border-l-4 border-gray-300">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show anything if user is not a mentor or there's an authentication error
  if (error && (error.includes("mentor") || error.includes("Authentication"))) {
    return null;
  }

  // Show error message for other errors
  if (error) {
    return (
      <Card className="border-l-4 border-red-400">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium flex items-center text-red-600">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Profile Status
            </span>
          </div>
          <p className="text-xs text-red-500 mt-2">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs mt-2"
            onClick={fetchProfileCompletion}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-yellow-400">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium flex items-center">
              <AlertCircle className="h-3.5 w-3.5 mr-1 text-yellow-500" />
              Complete your profile
            </span>
            <span>{percentage}%</span>
          </div>

          <Progress value={percentage} className="h-1.5" />

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{missingCount} items missing</span>

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => router.push("/mentor/profile")}
            >
              <User className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
