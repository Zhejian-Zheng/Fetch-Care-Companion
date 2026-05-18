"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileText,
  Home as HomeIcon,
  Loader2,
  MessageCircle,
  PawPrint,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  WalletCards
} from "lucide-react";
import {
  careQueue,
  pets,
  visitTypes,
  type CoverageStatus,
  type Estimate,
  type VisitType
} from "@/lib/mock-care";

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0
});

const statusTone: Record<CoverageStatus, string> = {
  "Likely covered": "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Needs review": "border-amber-200 bg-amber-50 text-amber-900",
  "Not covered": "border-slate-200 bg-slate-100 text-slate-600"
};

const timeline = [
  {
    label: "Estimate read",
    detail: "Line items grouped by cover type",
    active: true
  },
  {
    label: "Vet notes requested",
    detail: "Clinic can upload notes directly",
    active: true
  },
  {
    label: "Pre-approval review",
    detail: "Fetch checks policy and history",
    active: false
  },
  {
    label: "Pay clinic",
    detail: "Direct-to-vet once approved",
    active: false
  }
];

function formatMoney(value: number) {
  return money.format(value);
}

export default function Home() {
  const [selectedPetId, setSelectedPetId] = useState(pets[0].id);
  const [visitType, setVisitType] = useState<VisitType>("skin");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [error, setError] = useState("");

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId) ?? pets[0],
    [selectedPetId]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("demo") === "results") {
      void analyseEstimate();
    }
  }, []);

  async function analyseEstimate() {
    setError("");
    setEstimate(null);
    setIsAnalysing(true);

    try {
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          petId: selectedPetId,
          visitType
        })
      });

      if (!response.ok) {
        throw new Error("Estimate API failed");
      }

      const data = (await response.json()) as Estimate;
      setEstimate(data);
    } catch {
      setError("We could not read this estimate. Try again with a clearer invoice.");
    } finally {
      setIsAnalysing(false);
    }
  }

  const claimTotal = estimate?.total ?? 642;
  const fetchPays = estimate?.likelyFetchPays ?? 363;
  const userPays = estimate?.likelyYouPay ?? 279;
  const coverPercent = estimate?.confidence ?? 86;

  return (
    <main className="min-h-screen bg-[#f7f9fb] text-ink">
      <div className="grid-paper min-h-screen px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)_330px]">
          <aside className="hidden lg:flex lg:flex-col lg:gap-4">
            <BrandPanel />
            <PetSwitcher selectedPetId={selectedPetId} onSelect={setSelectedPetId} />
            <CareQueue />
          </aside>

          <section className="min-w-0 overflow-hidden">
            <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-white/80 bg-white/80 px-4 py-3 shadow-soft backdrop-blur">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-fetch-pink">Sydney beta</p>
                <h1 className="truncate text-lg font-bold sm:text-xl">Fetch Care Companion</h1>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-fetch-pink hover:text-fetch-pink"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                </button>
                <button
                  className="hidden h-10 w-10 place-items-center rounded-lg bg-ink text-white transition hover:bg-slate-800 sm:grid"
                  title="Care inbox"
                  aria-label="Care inbox"
                >
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>

            <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="app-phone-frame mx-auto rounded-[28px] border border-slate-200 bg-[#1c2738] p-3 shadow-phone">
                <div className="app-phone-screen mx-auto overflow-hidden rounded-[22px] bg-white">
                  <PhoneHeader petName={selectedPet.name} />
                  <div className="max-h-[760px] overflow-y-auto px-4 pb-5 pt-4">
                    <PetHero selectedPet={selectedPet} />
                    <VisitSelector visitType={visitType} onSelect={setVisitType} />
                    {estimate ? (
                      <EstimateResults estimate={estimate} onReset={() => setEstimate(null)} />
                    ) : (
                      <>
                        <UploadEstimate isAnalysing={isAnalysing} onAnalyse={analyseEstimate} />
                        {error ? <ErrorState message={error} onRetry={analyseEstimate} /> : null}
                        {isAnalysing ? <AnalysingState /> : null}
                        {!isAnalysing && !error ? <QuietEmptyState /> : null}
                      </>
                    )}
                  </div>
                  <MobileNav />
                </div>
              </div>

              <div className="grid content-start gap-4">
                <DesktopPetSwitcher selectedPetId={selectedPetId} onSelect={setSelectedPetId} />
                <InsightCard
                  claimTotal={claimTotal}
                  fetchPays={fetchPays}
                  userPays={userPays}
                  coverPercent={coverPercent}
                />
                <AskFetchCard petName={selectedPet.name} />
              </div>
            </div>
          </section>

          <aside className="grid gap-4">
            <ClaimTimeline />
            <ClinicCard />
            <PolicyCard reimbursement={selectedPet.reimbursement} excess={selectedPet.excess} />
          </aside>
        </div>
      </div>
    </main>
  );
}

