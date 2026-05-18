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

const palette = {
  ink: "#122033",
  slate: "#66758c",
  muted: "#8a98ab",
  canvas: "#f6f8fb",
  panel: "#ffffff",
  line: "#dfe6ef",
  pink: "#ff5fa2",
  pinkDeep: "#ee4f95",
  rose: "#fff2f7",
  roseStrong: "#ffe4f0",
  mint: "#dff8ee",
  blue: "#dff2ff",
  lemon: "#fff6d7",
  green: "#087f5b",
  amber: "#a16207",
  navySoft: "#22304a"
};

const money = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
  maximumFractionDigits: 0
});

const tabs = [
  { label: "Home", icon: "home-outline" },
  { label: "Visit", icon: "medical-outline" },
  { label: "Cover", icon: "shield-checkmark-outline" },
  { label: "Claim", icon: "receipt-outline" }
] as const;

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

const statusStyles: Record<
  CoverageStatus,
  { backgroundColor: string; borderColor: string; color: string }
> = {
  "Likely covered": {
    backgroundColor: "#ecfdf5",
    borderColor: "#bbf7d0",
    color: palette.green
  },
  "Needs review": {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa",
    color: "#9a3412"
  },
  "Not covered": {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
    color: "#64748b"
  }
};

function formatMoney(value: number) {
  return money.format(value);
}

