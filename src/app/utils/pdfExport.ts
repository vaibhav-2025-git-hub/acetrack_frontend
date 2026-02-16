import { jsPDF } from 'jspdf';
import { UserProfile, StudyPlan } from '../types';

export const exportToPDF = (profile: UserProfile, plan: StudyPlan) => {
  const doc = new jsPDF();
  let currentPage = 1;

  // Helper function to add page header
  const addHeader = (pageNum: number) => {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${profile.name}'s Study Plan`, 20, 10);
    doc.text(`Page ${pageNum}`, 190, 10, { align: 'right' });
    doc.setTextColor(0);
  };

  // Helper function to check if we need a new page
  const checkPageBreak = (currentY: number, requiredSpace: number = 20): number => {
    if (currentY + requiredSpace > 280) {
      doc.addPage();
      currentPage++;
      addHeader(currentPage);
      return 25;
    }
    return currentY;
  };

  // Title Page
  doc.setFontSize(24);
  doc.setTextColor(237, 137, 54); // Orange color
  doc.text('📚 Personalized Study Plan', 105, 40, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Academic Year Study Schedule', 105, 50, { align: 'center' });

  // Decorative line
  doc.setDrawColor(237, 137, 54);
  doc.setLineWidth(0.5);
  doc.line(40, 60, 170, 60);

  // Student Information Section
  doc.setFontSize(16);
  doc.setTextColor(251, 146, 60); // Lighter orange
  doc.text('Student Information', 20, 75);

  doc.setFontSize(11);
  doc.setTextColor(0);
  let y = 85;

  doc.setFont(undefined, 'bold');
  doc.text('Name:', 25, y);
  doc.setFont(undefined, 'normal');
  doc.text(profile.name, 60, y);
  y += 8;

  doc.setFont(undefined, 'bold');
  doc.text('Class:', 25, y);
  doc.setFont(undefined, 'normal');
  doc.text(`${profile.class}`, 60, y);
  y += 8;

  doc.setFont(undefined, 'bold');
  doc.text('Board:', 25, y);
  doc.setFont(undefined, 'normal');
  doc.text(profile.board.toUpperCase(), 60, y);
  y += 8;

  doc.setFont(undefined, 'bold');
  doc.text('Stream:', 25, y);
  doc.setFont(undefined, 'normal');
  doc.text(profile.stream, 60, y);
  y += 8;

  doc.setFont(undefined, 'bold');
  doc.text('Daily Study Hours:', 25, y);
  doc.setFont(undefined, 'normal');
  doc.text(`${profile.studyHoursPerDay} hours`, 60, y);
  y += 8;

  doc.setFont(undefined, 'bold');
  doc.text('Learning Speed:', 25, y);
  doc.setFont(undefined, 'normal');
  doc.text(profile.learningSpeed.charAt(0).toUpperCase() + profile.learningSpeed.slice(1), 60, y);
  y += 8;

  doc.setFont(undefined, 'bold');
  doc.text('Plan Duration:', 25, y);
  doc.setFont(undefined, 'normal');
  doc.text(`${profile.totalDays} days`, 60, y);
  y += 15;

  // Study Plan Overview
  doc.setFontSize(16);
  doc.setTextColor(251, 146, 60);
  doc.text('Study Plan Overview', 20, y);
  y += 10;

  doc.setFontSize(11);
  doc.setTextColor(0);

  doc.setFont(undefined, 'bold');
  doc.text('Overall Progress:', 25, y);
  doc.setFont(undefined, 'normal');
  doc.text(`${plan.overallProgress}%`, 60, y);
  y += 8;

  doc.setFont(undefined, 'bold');
  doc.text('Current Streak:', 25, y);
  doc.setFont(undefined, 'normal');
  doc.text(`${plan.currentStreak} days`, 60, y);
  y += 8;

  doc.setFont(undefined, 'bold');
  doc.text('Longest Streak:', 25, y);
  doc.setFont(undefined, 'normal');
  doc.text(`${plan.longestStreak} days`, 60, y);
  y += 8;

  const totalSessions = Object.values(plan.dailyPlans).reduce((sum, day) => sum + day.sessions.length, 0);
  doc.setFont(undefined, 'bold');
  doc.text('Total Sessions:', 25, y);
  doc.setFont(undefined, 'normal');
  doc.text(`${totalSessions} sessions`, 60, y);
  y += 15;

  // Subject Difficulties
  doc.setFontSize(16);
  doc.setTextColor(251, 146, 60);
  doc.text('Subject Difficulty Ratings', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(0);

  if (profile.subjectDifficulties) {
    Object.entries(profile.subjectDifficulties).forEach(([subject, difficulty]) => {
      y = checkPageBreak(y, 8);
      const difficultyEmoji = difficulty === 'easy' ? '⭐' : difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐';
      // Capitalize subject name
      const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
      doc.text(`${subjectName}: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} ${difficultyEmoji}`, 25, y);
      y += 6;
    });
  }

  // Start detailed schedule on a new page
  doc.addPage();
  currentPage++;
  addHeader(currentPage);

  doc.setFontSize(18);
  doc.setTextColor(237, 137, 54);
  doc.text('📅 Detailed Study Schedule', 105, 30, { align: 'center' });

  doc.setDrawColor(237, 137, 54);
  doc.line(40, 35, 170, 35);

  y = 45;

  // Sort dates chronologically
  const sortedDates = plan.dailyPlans ? Object.keys(plan.dailyPlans).sort() : [];

  sortedDates.forEach((date, dateIndex) => {
    const dailyPlan = plan.dailyPlans[date];
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Check if we need a new page for this day
    const sessionsHeight = dailyPlan.sessions.length * 25 + 30;
    y = checkPageBreak(y, sessionsHeight);

    // Day Header
    doc.setFillColor(254, 243, 199); // Amber-100
    doc.roundedRect(15, y - 5, 180, 12, 2, 2, 'F');

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(146, 64, 14); // Amber-900
    doc.text(`Day ${dateIndex + 1}: ${formattedDate}`, 20, y + 2);

    doc.setFontSize(9);
    doc.setTextColor(120, 53, 15);
    doc.text(`${dailyPlan.sessions.length} sessions | ${dailyPlan.totalHours.toFixed(1)} hours total`, 20, y + 9);

    y += 18;

    // Sessions for this day
    dailyPlan.sessions.forEach((session, sessionIndex) => {
      y = checkPageBreak(y, 25);

      // Session box
      const boxColor = session.status === 'completed' ? [187, 247, 208] : // Green-200
        session.status === 'skipped' ? [254, 202, 202] : // Red-200
          [224, 242, 254]; // Blue-100

      doc.setFillColor(...boxColor);
      doc.roundedRect(20, y - 4, 170, 22, 2, 2, 'F');

      // Session header
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0);
      // Safely get subject name with fallback
      const subjectName = session.subjectName ||
        (session.subjectId ? (session.subjectId.charAt(0).toUpperCase() + session.subjectId.slice(1)) : 'Unknown Subject');
      doc.text(`Session ${sessionIndex + 1}: ${subjectName}`, 25, y + 2);

      // Status badge
      const statusX = 180;
      const statusText = session.status.charAt(0).toUpperCase() + session.status.slice(1);
      const statusColor = session.status === 'completed' ? [34, 197, 94] : // Green
        session.status === 'skipped' ? [239, 68, 68] : // Red
          [59, 130, 246]; // Blue

      doc.setTextColor(...statusColor);
      doc.setFont(undefined, 'bold');
      doc.text(statusText, statusX, y + 2, { align: 'right' });

      // Session details
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(60);

      y += 8;

      // Time and type
      const sessionType = session.isRevision ? 'Revision' : 'New Content';
      const typeIcon = session.isRevision ? '🔄' : '📖';
      doc.text(`${typeIcon} Type: ${sessionType}`, 25, y);
      doc.text(`⏱️ Duration: ${session.duration} hours`, 100, y);

      y += 5;

      // Topics covered
      if (session.topics && session.topics.length > 0) {
        const topicsText = `Topics: ${session.topics.slice(0, 3).join(', ')}${session.topics.length > 3 ? '...' : ''}`;
        doc.text(topicsText, 25, y);
      }

      // Priority indicator
      if (session.priority) {
        const priorityText = `Priority: ${session.priority.charAt(0).toUpperCase() + session.priority.slice(1)}`;
        const priorityColor = session.priority === 'high' ? [239, 68, 68] :
          session.priority === 'medium' ? [251, 146, 60] :
            [34, 197, 94];
        doc.setTextColor(...priorityColor);
        doc.text(priorityText, 100, y);
        doc.setTextColor(60);
      }

      y += 10;
    });

    // Summary stats for the day
    const completedSessions = dailyPlan.sessions.filter(s => s.status === 'completed').length;
    const revisionSessions = dailyPlan.sessions.filter(s => s.isRevision).length;

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.setFont(undefined, 'italic');
    doc.text(`Day Summary: ${completedSessions}/${dailyPlan.sessions.length} completed | ${revisionSessions} revision sessions | Burnout: ${dailyPlan.burnoutLevel || 0}%`, 25, y);

    y += 15;
  });

  // Summary page at the end
  doc.addPage();
  currentPage++;
  addHeader(currentPage);

  doc.setFontSize(18);
  doc.setTextColor(237, 137, 54);
  doc.text('📊 Study Plan Summary', 105, 30, { align: 'center' });

  doc.setDrawColor(237, 137, 54);
  doc.line(40, 35, 170, 35);

  y = 50;

  // Calculate statistics
  const allSessions = Object.values(plan.dailyPlans).flatMap(day => day.sessions);
  const completedSessions = allSessions.filter(s => s.status === 'completed').length;
  const skippedSessions = allSessions.filter(s => s.status === 'skipped').length;
  const revisionSessions = allSessions.filter(s => s.isRevision).length;
  const newContentSessions = allSessions.filter(s => !s.isRevision).length;

  // Subject-wise breakdown
  const subjectStats: Record<string, { total: number; completed: number; hours: number }> = {};
  allSessions.forEach(session => {
    // Safely get subject name with fallback
    const subjectName = session.subjectName ||
      (session.subjectId ? (session.subjectId.charAt(0).toUpperCase() + session.subjectId.slice(1)) : 'Unknown Subject');
    if (!subjectStats[subjectName]) {
      subjectStats[subjectName] = { total: 0, completed: 0, hours: 0 };
    }
    subjectStats[subjectName].total++;
    subjectStats[subjectName].hours += session.duration || 0;
    if (session.status === 'completed') {
      subjectStats[subjectName].completed++;
    }
  });

  doc.setFontSize(14);
  doc.setTextColor(251, 146, 60);
  doc.text('Overall Statistics', 20, y);
  y += 12;

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont(undefined, 'normal');

  doc.text(`Total Study Days: ${sortedDates.length}`, 25, y);
  y += 7;
  doc.text(`Total Sessions Planned: ${allSessions.length}`, 25, y);
  y += 7;
  doc.text(`Completed Sessions: ${completedSessions} (${((completedSessions / allSessions.length) * 100).toFixed(1)}%)`, 25, y);
  y += 7;
  doc.text(`Skipped Sessions: ${skippedSessions}`, 25, y);
  y += 7;
  doc.text(`Revision Sessions: ${revisionSessions}`, 25, y);
  y += 7;
  doc.text(`New Content Sessions: ${newContentSessions}`, 25, y);
  y += 15;

  doc.setFontSize(14);
  doc.setTextColor(251, 146, 60);
  doc.text('Subject-wise Breakdown', 20, y);
  y += 12;

  doc.setFontSize(10);
  doc.setTextColor(0);

  Object.entries(subjectStats)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([subject, stats]) => {
      y = checkPageBreak(y, 12);

      doc.setFont(undefined, 'bold');
      doc.text(subject, 25, y);
      doc.setFont(undefined, 'normal');

      const completionRate = ((stats.completed / stats.total) * 100).toFixed(1);
      doc.text(`${stats.total} sessions | ${stats.hours.toFixed(1)} hours | ${completionRate}% complete`, 25, y + 5);

      y += 12;
    });

  // Footer on last page
  y = checkPageBreak(y, 30);
  y = 270;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Generated by Adaptive Study Planner', 105, y, { align: 'center' });
  doc.text(`Created on: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, 105, y + 5, { align: 'center' });

  // Save PDF with detailed filename
  const filename = `study-plan-${profile.name.replace(/\s+/g, '-')}-${profile.class}-detailed.pdf`;
  doc.save(filename);
};