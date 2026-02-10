import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../lib/colors";
import { useAuth } from "../../lib/auth";
import { generateQuiz, submitQuiz, QuizQuestion, QuizResult } from "../../lib/quiz";
import { getTierByXP, getXPProgress, getUserXP } from "../../lib/xp";

type Phase = "loading" | "question" | "result" | "summary";

export default function QuizScreen() {
  const { lessonId, title } = useLocalSearchParams<{
    lessonId: string;
    title?: string;
  }>();
  const router = useRouter();
  const { user } = useAuth();

  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answers, setAnswers] = useState<
    { questionId: string; selected: string; correct: boolean }[]
  >([]);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [xpBefore, setXpBefore] = useState(0);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadQuiz();
  }, [lessonId]);

  const loadQuiz = async () => {
    setPhase("loading");
    if (user) {
      const xp = await getUserXP(user.id);
      setXpBefore(xp?.total_xp ?? 0);
    }
    const qs = await generateQuiz(lessonId!);
    setQuestions(qs);
    setPhase(qs.length > 0 ? "question" : "summary");
  };

  const currentQ = questions[currentIndex];

  const handleSelectAnswer = (answer: string) => {
    if (selectedAnswer) return; // Already answered
    setSelectedAnswer(answer);
    const correct = answer === currentQ.correctAnswer;
    setIsCorrect(correct);
    setPhase("result");
  };

  const handleNext = () => {
    const newAnswers = [
      ...answers,
      {
        questionId: currentQ.id,
        selected: selectedAnswer!,
        correct: isCorrect!,
      },
    ];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setPhase("question");

      // Animate progress
      Animated.timing(progressAnim, {
        toValue: (currentIndex + 1) / questions.length,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      // Quiz complete — submit
      finishQuiz(newAnswers);
    }
  };

  const finishQuiz = async (
    finalAnswers: { questionId: string; selected: string; correct: boolean }[]
  ) => {
    setPhase("loading");
    if (user) {
      const r = await submitQuiz(user.id, lessonId!, finalAnswers);
      setResult(r);
    } else {
      // Guest mode — just show score
      const score = finalAnswers.filter((a) => a.correct).length;
      setResult({
        score,
        total: finalAnswers.length,
        isPerfect: score === finalAnswers.length,
        xpEarned: 0,
        answers: finalAnswers,
      });
    }
    setPhase("summary");
  };

  // ============================================================
  // LOADING
  // ============================================================
  if (phase === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Preparing your quiz...</Text>
      </View>
    );
  }

  // ============================================================
  // SUMMARY
  // ============================================================
  if (phase === "summary") {
    if (!result || questions.length === 0) {
      return (
        <>
          <Stack.Screen options={{ title: "Quiz" }} />
          <View style={styles.center}>
            <Ionicons name="book-outline" size={48} color={Colors.border} />
            <Text style={styles.emptyText}>
              No quiz available for this lesson yet.
            </Text>
            <Pressable
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.backBtnText}>Go Back</Text>
            </Pressable>
          </View>
        </>
      );
    }

    const pct = Math.round((result.score / result.total) * 100);
    const emoji =
      pct === 100 ? "star" : pct >= 60 ? "checkmark-circle" : "refresh";
    const emojiColor =
      pct === 100 ? Colors.accent : pct >= 60 ? Colors.primary : Colors.error;
    const message =
      pct === 100
        ? "MashaAllah! Perfect score!"
        : pct >= 80
        ? "Excellent work!"
        : pct >= 60
        ? "Good effort — keep learning!"
        : "Don't give up — review and try again!";

    return (
      <>
        <Stack.Screen options={{ title: "Quiz Results" }} />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.summaryContent}
        >
          <View style={styles.scoreCircle}>
            <Ionicons name={emoji as any} size={48} color={emojiColor} />
            <Text style={styles.scoreText}>
              {result.score}/{result.total}
            </Text>
            <Text style={styles.scorePct}>{pct}%</Text>
          </View>

          <Text style={styles.messageText}>{message}</Text>

          {result.xpEarned > 0 && (
            <View style={styles.xpBox}>
              <Ionicons name="flash" size={20} color={Colors.accent} />
              <Text style={styles.xpText}>+{result.xpEarned} XP earned</Text>
            </View>
          )}

          {result.isPerfect && (
            <View style={[styles.xpBox, { backgroundColor: Colors.accent + "15" }]}>
              <Ionicons name="trophy" size={20} color={Colors.accent} />
              <Text style={[styles.xpText, { color: Colors.accent }]}>
                Perfect Score Bonus: +{50} XP
              </Text>
            </View>
          )}

          {/* Answer Review */}
          <Text style={styles.reviewTitle}>Answer Review</Text>
          {result.answers.map((a, i) => (
            <View
              key={a.questionId}
              style={[
                styles.reviewCard,
                { borderLeftColor: a.correct ? Colors.primary : Colors.error },
              ]}
            >
              <Text style={styles.reviewQ}>
                Q{i + 1}: {questions[i]?.questionText}
              </Text>
              <Text
                style={[
                  styles.reviewA,
                  { color: a.correct ? Colors.primary : Colors.error },
                ]}
              >
                {a.correct ? "Correct" : `Wrong — correct: ${questions[i]?.correctAnswer}`}
              </Text>
            </View>
          ))}

          <View style={styles.summaryActions}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => router.back()}
            >
              <Text style={styles.primaryBtnText}>Back to Lesson</Text>
            </Pressable>

            {pct < 100 && (
              <Pressable
                style={({ pressed }) => [
                  styles.outlineBtn,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => {
                  setAnswers([]);
                  setCurrentIndex(0);
                  setSelectedAnswer(null);
                  setIsCorrect(null);
                  setResult(null);
                  progressAnim.setValue(0);
                  loadQuiz();
                }}
              >
                <Text style={styles.outlineBtnText}>Retry Quiz</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </>
    );
  }

  // ============================================================
  // QUESTION / RESULT
  // ============================================================
  return (
    <>
      <Stack.Screen options={{ title: title ? `Quiz: ${title}` : "Quiz" }} />
      <View style={styles.container}>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>

        <Text style={styles.questionCounter}>
          Question {currentIndex + 1} of {questions.length}
        </Text>

        <ScrollView
          style={styles.questionScroll}
          contentContainerStyle={styles.questionContent}
        >
          {/* Hadith preview */}
          {currentQ.hadithPreview && (
            <View style={styles.hadithPreview}>
              <Text style={styles.previewLabel}>Hadith</Text>
              <Text style={styles.previewText}>{currentQ.hadithPreview}</Text>
            </View>
          )}

          {/* Question */}
          <Text style={styles.questionText}>{currentQ.questionText}</Text>

          {/* Options */}
          {currentQ.options.map((option, i) => {
            const isSelected = selectedAnswer === option;
            const isCorrectAnswer = option === currentQ.correctAnswer;
            const showResult = phase === "result";

            let optionStyle = styles.option;
            let textStyle = styles.optionText;

            if (showResult && isCorrectAnswer) {
              optionStyle = { ...styles.option, ...styles.optionCorrect };
              textStyle = { ...styles.optionText, color: "#fff" };
            } else if (showResult && isSelected && !isCorrectAnswer) {
              optionStyle = { ...styles.option, ...styles.optionWrong };
              textStyle = { ...styles.optionText, color: "#fff" };
            } else if (isSelected) {
              optionStyle = { ...styles.option, ...styles.optionSelected };
            }

            return (
              <Pressable
                key={`${option}-${i}`}
                style={({ pressed }) => [
                  optionStyle,
                  !showResult && pressed && { opacity: 0.85 },
                ]}
                onPress={() => handleSelectAnswer(option)}
                disabled={!!selectedAnswer}
              >
                <Text style={styles.optionLetter}>
                  {String.fromCharCode(65 + i)}
                </Text>
                <Text style={textStyle} numberOfLines={3}>
                  {option}
                </Text>
                {showResult && isCorrectAnswer && (
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                )}
                {showResult && isSelected && !isCorrectAnswer && (
                  <Ionicons name="close-circle" size={22} color="#fff" />
                )}
              </Pressable>
            );
          })}

          {/* Result feedback */}
          {phase === "result" && (
            <View style={styles.feedback}>
              <Ionicons
                name={isCorrect ? "checkmark-circle" : "close-circle"}
                size={28}
                color={isCorrect ? Colors.primary : Colors.error}
              />
              <Text
                style={[
                  styles.feedbackText,
                  { color: isCorrect ? Colors.primary : Colors.error },
                ]}
              >
                {isCorrect ? "Correct! +10 XP" : "Incorrect"}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Next button */}
        {phase === "result" && (
          <View style={styles.bottomBar}>
            <Pressable
              style={({ pressed }) => [
                styles.nextBtn,
                { opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={handleNext}
            >
              <Text style={styles.nextBtnText}>
                {currentIndex < questions.length - 1
                  ? "Next Question"
                  : "See Results"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </Pressable>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  backBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: { color: "#fff", fontWeight: "600" },

  // Progress
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  questionCounter: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Question
  questionScroll: { flex: 1 },
  questionContent: { padding: 16, paddingBottom: 100 },
  hadithPreview: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.text,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 20,
    lineHeight: 26,
  },

  // Options
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: 12,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "08",
  },
  optionCorrect: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  optionWrong: {
    borderColor: Colors.error,
    backgroundColor: Colors.error,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    textAlign: "center",
    lineHeight: 28,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },

  // Feedback
  feedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    padding: 14,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: "700",
  },

  // Bottom bar
  bottomBar: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Summary
  summaryContent: {
    alignItems: "center",
    padding: 24,
    paddingBottom: 40,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 4,
  },
  scorePct: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  messageText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  xpBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary + "10",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  xpText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    alignSelf: "flex-start",
    marginTop: 20,
    marginBottom: 10,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    width: "100%",
  },
  reviewQ: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500",
    marginBottom: 4,
  },
  reviewA: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryActions: {
    width: "100%",
    marginTop: 20,
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  outlineBtnText: { color: Colors.primary, fontSize: 16, fontWeight: "700" },
});
