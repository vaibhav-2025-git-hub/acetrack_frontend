import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
  Briefcase,
  Brain,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface AuthPageProps {
  onLogin: (userType: 'student' | 'parent' | 'faculty', userData: any) => void;
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, initialMode = 'login' }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(initialMode);
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
    studentCode: '',
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
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password,
          user_type: userType,
        });

        toast.success(`Welcome back! Logging in as ${response.data.user_type}...`);
        setTimeout(() => {
          onLogin(response.data.user_type, {
            ...response.data,
            isReturningUser: true,
          });
        }, 500);
      } else {
        // Register
        const email = formData.email.trim().toLowerCase();
        const registerData = {
          email: email,
          password: formData.password,
          user_type: userType,
          name: userType === 'student' ? formData.fullName : userType === 'parent' ? formData.parentName : formData.facultyName,
          // Parent specific fields
          studentCode: userType === 'parent' ? formData.studentCode : undefined,
          relationship: userType === 'parent' ? formData.relationship : undefined,
        };

        const response = await authAPI.register(registerData);

        toast.success(`Account created successfully! Welcome aboard! 🎉`);
        setTimeout(() => {
          onLogin(userType, {
            ...response.data,
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

  return (
    <div className="min-h-screen flex overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900 bg-white">

      {/* Left Panel - Visual/Brand (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col justify-between p-12 xl:p-20">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">AceTrack</span>
          </div>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span className="text-sm font-medium text-indigo-100">AI-Powered Study Planning</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Unlock your true academic potential.
            </h2>
            <p className="text-lg text-indigo-200/80 mb-8 leading-relaxed">
              Join thousands of students, parents, and faculty using intelligent insights to build better habits and achieve better results.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <CheckCircle2 className="w-4 h-4 text-indigo-300" />
                </div>
                <span className="text-indigo-100 font-medium">Personalized daily study schedules</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <CheckCircle2 className="w-4 h-4 text-indigo-300" />
                </div>
                <span className="text-indigo-100 font-medium">Live progress & readiness tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <CheckCircle2 className="w-4 h-4 text-indigo-300" />
                </div>
                <span className="text-indigo-100 font-medium">Direct faculty feedback & curriculum</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-indigo-300/60 font-medium">
            © {new Date().getFullYear()} AceTrack Technologies.
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-white overflow-y-auto">
        <div className="w-full max-w-md my-auto">

          {/* Mobile Logo */}
          <div className="flex lg:hidden flex-col items-center justify-center gap-2 mb-8">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900 mt-2">AceTrack</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {authMode === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-slate-500 mt-2">
              {authMode === 'login'
                ? 'Enter your credentials to access your dashboard.'
                : 'Join AceTrack to start optimizing your learning journey.'}
            </p>
          </div>

          <div className="bg-slate-100/50 p-1 rounded-xl flex items-center mb-8 border border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={() => { setUserType('student'); setErrors({}); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${userType === 'student' ? 'bg-white shadow-sm text-indigo-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => { setUserType('parent'); setErrors({}); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${userType === 'parent' ? 'bg-white shadow-sm text-indigo-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Parent
            </button>
            <button
              type="button"
              onClick={() => { setUserType('faculty'); setErrors({}); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${userType === 'faculty' ? 'bg-white shadow-sm text-indigo-600 border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Faculty
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Login Mode Fields */}
            {authMode === 'login' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={userType === 'student' ? 'student@example.com' : userType === 'parent' ? 'parent@example.com' : 'faculty@example.com'}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-indigo-600'}`}
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" /><span>{errors.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                    <button type="button" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`pl-10 pr-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-indigo-600'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
                      <AlertCircle className="w-3 h-3" /><span>{errors.password}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Registration Mode Fields */}
            {authMode === 'register' && (
              <div className="space-y-4">
                {/* Student specific fields */}
                {userType === 'student' && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">Full Name</Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className={`pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl ${errors.fullName ? 'border-red-500' : 'focus-visible:ring-indigo-600'}`}
                        />
                      </div>
                      {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-semibold text-slate-700">Class & Board</Label>
                      <div className="px-4 py-2.5 h-11 border border-slate-200 rounded-xl bg-slate-50 flex items-center">
                        <p className="text-sm font-semibold text-slate-700">Class 12th - CBSE Board</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="stream" className="text-sm font-semibold text-slate-700">Science Stream *</Label>
                      <select
                        id="stream"
                        value={formData.stream}
                        onChange={(e) => handleInputChange('stream', e.target.value)}
                        className={`w-full px-4 h-11 border rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 ${errors.stream ? 'border-red-500' : 'border-slate-200'}`}
                      >
                        <option value="">Select Stream</option>
                        <option value="pcmb">PCMB (Physics, Chem, Math, Bio)</option>
                        <option value="pcm-cs">PCM(CS) (Physics, Chem, Math, CS)</option>
                        <option value="pcb-cs">PCB(CS) (Physics, Chem, Bio, CS)</option>
                      </select>
                      {errors.stream && <p className="text-xs text-red-500 mt-1">{errors.stream}</p>}
                    </div>
                  </>
                )}

                {/* Parent specific fields */}
                {userType === 'parent' && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="parentName" className="text-sm font-semibold text-slate-700">Your Name</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <Input
                          id="parentName"
                          type="text"
                          placeholder="Parent's full name"
                          value={formData.parentName}
                          onChange={(e) => handleInputChange('parentName', e.target.value)}
                          className={`pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl ${errors.parentName ? 'border-red-500' : 'focus-visible:ring-indigo-600'}`}
                        />
                      </div>
                      {errors.parentName && <p className="text-xs text-red-500 mt-1">{errors.parentName}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="studentName" className="text-sm font-semibold text-slate-700">Student's Name</Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <Input
                          id="studentName"
                          type="text"
                          placeholder="Your child's name"
                          value={formData.studentName}
                          onChange={(e) => handleInputChange('studentName', e.target.value)}
                          className={`pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl ${errors.studentName ? 'border-red-500' : 'focus-visible:ring-indigo-600'}`}
                        />
                      </div>
                      {errors.studentName && <p className="text-xs text-red-500 mt-1">{errors.studentName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="studentClass" className="text-sm font-semibold text-slate-700">Student's Class</Label>
                        <select
                          id="studentClass"
                          value={formData.studentClass}
                          onChange={(e) => handleInputChange('studentClass', e.target.value)}
                          className={`w-full px-4 h-11 border rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 ${errors.studentClass ? 'border-red-500' : 'border-slate-200'}`}
                        >
                          <option value="">Select</option>
                          <option value="11">Class 11</option>
                          <option value="12">Class 12</option>
                        </select>
                        {errors.studentClass && <p className="text-xs text-red-500 mt-1">{errors.studentClass}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="relationship" className="text-sm font-semibold text-slate-700">Relationship</Label>
                        <select
                          id="relationship"
                          value={formData.relationship}
                          onChange={(e) => handleInputChange('relationship', e.target.value)}
                          className={`w-full px-4 h-11 border rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 ${errors.relationship ? 'border-red-500' : 'border-slate-200'}`}
                        >
                          <option value="">Select</option>
                          <option value="Father">Father</option>
                          <option value="Mother">Mother</option>
                          <option value="Guardian">Guardian</option>
                        </select>
                        {errors.relationship && <p className="text-xs text-red-500 mt-1">{errors.relationship}</p>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="studentCode" className="text-sm font-semibold text-slate-700">Student's AceTrack ID *</Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <Input
                          id="studentCode"
                          type="text"
                          required
                          placeholder="ACE-XXXXXX"
                          value={formData.studentCode}
                          onChange={(e) => handleInputChange('studentCode', e.target.value)}
                          className={`pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl ${errors.studentCode ? 'border-red-500' : 'focus-visible:ring-indigo-600'}`}
                        />
                      </div>
                      {errors.studentCode && <p className="text-xs text-red-500 mt-1">{errors.studentCode}</p>}
                    </div>
                  </>
                )}

                {/* Faculty specific fields */}
                {userType === 'faculty' && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="facultyName" className="text-sm font-semibold text-slate-700">Your Name</Label>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <Input
                          id="facultyName"
                          type="text"
                          placeholder="Faculty's full name"
                          value={formData.facultyName}
                          onChange={(e) => handleInputChange('facultyName', e.target.value)}
                          className={`pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl ${errors.facultyName ? 'border-red-500' : 'focus-visible:ring-indigo-600'}`}
                        />
                      </div>
                      {errors.facultyName && <p className="text-xs text-red-500 mt-1">{errors.facultyName}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="instituteName" className="text-sm font-semibold text-slate-700">Institute Name</Label>
                      <div className="relative">
                        <School className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <Input
                          id="instituteName"
                          type="text"
                          placeholder="Name of your institute"
                          value={formData.instituteName}
                          onChange={(e) => handleInputChange('instituteName', e.target.value)}
                          className={`pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl ${errors.instituteName ? 'border-red-500' : 'focus-visible:ring-indigo-600'}`}
                        />
                      </div>
                      {errors.instituteName && <p className="text-xs text-red-500 mt-1">{errors.instituteName}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="qualification" className="text-sm font-semibold text-slate-700">Qualification</Label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                        <Input
                          id="qualification"
                          type="text"
                          placeholder="Your highest qualification"
                          value={formData.qualification}
                          onChange={(e) => handleInputChange('qualification', e.target.value)}
                          className={`pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl ${errors.qualification ? 'border-red-500' : 'focus-visible:ring-indigo-600'}`}
                        />
                      </div>
                      {errors.qualification && <p className="text-xs text-red-500 mt-1">{errors.qualification}</p>}
                    </div>
                  </>
                )}

                {/* Common Registration Fields */}
                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl ${errors.email ? 'border-red-500' : 'focus-visible:ring-indigo-600'}`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min. 8 char"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl ${errors.password ? 'border-red-500' : 'focus-visible:ring-indigo-600'}`}
                      />
                    </div>
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">Confirm</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Re-enter"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl ${errors.confirmPassword ? 'border-red-500' : 'focus-visible:ring-indigo-600'}`}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-slate-500 text-center">
                    By registering, you agree to our{' '}
                    <button type="button" className="text-indigo-600 hover:underline">Terms</button>
                    {' '}and{' '}
                    <button type="button" className="text-indigo-600 hover:underline">Privacy Policy</button>
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                  <span>Please wait...</span>
                </div>
              ) : (
                authMode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          {/* Toggle Register/Login */}
          <div className="mt-8 text-center text-sm text-slate-600">
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setErrors({});
              }}
              className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline ml-1 transition-all"
            >
              {authMode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};