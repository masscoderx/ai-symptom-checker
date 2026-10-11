import jsPDF from "jspdf";

export function generatePDF(messages, lastMeta, profile) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const addLine = (text, fontSize = 11, color = [30, 30, 30]) => {
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, pageWidth - 30);
    lines.forEach((line) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 15, y);
      y += fontSize * 0.55;
    });
    y += 2;
  };

  // Title
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 16, "F");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("MediBot — AI Symptom Checker Report", 15, 11);
  y = 25;

  // Date & profile
  addLine(`Date: ${new Date().toLocaleString()}`, 10, [100, 100, 100]);
  if (profile.age) addLine(`Patient Age: ${profile.age}`, 10, [100, 100, 100]);
  if (profile.gender) addLine(`Patient Gender: ${profile.gender}`, 10, [100, 100, 100]);

  y += 4;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  // Triage Summary
  addLine("Triage Summary", 13, [37, 99, 235]);
  addLine(`Urgency Level: ${lastMeta.urgency}`, 11);
  addLine(`Recommended Action: ${lastMeta.action}`, 11);

  if (lastMeta.conditions?.length) {
    addLine(`Possible Conditions: ${lastMeta.conditions.join(", ")}`, 11);
  }

  y += 4;
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  // Conversation
  addLine("Conversation Transcript", 13, [37, 99, 235]);
  messages.forEach((msg) => {
    if (msg.role === "user") {
      addLine(`You: ${msg.content}`, 10, [50, 50, 50]);
    } else if (msg.role === "assistant") {
      addLine(`MediBot: ${msg.content}`, 10, [30, 100, 200]);
    }
    y += 1;
  });

  y += 4;
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  // Disclaimer
  addLine("Disclaimer", 10, [150, 0, 0]);
  addLine(lastMeta.disclaimer, 9, [120, 120, 120]);

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `MediBot AI Symptom Checker — Page ${i} of ${pageCount}`,
      15,
      doc.internal.pageSize.getHeight() - 8
    );
  }

  doc.save(`MediBot_Report_${Date.now()}.pdf`);
}
