"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Clock, DollarSign, Save, Edit, X } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"
import { useAuth } from "@/context/AuthContext"

interface SessionType {
  _id?: string
  name: string
  description: string
  duration: number
  price: number
  isActive: boolean
  isNew?: boolean
  isEditing?: boolean
}

export function SessionTypesManager() {
  const { token } = useAuth()
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSessionTypes()
  }, [])

  const fetchSessionTypes = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const response = await axios.get(`${API_BASE_URL}/api/mentor/session-types`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data && response.data.sessionTypes) {
        setSessionTypes(response.data.sessionTypes.map((type: SessionType) => ({
          ...type,
          isEditing: false
        })))
      }
    } catch (error) {
      console.error("Error fetching session types:", error)
      toast.error("Failed to load session types")
      // Set default session types if fetch fails
      setSessionTypes([
        {
          name: 'Free Introduction',
          description: 'A short 15-minute session to get to know each other and discuss potential mentorship',
          duration: 15,
          price: 0,
          isActive: true,
          isEditing: false
        },
        {
          name: 'Expert Session',
          description: 'A comprehensive 60-minute session focused on specific topics or challenges',
          duration: 60,
          price: 2000,
          isActive: true,
          isEditing: false
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const addNewSessionType = () => {
    setSessionTypes([
      ...sessionTypes,
      {
        name: '',
        description: '',
        duration: 30,
        price: 0,
        isActive: true,
        isNew: true,
        isEditing: true
      }
    ])
  }

  const toggleEdit = (index: number) => {
    const updatedTypes = [...sessionTypes]
    updatedTypes[index].isEditing = !updatedTypes[index].isEditing
    setSessionTypes(updatedTypes)
  }

  const handleChange = (index: number, field: keyof SessionType, value: string | number | boolean) => {
    const updatedTypes = [...sessionTypes]
    updatedTypes[index] = {
      ...updatedTypes[index],
      [field]: value
    }
    setSessionTypes(updatedTypes)
  }

  const removeSessionType = (index: number) => {
    const updatedTypes = [...sessionTypes]
    updatedTypes.splice(index, 1)
    setSessionTypes(updatedTypes)
  }

  const saveSessionTypes = async () => {
    // Validate all session types
    const invalidTypes = sessionTypes.filter(type => 
      !type.name.trim() || 
      type.duration <= 0 || 
      type.price < 0
    )
    
    if (invalidTypes.length > 0) {
      toast.error("Please fill in all required fields correctly")
      return
    }
    
    try {
      setSaving(true)
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      
      await axios.put(
        `${API_BASE_URL}/api/mentor/session-types`,
        { sessionTypes },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      toast.success("Session types saved successfully")
      
      // Reset editing state
      setSessionTypes(sessionTypes.map(type => ({
        ...type,
        isNew: false,
        isEditing: false
      })))
      
    } catch (error) {
      console.error("Error saving session types:", error)
      toast.error("Failed to save session types")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Types</CardTitle>
          <CardDescription>Loading session types...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Types</CardTitle>
        <CardDescription>
          Define the types of sessions you offer to students. Students will be able to select from these when scheduling sessions.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {sessionTypes.map((sessionType, index) => (
          <Card key={index} className={`border ${sessionType.isEditing ? 'border-primary' : 'border-gray-200'}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                {sessionType.isEditing ? (
                  <Input
                    value={sessionType.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    placeholder="Session Type Name"
                    className="font-medium text-lg"
                  />
                ) : (
                  <CardTitle>{sessionType.name || 'Untitled Session'}</CardTitle>
                )}
                
                <div className="flex items-center gap-2">
                  {sessionType.isEditing ? (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleEdit(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Cancel</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleEdit(index)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Save className="h-4 w-4" />
                        <span className="sr-only">Save</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleEdit(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeSessionType(index)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-4">
              {sessionType.isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={sessionType.description}
                      onChange={(e) => handleChange(index, 'description', e.target.value)}
                      placeholder="Describe what this session type offers"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`duration-${index}`}>Duration (minutes)</Label>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <Input
                          id={`duration-${index}`}
                          type="number"
                          min="1"
                          value={sessionType.duration}
                          onChange={(e) => handleChange(index, 'duration', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`price-${index}`}>Price (LKR)</Label>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        <Input
                          id={`price-${index}`}
                          type="number"
                          min="0"
                          value={sessionType.price}
                          onChange={(e) => handleChange(index, 'price', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`active-${index}`}
                      checked={sessionType.isActive}
                      onCheckedChange={(checked) => handleChange(index, 'isActive', checked)}
                    />
                    <Label htmlFor={`active-${index}`}>Active</Label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-700">{sessionType.description}</p>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm text-gray-700">{sessionType.duration} minutes</span>
                    </div>
                    
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {sessionType.price === 0 ? 'Free' : `LKR ${sessionType.price.toLocaleString()}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-1 ${sessionType.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-sm text-gray-700">{sessionType.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {sessionTypes.length === 0 && (
          <div className="text-center py-8 border rounded-lg border-dashed">
            <p className="text-gray-500">No session types defined yet</p>
            <Button onClick={addNewSessionType} variant="outline" className="mt-2">
              <Plus className="h-4 w-4 mr-1" /> Add Session Type
            </Button>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={addNewSessionType}
          disabled={saving}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Session Type
        </Button>
        
        <Button 
          onClick={saveSessionTypes}
          disabled={saving}
          className="bg-primary hover:bg-primary/90"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

