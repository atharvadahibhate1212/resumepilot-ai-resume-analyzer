
import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Gauge,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
  UploadCloud,
  XCircle
} from 'lucide-react';

const API_URL = (
  import.meta.env.VITE_API_URL ||
  'https://resumepilot-ai-resume-analyzer-1.onrender.com'
).replace(/\/$/, '');

const demo = {
  fileName: 'sample-resume.pdf',
  analysisMode: 'demo',
  disclaimer:
    'Scores are illustrative and are not an official ATS score or a hiring prediction.',
  scores: {
    resumeScore: 78,
    atsReadabilityScore: 86,
    jobMatchScore: 68,
    breakdown: [
      { category: 'ATS readability', score: 86, weight: 15 },
      { category: 'Relevant skills', score: 72, weight: 25 },
      { category: 'Projects and experience evidence', score: 75, weight: 20 },
      { category: 'Content clarity', score: 70, weight: 10 },
      { category: 'Education and credentials', score: 90, weight: 10 },
      { category: 'Job alignment / baseline', score: 68, weight: 20 }
    ],
    matchedKeywords: ['JavaScript', 'React', 'HTML', 'CSS'],
    missingKeywords: ['REST API', 'Testing', 'Git']
  },
  report: {
    summary:
      'Your resume has a useful foundation. Make project contributions more specific and compare your skills with the target role before applying.',
    strengths: [
      'Education and technical skills are easy to identify.',
      'Projects give recruiters examples to discuss.',
      'The resume includes relevant web development terminology.'
    ],
    weaknesses: [
      'Some project bullets describe tools but not the result.',
      'The target job asks for skills that are not clearly evidenced.',
      'A few bullet points could be more concise.'
    ],
    recommendations: [
      'Describe the problem, your contribution, and the outcome for each major project.',
      'Add links to working demos and source repositories where available.',
      'Include job keywords only when they truthfully describe your experience.'
    ],
    matchedSkills: ['JavaScript', 'React', 'HTML', 'CSS'],
    missingSkills: ['REST API', 'Testing', 'Git'],
    bulletRewrites: [
      {
        original: 'Made a website using React.',
        suggested:
          'Built a React website with reusable components and responsive page layouts.',
        reason:
          'Explains the implementation more clearly. Use only if it accurately reflects your work.'
      }
    ],
    interviewTopics: [
      'Explain one project architecture and why you chose its technologies.',
      'Describe how you debugged a difficult issue.',
      'Explain how you would test a key user flow.'
    ],
    scoreExplanation:
      'This sample report is illustrative. A real analysis requires uploading a resume.'
  }
};

function scoreColor(score) {
  if (score >= 80) return 'green';
  if (score >= 60) return 'amber';
  return 'rose';
}

function ScoreRing({ score, label, sublabel }) {
  const safe = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div className="score-ring-wrap">
      <div
        className={`score-ring ${scoreColor(safe)}`}
        style={{ '--score': `${safe * 3.6}deg` }}
      >
        <div className="score-ring-inner">
          <strong>{safe}</strong>
          <span>/100</span>
        </div>
      </div>

      <div className="score-ring-copy">
        <strong>{label}</strong>
        <span>{sublabel}</span>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, eyebrow, title, detail }) {
  return (
    <div className="section-title">
      <div className="section-icon">
        <Icon size={18} />
      </div>

      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
    </div>
  );
}