function BrandPanel() {
  return (
    <div className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-soft backdrop-blur">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-fetch-pink text-white">
          <PawPrint size={22} />
        </div>
        <div>
          <p className="text-xl font-black">fetch</p>
          <p className="text-sm text-slate-500">care companion</p>
        </div>
      </div>

      <div className="grid gap-2">
        {[
          { icon: HomeIcon, label: "Home", active: false },
          { icon: Stethoscope, label: "Vet visit", active: true },
          { icon: ShieldCheck, label: "Cover", active: false },
          { icon: ReceiptText, label: "Claims", active: false }
        ].map((item) => (
          <button
            key={item.label}
            className={`flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition ${
              item.active
                ? "bg-ink text-white shadow-soft"
                : "text-slate-600 hover:bg-slate-100 hover:text-ink"
            }`}
          >
            <item.icon size={17} />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PetSwitcher({
  selectedPetId,
  onSelect
}: {
  selectedPetId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-soft backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-bold">Pets</p>
        <span className="rounded-full bg-fetch-rose px-2.5 py-1 text-xs font-bold text-fetch-pink">
          2 active
        </span>
      </div>
      <div className="grid gap-2">
        {pets.map((pet) => (
          <button
            key={pet.id}
            onClick={() => onSelect(pet.id)}
            className={`flex items-center gap-3 rounded-lg border p-2 text-left transition ${
              selectedPetId === pet.id
                ? "border-fetch-pink bg-fetch-rose"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <img
              src={pet.image}
              alt={pet.name}
              className="h-12 w-12 rounded-lg object-cover"
            />
            <span className="min-w-0">
              <span className="block font-bold">{pet.name}</span>
              <span className="block truncate text-sm text-slate-500">{pet.breed}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CareQueue() {
  return (
    <div className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-soft backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-bold">Care queue</p>
        <CalendarDays size={17} className="text-slate-500" />
      </div>
      <div className="grid gap-2">
        {careQueue.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-3">
            <span className={`mb-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${item.tone}`}>
              {item.detail}
            </span>
            <p className="text-sm font-semibold">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhoneHeader({ petName }: { petName: string }) {
  return (
    <div className="border-b border-slate-100 bg-white px-4 pb-3 pt-4">
      <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-slate-200" />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-fetch-pink">Vet visit</p>
          <p className="text-lg font-black">{petName}'s care plan</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-fetch-rose text-fetch-pink">
          <PawPrint size={19} />
        </div>
      </div>
    </div>
  );
}

function PetHero({ selectedPet }: { selectedPet: (typeof pets)[number] }) {
  return (
    <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-3">
        <img
          src={selectedPet.image}
          alt={selectedPet.name}
          className="h-16 w-16 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black">{selectedPet.name}</h2>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">
              covered
            </span>
          </div>
          <p className="text-sm text-slate-500">
            {selectedPet.breed} · {selectedPet.age}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{selectedPet.policy}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniMetric label="Excess" value={formatMoney(selectedPet.excess)} />
        <MiniMetric label="Cover" value={`${Math.round(selectedPet.reimbursement * 100)}%`} />
        <MiniMetric label="Claims" value="2 open" />
      </div>
    </section>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-sm font-black">{value}</p>
    </div>
  );
}

function VisitSelector({
  visitType,
  onSelect
}: {
  visitType: VisitType;
  onSelect: (type: VisitType) => void;
}) {
  return (
    <section className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-black">Visit type</h2>
        <span className="hidden text-xs font-semibold text-slate-500 sm:inline">Pre-approval ready</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {visitTypes.map((type) => (
          <button
            key={type.id}
            aria-pressed={visitType === type.id}
            onClick={() => onSelect(type.id)}
            className={`min-h-20 rounded-lg border p-3 text-left transition ${
              visitType === type.id
                ? `${type.color} shadow-soft`
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span className="block text-sm font-black">{type.label}</span>
            <span className="mt-1 block text-xs leading-5 text-slate-600">{type.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function UploadEstimate({
  isAnalysing,
  onAnalyse
}: {
  isAnalysing: boolean;
  onAnalyse: () => void;
}) {
  return (
    <section className="mb-4 rounded-lg border border-dashed border-fetch-pink bg-fetch-rose p-3">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-white text-fetch-pink">
          <Upload size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-black">Vet estimate</h2>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            Add the quote or invoice and Fetch will sort the care items into plain English.
          </p>
          <button
            onClick={onAnalyse}
            disabled={isAnalysing}
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-fetch-pink px-4 text-sm font-black text-white shadow-soft transition hover:bg-[#ee4f95] disabled:cursor-not-allowed disabled:opacity-75"
          >
            {isAnalysing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isAnalysing ? "Reading estimate" : "Read sample estimate"}
          </button>
        </div>
      </div>
    </section>
  );
}

function AnalysingState() {
  return (
    <section className="mb-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-white">
          <ReceiptText size={18} />
        </div>
        <div>
          <p className="font-black">Checking the details</p>
          <p className="text-sm text-slate-500">Matching line items to the policy</p>
        </div>
      </div>
      <div className="grid gap-2">
        <div className="shimmer h-12 rounded-lg bg-slate-100" />
        <div className="shimmer h-12 rounded-lg bg-slate-100" />
        <div className="shimmer h-12 rounded-lg bg-slate-100" />
      </div>
    </section>
  );
}

function EstimateResults({
  estimate,
  onReset
}: {
  estimate: Estimate;
  onReset: () => void;
}) {
  return (
    <section className="rise-in mb-4 grid gap-3">
      <div className="rounded-lg bg-ink p-4 text-white">
        <div>
          <p className="text-sm text-white/70">{estimate.clinic}</p>
          <h2 className="mt-1 text-xl font-black">{estimate.visitLabel}</h2>
          <span className="mt-2 inline-flex rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold">
            {estimate.confidence}%<span className="hidden sm:inline">{" "}clear</span>
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
          <Amount label="Bill" value={estimate.total} />
          <Amount label="Fetch" value={estimate.likelyFetchPays} />
          <Amount label="You" value={estimate.likelyYouPay} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-black">Line items</h2>
          <ClipboardCheck size={18} className="text-emerald-600" />
        </div>
        <div className="grid gap-2">
          {estimate.lineItems.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 p-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0">
                  <p className="font-bold">{item.label}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{item.note}</p>
                </div>
                <p className="shrink-0 text-sm font-black sm:text-base">{formatMoney(item.amount)}</p>
              </div>
              <span
                className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${
                  statusTone[item.status]
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="mb-3 flex items-center gap-2">
          <FileText size={18} className="text-fetch-pink" />
          <h2 className="font-black">Next step</h2>
        </div>
        <p className="text-sm leading-6 text-slate-600">{estimate.nextAction}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {estimate.missingDocs.map((doc) => (
            <span key={doc} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold">
              {doc}
            </span>
          ))}
        </div>
        <button
          onClick={onReset}
          className="mt-3 h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-black transition hover:border-fetch-pink hover:text-fetch-pink"
        >
          Read another estimate
        </button>
      </div>
    </section>
  );
}

function Amount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/10 p-2">
      <p className="text-xs font-semibold text-white/65">{label}</p>
      <p className="mt-1 text-sm font-black sm:text-base">{formatMoney(value)}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
      <p className="font-black text-rose-950">That file needs another look</p>
      <p className="mt-1 text-sm leading-5 text-rose-800">{message}</p>
      <button
        onClick={onRetry}
        className="mt-3 h-10 rounded-lg bg-white px-4 text-sm font-black text-rose-900 shadow-sm transition hover:bg-rose-100"
      >
        Try again
      </button>
    </section>
  );
}

function QuietEmptyState() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <Clock3 size={18} className="text-slate-500" />
        <p className="font-black">Ready when the clinic sends the quote</p>
      </div>
      <p className="text-sm leading-6 text-slate-500">
        Fetch can keep the visit, policy, documents, and next steps in one place.
      </p>
    </section>
  );
}

function MobileNav() {
  return (
    <nav className="grid grid-cols-4 border-t border-slate-100 bg-white px-2 py-2">
      {[
        { icon: HomeIcon, label: "Home" },
        { icon: Stethoscope, label: "Visit" },
        { icon: ShieldCheck, label: "Cover" },
        { icon: ReceiptText, label: "Claim" }
      ].map((item, index) => (
        <button
          key={item.label}
          className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-bold transition sm:text-xs ${
            index === 1 ? "bg-fetch-rose text-fetch-pink" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <item.icon size={18} />
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function DesktopPetSwitcher({
  selectedPetId,
  onSelect
}: {
  selectedPetId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-2 lg:hidden">
      {pets.map((pet) => (
        <button
          key={pet.id}
          onClick={() => onSelect(pet.id)}
          className={`flex items-center gap-3 rounded-lg border bg-white p-3 text-left shadow-soft transition ${
            selectedPetId === pet.id ? "border-fetch-pink" : "border-slate-200"
          }`}
        >
          <img src={pet.image} alt={pet.name} className="h-12 w-12 rounded-lg object-cover" />
          <span>
            <span className="block font-black">{pet.name}</span>
            <span className="block text-sm text-slate-500">{pet.policy}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function InsightCard({
  claimTotal,
  fetchPays,
  userPays,
  coverPercent
}: {
  claimTotal: number;
  fetchPays: number;
  userPays: number;
  coverPercent: number;
}) {
  return (
    <section className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-soft backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-fetch-pink">Cover snapshot</p>
          <h2 className="text-lg font-black">Likely outcome</h2>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
          <CircleDollarSign size={21} />
        </div>
      </div>

      <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-fetch-pink transition-all"
          style={{ width: `${coverPercent}%` }}
        />
      </div>

      <div className="grid gap-2">
        <InsightRow label="Vet bill" value={formatMoney(claimTotal)} />
        <InsightRow label="Fetch may pay" value={formatMoney(fetchPays)} positive />
        <InsightRow label="You may pay" value={formatMoney(userPays)} />
      </div>
    </section>
  );
}

function InsightRow({
  label,
  value,
  positive
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex min-h-12 items-center justify-between rounded-lg bg-slate-50 px-3">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className={`font-black ${positive ? "text-emerald-700" : "text-ink"}`}>{value}</span>
    </div>
  );
}

function AskFetchCard({ petName }: { petName: string }) {
  return (
    <section className="rounded-lg border border-white/80 bg-[#fff8d7] p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={18} className="text-amber-700" />
        <h2 className="font-black">Ask Fetch</h2>
      </div>
      <p className="text-sm leading-6 text-slate-700">
        Can {petName}'s clinic get paid directly if this estimate is approved?
      </p>
      <button className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-3 text-sm font-black text-white transition hover:bg-slate-800">
        Draft answer
        <ChevronRight size={16} />
      </button>
    </section>
  );
}

function ClaimTimeline() {
  return (
    <section className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-soft backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-fetch-pink">Claim path</p>
          <h2 className="text-lg font-black">Direct-to-vet timeline</h2>
        </div>
        <ShieldCheck size={21} className="text-fetch-pink" />
      </div>
      <div className="grid gap-3">
        {timeline.map((item, index) => (
          <div key={item.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`grid h-7 w-7 place-items-center rounded-full border ${
                  item.active
                    ? "border-fetch-pink bg-fetch-pink text-white"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {item.active ? <Check size={15} /> : <span className="text-xs font-black">{index + 1}</span>}
              </div>
              {index < timeline.length - 1 ? (
                <div className={`mt-1 h-9 w-px ${item.active ? "bg-fetch-pink" : "bg-slate-200"}`} />
              ) : null}
            </div>
            <div className="pb-2">
              <p className="font-bold">{item.label}</p>
              <p className="text-sm leading-5 text-slate-500">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ClinicCard() {
  return (
    <section className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-soft backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-black">Clinic handoff</h2>
        <Stethoscope size={19} className="text-slate-500" />
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="font-bold">Bondi Junction Vet</p>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          Invoice request sent · notes can be uploaded from the clinic portal
        </p>
      </div>
      <button className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-black transition hover:border-fetch-pink hover:text-fetch-pink">
        <FileText size={17} />
        Copy clinic link
      </button>
    </section>
  );
}

function PolicyCard({ reimbursement, excess }: { reimbursement: number; excess: number }) {
  return (
    <section className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-soft backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-black">Policy clarity</h2>
        <WalletCards size={19} className="text-slate-500" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-fetch-blue p-3">
          <p className="text-xs font-semibold text-sky-900">Reimburse</p>
          <p className="mt-1 text-lg font-black">{Math.round(reimbursement * 100)}%</p>
        </div>
        <div className="rounded-lg bg-fetch-rose p-3">
          <p className="text-xs font-semibold text-rose-900">Excess</p>
          <p className="mt-1 text-lg font-black">{formatMoney(excess)}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">
        Plain-language cover notes stay attached to each visit, so the next step is obvious.
      </p>
    </section>
  );
}
