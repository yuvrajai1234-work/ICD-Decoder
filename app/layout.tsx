import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ICD Decoder — AI-Powered Medical Code Prediction",
  description:
    "Intelligent ICD-10 code prediction from clinical text. Accepts discharge summaries, OP notes, and triage logs with confidence scoring, human-in-the-loop review, and FHIR export.",
  keywords: "ICD, medical coding, NLP, clinical text, discharge summary, FHIR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrains.variable}`}>
        <nav className="nav">
          <div className="nav-inner">
            <a href="/" className="nav-brand">
              <div className="nav-brand-icon">⚕</div>
              <div className="nav-brand-text">
                ICD <span>Decoder</span>
              </div>
            </a>
            <div className="nav-links">
              <a href="/" className="nav-link" id="nav-predict">
                🔍 Predict
              </a>
              <a href="/review" className="nav-link" id="nav-review">
                👁 Review
                <span className="badge" id="review-badge"></span>
              </a>
              <a href="/audit" className="nav-link" id="nav-audit">
                📋 Audit Log
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