function FeedbackList({ items, type }) {
  const Icon =
    type === 'good'
      ? CheckCircle2
      : type === 'warn'
        ? TriangleAlert
        : Lightbulb;

  return (
    <ul className={`feedback-list ${type}`}>
      {(items || []).map((item, i) => (
        <li key={`${item}-${i}`}>
          <Icon size={17} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CircularScore({ label, score }) {
  const value = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div className="circular-score-card">
      <div
        className="circular-score-ring"
        style={{ "--score": `${value * 3.6}deg` }}
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="circular-score-inner">
          <strong>{value}</strong>
          <span>/100</span>
        </div>
      </div>

      <h3>{label}</h3>
    </div>
  );
}


function AnimatedScoreChart({ scores }) {
  const breakdown = scores?.breakdown || [];

  return (
    <div className="score-chart">
      <h3>Score Breakdown</h3>
      <p className="score-chart-subtitle">
        Resume assessment across key categories
      </p>

      {breakdown.map((item, index) => (
        <div className="score-row" key={item.category}>
          <div className="score-row-heading">
            <span>{item.category}</span>
            <strong>{item.score}/100</strong>
          </div>

          <div
            className="score-track"
            role="progressbar"
            aria-label={item.category}
            aria-valuenow={item.score}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="score-fill"
              style={{
                '--score': `${item.score}%`,
                '--delay': `${index * 120}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}


export default function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  function selectFile(nextFile) {
    setError('');

    if (!nextFile) return;

    const validType =
      nextFile.type === 'application/pdf' ||
      nextFile.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      nextFile.name.toLowerCase().endsWith('.pdf') ||
      nextFile.name.toLowerCase().endsWith('.docx');

    if (!validType) {
      setError('Choose a PDF or DOCX file.');
      return;
    }

    if (nextFile.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5 MB.');
      return;
    }

    setFile(nextFile);
    setReport(null);
  }

  async function analyzeResume(event) {
    event?.preventDefault();
    setError('');

    if (!file) {
      setError('Upload your resume first.');
      return;
    }

    setLoading(true);

    try {
      const body = new FormData();
      body.append('resume', file);
      body.append('jobDescription', jobDescription);

const response = await fetch(`${API_URL}/api/analyze`, {
  method: 'POST',
        body
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not analyze the resume.'
        );
      }

      setReport(data);
      setDemoMode(false);

      setTimeout(() => {
        document
          .getElementById('analysis-results')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(
        `${err.message} If the server is not running, start it from the server folder. You can also preview the sample report.`
      );
    } finally {
      setLoading(false);
    }
  }

  function showDemo() {
    setReport(demo);
    setDemoMode(true);
    setError('');

    setTimeout(() => {
      document
        .getElementById('analysis-results')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  const scores = report?.scores;
  const feedback = report?.report;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brand-mark">
            <BrainCircuit size={21} />
          </span>

          <span>
            resume<span className="brand-accent">pilot</span>
            <small>CAREER INTELLIGENCE</small>
          </span>
        </a>

        <nav>
          <a href="#how-it-works">How it works</a>
          <a href="#analyzer">Analyzer</a>
          <a href="#privacy">Privacy</a>
        </nav>

        <a className="top-cta" href="#analyzer">
          Analyze resume <ArrowRight size={15} />
        </a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-content">
            <div className="pill">
              <Sparkles size={14} /> YOUR CAREER, CLEARER
            </div>

            <h1>
              Your resume.
              <br />
              <span>Understood.</span>
              <br />
              Improved.
            </h1>

            <p className="hero-copy">
              Get practical AI feedback, check resume readability, and
              discover how your experience aligns with the job you want.
            </p>

            <div className="hero-actions">
              <a className="primary-btn" href="#analyzer">
                Analyze my resume <ArrowRight size={17} />
              </a>

              <a className="text-btn" href="#how-it-works">
                See how it works <ChevronRight size={16} />
              </a>
            </div>

            <div className="hero-proof">
              <span>
                <ShieldCheck size={16} /> Private-by-design processing
              </span>
              <span>
                <Target size={16} /> Role-specific feedback
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="orbit orbit-one"></div>
            <div className="orbit orbit-two"></div>

            <div className="floating-chip chip-top">
              <span className="chip-dot"></span>
              Resume scan complete
            </div>

            <div className="mock-report">
              <div className="mock-top">
                <div className="mock-file">
                  <FileText size={19} />
                </div>

                <div>
                  <strong>Resume overview</strong>
                  <small>Illustrative preview</small>
                </div>

                <span className="mock-badge">AI REVIEW</span>
              </div>

              <div className="mock-score-row">
                <div className="mock-donut">
                  <span>
                    78<small>/100</small>
                  </span>
                </div>

                <div className="mock-score-text">
                  <strong>Good foundation</strong>
                  <p>There is room to make your impact clearer.</p>
                  <div className="mini-progress">
                    <i style={{ width: '78%' }} />
                  </div>
                </div>
              </div>

              <div className="mock-divider"></div>

              <div className="mock-feedback">
                <span className="mock-check">
                  <Check size={14} />
                </span>

                <div>
                  <strong>Clear technical foundation</strong>
                  <small>Skills and projects detected</small>
                </div>

                <span className="mock-status">STRONG</span>
              </div>

              <div className="mock-feedback">
                <span className="mock-alert">
                  <TrendingUp size={14} />
                </span>

                <div>
                  <strong>Show your impact</strong>
                  <small>Make project bullets more specific</small>
                </div>

                <span className="mock-status status-warn">IMPROVE</span>
              </div>

              <div className="mock-bottom">
                <Sparkles size={15} />
                <span>Specific suggestions, not just a score.</span>
              </div>
            </div>

            <div className="floating-chip chip-bottom">
              <Activity size={15} /> Built for your next opportunity
            </div>
          </div>
        </section>

        <section className="trust-strip">
          <div>
            <FileCheck2 />
            <span>
              <strong>Resume readability</strong>
              <small>Check common parsing signals</small>
            </span>
          </div>

          <div>
            <BrainCircuit />
            <span>
              <strong>AI feedback</strong>
              <small>Understand what to improve</small>
            </span>
          </div>

          <div>
            <BriefcaseBusiness />
            <span>
              <strong>Job matching</strong>
              <small>Compare with a target role</small>
            </span>
          </div>
        </section>

        <section className="analyzer-section" id="analyzer">
          <div className="section-heading-center">
            <span className="eyebrow">START YOUR REVIEW</span>
            <h2>
              Make your next application <span>stronger.</span>
            </h2>
            <p>
              Upload your resume and optionally paste the job description
              to get tailored feedback.
            </p>
          </div>

          <div className="analyzer-grid">
            <form className="upload-panel" onSubmit={analyzeResume}>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">STEP 01</span>
                  <h3>Upload your resume</h3>
                </div>
                <span className="step-number">01</span>
              </div>

              <label
                className={`dropzone ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  selectFile(e.dataTransfer.files?.[0]);
                }}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => selectFile(e.target.files?.[0])}
                />

                <div className="upload-icon">
                  {file ? (
                    <FileCheck2 size={25} />
                  ) : (
                    <UploadCloud size={26} />
                  )}
                </div>

                {file ? (
                  <>
                    <strong className="file-name">{file.name}</strong>
                    <span>
                      {(file.size / 1024).toFixed(0)} KB · Ready to analyze
                    </span>
                  </>
                ) : (
                  <>
                    <strong>Drop your resume here</strong>
                    <span>
                      or <em>browse files</em> from your device
                    </span>
                  </>
                )}

                <small>PDF or DOCX · Max 5 MB</small>

                {file && (
                  <button
                    type="button"
                    className="remove-file"
                    aria-label="Remove file"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFile(null);
                      setReport(null);
                    }}
                  >
                    <XCircle size={17} />
                  </button>
                )}
              </label>

              <div className="field-heading">
                <label htmlFor="job-description">
                  Job description <span>OPTIONAL</span>
                </label>
                <small>For a more relevant comparison</small>
              </div>

              <textarea
                id="job-description"
                rows="5"
                maxLength="12000"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job responsibilities and required skills here..."
              />

              <div className="textarea-foot">
                <span>Include the requirements for the role you want.</span>
                <span>{jobDescription.length.toLocaleString()}/12,000</span>
              </div>

              {error && (
                <div className="error-message">
                  <TriangleAlert size={17} />
                  <span>{error}</span>
                </div>
              )}

              <button
                className="primary-btn analyze-btn"
                type="submit"
                disabled={loading || !file}
              >
                {loading ? (
                  <>
                    <LoaderCircle className="spin" size={18} />
                    Analyzing resume...
                  </>
                ) : (
                  <>
                    Analyze my resume <ArrowRight size={17} />
                  </>
                )}
              </button>

              <button
                className="demo-btn"
                type="button"
                onClick={showDemo}
              >
                Preview a sample report <ChevronRight size={16} />
              </button>

              <p className="upload-privacy">
                <LockKeyhole size={13} />
                Files are processed in memory and are not saved to disk by
                this app.
              </p>
            </form>

            <aside className="what-you-get">
              <span className="eyebrow">YOUR ANALYSIS INCLUDES</span>
              <h3>
                Know what's working.
                <br />
                <span>Know what to fix.</span>
              </h3>

              <div className="benefit-list">
                <div>
                  <span className="benefit-icon purple">
                    <Gauge size={19} />
                  </span>
                  <div>
                    <strong>Resume quality score</strong>
                    <p>
                      A transparent score based on the app's review rubric.
                    </p>
                  </div>
                </div>

                <div>
                  <span className="benefit-icon blue">
                    <ClipboardCheck size={19} />
                  </span>
                  <div>
                    <strong>ATS readability checks</strong>
                    <p>
                      Common formatting and parsing signals—not a guarantee.
                    </p>
                  </div>
                </div>

                <div>
                  <span className="benefit-icon green">
                    <Target size={19} />
                  </span>
                  <div>
                    <strong>Job-description match</strong>
                    <p>
                      See matched terms and skills that need stronger evidence.
                    </p>
                  </div>
                </div>

                <div>
                  <span className="benefit-icon orange">
                    <Lightbulb size={19} />
                  </span>
                  <div>
                    <strong>Actionable recommendations</strong>
                    <p>
                      Practical edits you can make before applying.
                    </p>
                  </div>
                </div>
              </div>

              <div className="privacy-note">
                <ShieldCheck size={18} />
                <p>
                  <strong>Your career data deserves care.</strong>
                  <br />
                  Avoid uploading sensitive documents you do not have
                  permission to share. Review the AI provider's terms before
                  using real personal data.
                </p>
              </div>
            </aside>
          </div>
        </section>

        {report && scores && feedback && (
          <section className="results-section" id="analysis-results">
            <div className="results-heading">
              <div>
                <span className="eyebrow">
                  {demoMode ? 'SAMPLE REPORT' : 'YOUR RESULTS'}
                </span>
                <h2>
                  Resume analysis <span>report</span>
                </h2>
                <p>
                  {report.fileName} ·{' '}
                  {report.analysisMode === 'ai'
                    ? 'AI-assisted analysis'
                    : 'Rule-based demo analysis'}
                </p>
              </div>

              <button
                className="secondary-btn"
                onClick={() => {
                  setReport(null);
                  setError('');
                  document
                    .getElementById('analyzer')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <RefreshCw size={15} /> New analysis
              </button>
            </div>

            <div className="score-cards">
              <div className="score-card main-score">
                <ScoreRing
                  score={scores.resumeScore}
                  label="Resume quality"
                  sublabel="Based on this app's rubric"
                />
                <p>{feedback.summary}</p>
              </div>

              <div className="score-card">
                <ScoreRing
                  score={scores.atsReadabilityScore}
                  label="ATS readability"
                  sublabel="Common parsing signals"
                />
                <div className="score-card-foot">
                  <BadgeCheck size={15} /> Readability estimate
                </div>
              </div>

              <div className="score-card">
                <div className="job-score-number">
                  {scores.jobMatchScore == null
                    ? '—'
                    : `${scores.jobMatchScore}%`}
                </div>
                <strong>Job match</strong>
                <span className="muted">
                  {scores.jobMatchScore == null
                    ? 'Add a job description to compare.'
                    : 'Keyword overlap estimate, not hiring probability.'}
                </span>
                <div className="score-card-foot">
                  <Target size={15} /> Role-specific fit
                </div>
              </div>
            </div>

            <div className="results-grid">
              <div className="result-panel score-breakdown">
                <SectionTitle
                  icon={Activity}
                  eyebrow="THE DETAILS"
                  title="Score breakdown"
                  detail="A transparent view of the scoring signals."
                />

                {(scores.breakdown || []).map((item) => (
                  <div className="breakdown-row" key={item.category}>
                    <div>
                      <span>{item.category}</span>
                      <strong>{item.score}/100</strong>
                    </div>
                    <div className="bar-track">
                      <div
                        style={{ width: `${item.score}%` }}
                        className={`bar-fill ${scoreColor(item.score)}`}
                      />
                    </div>
                  </div>
                ))}

                <p className="fine-print">
                  Weights are defined by this demo's rubric; they are not an
                  industry standard.
                </p>
              </div>

              <div className="result-panel">
                <SectionTitle
                  icon={CheckCircle2}
                  eyebrow="WHAT'S WORKING"
                  title="Your strengths"
                />
                <FeedbackList items={feedback.strengths} type="good" />
              </div>

              <div className="result-panel">
                <SectionTitle
                  icon={TriangleAlert}
                  eyebrow="OPPORTUNITIES"
                  title="Areas to improve"
                />
                <FeedbackList items={feedback.weaknesses} type="warn" />
              </div>

              <div className="result-panel">
                <SectionTitle
                  icon={Lightbulb}
                  eyebrow="YOUR ACTION PLAN"
                  title="Recommendations"
                />
                <FeedbackList
                  items={feedback.recommendations}
                  type="tip"
                />
              </div>

              <div className="result-panel keyword-panel">
                <SectionTitle
                  icon={Target}
                  eyebrow="ROLE ALIGNMENT"
                  title="Keyword comparison"
                  detail="A keyword match is a clue, not proof of proficiency."
                />

                <div className="keyword-columns">
                  <div>
                    <strong className="keyword-label matched-label">
                      FOUND IN RESUME
                    </strong>
                    <div className="keyword-list">
                      {(feedback.matchedSkills?.length
                        ? feedback.matchedSkills
                        : scores.matchedKeywords || []
                      ).map((x) => (
                        <span className="keyword matched" key={x}>
                          <Check size={12} />
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <strong className="keyword-label missing-label">
                      NOT CLEARLY FOUND
                    </strong>
                    <div className="keyword-list">
                      {(feedback.missingSkills?.length
                        ? feedback.missingSkills
                        : scores.missingKeywords || []
                      ).map((x) => (
                        <span className="keyword missing" key={x}>
                          <CircleHelp size={12} />
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {feedback.bulletRewrites?.length > 0 && (
                <div className="result-panel rewrite-panel">
                  <SectionTitle
                    icon={Sparkles}
                    eyebrow="BETTER BULLETS"
                    title="Suggested rewrites"
                    detail="Verify every suggestion before using it."
                  />

                  {feedback.bulletRewrites.map((b, i) => (
                    <div className="rewrite-card" key={i}>
                      <div>
                        <span className="rewrite-label">ORIGINAL</span>
                        <p>{b.original}</p>
                      </div>

                      <ArrowRight className="rewrite-arrow" size={18} />

                      <div>
                        <span className="rewrite-label suggested-label">
                          SUGGESTED
                        </span>
                        <p>{b.suggested}</p>
                        <small>{b.reason}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {feedback.interviewTopics?.length > 0 && (
                <div className="result-panel">
                  <SectionTitle
                    icon={BriefcaseBusiness}
                    eyebrow="PREPARE NEXT"
                    title="Interview topics"
                  />
                  <FeedbackList
                    items={feedback.interviewTopics}
                    type="tip"
                  />
                </div>
              )}
            </div>

            <div className="disclaimer">
              <ShieldCheck size={18} />
              <p>
                <strong>
                  Use this report as guidance, not a verdict.
                </strong>
                <br />
                {report.disclaimer} {feedback.scoreExplanation}
              </p>
            </div>
          </section>
        )}

        <section className="how-section" id="how-it-works">
          <div className="section-heading-center">
            <span className="eyebrow">A CLEARER PROCESS</span>
            <h2>
              From upload to <span>action plan.</span>
            </h2>
            <p>
              A few focused steps turn a document into a practical
              improvement plan.
            </p>
          </div>

          <div className="process-grid">
            <div>
              <span className="process-num">01</span>
              <FileText size={23} />
              <h3>Upload</h3>
              <p>Choose a text-readable PDF or DOCX resume.</p>
            </div>

            <div>
              <span className="process-num">02</span>
              <BrainCircuit size={23} />
              <h3>Analyze</h3>
              <p>
                Review content signals and optionally compare a job
                description.
              </p>
            </div>

            <div>
              <span className="process-num">03</span>
              <TrendingUp size={23} />
              <h3>Improve</h3>
              <p>
                Use clear recommendations to strengthen your next
                application.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer id="privacy">
        <div className="footer-brand">
          <span className="brand-mark">
            <BrainCircuit size={19} />
          </span>
          <span>
            resume<span className="brand-accent">pilot</span>
          </span>
        </div>

        <p>Built to make resume feedback more understandable.</p>
        <span className="footer-note">
          Independent project · Not an official ATS >Atharva Dahibhate 
        </span>
      </footer>
    </div>
  );
}
