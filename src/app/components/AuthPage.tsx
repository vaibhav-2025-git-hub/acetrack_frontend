import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  UserCircle, 
  Users, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  BookOpen, 
  Phone,
  MapPin,
  School,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface AuthPageProps {
  onLogin: (userType: 'student' | 'parent' | 'faculty', userData: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [userType, setUserType] = useState<'student' | 'parent' | 'faculty'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    
    // Student fields
    fullName: '',
    class: '12th', // Hardcoded for 12th
    board: 'cbse', // Hardcoded for CBSE
    stream: '',
    phoneNumber: '',
    schoolName: '',
    
    // Parent fields
    parentName: '',
    studentName: '',
    studentClass: '',
    relationship: '',
    parentPhone: '',
    
    // Faculty fields
    facultyName: '',
    instituteName: '',
    subjects: [] as string[],
    qualification: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (authMode === 'register' && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (authMode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (userType === 'student') {
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.class) newErrors.class = 'Class is required';
        if (!formData.board) newErrors.board = 'Board is required';
        if (!formData.stream) newErrors.stream = 'Stream is required';
      } else if (userType === 'parent') {
        if (!formData.parentName) newErrors.parentName = 'Your name is required';
        if (!formData.studentName) newErrors.studentName = 'Student name is required';
        if (!formData.studentClass) newErrors.studentClass = 'Student class is required';
        if (!formData.relationship) newErrors.relationship = 'Relationship is required';
      } else if (userType === 'faculty') {
        if (!formData.facultyName) newErrors.facultyName = 'Your name is required';
        if (!formData.instituteName) newErrors.instituteName = 'Institute name is required';
        if (!formData.qualification) newErrors.qualification = 'Qualification is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'login') {
        // localStorage-only login
        const storedUsers = JSON.parse(localStorage.getItem('acetrack_users') || '[]');
        const user = storedUsers.find((u: any) => u.email === formData.email);
        
        if (!user) {
          toast.error('No account found with this email');
          setIsLoading(false);
          return;
        }
        
        if (user.password !== formData.password) {
          toast.error('Incorrect password');
          setIsLoading(false);
          return;
        }
        
        toast.success(`Welcome back! Logging in as ${userType}...`);
        setTimeout(() => {
          onLogin(userType, {
            email: user.email,
            type: userType,
            name: user.name,
            isReturningUser: true,
          });
        }, 500);
      } else {
        // localStorage-only signup
        const storedUsers = JSON.parse(localStorage.getItem('acetrack_users') || '[]');
        const existingUser = storedUsers.find((u: any) => u.email === formData.email);
        
        if (existingUser) {
          toast.error('Account already exists with this email');
          setIsLoading(false);
          return;
        }
        
        // Create new user
        const newUser = {
          email: formData.email,
          password: formData.password,
          name: userType === 'student' ? formData.fullName : userType === 'parent' ? formData.parentName : formData.facultyName,
          type: userType,
          class: userType === 'student' ? formData.class : formData.studentClass,
          board: formData.board,
          stream: formData.stream,
          createdAt: new Date().toISOString(),
        };
        
        storedUsers.push(newUser);
        localStorage.setItem('acetrack_users', JSON.stringify(storedUsers));
        
        toast.success(`Account created successfully! Welcome aboard! 🎉`);
        setTimeout(() => {
          onLogin(userType, {
            email: newUser.email,
            type: userType,
            name: newUser.name,
            class: newUser.class,
            board: newUser.board,
            stream: newUser.stream,
            isReturningUser: false,
          });
        }, 500);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(`Authentication failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    toast.success('Demo login successful! 🎓');
    setTimeout(() => {
      onLogin('student', {
        email: 'demo@student.com',
        type: 'student',
        name: 'Demo Student',
        class: '11',
        board: 'CBSE',
        stream: 'Science PCM',
        isReturningUser: false, // Demo goes through setup to showcase features
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AceTrack</h1>
          </div>
          <p className="text-sm text-gray-600">Class 12 CBSE Science Excellence</p>
        </div>

        {/* Auth Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-900">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setErrors({});
                }}
                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
              >
                {authMode === 'login' ? 'Sign Up' : 'Sign In'}
              </Button>
            </div>
            <CardDescription className="text-sm text-gray-600">
              {authMode === 'login' 
                ? 'Continue your learning journey' 
                : 'Join AceTrack today'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* User Type Selection */}
            <Tabs value={userType} onValueChange={(v) => setUserType(v as 'student' | 'parent' | 'faculty')} className="mb-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                <TabsTrigger value="student" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Student
                </TabsTrigger>
                <TabsTrigger value="parent" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Parent
                </TabsTrigger>
                <TabsTrigger value="faculty" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
                  Faculty
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Login Form */}
              {authMode === 'login' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder={userType === 'student' ? 'student@example.com' : 'parent@example.com'}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-slate-300" />
                      <span className="text-slate-600">Remember me</span>
                    </label>
                    <button type="button" className="text-purple-600 hover:text-purple-700 font-semibold">
                      Forgot password?
                    </button>
                  </div>
                </>
              )}

              {/* Registration Form */}
              {authMode === 'register' && userType === 'student' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">Full Name</Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.fullName && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.fullName}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-slate-700">Class & Board</Label>
                    <div className="px-3 py-2 border border-slate-200 rounded-md bg-slate-50">
                      <p className="text-sm font-semibold text-slate-700">Class 12th - CBSE Board</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stream" className="text-sm font-semibold text-slate-700">Science Stream *</Label>
                    <select
                      id="stream"
                      value={formData.stream}
                      onChange={(e) => handleInputChange('stream', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md ${errors.stream ? 'border-red-500' : 'border-slate-300'}`}
                    >
                      <option value="">Select Stream</option>
                      <option value="pcmb">PCMB (Physics, Chemistry, Maths, Biology)</option>
                      <option value="pcm-cs">PCM(CS) (Physics, Chemistry, Maths, Computer Science)</option>
                      <option value="pcb-cs">PCB(CS) (Physics, Chemistry, Biology, Computer Science)</option>
                    </select>
                    {errors.stream && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.stream}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="student@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <div className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.confirmPassword}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Parent Registration Form */}
              {authMode === 'register' && userType === 'parent' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="parentName" className="text-sm font-semibold text-slate-700">Your Name</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="parentName"
                        type="text"
                        placeholder="Parent's full name"
                        value={formData.parentName}
                        onChange={(e) => handleInputChange('parentName', e.target.value)}
                        className={`pl-10 ${errors.parentName ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentName" className="text-sm font-semibold text-slate-700">Student's Name</Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="studentName"
                        type="text"
                        placeholder="Your child's name"
                        value={formData.studentName}
                        onChange={(e) => handleInputChange('studentName', e.target.value)}
                        className={`pl-10 ${errors.studentName ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentClass" className="text-sm font-semibold text-slate-700">Student's Class</Label>
                      <select
                        id="studentClass"
                        value={formData.studentClass}
                        onChange={(e) => handleInputChange('studentClass', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${errors.studentClass ? 'border-red-500' : 'border-slate-300'}`}
                      >
                        <option value="">Select</option>
                        <option value="11">Class 11</option>
                        <option value="12">Class 12</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="relationship" className="text-sm font-semibold text-slate-700">Relationship</Label>
                      <select
                        id="relationship"
                        value={formData.relationship}
                        onChange={(e) => handleInputChange('relationship', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md ${errors.relationship ? 'border-red-500' : 'border-slate-300'}`}
                      >
                        <option value="">Select</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="parent@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Faculty Registration Form */}
              {authMode === 'register' && userType === 'faculty' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="facultyName" className="text-sm font-semibold text-slate-700">Your Name</Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="facultyName"
                        type="text"
                        placeholder="Faculty's full name"
                        value={formData.facultyName}
                        onChange={(e) => handleInputChange('facultyName', e.target.value)}
                        className={`pl-10 ${errors.facultyName ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instituteName" className="text-sm font-semibold text-slate-700">Institute Name</Label>
                    <div className="relative">
                      <School className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="instituteName"
                        type="text"
                        placeholder="Name of your institute"
                        value={formData.instituteName}
                        onChange={(e) => handleInputChange('instituteName', e.target.value)}
                        className={`pl-10 ${errors.instituteName ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualification" className="text-sm font-semibold text-slate-700">Qualification</Label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="qualification"
                        type="text"
                        placeholder="Your highest qualification"
                        value={formData.qualification}
                        onChange={(e) => handleInputChange('qualification', e.target.value)}
                        className={`pl-10 ${errors.qualification ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="faculty@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 characters"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm"
                size="lg"
                disabled={isLoading}
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>

              {authMode === 'register' && (
                <p className="text-xs text-center text-slate-500">
                  By signing up, you agree to our{' '}
                  <button type="button" className="text-purple-600 hover:underline">Terms of Service</button>
                  {' '}and{' '}
                  <button type="button" className="text-purple-600 hover:underline">Privacy Policy</button>
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};