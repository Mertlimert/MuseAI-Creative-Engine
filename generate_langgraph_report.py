from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    HRFlowable,
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "MuseAI_LangGraph_Submission_Report.pdf"
REPO_URL = "https://github.com/Mertlimert/MuseAI-Creative-Engine.git"
ACCOUNT_URL = "https://github.com/Mertlimert"
REPORT_DATE = date.today().isoformat()
REPORT_ASSET_DIR = ROOT / "assets" / "report"


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="ReportTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#17324d"),
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="ReportSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=15,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#52667a"),
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionTitle",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#17324d"),
            spaceBefore=10,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15,
            alignment=TA_JUSTIFY,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletItem",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.2,
            leading=14,
            leftIndent=12,
            bulletIndent=0,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Caption",
            parent=styles["Italic"],
            fontName="Helvetica-Oblique",
            fontSize=9,
            leading=12,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#4e5d6c"),
            spaceBefore=4,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Small",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=12,
            alignment=TA_LEFT,
            textColor=colors.HexColor("#425466"),
            spaceAfter=4,
        )
    )
    return styles


def add_bullets(story, styles, items):
    for item in items:
        story.append(Paragraph(item, styles["BulletItem"], bulletText="•"))


def add_image_or_placeholder(story, styles, image_path, caption, max_width=16.5 * cm, max_height=9.2 * cm):
    image_path = Path(image_path)
    if image_path.exists():
        img = Image(str(image_path))
        img._restrictSize(max_width, max_height)
        story.append(img)
    else:
        table = Table(
            [[f"Screenshot placeholder\n{image_path.name}"]],
            colWidths=[max_width],
            rowHeights=[max_height],
        )
        table.setStyle(
            TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#8aa0b6")),
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f2f6fa")),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#5b6e80")),
                    ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Oblique"),
                    ("FONTSIZE", (0, 0), (-1, -1), 10),
                ]
            )
        )
        story.append(table)
    story.append(Paragraph(caption, styles["Caption"]))


def get_langgraph_screenshots():
    return sorted(REPORT_ASSET_DIR.glob("Ekran görüntüsü *.png"))


