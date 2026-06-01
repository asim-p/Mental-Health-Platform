import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Navbar } from '../components/navbar.jsx';
import { Users, UserCheck, ShieldAlert, DollarSign, Calendar, CheckCircle, XCircle, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import { toast } from 'sonner';

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [therapists, setTherapists] = useState([]);
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('therapists');
  const [sessionFilter, setSessionFilter] = useState('all');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, therapistsRes, patientsRes, sessionsRes] = await Promise.all([
        api.admin.getStats(),
        api.users.getTherapists(),
        api.users.getPatients(),
        api.appointments.getAll({}),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (therapistsRes.success) setTherapists(therapistsRes.data);
      if (patientsRes.success) setPatients(patientsRes.data);
      if (sessionsRes.success) setSessions(sessionsRes.data);
      
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyTherapist = async (id, action) => {
    try {
      await api.users.verifyTherapist(id, action);
      toast.success(`Therapist ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`);
      // Optimistically update local state so UI reflects change immediately
      setTherapists(prev => prev.map(t =>
        t.id === id
          ? {
              ...t,
              therapistProfile: {
                ...t.therapistProfile,
                isVerified: action === 'APPROVE',
                verificationStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
              },
            }
          : t
      ));
    } catch (error) {
      toast.error('Failed to update therapist verification status');
    }
  };

  const handleCancelSession = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;
    try {
      await api.appointments.cancel(id, 'Cancelled by admin');
      toast.success('Session cancelled');
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'CANCELLED' } : s));
    } catch {
      toast.error('Failed to cancel session');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await api.users.deleteUser(id);
      toast.success('User deleted successfully');
      fetchData(); // Refresh data
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">Loading Admin Dashboard...</div>
      </div>
    );
  }

  const pendingTherapists = therapists.filter(t => t.therapistProfile && !t.therapistProfile.isVerified && t.therapistProfile.verificationStatus !== 'REJECTED');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="text-primary" /> Admin Control Panel
            </h1>
            <p className="text-muted-foreground">Manage users and platform operations</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{stats?.users.total || 0}</p>
                </div>
                <Users className="text-primary" size={32} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.users.patients || 0} Patients, {stats?.users.therapists || 0} Therapists
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Verifications</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingTherapists.length}</p>
                </div>
                <UserCheck className="text-yellow-600" size={32} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Therapists awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-600">NPR {stats?.revenue.total.toLocaleString() || 0}</p>
                </div>
                <DollarSign className="text-green-600" size={32} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">From completed sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Appointments</p>
                  <p className="text-3xl font-bold">{stats?.appointments.total || 0}</p>
                </div>
                <Calendar className="text-primary" size={32} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.appointments.completed || 0} Completed, {stats?.appointments.confirmed || 0} Confirmed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals Section */}
        <Card className="mb-8 border-yellow-200 bg-yellow-50/30">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <UserCheck size={20} /> Action Required: Pending Therapists
            </CardTitle>
            <CardDescription>Review and verify new therapist registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTherapists.length > 0 ? (
              <div className="space-y-4">
                {pendingTherapists.map(t => (
                  <div key={t.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-background border rounded-lg">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="font-semibold text-lg">{t.firstName} {t.lastName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t.email} {t.phone && `• ${t.phone}`}
                        {t.therapistProfile?.licenseNumber && ` • License: ${t.therapistProfile.licenseNumber}`}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {t.therapistProfile?.specialization?.map(spec => (
                          <Badge key={spec} variant="outline" className="text-xs">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={() => handleVerifyTherapist(t.id, 'REJECT')}
                      >
                        <XCircle size={16} className="mr-1" /> Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleVerifyTherapist(t.id, 'APPROVE')}
                      >
                        <CheckCircle size={16} className="mr-1" /> Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No therapists are currently pending verification.</p>
            )}
          </CardContent>
        </Card>

        {/* User Management Section */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all accounts on the platform</CardDescription>
            </div>
            <div className="flex bg-muted p-1 rounded-md mt-4 sm:mt-0">
              <Button 
                variant={activeTab === 'therapists' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('therapists')}
              >
                Therapists ({therapists.length})
              </Button>
              <Button 
                variant={activeTab === 'patients' ? 'secondary' : 'ghost'} 
                size="sm" 
                onClick={() => setActiveTab('patients')}
              >
                Patients ({patients.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Name</th>
                    <th className="px-4 py-3">Email / Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'therapists' ? therapists : patients).map(u => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.email}
                        <br/>
                        <span className="text-xs">{u.phone}</span>
                        {activeTab === 'therapists' && u.therapistProfile?.licenseNumber && (
                          <>
                            <br/>
                            <span className="text-xs text-primary font-medium">License: {u.therapistProfile.licenseNumber}</span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {activeTab === 'therapists' ? (
                          u.therapistProfile?.isVerified ? (
                            <Badge className="bg-green-100 text-green-800 border-none">Verified</Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200">Pending</Badge>
                          )
                        ) : (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {activeTab === 'therapists' && !u.therapistProfile?.isVerified && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 mr-2"
                            onClick={() => handleVerifyTherapist(u.id, 'APPROVE')}
                            title="Approve Therapist"
                          >
                            <CheckCircle size={16} />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {(activeTab === 'therapists' ? therapists : patients).length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                        No {activeTab} found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Session Management Section */}
        <Card className="mt-8">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock size={20} className="text-primary" />
                Session Management
              </CardTitle>
              <CardDescription>View and manage all therapy sessions on the platform</CardDescription>
            </div>
            <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-md mt-4 sm:mt-0">
              {['all', 'PENDING', 'PAID', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(f => (
                <Button
                  key={f}
                  variant={sessionFilter === f ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSessionFilter(f)}
                  className="text-xs"
                >
                  {f === 'all' ? `All (${sessions.length})` : `${f.charAt(0) + f.slice(1).toLowerCase()} (${sessions.filter(s => s.status === f).length})`}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/50 uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Patient</th>
                    <th className="px-4 py-3">Therapist</th>
                    <th className="px-4 py-3">Scheduled</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(sessionFilter === 'all' ? sessions : sessions.filter(s => s.status === sessionFilter))
                    .sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
                    .map(s => {
                      const statusColors = {
                        PENDING: 'bg-yellow-100 text-yellow-700',
                        PAID: 'bg-orange-100 text-orange-700',
                        CONFIRMED: 'bg-green-100 text-green-700',
                        COMPLETED: 'bg-blue-100 text-blue-700',
                        CANCELLED: 'bg-red-100 text-red-700',
                      };
                      const statusLabels = {
                        PENDING: 'Awaiting Payment',
                        PAID: 'Awaiting Confirmation',
                        CONFIRMED: 'Confirmed',
                        COMPLETED: 'Completed',
                        CANCELLED: 'Cancelled',
                      };
                      return (
                        <tr key={s.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="px-4 py-3 font-medium">
                            {s.patient?.user?.firstName} {s.patient?.user?.lastName}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            Dr. {s.therapist?.user?.firstName} {s.therapist?.user?.lastName}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(s.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            <br />
                            <span className="text-xs">{new Date(s.scheduledAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {s.payment?.amount ? `NPR ${s.payment.amount.toLocaleString()}` : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`${statusColors[s.status] || 'bg-gray-100 text-gray-700'} border-none text-xs`}>
                              {statusLabels[s.status] || s.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {s.status !== 'CANCELLED' && s.status !== 'COMPLETED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleCancelSession(s.id)}
                                title="Cancel Session"
                              >
                                <XCircle size={16} />
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  {(sessionFilter === 'all' ? sessions : sessions.filter(s => s.status === sessionFilter)).length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                        No sessions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
