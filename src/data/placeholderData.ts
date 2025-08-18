import { CVData } from "@/types/cv";

export const placeholderData: CVData = {
  personalInfo: {
    fullName: "Your Name",
    jobTitle: "Your Job Title",
    email: "your.email@example.com",
    phone: "+1 (555) 000-0000",
    address: "Your Street Address",
    city: "Your City",
    provinceState: "Your Province/State",
    postcode: "Your Postal Code",
    website: "www.yourwebsite.com",
    photoUrl: ""
  },
  summary: "Your professional summary goes here. Describe your key achievements, skills, and career objectives in 2-3 sentences.",
  workExperience: [
    {
      id: "placeholder-1",
      jobTitle: "Job Title 1",
      company: "Company Name",
      startDate: "",
      endDate: "",
      current: false,
      responsibilities: "<ul><li>Key responsibility 1</li><li>Key responsibility 2</li><li>Key responsibility 3</li></ul>"
    },
    {
      id: "placeholder-2",
      jobTitle: "Job Title 2",
      company: "Previous Company",
      startDate: "",
      endDate: "",
      current: false,
      responsibilities: "<ul><li>Previous role responsibility 1</li><li>Previous role responsibility 2</li></ul>"
    }
  ],
  education: [
    {
      id: "placeholder-1",
      educationType: "secondary" as const,
      degree: "High School Diploma",
      fieldOfStudy: "General Studies",
      institution: "Your High School",
      location: "Your City, Province/State",
      startDate: "",
      endDate: "",
      grade: "Your Grade"
    },
    {
      id: "placeholder-2",
      educationType: "tertiary" as const,
      degree: "Your Degree",
      fieldOfStudy: "Field of Study",
      institution: "Institution Name",
      location: "University City, State",
      startDate: "",
      endDate: "",
      grade: "Your GPA"
    }
  ],
  skills: [
    { id: "placeholder-1", name: "Skill 1", level: "Advanced" },
    { id: "placeholder-2", name: "Skill 2", level: "Expert" },
    { id: "placeholder-3", name: "Skill 3", level: "Intermediate" },
    { id: "placeholder-4", name: "Skill 4", level: "Advanced" }
  ],
  languages: [
    { id: "placeholder-1", name: "Language 1", proficiency: "Native" },
    { id: "placeholder-2", name: "Language 2", proficiency: "Fluent" }
  ],
  certifications: [
    {
      id: "placeholder-1",
      name: "Certification Name",
      issuer: "Issuing Organization",
      date: "",
      expiryDate: ""
    }
  ],
  references: [
    {
      id: "placeholder-1",
      name: "Reference Name",
      email: "reference@company.com",
      phone: "+1 (555) 000-0000",
      organization: "Company Name"
    }
  ]
};