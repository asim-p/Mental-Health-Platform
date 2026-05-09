import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Navbar } from "../components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Calendar } from "../components/ui/calendar";
import { mockTherapists } from "../data/therapists";
import { Star, CheckCircle, Calendar as CalendarIcon, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const availableTimeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

export function BookingPage() {
  const { therapistId } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("esewa");

  const therapist = mockTherapists.find((t) => t.id === therapistId);

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">Therapist not found</p>
              <Link to="/therapists">
                <Button>Browse Therapists</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time for your appointment");
      return;
    }

    // Simulate payment processing
    toast.success("Booking confirmed! Redirecting to dashboard...");
    setTimeout(() => {
      navigate("/dashboard/patient");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/therapists" className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-6">
          <ArrowLeft size={20} />
          Back to Therapists
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Therapist Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-3xl font-semibold text-teal-700">
                      {therapist.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h2 className="font-semibold text-xl">{therapist.name}</h2>
                    {therapist.verified && (
                      <CheckCircle className="text-teal-600" size={20} />
                    )}
                  </div>
                  <p className="text-gray-600">{therapist.title}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Star className="text-yellow-500 fill-yellow-500" size={16} />
                    <span className="font-medium">{therapist.rating}</span>
                    <span className="text-gray-500 text-sm">
                      ({therapist.totalSessions} sessions)
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {therapist.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Languages</p>
                    <div className="flex flex-wrap gap-1">
                      {therapist.languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Education</p>
                    <p className="text-sm">{therapist.education}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Experience</p>
                    <p className="text-sm">{therapist.experience} years</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">About</p>
                  <p className="text-sm text-gray-700">{therapist.bio}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book Your Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div>
                  <Label className="text-base mb-3 flex items-center gap-2">
                    <CalendarIcon size={18} />
                    Select Date
                  </Label>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <Label className="text-base mb-3 flex items-center gap-2">
                    <Clock size={18} />
                    Select Time Slot
                  </Label>
                  <RadioGroup value={selectedTime} onValueChange={setSelectedTime}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableTimeSlots.map((time) => (
                        <div key={time} className="flex items-center">
                          <RadioGroupItem
                            value={time}
                            id={time}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={time}
                            className="flex-1 flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-50 hover:bg-gray-50 transition-colors"
                          >
                            {time}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>

                {/* Payment Method */}
                <div>
                  <Label className="text-base mb-3 flex items-center gap-2">
                    <DollarSign size={18} />
                    Payment Method
                  </Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <RadioGroupItem value="esewa" id="esewa" className="peer sr-only" />
                        <Label
                          htmlFor="esewa"
                          className="flex-1 flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-50 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-12 h-8 bg-purple-100 rounded flex items-center justify-center">
                            <span className="text-xs font-semibold text-purple-700">eSewa</span>
                          </div>
                          <span>eSewa Digital Wallet</span>
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <RadioGroupItem value="khalti" id="khalti" className="peer sr-only" />
                        <Label
                          htmlFor="khalti"
                          className="flex-1 flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer peer-data-[state=checked]:border-teal-600 peer-data-[state=checked]:bg-teal-50 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-12 h-8 bg-purple-700 rounded flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">Khalti</span>
                          </div>
                          <span>Khalti Digital Wallet</span>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session Duration</span>
                    <span className="font-medium">45 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Session Fee</span>
                    <span className="font-medium">NPR {therapist.pricePerSession}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-teal-600">
                      NPR {therapist.pricePerSession}
                    </span>
                  </div>
                </div>

                {/* Book Button */}
                <Button
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime}
                  className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-base"
                >
                  Confirm & Pay NPR {therapist.pricePerSession}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By booking, you agree to our Terms of Service and Privacy Policy. 
                  You will receive a confirmation email once payment is processed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
