"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PaymentProcessorProps {
  sessionDetails: {
    mentorId: string
    mentorName: string
    sessionType: string
    sessionDate: string
    sessionTime: string
    price: number
  }
  onSuccess: () => void
  onCancel: () => void
}

export function PaymentProcessor({ sessionDetails, onSuccess, onCancel }: PaymentProcessorProps) {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<string>("card")
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isComplete, setIsComplete] = useState<boolean>(false)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  })

  // Handle card detail changes
  const handleCardDetailChange = (field: string, value: string) => {
    setCardDetails({
      ...cardDetails,
      [field]: value
    })
  }

  // Check if form is valid
  const isFormValid = () => {
    if (paymentMethod === "card") {
      return (
        cardDetails.cardNumber.length >= 16 &&
        cardDetails.cardName.length > 0 &&
        cardDetails.expiryDate.length >= 5 &&
        cardDetails.cvv.length >= 3
      )
    }
    return true
  }

  // Process payment
  const handleProcessPayment = async () => {
    setIsProcessing(true)
    
    // In a real app, you would make an API call to your payment processor
    // This is a mock implementation that simulates a payment process
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate successful payment
      setIsProcessing(false)
      setIsComplete(true)
      
      // Redirect after showing success message
      setTimeout(() => {
        onSuccess()
        // In a real app, you might redirect to a booking confirmation page
        // router.push(`/mentorship/booking-confirmed/${bookingId}`)
      }, 2000)
    } catch (error) {
      console.error("Payment failed:", error)
      setIsProcessing(false)
      // Handle payment failure
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Booking</CardTitle>
        <CardDescription>
          Secure payment for your session with {sessionDetails.mentorName}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {!isComplete ? (
          <>
            {/* Booking Summary */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Session Type</span>
                  <span>{sessionDetails.sessionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Time</span>
                  <span>{sessionDetails.sessionDate} at {sessionDetails.sessionTime}</span>
                </div>
                <div className="flex justify-between font-medium pt-2 border-t border-gray-200 mt-2">
                  <span>Total</span>
                  <span>${sessionDetails.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {/* Payment Methods */}
            <Tabs defaultValue={paymentMethod} onValueChange={setPaymentMethod}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="card">Credit Card</TabsTrigger>
                <TabsTrigger value="paypal">PayPal</TabsTrigger>
                <TabsTrigger value="stripe">Stripe</TabsTrigger>
              </TabsList>
              
              <TabsContent value="card">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input 
                      id="cardNumber" 
                      placeholder="1234 5678 9012 3456" 
                      value={cardDetails.cardNumber}
                      onChange={(e) => handleCardDetailChange("cardNumber", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input 
                      id="cardName" 
                      placeholder="John Doe" 
                      value={cardDetails.cardName}
                      onChange={(e) => handleCardDetailChange("cardName", e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input 
                        id="expiryDate" 
                        placeholder="MM/YY" 
                        value={cardDetails.expiryDate}
                        onChange={(e) => handleCardDetailChange("expiryDate", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input 
                        id="cvv" 
                        placeholder="123" 
                        value={cardDetails.cvv}
                        onChange={(e) => handleCardDetailChange("cvv", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="paypal">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-blue-600 font-bold">PayPal</span>
                  </div>
                  <p className="text-center text-gray-600 mb-4">
                    You will be redirected to PayPal to complete your payment.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="stripe">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-purple-600 font-bold">Stripe</span>
                  </div>
                  <p className="text-center text-gray-600 mb-4">
                    You will be redirected to Stripe to complete your payment.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          // Payment success message
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-center text-gray-600 mb-4">
              Your booking has been confirmed. You will receive a confirmation email shortly.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {!isComplete ? (
          <>
            <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessPayment} 
              disabled={!isFormValid() || isProcessing}
              className="min-w-[120px]"
            >
              {isProcessing ? "Processing..." : `Pay $${sessionDetails.price.toLocaleString()}`}
            </Button>
          </>
        ) : (
          <Button className="w-full" onClick={onSuccess}>
            View My Bookings
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
