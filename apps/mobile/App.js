import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import metadata from "./metadata.json";
import { normalizeAnimal, QUESTION_GROUPS } from "./game/animal-facts.js";
import { ADS_PER_UNLOCK, getAdSeriesState, grantAdView, mergeSavedProgress, normalizeAdSeries, recordRoundResult } from "./game/progress.js";
import { askQuestion, createReadyRound, getAnimalStatus, getPossibleAnimals, getSortedAnimals, giveUp, guessAnimal, ROUND_PHASE, startSoloRound } from "./game/solo-game.js";
import { animalImages } from "./animal-images.js";
import { RewardCardOverlay } from "./components/RewardCardOverlay.js";

const INITIAL_DECK_SIZE = 24;

export default function App() {
  const { width } = useWindowDimensions();
  const animals = useMemo(() => metadata.animals.map(normalizeAnimal).sort((left, right) => left.name.localeCompare(right.name, "sv")), []);
  const [progress, setProgress] = useState(() => mergeSavedProgress(animals, {}));
  const [round, setRound] = useState(() => createReadyRound());
  const [deckSize, setDeckSize] = useState(INITIAL_DECK_SIZE);
  const [columnCount, setColumnCount] = useState(3);
  const [showLocked, setShowLocked] = useState(false);
  const [screen, setScreen] = useState("home");
  const [message, setMessage] = useState("Starta en runda. Datorn väljer ett hemligt djur bland dina upplåsta kort.");
  const [rewardAnimal, setRewardAnimal] = useState(null);
  const [detailAnimal, setDetailAnimal] = useState(null);
  const [now, setNow] = useState(Date.now());
  const pinch = useRef({ distance: 0, columns: 3 });

  const possibleAnimals = round.phase === ROUND_PHASE.PLAYING ? getPossibleAnimals(round, animals, progress.unlockedIds) : [];
  const visibleAnimals = getSortedAnimals(round, animals, progress.unlockedIds, {
    showLocked,
    showWholeCatalog: round.phase !== ROUND_PHASE.PLAYING,
    highlightedUnlockId: progress.highlightedUnlockId
  });
  const lockedCount = animals.length - progress.unlockedIds.length;
  const currentScore = round.phase === ROUND_PHASE.PLAYING ? Math.max(10, 100 - 10 * round.asked.length - 20 * round.wrongGuesses.length) : progress.bestScore;
  const cardWidth = getCardWidth(width, columnCount);
  const adSeries = getAdSeriesState(progress, now);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setProgress((currentProgress) => normalizeAdSeries(currentProgress, now));
  }, [now]);

  function startRound() {
    const nextProgress = { ...progress, highlightedUnlockId: null };
    setProgress(nextProgress);
    setRound(startSoloRound(animals, { unlockedIds: nextProgress.unlockedIds, deckSize }));
    setScreen("home");
    setMessage(`Datorn har valt ett av ${Math.min(deckSize, nextProgress.unlockedIds.length)} djur. Ställ frågor och gissa när du vågar.`);
  }

  function handleAsk(questionId) {
    setRound((currentRound) => {
      const updated = askQuestion(currentRound, animals, questionId);
      if (updated.lastAnswer && updated !== currentRound) {
        setMessage(`Datorn svarade ${updated.lastAnswer.answer === "yes" ? "JA" : "NEJ"} på: ${updated.lastAnswer.text}`);
      }
      return updated;
    });
  }

  function handleGuess(animalId) {
    setRound((currentRound) => {
      const updated = guessAnimal(currentRound, animals, animalId);
      if (updated === currentRound) return currentRound;
      const animal = animals.find((item) => item.id === animalId);
      if (updated.phase === ROUND_PHASE.WON) {
        setProgress((currentProgress) => recordRoundResult(currentProgress, updated.result));
        setMessage(`Rätt! Datorns djur var ${updated.result.secretName}. Du fick ${updated.result.score} poäng.`);
      } else {
        setMessage(`${animal?.name || "Det djuret"} var inte rätt. Fortsätt leta!`);
      }
      return updated;
    });
  }

  function handleGiveUp() {
    const updated = giveUp(round, animals);
    setRound(updated);
    setMessage(`Datorns djur var ${updated.result.secretName}. Starta en ny runda när du vill försöka igen.`);
  }

  function handleAdReward() {
    if (round.phase === ROUND_PHASE.PLAYING || lockedCount <= 0) return;
    const result = grantAdView(progress, animals, Date.now());
    setProgress(result.progress);
    if (result.blockedReason === "cooldown") {
      setMessage(`Du kan starta en ny reklamserie om ${formatDuration(result.remainingMs)}.`);
      return;
    }
    setMessage(result.unlockedAnimal ? `${result.unlockedAnimal.name} är upplåst.` : `Reklam sedd. ${ADS_PER_UNLOCK - result.progress.adViews} kvar till nästa kort.`);
    if (result.unlockedAnimal) setRewardAnimal(result.unlockedAnimal);
  }

  function resetProgress() {
    setProgress(mergeSavedProgress(animals, {}));
    setRound(createReadyRound());
    setScreen("home");
    setMessage("Progress återställd. Starta en ny runda.");
  }

  function handlePinchStart(event) {
    const touches = event.nativeEvent.touches;
    if (touches.length !== 2) return;
    pinch.current = { distance: getTouchDistance(touches), columns: columnCount };
  }

  function handlePinchMove(event) {
    const touches = event.nativeEvent.touches;
    if (touches.length !== 2 || !pinch.current.distance) return;
    const ratio = getTouchDistance(touches) / pinch.current.distance;
    if (ratio > 1.18) setColumnCount(Math.max(1, pinch.current.columns - 1));
    if (ratio < 0.82) setColumnCount(Math.min(3, pinch.current.columns + 1));
  }

  if (screen === "ads") {
    return (
      <SafeAreaView style={styles.shell}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Lås upp fler djur</Text>
            <Text style={styles.title}>Reklamserie</Text>
            <Text style={styles.intro}>Se {ADS_PER_UNLOCK} reklamklipp inom en timme för att låsa upp ett nytt djur. När serien är klar kan du inte starta en ny serie förrän timmen gått ut.</Text>
            <View style={styles.controls}>
              <Button label="Tillbaka" variant="ghost" onPress={() => setScreen("home")} />
              <Button label="Titta på reklam" disabled={lockedCount <= 0 || adSeries.status === "cooldown"} onPress={handleAdReward} />
            </View>
          </View>

          <View style={styles.adPageCard}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <View style={styles.rewardStars}>
              {Array.from({ length: ADS_PER_UNLOCK }).map((_, index) => <Text key={index} style={[styles.rewardStar, index < progress.adViews ? styles.rewardStarActive : null]}>★</Text>)}
            </View>
            <Text style={styles.adPageText}>{adSeries.status === "not-started" ? "Första reklamen startar en timer på 1 timme." : adSeries.status === "cooldown" ? `Serie klar. Ny reklamserie kan startas om ${formatDuration(adSeries.remainingMs)}.` : `Tid kvar: ${formatDuration(adSeries.remainingMs)}.`}</Text>
            <Text style={styles.help}>{lockedCount} djur är fortfarande låsta.</Text>
          </View>
        </ScrollView>
        <RewardCardOverlay visible={Boolean(rewardAnimal)} animal={rewardAnimal} imageSource={rewardAnimal ? animalImages[rewardAnimal.id] : null} onComplete={() => setRewardAnimal(null)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.shell} onTouchStart={handlePinchStart} onTouchMove={handlePinchMove}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        key={`columns-${columnCount}`}
        data={visibleAnimals}
        keyExtractor={(item) => item.id}
        numColumns={columnCount}
        contentContainerStyle={styles.content}
        columnWrapperStyle={styles.cardRow}
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <Text style={styles.eyebrow}>Fristående app</Text>
              <Text style={styles.title}>Gissa djuret</Text>
              <Text style={styles.intro}>Spela själv mot datorn. All metadata och alla bilder är bundlade lokalt i appen.</Text>
              <View style={styles.controls}>
                <Button label={round.phase === ROUND_PHASE.PLAYING ? "Starta om" : "Starta runda"} onPress={startRound} />
                {round.phase === ROUND_PHASE.PLAYING ? <Button label="Visa svaret" variant="ghost" onPress={handleGiveUp} /> : <Button label="Lås upp fler djur" variant="secondary" disabled={lockedCount <= 0} onPress={() => setScreen("ads")} />}
                <Button label="Återställ" variant="ghost" onPress={resetProgress} />
              </View>
            </View>

            <View style={styles.stats}>
              <Stat value={round.phase === ROUND_PHASE.PLAYING ? possibleAnimals.length : "-"} label="Möjliga" />
              <Stat value={currentScore} label={round.phase === ROUND_PHASE.PLAYING ? "Poäng" : "Bästa"} />
              <Stat value={progress.roundsWon} label="Vinster" />
            </View>

            <Text style={[styles.message, round.phase === ROUND_PHASE.WON ? styles.messageWin : round.wrongGuesses.length || round.phase === ROUND_PHASE.GAVE_UP ? styles.messageMiss : null]}>{message}</Text>

            <View style={styles.setupBox}>
              <Text style={styles.sectionTitle}>Rundstorlek</Text>
              <View style={styles.pills}>{[12, 24, 36, 50].map((size) => <Pill key={size} label={String(size)} active={deckSize === size} onPress={() => setDeckSize(size)} />)}</View>
              <Text style={styles.help}>Mindre runda är enklare. Bara upplåsta kort används.</Text>
            </View>

            {renderResult(round, animals)}

            {round.phase === ROUND_PHASE.PLAYING ? renderQuestions(round, handleAsk) : null}

            <View style={styles.catalogHeader}>
              <Text style={styles.sectionTitle}>{round.phase === ROUND_PHASE.PLAYING ? "Rundans djur" : "Djurkatalog"}</Text>
              <View style={styles.catalogControls}>
                <View style={styles.columnPills}>{[1, 2, 3].map((count) => <Pill key={count} label={String(count)} active={columnCount === count} onPress={() => setColumnCount(count)} />)}</View>
                <Pressable style={[styles.toggle, showLocked ? styles.toggleActive : null]} onPress={() => setShowLocked((value) => !value)}>
                  <Text style={styles.toggleText}>{showLocked ? "Dölj låsta" : "Visa låsta"}</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.catalogProgressBox}>
              <View style={styles.catalogProgressHeader}>
                <Text style={styles.catalogProgressLabel}>Upplåsta djur</Text>
                <Text style={styles.catalogProgressValue}>{progress.unlockedIds.length}/{animals.length}</Text>
              </View>
              <View style={styles.catalogProgressTrack}>
                <View style={[styles.catalogProgressFill, { width: `${(progress.unlockedIds.length / animals.length) * 100}%` }]} />
              </View>
            </View>
            <Text style={styles.zoomHint}>Nyp med två fingrar på listan eller välj 1, 2, 3 för kort per rad.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <AnimalCard
            animal={item}
            cardWidth={cardWidth}
            columns={columnCount}
            isLastInRow={(index + 1) % columnCount === 0}
            status={getAnimalStatus(round, item, progress.unlockedIds, progress.highlightedUnlockId)}
            disabled={false}
            onPress={() => round.phase === ROUND_PHASE.PLAYING ? handleGuess(item.id) : setDetailAnimal(item)}
          />
        )}
      />
      <RewardCardOverlay
        visible={Boolean(rewardAnimal)}
        animal={rewardAnimal}
        imageSource={rewardAnimal ? animalImages[rewardAnimal.id] : null}
        onComplete={() => setRewardAnimal(null)}
      />
      <AnimalDetailOverlay animal={detailAnimal} onClose={() => setDetailAnimal(null)} />
    </SafeAreaView>
  );
}

