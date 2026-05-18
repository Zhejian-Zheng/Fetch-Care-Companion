import { createEstimate, type VisitType } from "@/lib/mock-care";

const visitTypes = new Set(["skin", "dental", "emergency", "wellness"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const petId = typeof body.petId === "string" ? body.petId : "luna";
  const visitType = visitTypes.has(body.visitType) ? (body.visitType as VisitType) : "skin";

  await new Promise((resolve) => setTimeout(resolve, 700));

  return Response.json(createEstimate(petId, visitType));
}
