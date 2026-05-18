export type VisitType = "skin" | "dental" | "emergency" | "wellness";
export type CoverageStatus = "Likely covered" | "Needs review" | "Not covered";

export type Pet = {
  id: string;
  name: string;
  breed: string;
  age: string;
  pronoun: string;
  image: string;
  policy: string;
  excess: number;
  reimbursement: number;
  accent: string;
};

export type EstimateLineItem = {
  label: string;
  amount: number;
  status: CoverageStatus;
  note: string;
};

export type Estimate = {
  petName: string;
  visitLabel: string;
  clinic: string;
  total: number;
  likelyFetchPays: number;
  likelyYouPay: number;
  confidence: number;
  lineItems: EstimateLineItem[];
  missingDocs: string[];
  nextAction: string;
};

export const pets: Pet[] = [
  {
    id: "luna",
    name: "Luna",
    breed: "Cavoodle",
    age: "4 years",
    pronoun: "her",
    image:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=320&q=80",
    policy: "Accident + illness",
    excess: 100,
    reimbursement: 0.8,
    accent: "bg-fetch-rose"
  },
  {
    id: "milo",
    name: "Milo",
    breed: "Domestic shorthair",
    age: "2 years",
    pronoun: "his",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=320&q=80",
    policy: "Comprehensive care",
    excess: 75,
    reimbursement: 0.85,
    accent: "bg-fetch-blue"
  }
];

export const visitTypes = [
  {
    id: "skin",
    label: "Skin",
    description: "Itching, rash, allergy",
    color: "border-fetch-pink bg-fetch-rose"
  },
  {
    id: "dental",
    label: "Dental",
    description: "Clean, tooth, gums",
    color: "border-fetch-mint bg-emerald-50"
  },
  {
    id: "emergency",
    label: "Urgent",
    description: "Same-day support",
    color: "border-amber-300 bg-amber-50"
  },
  {
    id: "wellness",
    label: "Routine",
    description: "Checkup or vaccine",
    color: "border-sky-200 bg-sky-50"
  }
] as const;

export const careQueue = [
  {
    label: "Annual vaccination",
    detail: "Due in 12 days",
    tone: "bg-fetch-blue text-sky-900"
  },
  {
    label: "Dental check",
    detail: "Book before July",
    tone: "bg-emerald-50 text-emerald-900"
  },
  {
    label: "Claim follow-up",
    detail: "Invoice still needed",
    tone: "bg-fetch-rose text-rose-900"
  }
];

const estimateMap: Record<VisitType, Omit<Estimate, "petName" | "likelyFetchPays" | "likelyYouPay">> = {
  skin: {
    visitLabel: "Skin irritation consult",
    clinic: "Bondi Junction Vet",
    total: 642,
    confidence: 86,
    lineItems: [
      {
        label: "Consultation",
        amount: 112,
        status: "Likely covered",
        note: "Illness consult attached to this visit"
      },
      {
        label: "Skin cytology",
        amount: 185,
        status: "Likely covered",
        note: "Diagnostic test requested by the vet"
      },
      {
        label: "Medication",
        amount: 96,
        status: "Likely covered",
        note: "Linked to current symptoms"
      },
      {
        label: "Medicated shampoo",
        amount: 49,
        status: "Needs review",
        note: "May need product notes from clinic"
      },
      {
        label: "Follow-up review",
        amount: 200,
        status: "Likely covered",
        note: "Booked as part of the same condition"
      }
    ],
    missingDocs: ["Itemised invoice", "Vet clinical notes"],
    nextAction: "Send the invoice now and Fetch can start the pre-approval check."
  },
  dental: {
    visitLabel: "Dental treatment estimate",
    clinic: "Surry Hills Animal Hospital",
    total: 1180,
    confidence: 74,
    lineItems: [
      {
        label: "Dental examination",
        amount: 130,
        status: "Likely covered",
        note: "Clinical exam before treatment"
      },
      {
        label: "Anaesthesia",
        amount: 310,
        status: "Needs review",
        note: "Coverage depends on treatment reason"
      },
      {
        label: "Tooth extraction",
        amount: 520,
        status: "Needs review",
        note: "Requires vet notes and diagnosis"
      },
      {
        label: "Scale and polish",
        amount: 220,
        status: "Not covered",
        note: "Often treated as routine dental care"
      }
    ],
    missingDocs: ["Treatment estimate", "Dental chart", "Clinical notes"],
    nextAction: "Ask the clinic for a dental chart before approving the treatment."
  },
  emergency: {
    visitLabel: "Urgent care admission",
    clinic: "Sydney Animal Emergency",
    total: 1648,
    confidence: 81,
    lineItems: [
      {
        label: "Emergency consult",
        amount: 245,
        status: "Likely covered",
        note: "Urgent illness assessment"
      },
      {
        label: "Blood panel",
        amount: 315,
        status: "Likely covered",
        note: "Diagnostic test ordered during admission"
      },
      {
        label: "IV fluids",
        amount: 288,
        status: "Likely covered",
        note: "Treatment linked to admission"
      },
      {
        label: "Overnight monitoring",
        amount: 800,
        status: "Needs review",
        note: "Clinic notes needed for approval"
      }
    ],
    missingDocs: ["Admission notes", "Discharge summary", "Itemised invoice"],
    nextAction: "Start direct-to-vet review while the clinic prepares notes."
  },
  wellness: {
    visitLabel: "Routine wellness visit",
    clinic: "Newtown Vet Care",
    total: 286,
    confidence: 69,
    lineItems: [
      {
        label: "Health check",
        amount: 95,
        status: "Needs review",
        note: "Depends on policy wellness benefits"
      },
      {
        label: "Vaccination",
        amount: 126,
        status: "Not covered",
        note: "Usually routine preventative care"
      },
      {
        label: "Nail clip",
        amount: 28,
        status: "Not covered",
        note: "Grooming item"
      },
      {
        label: "Ear medication",
        amount: 37,
        status: "Likely covered",
        note: "Can be reviewed if tied to illness notes"
      }
    ],
    missingDocs: ["Vet notes if illness was found"],
    nextAction: "Save the visit summary and only claim the illness-related item."
  }
};

export function createEstimate(petId: string, visitType: VisitType): Estimate {
  const pet = pets.find((item) => item.id === petId) ?? pets[0];
  const template = estimateMap[visitType] ?? estimateMap.skin;
  const eligibleTotal = template.lineItems
    .filter((item) => item.status !== "Not covered")
    .reduce((sum, item) => sum + item.amount, 0);
  const likelyFetchPays = Math.max(0, Math.round((eligibleTotal - pet.excess) * pet.reimbursement));
  const likelyYouPay = Math.max(0, template.total - likelyFetchPays);

  return {
    ...template,
    petName: pet.name,
    likelyFetchPays,
    likelyYouPay
  };
}