def build_report():
    styles = build_styles()
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=1.8 * cm,
        rightMargin=1.8 * cm,
        topMargin=1.6 * cm,
        bottomMargin=1.4 * cm,
        title="MuseAI LangGraph Submission Report",
        author="Mert Kedik",
    )

    story = []

    story.append(Paragraph("MuseAI LangGraph Submission Report", styles["ReportTitle"]))
    story.append(
        Paragraph(
            "LangGraph integration into an existing CrewAI-based project with shared frontend support, defined workflow steps, and screenshot-ready documentation.",
            styles["ReportSubtitle"],
        )
    )
    story.append(Spacer(1, 0.1 * cm))

    summary_table = Table(
        [
            ["Student", "Mert Kedik"],
            ["Project", "MuseAI - Creative Engine"],
            ["GitHub Account", ACCOUNT_URL],
            ["Repository", REPO_URL],
            ["Git Account / Repo Link", REPO_URL],
            ["Relevant Commit", "23e2172 - Add LangGraph encounter workflow alongside CrewAI"],
            ["Report Date", REPORT_DATE],
        ],
        colWidths=[4.8 * cm, 11.2 * cm],
    )
    summary_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#eaf1f8")),
                ("BACKGROUND", (1, 0), (1, -1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#9cb0c2")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#c6d2de")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 9.8),
                ("LEADING", (0, 0), (-1, -1), 13),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(summary_table)
    story.append(Spacer(1, 0.35 * cm))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#9cb0c2")))
    story.append(Spacer(1, 0.2 * cm))

    story.append(Paragraph("1. Assignment Coverage", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "This report documents how LangGraph was added into the existing MuseAI project without creating a separate application. The original CrewAI implementation was preserved, and both orchestration approaches now work in the same encounter system.",
            styles["Body"],
        )
    )
    add_bullets(
        story,
        styles,
        [
            "LangGraph was integrated into the current project instead of starting a new one.",
            "CrewAI support was kept active, and the user can choose between CrewAI and LangGraph from the same interface.",
            "The LangGraph workflow was implemented with clearly defined steps and a shared state model.",
            "Git history includes a dedicated integration commit and the repository link is included in this report.",
            "LangSmith support was prepared through environment variables for traceability and debugging.",
            "Screenshots in this report document the implemented features and the live encounter flow.",
        ],
    )

    story.append(Paragraph("2. Project Purpose and Why LangGraph Was Added", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "MuseAI is a storytelling and RPG content application that already supported an encounter mode powered by CrewAI. LangGraph was introduced to demonstrate a second orchestration style focused on stateful workflows, explicit node transitions, and conditional execution. This made the project a stronger example for classroom discussion because the same frontend experience can now be backed by either agent-based orchestration or graph-based control.",
            styles["Body"],
        )
    )
    add_bullets(
        story,
        styles,
        [
            "CrewAI is useful for role-based multi-agent execution.",
            "LangGraph is useful when execution steps must be explicit, inspectable, and state-driven.",
            "The project now allows direct comparison between two orchestration strategies while preserving one shared UI and one shared API contract.",
        ],
    )

    story.append(Paragraph("3. Implementation Summary", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "The integration was completed by extending both the backend and the frontend. On the backend, a new LangGraph encounter engine was added, shared request and response models were aligned, and the API was updated to dispatch to the selected engine. On the frontend, an engine selector was introduced so the user can run the same D&D encounter with CrewAI or LangGraph while keeping the rest of the user experience unchanged.",
            styles["Body"],
        )
    )
    add_bullets(
        story,
        styles,
        [
            "Added <b>backend/langgraph_engine.py</b> to define the graph nodes and execution flow.",
            "Updated <b>backend/api.py</b> so requests can route to either CrewAI or LangGraph.",
            "Aligned <b>backend/schemas.py</b> so both engines return the same frontend-friendly response shape.",
            "Updated <b>app.js</b>, <b>index.html</b>, and <b>style.css</b> so the user can select the active orchestration engine from the encounter interface.",
            "Prepared LangSmith-ready configuration through environment variables in the backend setup.",
        ],
    )

    story.append(Paragraph("4. LangGraph Workflow Steps", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "The LangGraph implementation was intentionally designed with well-defined steps so that its execution is understandable during demonstration and easy to explain in class. Each step has a clear responsibility and passes structured state to the next node.",
            styles["Body"],
        )
    )
    add_bullets(
        story,
        styles,
        [
            "<b>Step 1 - Prepare Context:</b> The graph gathers player stats, story premise, campaign history, NPC histories, the latest player action, and location context into a shared encounter state.",
            "<b>Step 2 - Game Master Node:</b> The Game Master node evaluates the action and produces a structured output containing the narration and a list of NPCs that should react.",
            "<b>Step 3 - Conditional NPC Branch:</b> If at least one NPC must respond, the graph routes execution into the NPC dialogue node; otherwise, it skips directly to finalization.",
            "<b>Step 4 - Final Response Assembly:</b> The graph combines narration, NPC reactions, engine metadata, and workflow steps into a payload that the frontend can render immediately.",
        ],
    )

    story.append(Paragraph("5. CrewAI and LangGraph Together", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "A key requirement of the assignment was to add LangGraph alongside the current system instead of replacing it. This requirement is satisfied. CrewAI remains available for the original multi-agent approach, while LangGraph is available for stateful step orchestration. Both engines are accessible from the same live encounter screen, both operate on the same character and location context, and both return compatible data to the frontend.",
            styles["Body"],
        )
    )
    add_bullets(
        story,
        styles,
        [
            "No new project was created.",
            "The same application supports both CrewAI and LangGraph.",
            "The same player action flow works with either engine.",
            "The same frontend chat area can render the output of both systems.",
        ],
    )

    story.append(Paragraph("6. LangSmith Integration", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "LangSmith integration was prepared as a helpful tracing option for development and debugging. With LangSmith enabled, it becomes possible to inspect which nodes executed, how state moved through the graph, and whether an NPC branch was triggered during a specific encounter run. This is especially useful when discussing implementation details in class because it makes the graph behavior visible beyond the frontend.",
            styles["Body"],
        )
    )
    add_bullets(
        story,
        styles,
        [
            "LANGCHAIN_TRACING_V2=true",
            "LANGCHAIN_API_KEY=<i>your_key_here</i>",
            "LANGCHAIN_PROJECT=MuseAI-LangGraph",
        ],
    )

    story.append(Paragraph("7. Files Added or Updated", styles["SectionTitle"]))
    file_table = Table(
        [
            ["Area", "Files"],
            ["Backend", "backend/langgraph_engine.py, backend/api.py, backend/crew_engine.py, backend/schemas.py, backend/llm_factory.py, backend/.env.example, backend/requirements.txt"],
            ["Frontend", "index.html, app.js, style.css"],
            ["Documentation", "LangGraph_Report.md and this final submission PDF"],
        ],
        colWidths=[3.2 * cm, 12.8 * cm],
    )
    file_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17324d")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 9.6),
                ("LEADING", (0, 0), (-1, -1), 12),
                ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#9cb0c2")),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#c6d2de")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(file_table)

    story.append(PageBreak())

    story.append(Paragraph("8. Screenshot Evidence", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "The following screenshots were selected from the updated LangGraph demo session stored under assets/report. Older CrewAI report images were intentionally excluded so that this PDF reflects the latest LangGraph-specific walkthrough.",
            styles["Body"],
        )
    )
    screenshot_captions = [
        "Figure 1. Encounter setup screen with Aethelgard the Wise, Silverpeak Citadel, and the LangGraph Workflow engine selected. This proves that LangGraph was integrated into the existing project interface instead of being developed as a separate application.",
        "Figure 2. First LangGraph response after the player's opening question to the guard. The Game Master narration is rendered directly in the shared chat interface.",
        "Figure 3. The same first interaction showing the LangGraph workflow steps and the Guard node response. This demonstrates explicit step visibility and conditional NPC-style output in one screen.",
        "Figure 4. Second interaction in which the player asks about the alarm and the first accusation. The LangGraph-driven Game Master continues the investigation while preserving encounter context.",
        "Figure 5. Continuation of the second interaction showing workflow steps and the Guard node's in-character explanation, supporting the graph's shared-state execution model.",
        "Figure 6. Third interaction where the player asks to identify Lady Mirabel and inspect the vault. The narration shows scene progression from the courtyard to the underground vault area.",
        "Figure 7. Continuation of the third interaction with LangGraph steps and Guard node output, showing that the same frontend can render narration, workflow, and NPC reaction together.",
        "Figure 8. Continuation of the vault investigation showing LangGraph steps and the Guard node's detailed response about additional suspects. This supports the claim that the graph preserves context across multiple turns and exposes the execution path clearly.",
    ]
    screenshot_paths = get_langgraph_screenshots()

    if not screenshot_paths:
        story.append(
            Paragraph(
                "No updated LangGraph screenshots were found in assets/report. Add files named like 'Ekran görüntüsü ... .png' to populate this section automatically.",
                styles["Body"],
            )
        )
    else:
        for index, image_path in enumerate(screenshot_paths):
            caption = screenshot_captions[index] if index < len(screenshot_captions) else (
                f"Figure {index + 1}. Additional LangGraph interaction screenshot captured from the updated demo session."
            )
            add_image_or_placeholder(
                story,
                styles,
                image_path,
                caption,
                max_height=8.8 * cm,
            )
            if index in {2, 4, 6} and index != len(screenshot_paths) - 1:
                story.append(PageBreak())

    story.append(Paragraph("9. Implemented Features Summary", styles["SectionTitle"]))
    add_bullets(
        story,
        styles,
        [
            "LangGraph was added to the existing MuseAI project.",
            "CrewAI and LangGraph both remain operational in the same system.",
            "The encounter state was modeled explicitly for graph execution.",
            "Conditional branching was implemented for NPC activation.",
            "Workflow steps are returned to the frontend for visibility.",
            "LangSmith configuration was prepared for tracing and debugging.",
            "Git commit history documents the LangGraph integration clearly.",
        ],
    )

    story.append(Paragraph("10. Class Discussion Notes", styles["SectionTitle"]))
    add_bullets(
        story,
        styles,
        [
            "Why LangGraph was a good fit for state-based encounter orchestration.",
            "How the graph separates context preparation, narration, branching, and final payload generation.",
            "Why CrewAI was preserved and not removed.",
            "How the same frontend can compare two different orchestration strategies.",
            "How LangSmith can help debug graph execution and branching behavior.",
        ],
    )

    story.append(Paragraph("11. Conclusion", styles["SectionTitle"]))
    story.append(
        Paragraph(
            "The assignment requirements were satisfied by integrating LangGraph into an already existing project, keeping CrewAI active, defining the workflow steps clearly, documenting the work in Git, and preparing screenshot evidence for records. The final result is a hybrid encounter system where the same role-playing scenario can be orchestrated by either CrewAI or LangGraph inside one consistent application.",
            styles["Body"],
        )
    )
    story.append(
        Paragraph(
            "Prepared for submission as a PDF record with screenshots and implementation notes.",
            styles["Small"],
        )
    )

    doc.build(story)


if __name__ == "__main__":
    build_report()
    print(f"Created: {OUTPUT}")
