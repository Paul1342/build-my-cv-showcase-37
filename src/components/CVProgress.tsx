import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { CVData } from "@/types/cv";
import { placeholderData } from "@/data/placeholderData";

const isReal = (val?: string, sample?: string) => {
  const v = (val ?? "").trim();
  if (!v) return false;
  if (sample !== undefined && v === (sample ?? "").trim()) return false;
  return true;
};

interface CVProgressProps {
  data: CVData; // pass sanitized data from CVBuilder
}

const CVProgress = ({ data }: CVProgressProps) => {
  const personalComplete =
    isReal(data.personalInfo.fullName) &&
    isReal(data.personalInfo.jobTitle, placeholderData.personalInfo.jobTitle) &&
    isReal(data.personalInfo.email, placeholderData.personalInfo.email) &&
    isReal(data.personalInfo.phone, placeholderData.personalInfo.phone);

  const summaryComplete =
    isReal(data.summary, placeholderData.summary) &&
    (data.summary?.trim().length ?? 0) >= 20;

  const anyRealExperience = data.workExperience.some((exp) => {
    const sample = placeholderData.workExperience?.[0];
    const realTitle = isReal(exp.jobTitle, sample?.jobTitle);
    const realCompany = isReal(exp.company, sample?.company);
    const realStart = isReal(exp.startDate, sample?.startDate);
    return realTitle && realCompany && realStart;
  });
  const workComplete = anyRealExperience || data.workExperience.length === 0;

  const educationComplete = data.education.some((edu) => {
    const sample = placeholderData.education?.[0];
    return (
      isReal(edu.degree, sample?.degree) &&
      isReal(edu.institution, sample?.institution)
    );
  });

  const sampleSkillNames = new Set(
    (placeholderData.skills ?? []).map((s) => (s.name ?? "").trim())
  );
  const skillsComplete = data.skills.some((s) => {
    const name = (s.name ?? "").trim();
    return name.length > 0 && !sampleSkillNames.has(name);
  });

  const sections = [
    { name: "Personal Information", complete: personalComplete },
    { name: "Summary", complete: summaryComplete },
    { name: "Work Experience", complete: workComplete },
    { name: "Education", complete: educationComplete },
    { name: "Skills", complete: skillsComplete },
  ];

  const completedSections = sections.filter((s) => s.complete).length;
  const percentage = Math.round((completedSections / sections.length) * 100);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold mb-2">Resume Completeness</h3>
          <div className="flex items-center gap-3">
            <Progress value={percentage} className="flex-1 h-2" />
            <span className="text-sm font-medium min-w-[3ch]">{percentage}%</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {sections.map((section, index) => (
            <div key={section.name} className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded-full border text-xs font-medium">
                {section.complete ? (
                  <CheckCircle className="w-3 h-3 text-primary" />
                ) : (
                  <span className="text-muted-foreground">{index + 1}</span>
                )}
              </div>
              <span className={`text-xs ${section.complete ? "text-foreground" : "text-muted-foreground"}`}>
                {section.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CVProgress;
