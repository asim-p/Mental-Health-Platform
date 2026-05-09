import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Navbar } from "../components/navbar.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Switch } from "../components/ui/switch.jsx";
import { Label } from "../components/ui/label.jsx";
import { Input } from "../components/ui/input.jsx";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2, Clock } from "lucide-react";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function TherapistAvailability() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "THERAPIST") {
      navigate("/login");
      return;
    }

    const fetchAvailability = async () => {
      try {
        const response = await api.therapists.getById(user.id);
        if (response.success && response.data) {
          const existingSlots = response.data.availability || [];
          setSlots(existingSlots.map(s => ({
            id: s.id,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            isAvailable: s.isAvailable
          })));
        }
      } catch (error) {
        console.error("Failed to fetch availability:", error);
        toast.error("Failed to load availability settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [user, navigate]);

  const handleAddSlot = (dayIndex) => {
    const newSlot = {
      dayOfWeek: dayIndex,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    };
    setSlots([...slots, newSlot]);
  };

  const handleRemoveSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleUpdateSlot = (index, updates) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], ...updates };
    setSlots(newSlots);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await api.therapists.updateAvailability(slots);
      if (response.success) {
        toast.success("Availability updated successfully");
      }
    } catch (error) {
      console.error("Failed to update availability:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Availability</h1>
            <p className="text-muted-foreground">Set your weekly working hours for sessions</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </Button>
        </div>

        <div className="space-y-6">
          {DAYS.map((day, dayIndex) => {
            const daySlots = slots.filter(s => s.dayOfWeek === dayIndex);
            
            return (
              <Card key={day}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{day}</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddSlot(dayIndex)}
                      className="gap-1"
                    >
                      <Plus size={14} />
                      Add Slot
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {daySlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No availability set for this day.</p>
                  ) : (
                    <div className="space-y-3">
                      {slots.map((slot, index) => {
                        if (slot.dayOfWeek !== dayIndex) return null;
                        
                        return (
                          <div key={index} className="flex items-center gap-4 bg-muted/30 p-3 rounded-lg border">
                            <div className="flex items-center gap-2 flex-1">
                              <Clock size={16} className="text-muted-foreground" />
                              <div className="flex items-center gap-2">
                                <Input 
                                  type="time" 
                                  value={slot.startTime} 
                                  onChange={(e) => handleUpdateSlot(index, { startTime: e.target.value })}
                                  className="w-32 h-9"
                                />
                                <span className="text-muted-foreground">to</span>
                                <Input 
                                  type="time" 
                                  value={slot.endTime} 
                                  onChange={(e) => handleUpdateSlot(index, { endTime: e.target.value })}
                                  className="w-32 h-9"
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Switch 
                                  checked={slot.isAvailable} 
                                  onCheckedChange={(checked) => handleUpdateSlot(index, { isAvailable: checked })}
                                />
                                <Label className="text-xs">Available</Label>
                              </div>
                              
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleRemoveSlot(index)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
