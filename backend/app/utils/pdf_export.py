from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.units import cm
from io import BytesIO

def generate_pdf(destination: str, itinerary: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("title", parent=styles["Heading1"], fontSize=20, spaceAfter=12)
    day_style = ParagraphStyle("day", parent=styles["Heading2"], fontSize=14, spaceAfter=6)
    body_style = styles["Normal"]

    story = []
    story.append(Paragraph(f"TravelMind Itinerary: {destination}", title_style))
    story.append(Spacer(1, 0.5*cm))

    days = itinerary.get("days", [])
    for day in days:
        story.append(Paragraph(f"Day {day.get('day', '')}", day_style))
        for slot in ["morning", "afternoon", "evening"]:
            val = day.get(slot, "")
            if val:
                story.append(Paragraph(f"<b>{slot.capitalize()}:</b> {val}", body_style))
        cost = day.get("estimated_cost")
        if cost:
            story.append(Paragraph(f"<b>Estimated Cost:</b> {cost} {itinerary.get('currency', '')}", body_style))
        story.append(Spacer(1, 0.3*cm))

    packing = itinerary.get("packing_list", [])
    if packing:
        story.append(Paragraph("Packing List", day_style))
        for item in packing:
            story.append(Paragraph(f"• {item}", body_style))

    doc.build(story)
    return buffer.getvalue()
