"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import axios from "axios"
import { Calendar, Clock, User, DollarSign, Shield, CreditCard, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface SessionDetails {
  mentorId: string
  mentorName: string
  mentorImage: string
  mentorTitle: string
  mentorCompany: string
  sessionTypeId: string
  sessionTypeName: string
  sessionDuration: number
  sessionPrice: number
  sessionDate: string
  sessionTime: string
  endTime: string
}

interface PaymentForm {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
  paymentMethod: string
}

export default function SessionPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(null)
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    paymentMethod: 'credit_card'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  useEffect(() => {
    // Parse session details from URL parameters
    const mentorId = searchParams.get('mentorId')
    const mentorName = searchParams.get('mentorName')
    const mentorImage = searchParams.get('mentorImage')
    const mentorTitle = searchParams.get('mentorTitle')
    const mentorCompany = searchParams.get('mentorCompany')
    const sessionTypeId = searchParams.get('sessionTypeId')
    const sessionTypeName = searchParams.get('sessionTypeName')
    const sessionDuration = searchParams.get('sessionDuration')
    const sessionPrice = searchParams.get('sessionPrice')
    const sessionDate = searchParams.get('sessionDate')
    const sessionTime = searchParams.get('sessionTime')
    const endTime = searchParams.get('endTime')

    if (!mentorId || !sessionTypeId || !sessionDate || !sessionTime) {
      toast.error("Missing session information. Please try booking again.")
      router.push('/mentorship')
      return
    }

    setSessionDetails({
      mentorId,
      mentorName: mentorName || 'Mentor',
      mentorImage: mentorImage || '/placeholder.svg',
      mentorTitle: mentorTitle || 'Professional Mentor',
      mentorCompany: mentorCompany || 'LevelUP',
      sessionTypeId,
      sessionTypeName: sessionTypeName || 'Session',
      sessionDuration: parseInt(sessionDuration || '60'),
      sessionPrice: parseFloat(sessionPrice || '0'),
      sessionDate,
      sessionTime,
      endTime: endTime || sessionTime
    })
    setIsLoading(false)
  }, [searchParams, router])

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sessionDetails) {
      toast.error("Session details are missing")
      return
    }

    // Validate payment form
    if (paymentForm.paymentMethod === 'credit_card') {
      if (!paymentForm.cardNumber || !paymentForm.expiryDate || !paymentForm.cvv || !paymentForm.cardholderName) {
        toast.error("Please fill in all payment details")
        return
      }
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // After successful payment, book the session
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error("Please log in to complete the booking")
        router.push('/login')
        return
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
      const bookingData = {
        mentorId: sessionDetails.mentorId,
        date: sessionDetails.sessionDate,
        startTime: sessionDetails.sessionTime,
        endTime: sessionDetails.endTime,
        sessionTypeId: sessionDetails.sessionTypeId,
        sessionTypeName: sessionDetails.sessionTypeName,
        duration: sessionDetails.sessionDuration,
        price: sessionDetails.sessionPrice,
        paymentMethod: paymentForm.paymentMethod,
        paymentConfirmed: true
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/student/book-mentor-session`,
        bookingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      toast.success("Session successfully booked!")
      setPaymentSuccess(true)
      
      // Show success message for a moment, then redirect
      setTimeout(() => {
        router.push('/student/sessions')
      }, 3000) // 3 second delay to show the success message

    } catch (error: any) {
      console.error('Payment/Booking error:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Payment failed. Please try again.")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Successfully Booked!</h1>
            <p className="text-gray-600 mb-4">
              Your mentorship session with <strong>{sessionDetails?.mentorName}</strong> has been confirmed.
            </p>
            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Date:</strong> {sessionDetails && formatDate(sessionDetails.sessionDate)}</div>
                <div><strong>Time:</strong> {sessionDetails && formatTime(sessionDetails.sessionTime)}</div>
                <div><strong>Session:</strong> {sessionDetails?.sessionTypeName}</div>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-4">
            Redirecting to your sessions page...
          </div>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-4"></div>
          <Button 
            onClick={() => router.push('/student/sessions')}
            className="mt-2"
          >
            Go to My Sessions
          </Button>
        </div>
      </div>
    )
  }

  if (!sessionDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p>Session details not found</p>
          <Button onClick={() => router.push('/mentorship')} className="mt-4">
            Back to Mentorship
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Booking</h1>
          <p className="text-gray-600 mt-2">Secure payment for your mentorship session</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Session Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Session Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mentor Information */}
                <div className="flex items-start gap-4">
                  <Image
                    src={sessionDetails.mentorImage}
                    alt={sessionDetails.mentorName}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{sessionDetails.mentorName}</h3>
                    <p className="text-gray-600">{sessionDetails.mentorTitle}</p>
                    <p className="text-sm text-gray-500">{sessionDetails.mentorCompany}</p>
                  </div>
                </div>

                <Separator />

                {/* Session Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Session Type</span>
                    <Badge variant="outline">{sessionDetails.sessionTypeName}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{sessionDetails.sessionDuration} minutes</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{formatDate(sessionDetails.sessionDate)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium">
                      {formatTime(sessionDetails.sessionTime)} - {formatTime(sessionDetails.endTime)}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Pricing */}
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-primary">
                    LKR {sessionDetails.sessionPrice.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  {/* Payment Method Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={paymentForm.paymentMethod}
                      onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentMethod: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit/Debit Card</SelectItem>
                        <SelectItem value="digital_wallet">Digital Wallet</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Credit Card Details */}
                  {paymentForm.paymentMethod === 'credit_card' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          placeholder="John Doe"
                          value={paymentForm.cardholderName}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, cardholderName: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentForm.cardNumber}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                          maxLength={19}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={paymentForm.expiryDate}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                            maxLength={5}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={paymentForm.cvv}
                            onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Other Payment Methods Info */}
                  {paymentForm.paymentMethod === 'digital_wallet' && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        You will be redirected to your digital wallet to complete the payment.
                      </p>
                    </div>
                  )}

                  {paymentForm.paymentMethod === 'bank_transfer' && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        Bank transfer details will be provided after clicking "Complete Payment".
                      </p>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">
                      Your payment information is encrypted and secure
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.back()}
                      disabled={isProcessing}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        `Pay LKR ${sessionDetails.sessionPrice.toLocaleString()}`
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}