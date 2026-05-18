import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  careQueue,
  createEstimate,
  pets,
  visitTypes,
  type CoverageStatus,
  type Estimate,
  type Pet,
  type VisitType
} from "./src/mockCare";

const colors = {
  ink: "#152238",
  slate: "#61708a",
  pale: "#f7f9fb",
  panel: "#ffffff",
  line: "#dfe6ef",
  pink: "#ff5fa2",
  rose: "#fff3f8",
  mint: "#dff8ee",
  blue: "#dff2ff",
  amber: "#fff7d8",
  green: "#087f5b"
};

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0
});

const statusStyles: Record<CoverageStatus, { backgroundColor: string; borderColor: string; color: string }> = {
  "Likely covered": {
    backgroundColor: "#ecfdf5",
    borderColor: "#bbf7d0",
    color: "#047857"
  },
  "Needs review": {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
    color: "#92400e"
  },
  "Not covered": {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
    color: "#64748b"
  }
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

export default function App() {
  const [selectedPetId, setSelectedPetId] = useState(pets[0].id);
  const [visitType, setVisitType] = useState<VisitType>("skin");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId) ?? pets[0],
    [selectedPetId]
  );

  function readEstimate() {
    setEstimate(null);
    setIsAnalysing(true);

    setTimeout(() => {
      setEstimate(createEstimate(selectedPetId, visitType));
      setIsAnalysing(false);
    }, 800);
  }

  const claimTotal = estimate?.total ?? 642;
  const fetchPays = estimate?.likelyFetchPays ?? 363;
  const userPays = estimate?.likelyYouPay ?? 279;
  const coverPercent = estimate?.confidence ?? 86;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <Header />

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Fetch Care Companion</Text>
          <Text style={styles.heroTitle}>Vet visits, cover, and claims in one calm app.</Text>
          <Text style={styles.heroCopy}>
            A React Native prototype for turning a vet estimate into simple next steps.
          </Text>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryTile label="Pets" value="2" />
          <SummaryTile label="Claims" value="2" />
          <SummaryTile label="Clarity" value={`${coverPercent}%`} />
        </View>

        <Section
          eyebrow="Visit workspace"
          title={`${selectedPet.name}'s care plan`}
          actionLabel="Ask Fetch"
          actionIcon="chatbubble-ellipses-outline"
        >
          <PetSelector selectedPetId={selectedPetId} onSelect={setSelectedPetId} />
          <PetCard pet={selectedPet} />
          <VisitSelector visitType={visitType} onSelect={setVisitType} />
        </Section>

        <Section eyebrow="Estimate reader" title="Turn a vet quote into next steps">
          {estimate ? (
            <EstimateResults estimate={estimate} onReset={() => setEstimate(null)} />
          ) : (
            <>
              <UploadCard isAnalysing={isAnalysing} onPress={readEstimate} />
              {isAnalysing ? <AnalysingState /> : <EmptyState />}
            </>
          )}
        </Section>

        <OutcomeCard
          total={claimTotal}
          fetchPays={fetchPays}
          userPays={userPays}
          coverPercent={coverPercent}
        />
        <TimelineCard />
        <ClinicCard />
        <PolicyCard pet={selectedPet} />
        <CareQueue />
      </ScrollView>
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.logoMark}>
        <Ionicons name="paw" size={20} color="white" />
      </View>
      <View>
        <Text style={styles.logoText}>fetch</Text>
        <Text style={styles.logoSubtext}>care companion</Text>
      </View>
      <View style={styles.headerPill}>
        <Ionicons name="sparkles" size={15} color={colors.ink} />
        <Text style={styles.headerPillText}>Demo</Text>
      </View>
    </View>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryTile}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function Section({
  eyebrow,
  title,
  children,
  actionLabel,
  actionIcon
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  actionLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {actionLabel ? (
          <Pressable style={styles.darkButton}>
            {actionIcon ? <Ionicons name={actionIcon} size={17} color="white" /> : null}
            <Text style={styles.darkButtonText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function PetSelector({
  selectedPetId,
  onSelect
}: {
  selectedPetId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.petSelector}>
      {pets.map((pet) => {
        const isSelected = selectedPetId === pet.id;

        return (
          <Pressable
            key={pet.id}
            onPress={() => onSelect(pet.id)}
            style={[styles.petButton, isSelected && styles.petButtonSelected]}
          >
            <Image source={{ uri: pet.image }} style={styles.petThumb} />
            <View>
              <Text style={styles.petButtonName}>{pet.name}</Text>
              <Text style={styles.petButtonBreed}>{pet.breed}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function PetCard({ pet }: { pet: Pet }) {
  return (
    <View style={styles.petCard}>
      <Image source={{ uri: pet.image }} style={styles.petImage} />
      <View style={styles.petContent}>
        <View style={styles.row}>
          <Text style={styles.petName}>{pet.name}</Text>
          <View style={styles.coverBadge}>
            <Text style={styles.coverBadgeText}>covered</Text>
          </View>
        </View>
        <Text style={styles.petMeta}>
          {pet.breed} · {pet.age}
        </Text>
        <Text style={styles.petPolicy}>{pet.policy}</Text>
      </View>
      <View style={styles.metricGrid}>
        <MiniMetric label="Excess" value={formatMoney(pet.excess)} />
        <MiniMetric label="Cover" value={`${Math.round(pet.reimbursement * 100)}%`} />
        <MiniMetric label="Claims" value="2 open" />
      </View>
    </View>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniMetric}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
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
    <View style={styles.visitBlock}>
      <View style={styles.rowBetween}>
        <Text style={styles.blockTitle}>Visit type</Text>
        <Text style={styles.smallMuted}>Pre-approval ready</Text>
      </View>
      <View style={styles.visitGrid}>
        {visitTypes.map((type) => {
          const isSelected = visitType === type.id;

          return (
            <Pressable
              key={type.id}
              onPress={() => onSelect(type.id)}
              style={[styles.visitButton, isSelected && styles.visitButtonSelected]}
            >
              <Text style={styles.visitLabel}>{type.label}</Text>
              <Text style={styles.visitDescription}>{type.description}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function UploadCard({ isAnalysing, onPress }: { isAnalysing: boolean; onPress: () => void }) {
  return (
    <View style={styles.uploadCard}>
      <View style={styles.uploadIcon}>
        <Ionicons name="cloud-upload-outline" size={22} color={colors.pink} />
      </View>
      <View style={styles.uploadTextWrap}>
        <Text style={styles.blockTitle}>Vet estimate</Text>
        <Text style={styles.bodyText}>
          Add the quote or invoice and Fetch will sort the care items into plain English.
        </Text>
      </View>
      <Pressable disabled={isAnalysing} onPress={onPress} style={styles.primaryButton}>
        {isAnalysing ? (
          <ActivityIndicator color="white" />
        ) : (
          <Ionicons name="sparkles" size={17} color="white" />
        )}
        <Text style={styles.primaryButtonText}>
          {isAnalysing ? "Reading estimate" : "Read sample estimate"}
        </Text>
      </Pressable>
    </View>
  );
}

function AnalysingState() {
  return (
    <View style={styles.stateCard}>
      <View style={styles.row}>
        <View style={styles.darkIcon}>
          <Ionicons name="receipt-outline" size={18} color="white" />
        </View>
        <View>
          <Text style={styles.blockTitle}>Checking the details</Text>
          <Text style={styles.bodyText}>Matching line items to the policy</Text>
        </View>
      </View>
      <View style={styles.skeleton} />
      <View style={styles.skeleton} />
      <View style={styles.skeleton} />
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.stateCard}>
      <View style={styles.row}>
        <Ionicons name="time-outline" size={19} color={colors.slate} />
        <Text style={styles.blockTitle}>Ready when the clinic sends the quote</Text>
      </View>
      <Text style={styles.bodyText}>
        Fetch keeps the visit, policy, documents, and next steps in one place.
      </Text>
    </View>
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
    <View style={styles.results}>
      <View style={styles.resultHero}>
        <Text style={styles.resultClinic}>{estimate.clinic}</Text>
        <Text style={styles.resultTitle}>{estimate.visitLabel}</Text>
        <View style={styles.resultBadge}>
          <Text style={styles.resultBadgeText}>{estimate.confidence}% clear</Text>
        </View>
        <View style={styles.amountGrid}>
          <Amount label="Bill" value={estimate.total} />
          <Amount label="Fetch may pay" value={estimate.likelyFetchPays} />
          <Amount label="You may pay" value={estimate.likelyYouPay} />
        </View>
        <Pressable onPress={onReset} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Read another estimate</Text>
        </Pressable>
      </View>

      <View style={styles.subPanel}>
        <View style={styles.rowBetween}>
          <Text style={styles.blockTitle}>Line items</Text>
          <Ionicons name="clipboard-outline" size={19} color={colors.green} />
        </View>
        {estimate.lineItems.map((item) => (
          <View key={item.label} style={styles.lineItem}>
            <View style={styles.rowBetween}>
              <Text style={styles.lineTitle}>{item.label}</Text>
              <Text style={styles.lineAmount}>{formatMoney(item.amount)}</Text>
            </View>
            <Text style={styles.lineNote}>{item.note}</Text>
            <StatusBadge status={item.status} />
          </View>
        ))}
      </View>

      <View style={styles.subPanel}>
        <View style={styles.row}>
          <Ionicons name="document-text-outline" size={19} color={colors.pink} />
          <Text style={styles.blockTitle}>Next step</Text>
        </View>
        <Text style={styles.bodyText}>{estimate.nextAction}</Text>
        <View style={styles.chipWrap}>
          {estimate.missingDocs.map((doc) => (
            <View key={doc} style={styles.docChip}>
              <Text style={styles.docChipText}>{doc}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function Amount({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.amountCard}>
      <Text style={styles.amountLabel}>{label}</Text>
      <Text style={styles.amountValue}>{formatMoney(value)}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: CoverageStatus }) {
  const tone = statusStyles[status];

  return (
    <View style={[styles.statusBadge, { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }]}>
      <Text style={[styles.statusText, { color: tone.color }]}>{status}</Text>
    </View>
  );
}

function OutcomeCard({
  total,
  fetchPays,
  userPays,
  coverPercent
}: {
  total: number;
  fetchPays: number;
  userPays: number;
  coverPercent: number;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.eyebrow}>Cover snapshot</Text>
          <Text style={styles.sectionTitle}>Likely outcome</Text>
        </View>
        <View style={styles.moneyIcon}>
          <Ionicons name="cash-outline" size={22} color={colors.green} />
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${coverPercent}%` }]} />
      </View>
      <InsightRow label="Vet bill" value={formatMoney(total)} />
      <InsightRow label="Fetch may pay" value={formatMoney(fetchPays)} positive />
      <InsightRow label="You may pay" value={formatMoney(userPays)} />
    </View>
  );
}

function InsightRow({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <View style={styles.insightRow}>
      <Text style={styles.insightLabel}>{label}</Text>
      <Text style={[styles.insightValue, positive && styles.positiveText]}>{value}</Text>
    </View>
  );
}

function TimelineCard() {
  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.eyebrow}>Claim path</Text>
          <Text style={styles.sectionTitle}>Direct-to-vet timeline</Text>
        </View>
        <Ionicons name="shield-checkmark-outline" size={22} color={colors.pink} />
      </View>
      {timeline.map((item, index) => (
        <View key={item.label} style={styles.timelineRow}>
          <View style={[styles.timelineDot, item.active && styles.timelineDotActive]}>
            {item.active ? (
              <Ionicons name="checkmark" size={14} color="white" />
            ) : (
              <Text style={styles.timelineNumber}>{index + 1}</Text>
            )}
          </View>
          <View style={styles.timelineCopy}>
            <Text style={styles.timelineTitle}>{item.label}</Text>
            <Text style={styles.timelineDetail}>{item.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function ClinicCard() {
  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Clinic handoff</Text>
        <Ionicons name="medical-outline" size={21} color={colors.slate} />
      </View>
      <View style={styles.subPanel}>
        <Text style={styles.blockTitle}>Bondi Junction Vet</Text>
        <Text style={styles.bodyText}>
          Invoice request sent. Notes can be uploaded from the clinic portal.
        </Text>
      </View>
    </View>
  );
}

function PolicyCard({ pet }: { pet: Pet }) {
  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Policy clarity</Text>
        <Ionicons name="card-outline" size={21} color={colors.slate} />
      </View>
      <View style={styles.policyGrid}>
        <View style={[styles.policyTile, { backgroundColor: colors.blue }]}>
          <Text style={styles.policyLabel}>Reimburse</Text>
          <Text style={styles.policyValue}>{Math.round(pet.reimbursement * 100)}%</Text>
        </View>
        <View style={[styles.policyTile, { backgroundColor: colors.rose }]}>
          <Text style={styles.policyLabel}>Excess</Text>
          <Text style={styles.policyValue}>{formatMoney(pet.excess)}</Text>
        </View>
      </View>
      <Text style={styles.bodyText}>
        Plain-language cover notes stay attached to each visit, so the next step is obvious.
      </Text>
    </View>
  );
}

function CareQueue() {
  return (
    <View style={styles.section}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Care queue</Text>
        <Ionicons name="calendar-outline" size={21} color={colors.slate} />
      </View>
      {careQueue.map((item) => (
        <View key={item.label} style={styles.queueItem}>
          <Text style={styles.queueTag}>{item.detail}</Text>
          <Text style={styles.blockTitle}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.pale
  },
  page: {
    padding: 16,
    paddingBottom: 40
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 22
  },
  logoMark: {
    alignItems: "center",
    backgroundColor: colors.pink,
    borderRadius: 10,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  logoText: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 23
  },
  logoSubtext: {
    color: colors.slate,
    fontSize: 12,
    fontWeight: "700"
  },
  headerPill: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    marginLeft: "auto",
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  headerPillText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  hero: {
    marginBottom: 18
  },
  eyebrow: {
    color: colors.pink,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 36,
    marginTop: 8
  },
  heroCopy: {
    color: colors.slate,
    fontSize: 16,
    lineHeight: 25,
    marginTop: 12
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18
  },
  summaryTile: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 12
  },
  summaryLabel: {
    color: colors.slate,
    fontSize: 11,
    fontWeight: "800"
  },
  summaryValue: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4
  },
  section: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16
  },
  sectionHeader: {
    gap: 12,
    marginBottom: 16
  },
  sectionTitleWrap: {
    gap: 6
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 25
  },
  darkButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.ink,
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14
  },
  darkButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "900"
  },
  petSelector: {
    gap: 10,
    marginBottom: 14
  },
  petButton: {
    alignItems: "center",
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 78,
    padding: 12
  },
  petButtonSelected: {
    backgroundColor: colors.rose,
    borderColor: colors.pink
  },
  petThumb: {
    borderRadius: 8,
    height: 50,
    width: 50
  },
  petButtonName: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  petButtonBreed: {
    color: colors.slate,
    fontSize: 14,
    marginTop: 3
  },
  petCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
    padding: 14
  },
  petImage: {
    borderRadius: 10,
    height: 96,
    width: 96
  },
  petContent: {
    gap: 4
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  petName: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "900"
  },
  coverBadge: {
    backgroundColor: "#dcfce7",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4
  },
  coverBadgeText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900"
  },
  petMeta: {
    color: colors.slate,
    fontSize: 14
  },
  petPolicy: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2
  },
  metricGrid: {
    flexDirection: "row",
    gap: 8
  },
  miniMetric: {
    backgroundColor: colors.pale,
    borderRadius: 9,
    flex: 1,
    padding: 11
  },
  miniLabel: {
    color: colors.slate,
    fontSize: 11,
    fontWeight: "800"
  },
  miniValue: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 3
  },
  visitBlock: {
    gap: 10
  },
  blockTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  smallMuted: {
    color: colors.slate,
    fontSize: 12,
    fontWeight: "800"
  },
  visitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  visitButton: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 86,
    padding: 12,
    width: "48.8%"
  },
  visitButtonSelected: {
    backgroundColor: colors.rose,
    borderColor: colors.pink
  },
  visitLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  visitDescription: {
    color: colors.slate,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6
  },
  uploadCard: {
    backgroundColor: colors.rose,
    borderColor: colors.pink,
    borderRadius: 10,
    borderStyle: "dashed",
    borderWidth: 1,
    gap: 12,
    padding: 14
  },
  uploadIcon: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  uploadTextWrap: {
    gap: 5
  },
  bodyText: {
    color: colors.slate,
    fontSize: 14,
    lineHeight: 22
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.pink,
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 16
  },
  primaryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "900"
  },
  stateCard: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    marginTop: 12,
    padding: 14
  },
  darkIcon: {
    alignItems: "center",
    backgroundColor: colors.ink,
    borderRadius: 10,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  skeleton: {
    backgroundColor: colors.pale,
    borderRadius: 9,
    height: 48
  },
  results: {
    gap: 12
  },
  resultHero: {
    backgroundColor: colors.ink,
    borderRadius: 10,
    padding: 16
  },
  resultClinic: {
    color: "#cbd5e1",
    fontSize: 14
  },
  resultTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 30,
    marginTop: 6
  },
  resultBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  resultBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "900"
  },
  amountGrid: {
    gap: 8,
    marginTop: 14
  },
  amountCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 9,
    padding: 12
  },
  amountLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "800"
  },
  amountValue: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 42
  },
  secondaryButtonText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  subPanel: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
    padding: 14
  },
  lineItem: {
    borderColor: colors.line,
    borderRadius: 9,
    borderWidth: 1,
    gap: 7,
    padding: 12
  },
  lineTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  lineAmount: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  lineNote: {
    color: colors.slate,
    fontSize: 14,
    lineHeight: 21
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  statusText: {
    fontSize: 12,
    fontWeight: "900"
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  docChip: {
    backgroundColor: colors.pale,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  docChipText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  moneyIcon: {
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderRadius: 10,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  progressTrack: {
    backgroundColor: colors.pale,
    borderRadius: 999,
    height: 10,
    marginBottom: 14,
    marginTop: 16,
    overflow: "hidden"
  },
  progressFill: {
    backgroundColor: colors.pink,
    borderRadius: 999,
    height: 10
  },
  insightRow: {
    alignItems: "center",
    backgroundColor: colors.pale,
    borderRadius: 9,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    minHeight: 48,
    paddingHorizontal: 12
  },
  insightLabel: {
    color: colors.slate,
    fontSize: 14,
    fontWeight: "800"
  },
  insightValue: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  positiveText: {
    color: colors.green
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16
  },
  timelineDot: {
    alignItems: "center",
    borderColor: colors.line,
    borderRadius: 999,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  timelineDotActive: {
    backgroundColor: colors.pink,
    borderColor: colors.pink
  },
  timelineNumber: {
    color: colors.slate,
    fontSize: 12,
    fontWeight: "900"
  },
  timelineCopy: {
    flex: 1,
    gap: 3
  },
  timelineTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  timelineDetail: {
    color: colors.slate,
    fontSize: 14,
    lineHeight: 20
  },
  policyGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    marginTop: 12
  },
  policyTile: {
    borderRadius: 9,
    flex: 1,
    padding: 12
  },
  policyLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  policyValue: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: "900",
    marginTop: 5
  },
  queueItem: {
    borderColor: colors.line,
    borderRadius: 9,
    borderWidth: 1,
    gap: 7,
    marginTop: 10,
    padding: 12
  },
  queueTag: {
    alignSelf: "flex-start",
    backgroundColor: colors.blue,
    borderRadius: 999,
    color: "#075985",
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5
  }
});
