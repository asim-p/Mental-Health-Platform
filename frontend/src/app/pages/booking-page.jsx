import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Navbar } from "../components/navbar.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Label } from "../components/ui/label.jsx";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group.jsx";
import { Calendar } from "../components/ui/calendar.jsx";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext.jsx";
import { ArrowLeft, CheckCircle, Calendar as CalendarIcon, Clock, DollarSign, Languages, Loader2 } from "lucide-react";
import { api } from "../services/api.js";



export function BookingPage() {
  const { therapistId } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [therapist, setTherapist] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("esewa");

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      toast.error("Please login to book an appointment");
      navigate("/login");
      return;
    }

    if (user.role === "THERAPIST") {
      toast.error("Therapists cannot book appointments");
      navigate("/therapists");
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    const loadTherapist = async () => {
      try {
        setIsLoading(true);
        const response = await api.therapists.getById(therapistId);
        if (response.success) {
          setTherapist(response.data);
        }
      } catch (error) {
        console.error("Failed to load therapist:", error);
        toast.error("Therapist not found");
      } finally {
        setIsLoading(false);
      }
    };

    if (therapistId) {
      loadTherapist();
    }
  }, [therapistId]);

  const generateSlots = useCallback((availability, bookedSlots, date) => {
    const dayOfWeek = date.getDay();
    const daySlots = availability.filter(a => Number(a.dayOfWeek) === dayOfWeek && a.isAvailable);
    
    if (daySlots.length === 0) return [];

    const slots = [];
    for (const slot of daySlots) {
      const [hour, minute] = slot.time.split(":").map(Number);
      const slotTime = new Date(date);
      slotTime.setHours(hour, minute, 0, 0);
      
      const isoString = slotTime.toISOString();
      const isBooked = bookedSlots.some(booked => new Date(booked).getTime() === slotTime.getTime());
      const isPast = slotTime < new Date();

      if (!isBooked && !isPast) {
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        slots.push({
          display: `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`,
          value: isoString
        });
      }
    }
    return slots.sort((a, b) => new Date(a.value).getTime() - new Date(b.value).getTime());
  }, []);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!therapist || !selectedDate) return;
      
      try {
        const dateStr = selectedDate.toISOString().split("T")[0];
        const response = await api.therapists.getAvailability(therapist.user.id, dateStr);
        if (response.success) {
          const slots = generateSlots(response.data.availability, response.data.bookedSlots, selectedDate);
          setAvailableSlots(slots);
        }
      } catch (error) {
        console.error("Failed to load availability:", error);
      }
    };

    loadAvailability();
  }, [therapist, selectedDate, generateSlots]);

  const handleBooking = async (e) => {
    if (e) e.preventDefault();
    
    if (!selectedTime) {
      toast.error("Please select a time slot");
      return;
    }

    try {
      const response = await api.appointments.create({
        therapistId: therapist.id,
        scheduledAt: selectedTime,
        notes: "Booking via platform",
      });

      if (response.success) {
        toast.success("Appointment booked successfully!");
        setTimeout(() => {
          navigate("/dashboard/patient");
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message || "Failed to book appointment");
    }
  };

  const displayName = therapist?.user ? `${therapist.user.firstName} ${therapist.user.lastName}` : therapist?.displayName || therapist?.name;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">Therapist not found</p>
              <Link to="/therapists">
                <Button>Find Therapists</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/therapists" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Therapists
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Therapist Info */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                    {therapist.profileImage ? (
                      <img 
                        src={therapist.profileImage} 
                        alt={displayName}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-primary">
                        {displayName.split(" ").map(n => n[0]).join("")}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">{displayName}</h3>
                  <p className="text-gray-600 mb-4">{therapist.title}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {therapist.isVerified ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={16} />
                        <span className="text-sm">Verified</span>
                      </div>
                    ) : (
                      <Badge className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                        Verification Pending
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{therapist.yearsOfExperience || 0} years experience</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                    <DollarSign className="w-4 h-4" />
                    <span>NPR {therapist.hourlyRate} / hour</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                    <Languages className="w-4 h-4" />
                    <div className="flex flex-wrap gap-1">
                      {therapist.languages?.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 text-left">
                    <p className="font-medium mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {therapist.specialization?.map((specialty) => (
                        <Badge key={specialty} className="text-xs bg-primary/10 text-primary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book Appointment with {displayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <Label className="text-base font-medium mb-4 block">Select Date</Label>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        disabled={(date) => date < new Date()}
                      />
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <Label className="text-base font-medium mb-4 block">Select Time Slot</Label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot.value}
                            type="button"
                            variant={selectedTime === slot.value ? "default" : "outline"}
                            className={selectedTime === slot.value ? "bg-teal-600 hover:bg-teal-700" : ""}
                            onClick={() => setSelectedTime(slot.value)}
                          >
                            {slot.display}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4 border rounded-md">
                        No available slots for this date.
                      </p>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-green-100 shadow-sm">
                      <span className="font-bold text-green-600 text-xs">eSewa</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-900">Payment via eSewa</p>
                      <p className="text-xs text-green-700">Fast and secure mobile payment.</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 flex justify-between text-lg">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-teal-600">
                      NPR {therapist.pricePerSession || therapist.hourlyRate}
                    </span>
                  </div>

                  {/* Book Button */}
                  <Button
                    type="submit"
                    disabled={!selectedDate || !selectedTime}
                    className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-base"
                  >
                    Confirm & Pay NPR {therapist.pricePerSession || therapist.hourlyRate}
                  </Button>
                </form>

                <p className="mt-4 text-xs text-gray-500 text-center">
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
