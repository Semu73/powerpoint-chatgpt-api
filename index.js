const express = require("express");
const pptxgen = require("pptxgenjs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ─────────────────────────────────────────
// Health check
// ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "PPTX API is running 🎉" });
});

// ─────────────────────────────────────────
// POST /generate  →  returns .pptx file
// ─────────────────────────────────────────
app.post("/generate", async (req, res) => {
  try {
    const { title, theme, slides } = req.body;

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return res.status(400).json({ error: "slides array is required and must not be empty" });
    }

    const pres = new pptxgen();
    pres.layout = "LAYOUT_16x9";
    pres.title = title || "Presentation";

    // ── Pick theme colors ──────────────────
    const themes = {
      dark:      { bg: "1E2761", title: "CADCFC", text: "FFFFFF", accent: "4FC3F7" },
      light:     { bg: "FFFFFF", title: "1E2761", text: "333333", accent: "1E2761" },
      coral:     { bg: "2F3C7E", title: "F96167", text: "FFFFFF", accent: "F9E795" },
      forest:    { bg: "2C5F2D", title: "FFFFFF", text: "F5F5F5", accent: "97BC62" },
      minimal:   { bg: "F2F2F2", title: "36454F", text: "36454F", accent: "028090" },
      corporate: { bg: "021526", title: "6EACDA", text: "E2E2B6", accent: "03346E" },
    };

    const t = themes[theme] || themes.dark;

    for (const slide of slides) {
      const s = pres.addSlide();
      s.background = { color: slide.background || t.bg };

      // Each slide has an array of "elements"
      for (const el of (slide.elements || [])) {
        switch (el.type) {

          // ── TEXT ──────────────────────────
          case "text": {
            s.addText(el.text || "", {
              x: el.x ?? 0.5,
              y: el.y ?? 0.5,
              w: el.w ?? 9,
              h: el.h ?? 1,
              fontSize:  el.fontSize  ?? 18,
              fontFace:  el.fontFace  ?? "Calibri",
              color:     el.color     ?? t.text,
              bold:      el.bold      ?? false,
              italic:    el.italic    ?? false,
              align:     el.align     ?? "left",
              valign:    el.valign    ?? "top",
              wrap:      true,
              margin:    el.margin    ?? 0,
            });
            break;
          }

          // ── SHAPE ─────────────────────────
          case "shape": {
            const shapeMap = {
              rectangle:         pres.shapes.RECTANGLE,
              oval:              pres.shapes.OVAL,
              line:              pres.shapes.LINE,
              rounded_rectangle: pres.shapes.ROUNDED_RECTANGLE,
            };
            s.addShape(shapeMap[el.shape] || pres.shapes.RECTANGLE, {
              x: el.x ?? 0,
              y: el.y ?? 0,
              w: el.w ?? 1,
              h: el.h ?? 1,
              fill: el.fill ? { color: el.fill } : { type: "none" },
              line: el.line ? { color: el.line, width: el.lineWidth ?? 1 } : undefined,
            });
            break;
          }

          // ── IMAGE (URL) ───────────────────
          case "image": {
            s.addImage({
              path: el.url,
              x: el.x ?? 0,
              y: el.y ?? 0,
              w: el.w ?? 3,
              h: el.h ?? 2,
            });
            break;
          }

          // ── CHART ─────────────────────────
          case "chart": {
            const chartTypeMap = {
              bar:     pres.charts.BAR,
              line:    pres.charts.LINE,
              pie:     pres.charts.PIE,
              doughnut:pres.charts.DOUGHNUT,
            };
            const chartData = [{
              name:   el.seriesName || "Data",
              labels: el.labels || [],
              values: el.values || [],
            }];
            s.addChart(chartTypeMap[el.chartType] || pres.charts.BAR, chartData, {
              x: el.x ?? 0.5,
              y: el.y ?? 1,
              w: el.w ?? 9,
              h: el.h ?? 4,
              barDir: "col",
              chartColors: [t.accent, t.title],
              chartArea:  { fill: { color: "00000000" } },
              showValue:  el.showValues ?? false,
              showLegend: el.showLegend ?? false,
              showTitle:  !!el.chartTitle,
              title:      el.chartTitle || "",
            });
            break;
          }

          // ── BULLETS ───────────────────────
          case "bullets": {
            const items = (el.items || []).map((item, i) => ({
              text: item,
              options: {
                bullet:    true,
                breakLine: i < el.items.length - 1,
                fontSize:  el.fontSize ?? 16,
                color:     el.color ?? t.text,
              },
            }));
            s.addText(items, {
              x: el.x ?? 0.5,
              y: el.y ?? 1,
              w: el.w ?? 9,
              h: el.h ?? 3,
              fontFace: el.fontFace ?? "Calibri",
            });
            break;
          }

          default:
            // Unknown element type — skip
            break;
        }
      }
    }

    // ── Write to buffer and send ───────────
    const buffer = await pres.write({ outputType: "nodebuffer" });

    const filename = (title || "presentation")
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()
      .slice(0, 40) + ".pptx";

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// Start server
// ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅  PPTX API running on port ${PORT}`);
});