export default function App() {
  const [selectedPetId, setSelectedPetId] = useState(pets[0].id);
  const [visitType, setVisitType] = useState<VisitType>("skin");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [activeTab, setActiveTab] = useState("Visit");

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
    }, 850);
  }

  const total = estimate?.total ?? 642;
  const fetchPays = estimate?.likelyFetchPays ?? 363;
  const userPays = estimate?.likelyYouPay ?? 279;
  const clarity = estimate?.confidence ?? 86;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appShell}>
        <ScrollView
          contentContainerStyle={styles.page}
          showsVerticalScrollIndicator={false}
        >
          <TopBar />

          <HeroCard
            pet={selectedPet}
            total={total}
            fetchPays={fetchPays}
            userPays={userPays}
            clarity={clarity}
          />

          <Section
            eyebrow="Visit workspace"
            title={`${selectedPet.name}'s care plan`}
            actionLabel="Ask Fetch"
            actionIcon="chatbubble-ellipses-outline"
          >
            <PetSelector selectedPetId={selectedPetId} onSelect={setSelectedPetId} />
            <PetProfile pet={selectedPet} />
            <VisitSelector visitType={visitType} onSelect={setVisitType} />
          </Section>

          <EstimateReader
            estimate={estimate}
            isAnalysing={isAnalysing}
            onRead={readEstimate}
            onReset={() => setEstimate(null)}
          />

          <TimelineCard />
          <CareQueue />
          <PolicyCard pet={selectedPet} />
          <ClinicCard />
        </ScrollView>

        <BottomTabs activeTab={activeTab} onSelect={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

function TopBar() {
  return (
    <View style={styles.topBar}>
      <View style={styles.logoRow}>
        <View style={styles.logoMark}>
          <Ionicons name="paw" size={19} color="white" />
        </View>
        <View>
          <Text style={styles.logoText}>fetch</Text>
          <Text style={styles.logoCaption}>care companion</Text>
        </View>
      </View>

      <View style={styles.topActions}>
        <Pressable style={styles.iconButton}>
          <Ionicons name="notifications-outline" size={18} color={palette.ink} />
        </Pressable>
        <Pressable style={styles.demoPill}>
          <Ionicons name="sparkles" size={15} color={palette.pink} />
          <Text style={styles.demoPillText}>Demo</Text>
        </Pressable>
      </View>
    </View>
  );
}

function HeroCard({
  pet,
  total,
  fetchPays,
  userPays,
  clarity
}: {
  pet: Pet;
  total: number;
  fetchPays: number;
  userPays: number;
  clarity: number;
}) {
  return (
    <View style={[styles.heroCard, styles.softShadow]}>
      <View style={styles.heroGlow} />
      <View style={styles.heroHeader}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrowOnPink}>Fetch Care Companion</Text>
          <Text style={styles.heroTitle}>Calmer vet visits, clearer cover.</Text>
          <Text style={styles.heroText}>
            Upload a quote, understand the likely out-of-pocket cost, and start a
            direct-to-vet path.
          </Text>
        </View>
        <Image source={{ uri: pet.image }} style={styles.heroPetImage} />
      </View>

      <View style={styles.heroStats}>
        <HeroStat label="Vet bill" value={formatMoney(total)} />
        <HeroStat label="Fetch may pay" value={formatMoney(fetchPays)} strong />
        <HeroStat label="You may pay" value={formatMoney(userPays)} />
      </View>

      <View style={styles.clarityRow}>
        <Text style={styles.clarityLabel}>Coverage clarity</Text>
        <Text style={styles.clarityValue}>{clarity}%</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${clarity}%` }]} />
      </View>
    </View>
  );
}

function HeroStat({
  label,
  value,
  strong
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatLabel}>{label}</Text>
      <Text style={[styles.heroStatValue, strong && styles.heroStatStrong]}>{value}</Text>
    </View>
  );
}

function Section({
  eyebrow,
  title,
  actionLabel,
  actionIcon,
  children
}: {
  eyebrow: string;
  title: string;
  actionLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
}) {
  return (
    <View style={[styles.section, styles.cardShadow]}>
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
            style={[styles.petOption, isSelected && styles.petOptionActive]}
          >
            <Image source={{ uri: pet.image }} style={styles.petThumb} />
            <View style={styles.petOptionText}>
              <Text style={styles.petOptionName}>{pet.name}</Text>
              <Text style={styles.petOptionBreed}>{pet.breed}</Text>
            </View>
            {isSelected ? (
              <View style={styles.selectedDot}>
                <Ionicons name="checkmark" size={13} color="white" />
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function PetProfile({ pet }: { pet: Pet }) {
  return (
    <View style={styles.petProfile}>
      <Image source={{ uri: pet.image }} style={styles.petImage} />
      <View style={styles.petMain}>
        <View style={styles.inlineRow}>
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

      <View style={styles.metricRow}>
        <Metric label="Excess" value={formatMoney(pet.excess)} />
        <Metric label="Cover" value={`${Math.round(pet.reimbursement * 100)}%`} />
        <Metric label="Claims" value="2 open" />
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
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
              style={[styles.visitButton, isSelected && styles.visitButtonActive]}
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

function EstimateReader({
  estimate,
  isAnalysing,
  onRead,
  onReset
}: {
  estimate: Estimate | null;
  isAnalysing: boolean;
  onRead: () => void;
  onReset: () => void;
}) {
  return (
    <View style={[styles.section, styles.cardShadow]}>
      <View style={styles.readerHeader}>
        <View>
          <Text style={styles.eyebrow}>Estimate reader</Text>
          <Text style={styles.sectionTitle}>Know what happens before you pay.</Text>
        </View>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={14} color={palette.pink} />
          <Text style={styles.aiBadgeText}>AI-ready</Text>
        </View>
      </View>

      {!estimate ? (
        <>
          <View style={styles.uploadPanel}>
            <View style={styles.uploadIcon}>
              <Ionicons name="cloud-upload-outline" size={23} color={palette.pink} />
            </View>
            <View style={styles.uploadCopy}>
              <Text style={styles.blockTitle}>Vet estimate</Text>
              <Text style={styles.bodyText}>
                Parse line items, plain-English cover notes, and direct-to-vet next
                steps.
              </Text>
            </View>
          </View>

          <Pressable
            disabled={isAnalysing}
            onPress={onRead}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              isAnalysing && styles.disabledButton
            ]}
          >
            {isAnalysing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="scan-outline" size={18} color="white" />
            )}
            <Text style={styles.primaryButtonText}>
              {isAnalysing ? "Reading estimate" : "Read sample estimate"}
            </Text>
          </Pressable>

          {isAnalysing ? <AnalysingState /> : <ReadyState />}
        </>
      ) : (
        <EstimateResults estimate={estimate} onReset={onReset} />
      )}
    </View>
  );
}

function ReadyState() {
  return (
    <View style={styles.readyCard}>
      <Ionicons name="time-outline" size={19} color={palette.slate} />
      <View style={styles.readyText}>
        <Text style={styles.blockTitle}>Ready when the clinic sends the quote</Text>
        <Text style={styles.bodyText}>
          The visit, policy, documents, and next action stay together.
        </Text>
      </View>
    </View>
  );
}

function AnalysingState() {
  return (
    <View style={styles.analysisCard}>
      <View style={styles.inlineRow}>
        <View style={styles.darkIcon}>
          <Ionicons name="receipt-outline" size={18} color="white" />
        </View>
        <View>
          <Text style={styles.blockTitle}>Checking the details</Text>
          <Text style={styles.bodyText}>Matching line items to the policy</Text>
        </View>
      </View>
      <View style={styles.skeletonWide} />
      <View style={styles.skeletonMid} />
      <View style={styles.skeletonWide} />
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
    <View style={styles.resultsStack}>
      <View style={styles.resultHero}>
        <View style={styles.resultHeader}>
          <View>
            <Text style={styles.resultClinic}>{estimate.clinic}</Text>
            <Text style={styles.resultTitle}>{estimate.visitLabel}</Text>
          </View>
          <View style={styles.resultConfidence}>
            <Text style={styles.resultConfidenceText}>{estimate.confidence}%</Text>
            <Text style={styles.resultConfidenceLabel}>clear</Text>
          </View>
        </View>

        <View style={styles.amountGrid}>
          <Amount label="Bill" value={estimate.total} />
          <Amount label="Fetch may pay" value={estimate.likelyFetchPays} highlight />
          <Amount label="You may pay" value={estimate.likelyYouPay} />
        </View>

        <Pressable onPress={onReset} style={styles.secondaryButton}>
          <Ionicons name="refresh" size={16} color={palette.ink} />
          <Text style={styles.secondaryButtonText}>Read another estimate</Text>
        </Pressable>
      </View>

      <View style={styles.subPanel}>
        <View style={styles.rowBetween}>
          <Text style={styles.blockTitle}>Line items</Text>
          <Ionicons name="clipboard-outline" size={19} color={palette.green} />
        </View>
        {estimate.lineItems.map((item) => (
          <View key={item.label} style={styles.lineItem}>
            <View style={styles.rowBetweenTop}>
              <View style={styles.lineCopy}>
                <Text style={styles.lineTitle}>{item.label}</Text>
                <Text style={styles.lineNote}>{item.note}</Text>
              </View>
              <Text style={styles.lineAmount}>{formatMoney(item.amount)}</Text>
            </View>
            <StatusBadge status={item.status} />
          </View>
        ))}
      </View>

      <View style={styles.nextStepPanel}>
        <View style={styles.inlineRow}>
          <Ionicons name="document-text-outline" size={19} color={palette.pink} />
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

function Amount({
  label,
  value,
  highlight
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <View style={styles.amountCard}>
      <Text style={styles.amountLabel}>{label}</Text>
      <Text style={[styles.amountValue, highlight && styles.amountHighlight]}>
        {formatMoney(value)}
      </Text>
    </View>
  );
}

function StatusBadge({ status }: { status: CoverageStatus }) {
  const tone = statusStyles[status];

  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: tone.backgroundColor, borderColor: tone.borderColor }
      ]}
    >
      <Text style={[styles.statusText, { color: tone.color }]}>{status}</Text>
    </View>
  );
}

function TimelineCard() {
  return (
    <View style={[styles.section, styles.cardShadow]}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.eyebrow}>Claim path</Text>
          <Text style={styles.sectionTitle}>Direct-to-vet timeline</Text>
        </View>
        <View style={styles.softIcon}>
          <Ionicons name="shield-checkmark-outline" size={20} color={palette.pink} />
        </View>
      </View>

      <View style={styles.timeline}>
        {timeline.map((item, index) => (
          <View key={item.label} style={styles.timelineRow}>
            <View style={styles.timelineRail}>
              <View style={[styles.timelineDot, item.active && styles.timelineDotActive]}>
                {item.active ? (
                  <Ionicons name="checkmark" size={14} color="white" />
                ) : (
                  <Text style={styles.timelineNumber}>{index + 1}</Text>
                )}
              </View>
              {index < timeline.length - 1 ? (
                <View style={[styles.timelineLine, item.active && styles.timelineLineActive]} />
              ) : null}
            </View>
            <View style={styles.timelineCopy}>
              <Text style={styles.timelineTitle}>{item.label}</Text>
              <Text style={styles.timelineDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function CareQueue() {
  return (
    <View style={[styles.section, styles.cardShadow]}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.eyebrow}>Care queue</Text>
          <Text style={styles.sectionTitle}>Upcoming tasks</Text>
        </View>
        <View style={styles.softIconBlue}>
          <Ionicons name="calendar-outline" size={20} color="#0369a1" />
        </View>
      </View>
      <View style={styles.queueList}>
        {careQueue.map((item) => (
          <View key={item.label} style={styles.queueItem}>
            <Text style={styles.queueTag}>{item.detail}</Text>
            <Text style={styles.queueTitle}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PolicyCard({ pet }: { pet: Pet }) {
  return (
    <View style={[styles.section, styles.cardShadow]}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Policy clarity</Text>
        <Ionicons name="card-outline" size={21} color={palette.slate} />
      </View>

      <View style={styles.policyGrid}>
        <View style={[styles.policyTile, { backgroundColor: palette.blue }]}>
          <Text style={styles.policyLabel}>Reimburse</Text>
          <Text style={styles.policyValue}>{Math.round(pet.reimbursement * 100)}%</Text>
        </View>
        <View style={[styles.policyTile, { backgroundColor: palette.rose }]}>
          <Text style={styles.policyLabel}>Excess</Text>
          <Text style={styles.policyValue}>{formatMoney(pet.excess)}</Text>
        </View>
      </View>

      <Text style={styles.bodyText}>
        Plain-language cover notes stay attached to each visit, so the next step
        is obvious.
      </Text>
    </View>
  );
}

function ClinicCard() {
  return (
    <View style={[styles.section, styles.cardShadow]}>
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Clinic handoff</Text>
        <Ionicons name="medical-outline" size={21} color={palette.slate} />
      </View>
      <View style={styles.clinicPanel}>
        <Text style={styles.blockTitle}>Bondi Junction Vet</Text>
        <Text style={styles.bodyText}>
          Invoice request sent. Notes can be uploaded from the clinic portal.
        </Text>
      </View>
      <Pressable style={styles.linkButton}>
        <Ionicons name="link-outline" size={17} color={palette.pink} />
        <Text style={styles.linkButtonText}>Copy clinic link</Text>
      </Pressable>
    </View>
  );
}

function BottomTabs({
  activeTab,
  onSelect
}: {
  activeTab: string;
  onSelect: (tab: string) => void;
}) {
  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => {
        const active = activeTab === tab.label;

        return (
          <Pressable
            key={tab.label}
            onPress={() => onSelect(tab.label)}
            style={[styles.tabItem, active && styles.tabItemActive]}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={active ? palette.pink : palette.slate}
            />
            <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.canvas
  },
  appShell: {
    flex: 1,
    backgroundColor: palette.canvas
  },
  page: {
    padding: 16,
    paddingBottom: 112
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16
  },
  logoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  logoMark: {
    alignItems: "center",
    backgroundColor: palette.pink,
    borderRadius: 13,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  logoText: {
    color: palette.ink,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 23
  },
  logoCaption: {
    color: palette.slate,
    fontSize: 12,
    fontWeight: "800"
  },
  topActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: 12,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  demoPill: {
    alignItems: "center",
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 12
  },
  demoPillText: {
    color: palette.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  heroCard: {
    backgroundColor: palette.ink,
    borderRadius: 26,
    marginBottom: 16,
    overflow: "hidden",
    padding: 18,
    position: "relative"
  },
  heroGlow: {
    backgroundColor: palette.pink,
    borderRadius: 90,
    height: 180,
    opacity: 0.28,
    position: "absolute",
    right: -60,
    top: -65,
    width: 180
  },
  heroHeader: {
    flexDirection: "row",
    gap: 14
  },
  heroCopy: {
    flex: 1
  },
  eyebrowOnPink: {
    color: "#ffd3e5",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase"
  },
  heroTitle: {
    color: "white",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 35,
    marginTop: 8
  },
  heroText: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10
  },
  heroPetImage: {
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 18,
    borderWidth: 2,
    height: 90,
    width: 90
  },
  heroStats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18
  },
  heroStat: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
    flex: 1,
    padding: 11
  },
  heroStatLabel: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "800"
  },
  heroStatValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 5
  },
  heroStatStrong: {
    color: "#9be7d1"
  },
  clarityRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16
  },
  clarityLabel: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "800"
  },
  clarityValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "900"
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    height: 9,
    marginTop: 9,
    overflow: "hidden"
  },
  progressFill: {
    backgroundColor: palette.pink,
    borderRadius: 999,
    height: 9
  },
  section: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16
  },
  softShadow: {
    elevation: 8,
    shadowColor: "#122033",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 28
  },
  cardShadow: {
    elevation: 4,
    shadowColor: "#122033",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18
  },
  sectionHeader: {
    gap: 12,
    marginBottom: 14
  },
  sectionTitleWrap: {
    gap: 5
  },
  eyebrow: {
    color: palette.pink,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.45,
    textTransform: "uppercase"
  },
  sectionTitle: {
    color: palette.ink,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 27
  },
  darkButton: {
    alignItems: "center",
    backgroundColor: palette.ink,
    borderRadius: 13,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
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
  petOption: {
    alignItems: "center",
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 76,
    padding: 11
  },
  petOptionActive: {
    backgroundColor: palette.rose,
    borderColor: palette.pink
  },
  petThumb: {
    borderRadius: 13,
    height: 52,
    width: 52
  },
  petOptionText: {
    flex: 1,
    gap: 3
  },
  petOptionName: {
    color: palette.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  petOptionBreed: {
    color: palette.slate,
    fontSize: 14
  },
  selectedDot: {
    alignItems: "center",
    backgroundColor: palette.pink,
    borderRadius: 999,
    height: 22,
    justifyContent: "center",
    width: 22
  },
  petProfile: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: 18,
    borderWidth: 1,
    gap: 13,
    marginBottom: 16,
    padding: 14
  },
  petImage: {
    borderRadius: 16,
    height: 100,
    width: 100
  },
  petMain: {
    gap: 4
  },
  inlineRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  rowBetween: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  rowBetweenTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  petName: {
    color: palette.ink,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 0
  },
  coverBadge: {
    backgroundColor: "#dcfce7",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  coverBadgeText: {
    color: palette.green,
    fontSize: 12,
    fontWeight: "900"
  },
  petMeta: {
    color: palette.slate,
    fontSize: 14
  },
  petPolicy: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  metricRow: {
    flexDirection: "row",
    gap: 8
  },
  metric: {
    backgroundColor: palette.canvas,
    borderRadius: 13,
    flex: 1,
    padding: 11
  },
  metricLabel: {
    color: palette.slate,
    fontSize: 11,
    fontWeight: "800"
  },
  metricValue: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 4
  },
  visitBlock: {
    gap: 10
  },
  blockTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0
  },
  smallMuted: {
    color: palette.slate,
    fontSize: 12,
    fontWeight: "800"
  },
  visitGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  visitButton: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 88,
    padding: 12,
    width: "48.8%"
  },
  visitButtonActive: {
    backgroundColor: palette.rose,
    borderColor: palette.pink
  },
  visitLabel: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  visitDescription: {
    color: palette.slate,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6
  },
  readerHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginBottom: 14
  },
  aiBadge: {
    alignItems: "center",
    backgroundColor: palette.rose,
    borderRadius: 999,
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  aiBadgeText: {
    color: palette.pink,
    fontSize: 12,
    fontWeight: "900"
  },
  uploadPanel: {
    backgroundColor: palette.rose,
    borderColor: palette.roseStrong,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14
  },
  uploadIcon: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    width: 48
  },
  uploadCopy: {
    flex: 1,
    gap: 4
  },
  bodyText: {
    color: palette.slate,
    fontSize: 14,
    lineHeight: 22
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: palette.pink,
    borderRadius: 15,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 50,
    paddingHorizontal: 16
  },
  pressed: {
    opacity: 0.86
  },
  disabledButton: {
    backgroundColor: palette.pinkDeep
  },
  primaryButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900"
  },
  readyCard: {
    alignItems: "flex-start",
    backgroundColor: palette.canvas,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    padding: 13
  },
  readyText: {
    flex: 1,
    gap: 4
  },
  analysisCard: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    marginTop: 12,
    padding: 13
  },
  darkIcon: {
    alignItems: "center",
    backgroundColor: palette.ink,
    borderRadius: 13,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  skeletonWide: {
    backgroundColor: palette.canvas,
    borderRadius: 10,
    height: 44
  },
  skeletonMid: {
    backgroundColor: palette.canvas,
    borderRadius: 10,
    height: 44,
    width: "82%"
  },
  resultsStack: {
    gap: 12
  },
  resultHero: {
    backgroundColor: palette.ink,
    borderRadius: 20,
    padding: 16
  },
  resultHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
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
  resultConfidence: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
    minWidth: 58,
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  resultConfidenceText: {
    color: "white",
    fontSize: 16,
    fontWeight: "900"
  },
  resultConfidenceLabel: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "800"
  },
  amountGrid: {
    gap: 8,
    marginTop: 15
  },
  amountCard: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 14,
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
  amountHighlight: {
    color: "#9be7d1"
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 14,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 43
  },
  secondaryButtonText: {
    color: palette.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  subPanel: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 14
  },
  lineItem: {
    borderColor: palette.line,
    borderRadius: 15,
    borderWidth: 1,
    gap: 8,
    padding: 12
  },
  lineCopy: {
    flex: 1,
    gap: 4
  },
  lineTitle: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  lineAmount: {
    color: palette.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  lineNote: {
    color: palette.slate,
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
  nextStepPanel: {
    backgroundColor: palette.lemon,
    borderColor: "#fde68a",
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 14
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  docChip: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  docChipText: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  softIcon: {
    alignItems: "center",
    backgroundColor: palette.rose,
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  softIconBlue: {
    alignItems: "center",
    backgroundColor: palette.blue,
    borderRadius: 14,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  timeline: {
    marginTop: 16
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12
  },
  timelineRail: {
    alignItems: "center"
  },
  timelineDot: {
    alignItems: "center",
    borderColor: palette.line,
    borderRadius: 999,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 30
  },
  timelineDotActive: {
    backgroundColor: palette.pink,
    borderColor: palette.pink
  },
  timelineLine: {
    backgroundColor: palette.line,
    flex: 1,
    minHeight: 38,
    width: 1
  },
  timelineLineActive: {
    backgroundColor: palette.pink
  },
  timelineNumber: {
    color: palette.slate,
    fontSize: 12,
    fontWeight: "900"
  },
  timelineCopy: {
    flex: 1,
    gap: 3,
    paddingBottom: 18
  },
  timelineTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  timelineDetail: {
    color: palette.slate,
    fontSize: 14,
    lineHeight: 20
  },
  queueList: {
    gap: 9,
    marginTop: 14
  },
  queueItem: {
    borderColor: palette.line,
    borderRadius: 15,
    borderWidth: 1,
    gap: 8,
    padding: 12
  },
  queueTag: {
    alignSelf: "flex-start",
    backgroundColor: palette.blue,
    borderRadius: 999,
    color: "#075985",
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 5
  },
  queueTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  policyGrid: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 11,
    marginTop: 14
  },
  policyTile: {
    borderRadius: 15,
    flex: 1,
    padding: 13
  },
  policyLabel: {
    color: palette.ink,
    fontSize: 12,
    fontWeight: "800"
  },
  policyValue: {
    color: palette.ink,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 5
  },
  clinicPanel: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: 15,
    borderWidth: 1,
    gap: 5,
    marginTop: 13,
    padding: 13
  },
  linkButton: {
    alignItems: "center",
    borderColor: palette.line,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 43
  },
  linkButtonText: {
    color: palette.pink,
    fontSize: 14,
    fontWeight: "900"
  },
  bottomNav: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: palette.line,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: "row",
    gap: 6,
    justifyContent: "space-between",
    left: 0,
    paddingBottom: 12,
    paddingHorizontal: 14,
    paddingTop: 10,
    position: "absolute",
    right: 0
  },
  tabItem: {
    alignItems: "center",
    borderRadius: 14,
    flex: 1,
    gap: 4,
    minHeight: 56,
    justifyContent: "center"
  },
  tabItemActive: {
    backgroundColor: palette.rose
  },
  tabLabel: {
    color: palette.slate,
    fontSize: 11,
    fontWeight: "900"
  },
  tabLabelActive: {
    color: palette.pink
  }
});
