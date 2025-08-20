import React, { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { Mail, Phone, MapPin, Globe, Calendar, Award, Users } from "lucide-react";
import { CVData, CVTemplate } from "@/types/cv";

const DEFAULT_AVATAR_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUqDBA8jnL_ezUoa8s_GgnboMkEeE4M7-LyA&s";

interface CVPreviewProps {
  data: CVData;
  template: CVTemplate;
  isPreview?: boolean;
  isPDF?: boolean;
  isFullPagePDF?: boolean;
  /** When true, render an auto-height page (used for live preview & export) */
  unbounded?: boolean;
}

const CVPreview = ({
  data,
  template,
  isPreview = false,
  isPDF = false,
  isFullPagePDF = false,
  unbounded = false,
}: CVPreviewProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

  const getSkillLevel = (level: string) => {
    const levels: Record<string, number> = {
      Beginner: 25,
      Intermediate: 50,
      Advanced: 75,
      Expert: 100,
    };
    return levels[level] ?? 50;
  };

  // Color values for each palette
  const getColorValues = (colorName: string) => {
    const colorMap = {
      slate:   { primary: "215, 25%, 27%", secondary: "215, 25%, 95%", accent: "215, 25%, 20%" },
      rose:    { primary: "11, 70%, 84%",  secondary: "11, 70%, 95%",  accent: "11, 70%, 74%" },
      emerald: { primary: "164, 44%, 80%", secondary: "164, 44%, 95%", accent: "164, 44%, 70%" },
      sand:    { primary: "43, 35%, 62%",  secondary: "43, 35%, 94%",  accent: "43, 35%, 48%" },
      blue:    { primary: "217, 91%, 60%", secondary: "217, 91%, 95%", accent: "217, 91%, 50%" },
      orange:  { primary: "20, 90%, 48%",  secondary: "20, 90%, 95%",  accent: "20, 90%, 40%" },
    } as const;

    const key = (Object.prototype.hasOwnProperty.call(colorMap, colorName)
      ? (colorName as keyof typeof colorMap)
      : "slate") as keyof typeof colorMap;

    return colorMap[key];
  };

  // Per-instance scoped CSS variables
  const colorVars: CSSProperties = {
    ["--template-primary" as any]: getColorValues(template.color).primary,
    ["--template-secondary" as any]: getColorValues(template.color).secondary,
    ["--template-accent" as any]: getColorValues(template.color).accent,
  };

  // Template-specific style helpers
  const getTemplateStyles = () => {
    const baseStyle = "transition-all duration-300";
    const dynamicStyles = {
      sidebarBg: "cv-sidebar-bg",
      primaryColor: "cv-primary-text",
      accentColor: "cv-accent-bg",
      borderColor: "cv-primary-border",
      skillBar: "cv-skill-bar",
    };

    switch (template.id) {
      case "professional":
        return { ...dynamicStyles, headerStyle: `${baseStyle} cv-header-professional` };
      case "creative":
        return { ...dynamicStyles, headerStyle: `${baseStyle} cv-header-creative`, skillBar: "cv-skill-bar-creative" };
      case "executive":
        return { ...dynamicStyles, headerStyle: `${baseStyle} cv-header-executive` };
      case "minimal":
        return { ...dynamicStyles, headerStyle: `${baseStyle} cv-header-minimal` };
      case "modern-bullets":
        return { ...dynamicStyles, headerStyle: `${baseStyle} cv-header-modern-bullets` };
      default:
        return { ...dynamicStyles, headerStyle: baseStyle };
    }
  };

  const styles = getTemplateStyles();

  // Refs for snapping height in unbounded mode
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  // Snap unbounded wrapper height to whole page multiples (prevents ghost pages)
  useEffect(() => {
    if (!unbounded || !wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    const inner = innerRef.current || wrapper;

    const mmToPx = (mm: number) => {
      const probe = document.createElement("div");
      probe.style.height = `${mm}mm`;
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.style.pointerEvents = "none";
      document.body.appendChild(probe);
      const px = probe.getBoundingClientRect().height;
      document.body.removeChild(probe);
      return px;
    };

    const pageHeightPx = isPDF ? mmToPx(297) : 1123; // A4 height
    // small tolerance so tiny overflow doesn't create an extra page
    const EPS = 8; // px

    const snap = () => {
      // True content height (not affected by parent's minHeight)
      const contentH = inner.scrollHeight;

      // Use a tolerant calculation that requires >EPS extra content to create a new page
      let pages = Math.floor((contentH - EPS) / pageHeightPx) + 1;
      pages = Math.max(1, pages);

      // Subtract 1px from the snapped height to avoid rounding spillover that can add a blank page
      const snapped = pages * pageHeightPx - 1;
      wrapper.style.minHeight = `${snapped}px`;
    };

    snap();
    const ro = new ResizeObserver(snap);
    ro.observe(inner);
    window.addEventListener("resize", snap);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", snap);
    };
  }, [unbounded, isPDF, data, template]);

  // Common style block
  const styleBlock = (
    <style>{`
      .cv-primary-text { color: hsl(var(--template-primary)); }
      .cv-accent-bg { background-color: hsl(var(--template-primary)); }
      .cv-primary-border { border-color: hsl(var(--template-primary)); }
      .cv-skill-bar { background-color: hsl(var(--template-primary)); }
      .cv-skill-bar-creative { background-color: hsl(var(--template-primary)); }

      .cv-header-professional { background: linear-gradient(to right, hsl(var(--template-primary)), hsl(var(--template-accent))); }
      .cv-header-creative { background-color: hsl(var(--template-primary)); }
      .cv-header-executive { background-color: hsl(var(--template-primary)); }
      .cv-header-minimal { border-bottom: 2px solid hsl(var(--template-primary)); }
      .cv-header-modern-bullets { background: linear-gradient(135deg, hsl(var(--template-primary)), hsl(var(--template-accent))); }

      /* Page-filling ribbon as a background so it always reaches the bottom of each page */
      .cv-left-ribbon {
        background:
          linear-gradient(
            to right,
            hsl(var(--template-secondary)) 0%,
            hsl(var(--template-secondary)) 33.333%,
            transparent 33.333%,
            transparent 100%
          );
        background-repeat: no-repeat;
        background-size: 100% 100%;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      /* Sidebar itself remains transparent; background paints the ribbon */
      .cv-sidebar-bg { background-color: transparent; }
    `}</style>
  );

  // ---------- TWO COLUMN ----------
  if (template.columns === 2) {
    // Fixed A4 (thumbnails) vs unbounded (live preview + export)
    const wrapperClass = unbounded
      ? `${isPDF ? "bg-white" : "bg-background border border-border rounded-lg shadow-card"} cv-left-ribbon ${isPreview ? "text-xs" : "text-sm"}`
      : `cv-a4 ${isPDF ? "bg-white" : "bg-background"} ${isPDF ? "" : "border border-border rounded-lg shadow-card"} overflow-hidden ${isPreview ? "text-xs" : "text-sm"} cv-left-ribbon`;

    // For unbounded, set width but not height so it can grow and paginate.
    const sizeStyle: CSSProperties = unbounded
      ? (isPDF ? { width: "210mm" } : { width: "794px" })
      : {};

    const cvContent = (
      <div ref={wrapperRef} className={wrapperClass} style={{ ...colorVars, ...sizeStyle }}>
        {styleBlock}

        {/* NOTE: in unbounded mode we must NOT force h-full on this inner wrapper */}
        <div
          ref={unbounded ? innerRef : undefined}
          className={unbounded ? "flex" : "flex h-full"}
        >
          {/* Left Sidebar (transparent; ribbon comes from page background) */}
          <div className={`w-1/3 p-6 space-y-6`}>
            {template.hasPhoto && (
              <div className="text-center">
                <img
                  src={data.personalInfo.photoUrl || DEFAULT_AVATAR_URL}
                  alt="Profile"
                  className={`w-30 h-30 aspect-square rounded-full mx-auto object-cover object-center border-4 ${styles.borderColor}/20 shadow-md flex-shrink-0`}
                />
              </div>
            )}

            {/* Contact */}
            <div>
              <h3 className={`font-semibold ${styles.primaryColor} mb-3 border-b ${styles.borderColor}/30 pb-1 text-sm`}>
                Contact
              </h3>
              <div className="space-y-2">
                {data.personalInfo.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className={`w-3 h-3 flex-shrink-0 ${styles.primaryColor}`} />
                    <span className="text-xs break-all">{data.personalInfo.email}</span>
                  </div>
                )}
                {data.personalInfo.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className={`w-3 h-3 flex-shrink-0 ${styles.primaryColor}`} />
                    <span className="text-xs">{data.personalInfo.phone}</span>
                  </div>
                )}
                {(data.personalInfo.address || data.personalInfo.city || data.personalInfo.provinceState || data.personalInfo.postcode) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className={`w-3 h-3 flex-shrink-0 ${styles.primaryColor}`} />
                    <span className="text-xs">
                      {[
                        data.personalInfo.address,
                        data.personalInfo.city && data.personalInfo.provinceState && data.personalInfo.postcode
                          ? `${data.personalInfo.city}, ${data.personalInfo.provinceState} ${data.personalInfo.postcode}`
                          : [data.personalInfo.city, data.personalInfo.provinceState, data.personalInfo.postcode].filter(Boolean).join(', ')
                      ].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {data.personalInfo.website && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className={`w-3 h-3 flex-shrink-0 ${styles.primaryColor}`} />
                    <span className="text-xs break-all">{data.personalInfo.website}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {data.skills.length > 0 && (
              <div className="avoid-break">
                <h3 className={`font-semibold ${styles.primaryColor} mb-3 border-b ${styles.borderColor}/30 pb-1 text-sm`}>
                  Skills
                </h3>
                <div className="space-y-3">
                  {data.skills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">{skill.name}</span>
                        <span className="text-xs text-muted-foreground">{skill.level}</span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-2">
                        <div
                          className={`${styles.skillBar} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${getSkillLevel(skill.level)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {data.languages.length > 0 && (
              <div className="avoid-break">
                <h3 className={`font-semibold ${styles.primaryColor} mb-3 border-b ${styles.borderColor}/30 pb-1 text-sm`}>
                  Languages
                </h3>
                <div className="space-y-2">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex items-center justify-between">
                      <span className="text-xs font-medium">{lang.name}</span>
                      <span className="text-xs text-muted-foreground">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {data.certifications.length > 0 && (
              <div className="avoid-break">
                <h3 className={`font-semibold ${styles.primaryColor} mb-3 border-b ${styles.borderColor}/30 pb-1 text-sm`}>
                  Certifications
                </h3>
                <div className="space-y-3">
                  {data.certifications.map((cert) => (
                    <div key={cert.id}>
                      <div className="flex items-start gap-2">
                        <Award className={`w-3 h-3 flex-shrink-0 mt-0.5 ${styles.primaryColor}`} />
                        <div>
                          <div className="text-xs font-medium text-foreground">{cert.name}</div>
                          <div className="text-xs text-muted-foreground">{cert.issuer}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(cert.date)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {data.references.length > 0 && (
              <div className="avoid-break">
                <h3 className={`font-semibold ${styles.primaryColor} mb-3 border-b ${styles.borderColor}/30 pb-1 text-sm`}>
                  References
                </h3>
                <div className="space-y-3">
                  {data.references.map((ref) => (
                    <div key={ref.id}>
                      <div className="flex items-start gap-2">
                        <Users className={`w-3 h-3 flex-shrink-0 mt-0.5 ${styles.primaryColor}`} />
                        <div>
                          <div className="text-xs font-medium text-foreground">{ref.name}</div>
                          <div className="text-xs text-muted-foreground">{ref.organization}</div>
                          <div className="text-xs text-muted-foreground">{ref.email}</div>
                          <div className="text-xs text-muted-foreground">{ref.phone}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div className={`${template.id === "minimal" ? styles.headerStyle + " pb-4" : "border-b border-border pb-4"}`}>
              {template.id !== "minimal" && (
                <div className={`${styles.headerStyle} text-white p-4 rounded-lg mb-4 shadow-md`}>
                  <h1 className="text-2xl font-bold mb-1">{data.personalInfo.fullName || "Your Name"}</h1>
                  <p className="text-lg opacity-90">{data.personalInfo.jobTitle || "Your Job Title"}</p>
                </div>
              )}
              {template.id === "minimal" && (
                <>
                  <h1 className={`text-2xl font-bold ${styles.primaryColor} mb-1`}>
                    {data.personalInfo.fullName || "Your Name"}
                  </h1>
                  <p className="text-lg text-muted-foreground">{data.personalInfo.jobTitle || "Your Job Title"}</p>
                </>
              )}
            </div>

            {/* Summary */}
            {data.summary && (
              <div className="avoid-break">
                <h3 className={`font-semibold ${styles.primaryColor} mb-3 text-lg`}>Professional Summary</h3>
                <p className="text-muted-foreground leading-relaxed text-justify">{data.summary}</p>
              </div>
            )}

            {/* Work Experience */}
            {data.workExperience.length > 0 && (
               <div className="avoid-break">
                <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg`}>Work Experience</h3>
                <div className="space-y-6">
                  {data.workExperience.map((exp) => (
                    <div key={exp.id} className="relative">
                      {template.id === "creative" && (
                        <div className={`absolute left-0 top-0 w-1 h-full ${styles.accentColor} rounded-full`} />
                      )}
                      <div className={`${template.id === "creative" ? "pl-4" : ""}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground text-base">{exp.jobTitle}</h4>
                            <p className={`font-medium ${styles.primaryColor}`}>{exp.company}</p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                            </div>
                          </div>
                        </div>
                        {exp.responsibilities && exp.responsibilities.trim() && (
                          <div 
                            className="text-muted-foreground text-sm leading-relaxed ml-4 [&>ul]:list-disc [&>ul]:list-inside [&>ol]:list-decimal [&>ol]:list-inside [&>ul]:space-y-1 [&>ol]:space-y-1 [&>p]:mb-2 [&>strong]:font-semibold [&>em]:italic"
                            dangerouslySetInnerHTML={{ __html: exp.responsibilities }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {data.education.length > 0 && (
              <div className="avoid-break">
                <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg`}>Education</h3>
                <div className="space-y-6">
                  {/* Secondary Education */}
                  {data.education.filter(edu => edu.educationType === 'secondary').map((edu) => (
                    <div key={edu.id} className="relative">
                      {template.id === "creative" && (
                        <div className={`absolute left-0 top-0 w-1 h-full ${styles.accentColor} rounded-full`} />
                      )}
                      <div className={`${template.id === "creative" ? "pl-4" : ""}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground text-base">{edu.degree}</h4>
                            <p className={`font-medium ${styles.primaryColor}`}>{edu.institution}</p>
                            {edu.location && (
                              <p className="text-sm text-muted-foreground">{edu.location}</p>
                            )}
                            {edu.fieldOfStudy && (
                              <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                            )}
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                            </div>
                          </div>
                        </div>
                        {edu.grade && <div className="text-sm text-muted-foreground">Grade: {edu.grade}</div>}
                      </div>
                    </div>
                  ))}
                  
                  {/* Tertiary Education */}
                  {data.education.filter(edu => (edu.educationType === 'tertiary' || !edu.educationType)).map((edu) => (
                    <div key={edu.id} className="relative">
                      {template.id === "creative" && (
                        <div className={`absolute left-0 top-0 w-1 h-full ${styles.accentColor} rounded-full`} />
                      )}
                      <div className={`${template.id === "creative" ? "pl-4" : ""}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-foreground text-base">{edu.degree}</h4>
                            <p className={`font-medium ${styles.primaryColor}`}>{edu.institution}</p>
                            {edu.location && (
                              <p className="text-sm text-muted-foreground">{edu.location}</p>
                            )}
                            {edu.fieldOfStudy && (
                              <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                            )}
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                            </div>
                          </div>
                        </div>
                        {edu.grade && <div className="text-sm text-muted-foreground">Grade: {edu.grade}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    return isFullPagePDF ? <div className="cv-page">{cvContent}</div> : cvContent;
  }

  // ---------- SINGLE COLUMN ----------
  if (isFullPagePDF) {
    // Multi-page PDF with page breaks
    const content = (
      <>
        {styleBlock}
        <div className="cv-page">
          {/* Header */}
          <div className={`${template.id === "minimal" ? styles.headerStyle + " pb-2" : "pb-2"} text-center`}>
            {template.id !== "minimal" && template.id !== "modern-bullets" && (
              <div className={`${styles.headerStyle} text-white p-6 rounded-lg mb-4 shadow-md`}>
                {template.hasPhoto && (
                  <img
                    src={data.personalInfo.photoUrl || DEFAULT_AVATAR_URL}
                    alt="Profile"
                    className="w-32 h-32 aspect-square rounded-full mx-auto object-cover object-center border-4 border-white/20 mb-4 shadow-lg flex-shrink-0"
                  />
                )}
                <h1 className="text-3xl font-bold mb-2">{data.personalInfo.fullName || "Your Name"}</h1>
                <p className="text-xl opacity-90">{data.personalInfo.jobTitle || "Your Job Title"}</p>
              </div>
            )}
            {template.id === "modern-bullets" && (
              <div className={`${styles.headerStyle} text-white p-6 rounded-lg mb-4 shadow-md`}>
                {template.hasPhoto && (
                  <img
                    src={data.personalInfo.photoUrl || DEFAULT_AVATAR_URL}
                    alt="Profile"
                    className="w-32 h-32 aspect-square rounded-full mx-auto object-cover object-center border-4 border-white/20 mb-4 shadow-lg flex-shrink-0"
                  />
                )}
                <h1 className="text-3xl font-bold mb-2">{data.personalInfo.fullName || "Your Name"}</h1>
                <p className="text-xl opacity-90">{data.personalInfo.jobTitle || "Your Job Title"}</p>
              </div>
            )}
            {template.id === "minimal" && (
              <>
                {template.hasPhoto && (
                  <img
                    src={data.personalInfo.photoUrl || DEFAULT_AVATAR_URL}
                    alt="Profile"
                    className={`w-32 h-32 aspect-square rounded-full mx-auto object-cover object-center border-4 ${styles.borderColor}/20 mb-4 shadow-md flex-shrink-0`}
                  />
                )}
                <h1 className={`text-3xl font-bold ${styles.primaryColor} mb-2`}>
                  {data.personalInfo.fullName || "Your Name"}
                </h1>
                <p className="text-xl text-muted-foreground">{data.personalInfo.jobTitle || "Your Job Title"}</p>
              </>
            )}
          </div>

          {/* Contact Information */}
          <div className="avoid-break mb-8">
            <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
              Contact Information
            </h3>
            <div className="flex flex-wrap gap-6">
              {data.personalInfo.email && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className={`w-4 h-4 flex-shrink-0 ${styles.primaryColor}`} />
                  <span className="break-all">{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.phone && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className={`w-4 h-4 flex-shrink-0 ${styles.primaryColor}`} />
                  <span>{data.personalInfo.phone}</span>
                </div>
              )}
              {(data.personalInfo.address || data.personalInfo.city || data.personalInfo.provinceState || data.personalInfo.postcode) && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className={`w-4 h-4 flex-shrink-0 ${styles.primaryColor}`} />
                  <span>
                    {[
                      data.personalInfo.address,
                      data.personalInfo.city && data.personalInfo.provinceState && data.personalInfo.postcode
                        ? `${data.personalInfo.city}, ${data.personalInfo.provinceState} ${data.personalInfo.postcode}`
                        : [data.personalInfo.city, data.personalInfo.provinceState, data.personalInfo.postcode].filter(Boolean).join(', ')
                    ].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {data.personalInfo.website && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Globe className={`w-4 h-4 flex-shrink-0 ${styles.primaryColor}`} />
                  <span className="break-all">{data.personalInfo.website}</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="avoid-break mb-8">
              <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
                Professional Summary
              </h3>
              <p className="text-muted-foreground leading-relaxed text-justify">{data.summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {data.workExperience.length > 0 && (
            <div className="avoid-break mb-8">
              <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
                Work Experience
              </h3>
              <div className="space-y-6">
                {data.workExperience.map((exp) => (
                  <div key={exp.id} className="avoid-break-item relative">
                    {template.id === "creative" && (
                      <div className={`absolute left-0 top-0 w-1 h-full ${styles.accentColor} rounded-full`} />
                    )}
                    <div className={`${template.id === "creative" ? "pl-4" : ""}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-foreground text-base">{exp.jobTitle}</h4>
                          <p className={`font-medium ${styles.primaryColor}`}>{exp.company}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                          </div>
                        </div>
                      </div>
                      {exp.responsibilities && exp.responsibilities.trim().length > 0 && (
                        <div
                          className="text-muted-foreground space-y-1 ml-4 prose prose-sm max-w-none [&>ul]:list-disc [&>ul]:list-inside [&>ol]:list-decimal [&>ol]:list-inside [&>ul]:space-y-1 [&>ol]:space-y-1 [&>p]:mb-2 [&>strong]:font-semibold [&>em]:italic"
                          dangerouslySetInnerHTML={{ __html: exp.responsibilities }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div className="avoid-break mb-8">
              <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
                Education
              </h3>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="avoid-break-item">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                        <p className={`font-medium ${styles.primaryColor}`}>{edu.institution}</p>
                        {edu.fieldOfStudy && (
                          <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <div className="avoid-break mb-8">
              <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
                Skills
              </h3>
              {template.id === "modern-bullets" ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-center">
                  {data.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-center gap-2">
                      <span className={`${styles.primaryColor} font-medium`}>•</span>
                      <span className="font-medium text-foreground">{skill.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {data.skills.map((skill) => (
                    <div key={skill.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">{skill.level}</span>
                      </div>
                      <div className="w-full bg-muted/50 rounded-full h-2">
                        <div
                          className={`${styles.skillBar} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${getSkillLevel(skill.level)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Languages */}
          {data.languages.length > 0 && (
            <div className="avoid-break mb-8">
              <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
                Languages
              </h3>
              <div className="space-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex items-center justify-between">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-sm text-muted-foreground">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <div className="avoid-break mb-8">
              <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
                Certifications
              </h3>
              <div className="space-y-3">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="avoid-break-item">
                    <div className="flex items-start gap-2">
                      <Award className={`w-4 h-4 flex-shrink-0 mt-0.5 ${styles.primaryColor}`} />
                      <div>
                        <div className="font-medium text-foreground">{cert.name}</div>
                        <div className="text-sm text-muted-foreground">{cert.issuer}</div>
                        <div className="text-sm text-muted-foreground">{formatDate(cert.date)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {data.references.length > 0 && (
            <div className="avoid-break">
              <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
                References
              </h3>
              <div className="space-y-3">
                {data.references.map((ref) => (
                  <div key={ref.id} className="avoid-break-item">
                    <div className="flex items-start gap-2">
                      <Users className={`w-4 h-4 flex-shrink-0 mt-0.5 ${styles.primaryColor}`} />
                      <div>
                        <div className="font-medium text-foreground">{ref.name}</div>
                        <div className="text-sm text-muted-foreground">{ref.organization}</div>
                        <div className="text-sm text-muted-foreground">{ref.email}</div>
                        <div className="text-sm text-muted-foreground">{ref.phone}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );

    return <div style={colorVars}>{content}</div>;
  }

  // Non-PDF (unbounded mode or fixed A4 preview)
  const wrapperClass = unbounded
    ? `${isPDF ? "bg-white" : "bg-background border border-border rounded-lg shadow-card"} ${isPreview ? "text-xs" : "text-sm"}`
    : `cv-a4 ${isPDF ? "bg-white" : "bg-background"} ${isPDF ? "" : "border border-border rounded-lg shadow-card"} overflow-hidden ${isPreview ? "text-xs" : "text-sm"}`;

  // For unbounded, set width but not height so it can grow.
  const sizeStyle: CSSProperties = unbounded
    ? (isPDF ? { width: "210mm" } : { width: "794px" })
    : {};

  return (
    <div ref={wrapperRef} className={wrapperClass} style={{ ...colorVars, ...sizeStyle }}>
      {styleBlock}
      
      <div
        ref={unbounded ? innerRef : undefined}
        className="p-8 space-y-6"
      >
        {/* Header */}
        <div className={`${template.id === "minimal" ? styles.headerStyle + " pb-4" : "pb-4"} text-center`}>
          {template.id !== "minimal" && template.id !== "modern-bullets" && (
            <div className={`${styles.headerStyle} text-white p-6 rounded-lg mb-4 shadow-md`}>
              {template.hasPhoto && (
                <img
                  src={data.personalInfo.photoUrl || DEFAULT_AVATAR_URL}
                  alt="Profile"
                  className="w-32 h-32 aspect-square rounded-full mx-auto object-cover object-center border-4 border-white/20 mb-4 shadow-lg flex-shrink-0"
                />
              )}
              <h1 className="text-3xl font-bold mb-2">{data.personalInfo.fullName || "Your Name"}</h1>
              <p className="text-xl opacity-90">{data.personalInfo.jobTitle || "Your Job Title"}</p>
            </div>
          )}
          {template.id === "modern-bullets" && (
            <div className={`${styles.headerStyle} text-white p-6 rounded-lg mb-4 shadow-md`}>
              {template.hasPhoto && (
                <img
                  src={data.personalInfo.photoUrl || DEFAULT_AVATAR_URL}
                  alt="Profile"
                  className="w-32 h-32 aspect-square rounded-full mx-auto object-cover object-center border-4 border-white/20 mb-4 shadow-lg flex-shrink-0"
                />
              )}
              <h1 className="text-3xl font-bold mb-2">{data.personalInfo.fullName || "Your Name"}</h1>
              <p className="text-xl opacity-90">{data.personalInfo.jobTitle || "Your Job Title"}</p>
            </div>
          )}
          {template.id === "minimal" && (
            <>
              {template.hasPhoto && (
                <img
                  src={data.personalInfo.photoUrl || DEFAULT_AVATAR_URL}
                  alt="Profile"
                  className={`w-32 h-32 aspect-square rounded-full mx-auto object-cover object-center border-4 ${styles.borderColor}/20 mb-4 shadow-md flex-shrink-0`}
                />
              )}
              <h1 className={`text-3xl font-bold ${styles.primaryColor} mb-2`}>
                {data.personalInfo.fullName || "Your Name"}
              </h1>
              <p className="text-xl text-muted-foreground">{data.personalInfo.jobTitle || "Your Job Title"}</p>
            </>
          )}
        </div>

        {/* Contact Information */}
        <div className="avoid-break mb-8">
          <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
            Contact Information
          </h3>
          <div className="flex flex-wrap gap-6">
            {data.personalInfo.email && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className={`w-4 h-4 flex-shrink-0 ${styles.primaryColor}`} />
                <span className="break-all">{data.personalInfo.email}</span>
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className={`w-4 h-4 flex-shrink-0 ${styles.primaryColor}`} />
                <span>{data.personalInfo.phone}</span>
              </div>
            )}
            {(data.personalInfo.address || data.personalInfo.city || data.personalInfo.provinceState || data.personalInfo.postcode) && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className={`w-4 h-4 flex-shrink-0 ${styles.primaryColor}`} />
                <span>
                  {[
                    data.personalInfo.address,
                    data.personalInfo.city && data.personalInfo.provinceState && data.personalInfo.postcode
                      ? `${data.personalInfo.city}, ${data.personalInfo.provinceState} ${data.personalInfo.postcode}`
                      : [data.personalInfo.city, data.personalInfo.provinceState, data.personalInfo.postcode].filter(Boolean).join(', ')
                  ].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            {data.personalInfo.website && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Globe className={`w-4 h-4 flex-shrink-0 ${styles.primaryColor}`} />
                <span className="break-all">{data.personalInfo.website}</span>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="avoid-break">
            <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
              Professional Summary
            </h3>
            <p className="text-muted-foreground leading-relaxed text-justify">{data.summary}</p>
          </div>
        )}

        {/* Work Experience */}
        {data.workExperience.length > 0 && (
          <div className="avoid-break">
            <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
              Work Experience
            </h3>
            <div className="space-y-6">
              {data.workExperience.map((exp) => (
                <div key={exp.id} className="relative">
                  {template.id === "creative" && (
                    <div className={`absolute left-0 top-0 w-1 h-full ${styles.accentColor} rounded-full`} />
                  )}
                  <div className={`${template.id === "creative" ? "pl-4" : ""}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground text-base">{exp.jobTitle}</h4>
                        <p className={`font-medium ${styles.primaryColor}`}>{exp.company}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                        </div>
                      </div>
                    </div>
                    {exp.responsibilities && exp.responsibilities.trim().length > 0 && (
                      <div
                        className="text-muted-foreground space-y-1 prose prose-sm max-w-none [&>ul]:list-disc [&>ul]:list-inside [&>ol]:list-decimal [&>ol]:list-inside [&>ul]:space-y-1 [&>ol]:space-y-1 [&>p]:mb-2 [&>strong]:font-semibold [&>em]:italic"
                        dangerouslySetInnerHTML={{ __html: exp.responsibilities }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div className="avoid-break">
            <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
              Education
            </h3>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-foreground">{edu.degree}</h4>
                      <p className={`font-medium ${styles.primaryColor}`}>{edu.institution}</p>
                      {edu.fieldOfStudy && (
                        <p className="text-sm text-muted-foreground">{edu.fieldOfStudy}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="avoid-break">
            <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
              Skills
            </h3>
            {template.id === "modern-bullets" ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-center">
                {data.skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-center gap-2">
                    <span className={`${styles.primaryColor} font-medium`}>•</span>
                    <span className="font-medium text-foreground">{skill.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data.skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-sm text-muted-foreground">{skill.level}</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2">
                      <div
                        className={`${styles.skillBar} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${getSkillLevel(skill.level)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <div className="avoid-break">
            <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
              Languages
            </h3>
            <div className="space-y-2">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex items-center justify-between">
                  <span className="font-medium">{lang.name}</span>
                  <span className="text-sm text-muted-foreground">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div className="avoid-break">
            <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
              Certifications
            </h3>
            <div className="space-y-3">
              {data.certifications.map((cert) => (
                <div key={cert.id}>
                  <div className="flex items-start gap-2">
                    <Award className={`w-4 h-4 flex-shrink-0 mt-0.5 ${styles.primaryColor}`} />
                    <div>
                      <div className="font-medium text-foreground">{cert.name}</div>
                      <div className="text-sm text-muted-foreground">{cert.issuer}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(cert.date)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* References */}
        {data.references.length > 0 && (
          <div className="avoid-break">
            <h3 className={`font-semibold ${styles.primaryColor} mb-4 text-lg border-b ${styles.borderColor}/30 pb-2`}>
              References
            </h3>
            <div className="space-y-3">
              {data.references.map((ref) => (
                <div key={ref.id}>
                  <div className="flex items-start gap-2">
                    <Users className={`w-4 h-4 flex-shrink-0 mt-0.5 ${styles.primaryColor}`} />
                    <div>
                      <div className="font-medium text-foreground">{ref.name}</div>
                      <div className="text-sm text-muted-foreground">{ref.organization}</div>
                      <div className="text-sm text-muted-foreground">{ref.email}</div>
                      <div className="text-sm text-muted-foreground">{ref.phone}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVPreview;