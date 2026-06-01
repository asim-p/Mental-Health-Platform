import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardFooter } from "./ui/card.jsx";
import { Button } from "./ui/button.jsx";
import { Badge } from "./ui/badge.jsx";
import { Star, Languages, DollarSign, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export function TherapistCard({ therapist }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isTherapist = user?.role === 'THERAPIST' || user?.role === 'ADMIN';
  const displayName = therapist.name;

  const handleBookClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/book/${therapist.id}`);
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all hover:-translate-y-0.5 duration-300 border border-border">
      <CardContent className="pt-6">
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            {therapist.profileImage ? (
              <img 
                src={therapist.profileImage} 
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-primary">
                {displayName.split(" ").map(n => n[0]).join("")}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg truncate">{displayName}</h3>
              {therapist.verified && (
                <CheckCircle className="text-primary flex-shrink-0" size={16} />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{therapist.title}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{therapist.experience || 0} years experience</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Available</span>
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <Languages size={14} />
              <span>Languages</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {therapist.languages.map((lang) => (
                <Badge key={lang} variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-1">Specialties</div>
            <div className="flex flex-wrap gap-1">
              {therapist.specialties.slice(0, 3).map((specialty) => (
                <Badge key={specialty} className="text-xs bg-primary/10 text-primary border-primary/20">
                  {specialty}
                </Badge>
              ))}
              {therapist.specialties.length > 3 && (
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                  +{therapist.specialties.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm">
            <DollarSign size={14} className="text-muted-foreground" />
            <span className="font-semibold text-primary">NPR {therapist.pricePerSession}</span>
            <span className="text-muted-foreground">/ hour</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {therapist.bio}
        </p>
      </CardContent>

      {!isTherapist && (
        <CardFooter>
          <Button 
            onClick={handleBookClick}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Book Appointment
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