function Button({ label, onPress, variant, disabled }) {
  return (
    <Pressable style={[styles.button, variant === "secondary" ? styles.buttonSecondary : null, variant === "ghost" ? styles.buttonGhost : null, disabled ? styles.disabled : null]} disabled={disabled} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

function Pill({ label, active, onPress }) {
  return (
    <Pressable style={[styles.pill, active ? styles.pillActive : null]} onPress={onPress}>
      <Text style={[styles.pillText, active ? styles.pillTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuestionButton({ question, asked, disabled, onPress }) {
  return (
    <Pressable style={[styles.questionButton, asked ? styles.questionUsed : null, disabled ? styles.disabled : null]} disabled={disabled} onPress={onPress}>
      <Text style={styles.questionIcon}>{question.icon}</Text>
      <Text style={styles.questionText}>{question.text}</Text>
      {asked ? <Text style={styles.answerBadge}>{asked.answer === "yes" ? "JA" : "NEJ"}</Text> : null}
    </Pressable>
  );
}

function renderQuestions(round, handleAsk) {
  return (
    <>
      <Text style={styles.sectionTitle}>Frågor</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.questionScroller}>
        {QUESTION_GROUPS.map((group) => (
          <View key={group.id} style={styles.questionGroup}>
            <Text style={styles.questionGroupTitle}>{group.title}</Text>
            {group.questions.map((question) => {
              const asked = round.asked.find((item) => item.id === question.id);
              return <QuestionButton key={question.id} question={question} asked={asked} disabled={round.phase !== ROUND_PHASE.PLAYING || Boolean(asked)} onPress={() => handleAsk(question.id)} />;
            })}
          </View>
        ))}
      </ScrollView>
    </>
  );
}

function AnimalCard({ animal, cardWidth, columns, isLastInRow, status, disabled, onPress }) {
  const locked = status === "locked";
  const notPlayable = locked || status === "outOfRound" || disabled;
  const imageSize = cardWidth - (columns === 3 ? 12 : 16);
  return (
    <Pressable style={[styles.animalCard, cardSizeStyle(columns), { width: cardWidth, marginRight: isLastInRow ? 0 : 10 }, styles[`status_${status}`]]} disabled={notPlayable} onPress={onPress}>
      {status !== "possible" ? <Text style={styles.cardBadge}>{statusLabel(status)}</Text> : null}
      <Image source={animalImages[animal.id]} style={[styles.animalImage, { width: imageSize, height: imageSize }]} resizeMode="contain" />
      <Text style={styles.animalName}>{animal.name}</Text>
      <Text numberOfLines={1} style={styles.animalMeta}>{animal.habitats.slice(0, 2).join(", ")}</Text>
    </Pressable>
  );
}

function getCardWidth(screenWidth, columns) {
  const horizontalPadding = 28;
  const gapTotal = 10 * (columns - 1);
  return Math.floor((screenWidth - horizontalPadding - gapTotal) / columns);
}

function cardSizeStyle(columns) {
  if (columns === 1) return styles.animalCardLarge;
  if (columns === 2) return styles.animalCardMedium;
  return styles.animalCardSmall;
}

function getTouchDistance(touches) {
  const [first, second] = touches;
  const x = first.pageX - second.pageX;
  const y = first.pageY - second.pageY;
  return Math.sqrt(x * x + y * y);
}

function renderResult(round, animals) {
  if (![ROUND_PHASE.WON, ROUND_PHASE.GAVE_UP].includes(round.phase) || !round.result) return null;
  const secret = animals.find((animal) => animal.id === round.secretId);
  return (
    <View style={styles.resultPanel}>
      <Image source={animalImages[secret.id]} style={styles.resultImage} resizeMode="contain" />
      <View style={styles.resultText}>
        <Text style={styles.eyebrow}>{round.phase === ROUND_PHASE.WON ? "Rätt gissat" : "Svaret"}</Text>
        <Text style={styles.resultTitle}>{round.result.secretName}</Text>
        <Text style={styles.resultDescription}>{secret.description}</Text>
        <Text style={styles.scoreLine}>{"★".repeat(round.result.stars)}{"☆".repeat(3 - round.result.stars)} · {round.result.score} poäng</Text>
      </View>
    </View>
  );
}

function AnimalDetailOverlay({ animal, onClose }) {
  if (!animal) return null;
  const attributes = animal.attributes;
  const rows = [
    ["Storlek", translateSize(attributes.size)],
    ["Färger", attributes.colors.join(", ") || "-"],
    ["Mönster", attributes.pattern.join(", ") || "inget"],
    ["Ben", String(attributes.legs)],
    ["Vingar", yesNo(attributes.hasWings)],
    ["Kan flyga", yesNo(attributes.canFly)],
    ["Kan simma", yesNo(attributes.canSwim)],
    ["Lägger ägg", yesNo(attributes.laysEggs)],
    ["Habitat", animal.habitats.join(", ")],
    ["Kontinenter", animal.continents.join(", ")]
  ];

  return (
    <View style={styles.detailBackdrop}>
      <View style={styles.detailCard}>
        <Image source={animalImages[animal.id]} style={styles.detailImage} resizeMode="contain" />
        <Text style={styles.detailTitle}>{animal.name}</Text>
        <Text style={styles.detailDescription}>{animal.description}</Text>
        <View style={styles.detailRows}>{rows.map(([label, value]) => <View key={label} style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>)}</View>
        {animal.clues.length ? <Text style={styles.detailClues}>Ledtrådar: {animal.clues.join(" ")}</Text> : null}
        <Button label="Stäng" onPress={onClose} />
      </View>
    </View>
  );
}

function yesNo(value) {
  return value ? "Ja" : "Nej";
}

function translateSize(size) {
  return { small: "Liten", medium: "Mellan", large: "Stor", huge: "Mycket stor" }[size] || size;
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function statusLabel(status) {
  return { locked: "Låst", unlockedNew: "Nytt", wrong: "Inte den", eliminated: "Bort", correct: "Rätt", outOfRound: "Ej med" }[status] || "";
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: "#fff7db" },
  content: { padding: 14, paddingBottom: 40 },
  hero: { padding: 18, borderRadius: 28, backgroundColor: "#fffdf2", borderWidth: 2, borderColor: "rgba(33,47,43,0.10)" },
  eyebrow: { color: "#2f7668", fontSize: 11, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" },
  title: { color: "#1f352f", fontSize: 48, fontWeight: "900", letterSpacing: -3, lineHeight: 48, marginTop: 4 },
  intro: { color: "#52615d", fontSize: 16, lineHeight: 23, marginTop: 10 },
  controls: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  button: { minHeight: 44, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: "#ffcf4d", justifyContent: "center" },
  buttonSecondary: { backgroundColor: "#dff3ff" },
  buttonGhost: { backgroundColor: "#ffffff" },
  buttonText: { color: "#18332c", fontWeight: "900" },
  disabled: { opacity: 0.45 },
  stats: { flexDirection: "row", gap: 8, marginTop: 10 },
  stat: { flex: 1, minHeight: 74, padding: 10, borderRadius: 18, backgroundColor: "#ffffff" },
  statValue: { color: "#1f352f", fontSize: 22, fontWeight: "900" },
  statLabel: { color: "#6c7774", fontSize: 12, fontWeight: "800", marginTop: 4 },
  message: { marginTop: 10, padding: 12, borderRadius: 18, backgroundColor: "#ffffff", color: "#2f4a43", fontSize: 15, lineHeight: 21, fontWeight: "700" },
  messageWin: { backgroundColor: "#e3fbdf" },
  messageMiss: { backgroundColor: "#fff0d6" },
  setupBox: { marginTop: 10, padding: 12, borderRadius: 20, backgroundColor: "#eef9ef" },
  sectionTitle: { color: "#1f352f", fontSize: 20, fontWeight: "900", marginTop: 16, marginBottom: 8 },
  pills: { flexDirection: "row", gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: "#ffffff", borderWidth: 2, borderColor: "rgba(32,56,51,0.1)" },
  pillActive: { backgroundColor: "#2f7668", borderColor: "#2f7668" },
  pillText: { color: "#203833", fontWeight: "900" },
  pillTextActive: { color: "#ffffff" },
  help: { color: "#64736f", marginTop: 8, lineHeight: 19 },
  adPageCard: { marginTop: 14, padding: 18, borderRadius: 26, backgroundColor: "#fffdf2", borderWidth: 2, borderColor: "rgba(33,47,43,0.10)" },
  rewardStars: { flexDirection: "row", justifyContent: "center", gap: 10, marginVertical: 18 },
  rewardStar: { color: "#d8d1b9", fontSize: 38, fontWeight: "900" },
  rewardStarActive: { color: "#ffcf4d", textShadowColor: "rgba(255,177,47,0.35)", textShadowRadius: 8 },
  adPageText: { color: "#2f4a43", fontSize: 16, fontWeight: "800", lineHeight: 23, textAlign: "center" },
  questionScroller: { marginHorizontal: -14, paddingLeft: 14 },
  questionGroup: { width: 250, marginRight: 10, padding: 10, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.72)" },
  questionGroupTitle: { color: "#52615d", fontSize: 12, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  questionButton: { minHeight: 62, padding: 10, borderRadius: 16, backgroundColor: "#ffffff", marginBottom: 8, borderWidth: 2, borderColor: "rgba(32,56,51,0.08)" },
  questionUsed: { backgroundColor: "#effaf6", borderColor: "#9cc6ba" },
  questionIcon: { fontSize: 22 },
  questionText: { color: "#203833", fontSize: 14, fontWeight: "800", marginTop: 4 },
  answerBadge: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: "#203833", color: "#fff", fontSize: 12, fontWeight: "900" },
  catalogHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  catalogControls: { alignItems: "flex-end", gap: 8 },
  columnPills: { flexDirection: "row", gap: 6 },
  catalogProgressBox: { marginBottom: 8, padding: 12, borderRadius: 18, backgroundColor: "#fffdf2", borderWidth: 2, borderColor: "rgba(32,56,51,0.08)" },
  catalogProgressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  catalogProgressLabel: { color: "#52615d", fontSize: 13, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  catalogProgressValue: { color: "#1f352f", fontSize: 15, fontWeight: "900" },
  catalogProgressTrack: { overflow: "hidden", height: 13, borderRadius: 999, backgroundColor: "rgba(32,56,51,0.12)" },
  catalogProgressFill: { height: "100%", borderRadius: 999, backgroundColor: "#5bbd6a" },
  zoomHint: { color: "#71807c", fontSize: 12, fontWeight: "700", marginBottom: 8 },
  toggle: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#ffffff" },
  toggleActive: { backgroundColor: "#dff3ff" },
  toggleText: { color: "#203833", fontWeight: "900" },
  cardRow: { alignItems: "stretch" },
  animalCard: { marginBottom: 10, padding: 8, borderRadius: 20, backgroundColor: "#ffffff", borderWidth: 3, borderColor: "transparent" },
  animalCardLarge: { minHeight: 330 },
  animalCardMedium: { minHeight: 202 },
  animalCardSmall: { minHeight: 150, padding: 6, borderRadius: 16 },
  animalImage: { alignSelf: "center", borderRadius: 14, backgroundColor: "#fff8e6" },
  animalName: { color: "#223b35", fontSize: 15, fontWeight: "900", marginTop: 8 },
  animalMeta: { color: "#71807c", fontSize: 12, marginTop: 3 },
  cardBadge: { position: "absolute", zIndex: 2, top: 8, left: 8, overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999, backgroundColor: "#203833", color: "#fff", fontSize: 11, fontWeight: "900" },
  status_eliminated: { opacity: 0.38 },
  status_wrong: { opacity: 0.38 },
  status_outOfRound: { opacity: 0.34 },
  status_locked: { opacity: 0.55 },
  status_correct: { borderColor: "#5bbd6a" },
  status_unlockedNew: { borderColor: "#ffb12f" },
  resultPanel: { flexDirection: "row", gap: 12, marginTop: 12, padding: 12, borderRadius: 22, backgroundColor: "#f3ffe8" },
  resultImage: { width: 112, height: 112, borderRadius: 18, backgroundColor: "#ffffff" },
  resultText: { flex: 1 },
  resultTitle: { color: "#1f352f", fontSize: 28, fontWeight: "900", letterSpacing: -1.5 },
  resultDescription: { color: "#53625e", lineHeight: 20 },
  scoreLine: { color: "#2f7668", fontWeight: "900", marginTop: 8 }
  ,detailBackdrop: { ...StyleSheet.absoluteFillObject, zIndex: 30, padding: 18, backgroundColor: "rgba(20,34,31,0.52)", justifyContent: "center" },
  detailCard: { height: "88%", padding: 18, borderRadius: 30, backgroundColor: "#fffdf2", borderWidth: 3, borderColor: "rgba(91,189,106,0.45)" },
  detailImage: { alignSelf: "center", width: 176, height: 176, borderRadius: 24, backgroundColor: "#fff8e6" },
  detailTitle: { marginTop: 12, color: "#1f352f", fontSize: 34, fontWeight: "900", letterSpacing: -1.4, textAlign: "center" },
  detailScroll: { flex: 1, marginTop: 8, marginBottom: 12 },
  detailScrollContent: { paddingBottom: 8 },
  detailDescription: { marginTop: 6, color: "#52615d", fontSize: 15, lineHeight: 22, textAlign: "center" },
  detailRows: { marginTop: 14, borderRadius: 18, overflow: "hidden", backgroundColor: "#ffffff" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(32,56,51,0.12)" },
  detailLabel: { flex: 0.44, color: "#71807c", fontWeight: "900" },
  detailValue: { flex: 0.56, color: "#203833", fontWeight: "800", textAlign: "right" },
  detailClues: { marginTop: 12, marginBottom: 12, color: "#2f7668", fontSize: 14, lineHeight: 20, fontWeight: "800" }
});
