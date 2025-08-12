"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, User, MessageSquare } from "lucide-react"

interface Mentee {
  id: string
  name: string
  email: string
  avatar?: string
  progress: number
  goalTitle: string
  sessionsCompleted: number
  totalSessions: number
  lastSession: string
  nextSession?: string
}

interface MenteeProgressProps {
  mentees: Mentee[]
}

export function MenteeProgress({ mentees }: MenteeProgressProps) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-900">Mentee Progress</CardTitle>
          <Button variant="outline" size="sm" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            View All Mentees
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {mentees.map((mentee, index) => (
          <div key={mentee.id} className={`${index !== mentees.length - 1 ? 'border-b border-gray-100 pb-6' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mentee.avatar} alt={mentee.name} />
                  <AvatarFallback>
                    <User className="h-6 w-6 text-gray-600" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{mentee.name}</h3>
                    <p className="text-xs text-gray-500">{mentee.email}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">{mentee.goalTitle}</span>
                      <span className="text-xs text-gray-500">{mentee.progress}% Complete</span>
                    </div>
                    <Progress value={mentee.progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Sessions: {mentee.sessionsCompleted}/{mentee.totalSessions}</span>
                    <span>Last: {mentee.lastSession}</span>
                  </div>
                  
                  {mentee.nextSession && (
                    <div className="text-xs text-blue-600 font-medium">
                      Next session: {mentee.nextSession}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <MessageSquare className="h-3 w-3" />
                  Message
                </Button>
                <Button variant="outline" size="sm">
                  View Progress
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
