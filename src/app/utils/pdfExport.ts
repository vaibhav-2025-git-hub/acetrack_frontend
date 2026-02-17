import { jsPDF } from 'jspdf';
import { UserProfile, StudyPlan } from '../types';

export const exportToPDF = (profile: UserProfile, plan: StudyPlan) => {
  const doc = new jsPDF();
  let currentPage = 1;

  // Helper function to add page header
  const addHeader = (pageNum: number) => {
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`${profile.name}'s Plan`, 15, 10);
    doc.text(`Page ${pageNum}`, 195, 10, { align: 'right' });
    doc.setTextColor(0);
  };

  // Helper function to check page break
  const checkPageBreak = (currentY: number, requiredSpace: number = 10): number => {
    if (currentY + requiredSpace > 285) {
      doc.addPage();
      currentPage++;
      addHeader(currentPage);
      return 20;
    }
    return currentY;
  };

  // --- Page 1: Summary ---

  // Title
  doc.setFontSize(18);
  doc.setTextColor(237, 137, 54); // Brand Orange
  doc.text('Personalized Study Plan', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text('Compact Academic Schedule', 105, 26, { align: 'center' });

  doc.setDrawColor(237, 137, 54);
  doc.setLineWidth(0.5);
  doc.line(15, 32, 195, 32);

  // 2-Column Layout
  let y = 45;
  const leftColX = 15;
  const rightColX = 110;

  // Left Column: Student Info
  doc.setFontSize(12);
  doc.setTextColor(237, 137, 54);
  doc.text('Student Profile', leftColX, y);

  y += 6;
  doc.setFontSize(10);
  doc.setTextColor(0);

  const addInfo = (label: string, value: string, x: number, currentY: number) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, x, currentY);
    doc.setFont(undefined, 'normal');
    doc.text(value, x + 35, currentY);
    return currentY + 5;
  };

  let leftY = y;
  leftY = addInfo('Name:', profile.name, leftColX, leftY);
  leftY = addInfo('Class:', `${profile.class}`, leftColX, leftY);
  leftY = addInfo('Board:', profile.board.toUpperCase(), leftColX, leftY);
  leftY = addInfo('Stream:', profile.stream, leftColX, leftY);
  leftY = addInfo('Study/Day:', `${profile.studyHoursPerDay} hrs`, leftColX, leftY);
  leftY = addInfo('Pace:', profile.learningSpeed.charAt(0).toUpperCase() + profile.learningSpeed.slice(1), leftColX, leftY);
  leftY = addInfo('Duration:', `${profile.totalDays} days`, leftColX, leftY);

  // Right Column: Plan Stats
  doc.setFontSize(12);
  doc.setTextColor(237, 137, 54);
  doc.text('Plan Overview', rightColX, y);

  let rightY = y + 6;
  doc.setFontSize(10);
  doc.setTextColor(0);

  const totalSessions = Object.values(plan.dailyPlans).reduce((sum, day) => sum + day.sessions.length, 0);

  rightY = addInfo('Progress:', `${plan.overallProgress}%`, rightColX, rightY);
  rightY = addInfo('Sessions:', `${totalSessions}`, rightColX, rightY);
  rightY = addInfo('Streak:', `${plan.currentStreak} days`, rightColX, rightY);

  rightY += 4;
  doc.setFont(undefined, 'bold');
  doc.text('Subject Difficulties:', rightColX, rightY);
  rightY += 5;
  doc.setFont(undefined, 'normal');

  if (profile.subjectDifficulties) {
    Object.entries(profile.subjectDifficulties).forEach(([subject, difficulty]) => {
      const sub = subject.charAt(0).toUpperCase() + subject.slice(1);
      const diff = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
      doc.text(`• ${sub}: ${diff}`, rightColX + 5, rightY);
      rightY += 5;
    });
  }

  // Resync Y to below the lowest column
  y = Math.max(leftY, rightY) + 10;

  // --- Schedule ---
  doc.setFontSize(12);
  doc.setTextColor(237, 137, 54);
  doc.text('Detailed Schedule', 15, y);
  doc.setDrawColor(200);
  doc.line(15, y + 2, 195, y + 2);
  y += 10;

  const sortedDates = plan.dailyPlans ? Object.keys(plan.dailyPlans).sort() : [];

  sortedDates.forEach((date, dateIndex) => {
    const dailyPlan = plan.dailyPlans[date];
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });

    // Minimal day header
    y = checkPageBreak(y, 15);
    doc.setFillColor(240, 240, 240);
    doc.rect(15, y - 4, 180, 6, 'F');

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0);
    doc.text(`Day ${dateIndex + 1}: ${formattedDate} (${dailyPlan.totalHours.toFixed(1)} hrs)`, 17, y);
    y += 5;

    // Condensed Sessions
    dailyPlan.sessions.forEach((session) => {
      y = checkPageBreak(y, 6);

      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0);

      const subjectName = session.subjectName ||
        (session.subjectId ? (session.subjectId.charAt(0).toUpperCase() + session.subjectId.slice(1)) : 'Sub');
      const type = session.isRevision ? '(Rev)' : '';

      // Left part: Subject + Type
      doc.text(`• ${subjectName} ${type}`, 20, y);

      // Middle: Duration + Topic
      const topic = session.topicName ? `| ${session.topicName}` : '';
      doc.setTextColor(80);
      // Convert minutes to hours for consistency with daily total
      const durationHrs = (session.duration / 60).toFixed(1);
      doc.text(`${durationHrs}h ${topic}`, 80, y);

      // Right: Status
      const statusText = session.status.charAt(0).toUpperCase() + session.status.slice(1);
      const statusColor = session.status === 'completed' ? [34, 197, 94] :
        session.status === 'skipped' ? [239, 68, 68] : [80, 80, 80];

      doc.setTextColor(...statusColor);
      doc.setFontSize(8);
      doc.text(statusText, 195, y, { align: 'right' });

      y += 5;
    });

    y += 2; // Tiny spacer between days
  });

  // Footer
  const footerY = 285;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('AceTrack Layout', 105, footerY, { align: 'center' });

  const filename = `acetrack-plan-${profile.name.replace(/\s+/g, '-')}-compact.pdf`;
  doc.save(filename);
};