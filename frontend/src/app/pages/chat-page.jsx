import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { io } from "socket.io-client";
import { Navbar } from "../components/navbar.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  Calendar, 
  Clock, 
  CreditCard, 
  Lock, 
  ShieldAlert, 
  User, 
  Video, 
  Loader2, 
  CheckCircle,
  AlertCircle
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const SOCKET_URL = API_BASE_URL.replace('/api', '');

export function ChatPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [appointment, setAppointment] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Authentication check
  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      toast.error("Please login to access the chat");
      navigate("/login");
    }
  }, [user, isAuthLoading, navigate]);

  // Load appointment and message details
  useEffect(() => {
    const loadChatData = async () => {
      try {
        setIsLoading(true);
        const response = await api.appointments.getById(appointmentId);
        if (response.success && response.data) {
          setAppointment(response.data);
          if (response.data.chatMessages) {
            setMessages(response.data.chatMessages);
          }
        }
      } catch (error) {
        console.error("Failed to load chat details:", error);
        toast.error(error.message || "Failed to load consultation session");
      } finally {
        setIsLoading(false);
      }
    };

    if (appointmentId && user) {
      loadChatData();
    }
  }, [appointmentId, user]);

  // Socket.io real-time connection
  useEffect(() => {
    if (!appointmentId || !user || !appointment) return;

    const allowedStatuses = ["CONFIRMED", "COMPLETED"];
    if (!allowedStatuses.includes(appointment.status)) return; // Don't connect socket if payment is not confirmed

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit("join_appointment", appointmentId);
    console.log("Connected to secure socket room:", appointmentId);

    socket.on("new_message", (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id || m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    return () => {
      socket.emit("leave_appointment", appointmentId);
      socket.disconnect();
    };
  }, [appointmentId, user, appointment]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    try {
      setIsSending(true);
      const res = await api.chat.sendMessage(appointmentId, inputValue.trim());
      if (res.success && res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.data.id)) return prev;
          return [...prev, res.data];
        });
        setInputValue("");
      }
    } catch (error) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handlePayment = async () => {
    if (!appointment || isProcessingPayment) return;
    try {
      setIsProcessingPayment(true);
      const paymentRes = await api.payments.initiate(appointment.id);
      
      if (paymentRes.success && paymentRes.data) {
        const { paymentUrl, params } = paymentRes.data;
        
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", paymentUrl);
        
        for (const key in params) {
          const hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", params[key]);
          form.appendChild(hiddenField);
        }
        
        document.body.appendChild(form);
        form.submit();
      }
    } catch (error) {
      toast.error(error.message || "Failed to initiate payment");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-55 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600 mb-4" />
        <p className="text-gray-600 font-medium">Securing session connection...</p>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <Card>
            <CardContent className="pt-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Session Not Found</h3>
              <p className="text-gray-500 mb-6">This appointment session could not be retrieved or is invalid.</p>
              <Button onClick={() => navigate(user?.role === "THERAPIST" ? "/dashboard/therapist" : "/dashboard/patient")}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if paid
  const isPaid = ["CONFIRMED", "COMPLETED"].includes(appointment.status);

  // Locked Screen render
  if (!isPaid) {
    const therapistName = `Dr. ${appointment.therapist?.user?.firstName} ${appointment.therapist?.user?.lastName}`;
    const patientName = `${appointment.patient?.user?.firstName} ${appointment.patient?.user?.lastName}`;
    
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
          <Card className="border-t-4 border-t-yellow-500 shadow-xl overflow-hidden rounded-2xl">
            <CardContent className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-yellow-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Consultation Room Locked</h2>
              
              <p className="text-slate-600 max-w-md mb-8 leading-relaxed">
                Secure messages and live consultations are enabled only **after payment is confirmed** by our gateway.
              </p>

              <div className="w-full bg-slate-50 rounded-xl p-5 border border-slate-100 text-left mb-8">
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Appointment details:
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600">
                  <div>Consultant:</div>
                  <div className="font-medium text-slate-800">{therapistName}</div>
                  
                  <div>Patient:</div>
                  <div className="font-medium text-slate-800">{patientName}</div>
                  
                  <div>Date:</div>
                  <div className="font-medium text-slate-800">{formatDate(appointment.scheduledAt)}</div>
                  
                  <div>Time:</div>
                  <div className="font-medium text-slate-800">{formatTime(appointment.scheduledAt)}</div>

                  <div>Rate:</div>
                  <div className="font-medium text-teal-600 font-bold">NPR {appointment.payment?.amount || appointment.therapist?.hourlyRate}</div>
                </div>
              </div>

              {user?.role === "PATIENT" ? (
                <div className="space-y-4 w-full">
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-6 text-base rounded-xl shadow-md transition-all duration-200 gap-2"
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                  >
                    {isProcessingPayment ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CreditCard className="w-5 h-5" />
                    )}
                    Pay NPR {appointment.payment?.amount || appointment.therapist?.hourlyRate} with eSewa
                  </Button>
                  <Link to="/dashboard/patient" className="block text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
                    Back to Dashboard
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 w-full">
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-100 flex items-center gap-2 text-sm text-left">
                    <ShieldAlert className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <span>Please contact the patient to complete the eSewa payment to start this session.</span>
                  </div>
                  <Link to="/dashboard/therapist" className="block text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors">
                    Back to Dashboard
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Determine chat partner details
  const isUserPatient = user.role === "PATIENT";
  const partnerName = isUserPatient 
    ? `Dr. ${appointment.therapist?.user?.firstName} ${appointment.therapist?.user?.lastName}`
    : `${appointment.patient?.user?.firstName} ${appointment.patient?.user?.lastName}`;
  const partnerRole = isUserPatient ? "Specialist Therapist" : "Patient";
  const partnerSpecialty = isUserPatient ? appointment.therapist?.specialization?.join(", ") : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
      <Navbar />
      
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex gap-4 overflow-hidden h-full">
        {/* Left column: Consultation session details */}
        <div className="hidden lg:flex flex-col w-80 flex-shrink-0">
          <Card className="flex-1 flex flex-col overflow-hidden shadow-md">
            <CardHeader className="bg-gradient-to-r from-teal-700 to-teal-800 text-white rounded-t-xl py-6">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/10 -ml-2"
                  onClick={() => navigate(isUserPatient ? "/dashboard/patient" : "/dashboard/therapist")}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <CardTitle className="text-lg">Session Info</CardTitle>
                  <CardDescription className="text-white/80 text-xs">Secure Consulting Room</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Partner Profile card */}
              <div className="text-center pb-6 border-b border-slate-100">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-inner">
                  <User className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">{partnerName}</h3>
                <p className="text-slate-500 text-xs mt-1">{partnerRole}</p>
                {partnerSpecialty && (
                  <Badge variant="outline" className="mt-3 bg-teal-50/50 text-teal-700 border-teal-100 text-[10px] px-2 py-0.5">
                    {partnerSpecialty}
                  </Badge>
                )}
              </div>

              {/* Appointment Schedule */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-700 text-xs tracking-wider uppercase">Schedule</h4>
                
                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <Calendar className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>{formatDate(appointment.scheduledAt)}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <Clock className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span>{formatTime(appointment.scheduledAt)} ({appointment.duration || 60} mins)</span>
                </div>
              </div>

              {/* Payment and Room status */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-700 text-xs tracking-wider uppercase">Receipt & Safety</h4>
                
                <div className="bg-green-50/60 border border-green-100 text-green-800 p-3 rounded-lg text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    <span>eSewa Payment Confirmed</span>
                  </div>
                  <div className="pl-5 text-green-700">
                    <div>Amt: NPR {appointment.payment?.amount || appointment.therapist?.hourlyRate}</div>
                    <div className="mt-0.5 opacity-80">Ref: {appointment.payment?.esewaRefId || "GATEWAY_VERIFIED"}</div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 text-slate-600 p-3 rounded-lg text-[11px] leading-relaxed">
                  🔐 Consultations are end-to-end encrypted. Standard verification code is active.
                </div>
              </div>

              {/* Zoom Meeting Link */}
              {(appointment.zoomJoinUrl || appointment.zoomMeetingUrl) && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-semibold text-slate-700 text-xs tracking-wider uppercase">Video Room</h4>
                  <a 
                    href={isUserPatient ? appointment.zoomJoinUrl : appointment.zoomMeetingUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block"
                  >
                    <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center justify-center gap-2 py-5 rounded-lg shadow-sm">
                      <Video className="w-4 h-4" />
                      Launch Video Call
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Chat thread */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-hidden shadow-md">
            {/* Header */}
            <div className="bg-white border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="lg:hidden text-slate-600 hover:bg-slate-100"
                  onClick={() => navigate(isUserPatient ? "/dashboard/patient" : "/dashboard/therapist")}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-base">{partnerName}</span>
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" title="Active in consultation"></span>
                  </div>
                  <span className="text-slate-500 text-xs font-medium">{partnerRole}</span>
                </div>
              </div>

              {/* Mobile Video Call launcher */}
              {(appointment.zoomJoinUrl || appointment.zoomMeetingUrl) && (
                <a 
                  href={isUserPatient ? appointment.zoomJoinUrl : appointment.zoomMeetingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="lg:hidden"
                >
                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 p-2 text-white h-9 w-9 rounded-full flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>

            {/* Messages body */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4 flex flex-col">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-3 border border-teal-100">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-700 text-sm">Secure Consulting Active</h4>
                  <p className="text-slate-500 text-xs max-w-xs mt-1 leading-relaxed">
                    Say hello to **{partnerName}** below to start your private online conversation.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOutgoing = 
                    (isUserPatient && message.senderType === "PATIENT") ||
                    (!isUserPatient && message.senderType === "THERAPIST");
                  
                  return (
                    <div 
                      key={message.id || message._id} 
                      className={`flex flex-col max-w-[80%] ${isOutgoing ? "self-end items-end" : "self-start items-start"}`}
                    >
                      <div 
                        className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                          isOutgoing 
                            ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-tr-none" 
                            : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                        }`}
                      >
                        {message.content}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="bg-white border-t p-3">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message securely..."
                  disabled={isSending}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
                
                <Button 
                  type="submit" 
                  disabled={!inputValue.trim() || isSending}
                  className="bg-teal-600 hover:bg-teal-700 text-white w-12 h-12 rounded-xl flex items-center justify-center p-0 flex-shrink-0 transition-transform duration-100 active:scale-95 shadow-sm"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 -mr-0.5 -mt-0.5" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
