import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ADVANCED_QUESTIONS,
  ADVANCED_CATEGORIES,
  type AdvancedQuestion,
  type LogicGridQuestion,
  type CodeBreakerQuestion,
  type NumberPyramidQuestion,
  type ChoiceQuestion,
} from '../data/advancedLogicMath';
import { playCorrectSound, playWrongSound } from '../lib/gameAudio';
import { playMiniGameSound } from '../lib/minigameSounds';

const STORAGE_KEY = 'trang-toan:advanced-logic-v3';

export default function AdvancedLogicMathGame() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [fontSizePercent, setFontSizePercent] = useState<number>(100);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<'correct' | 'wrong' | null>(null);

  // Lưu trạng thái bảng logic grid: Record<questionId, Record<`${row}-${col}`, 'check' | 'cross' | ''>>
  const [gridState, setGridState] = useState<Record<string, Record<string, 'check' | 'cross' | ''>>>({});

  // Lưu trạng thái Phá khóa mật mã: Record<questionId, string[]>
  const [codeBreakerState, setCodeBreakerState] = useState<Record<string, string[]>>({});

  // Lưu trạng thái Tháp số: Record<questionId, Record<`${row}-${col}`, string>>
  const [pyramidState, setPyramidState] = useState<Record<string, Record<string, string>>>({});

  // Lưu đáp án trắc nghiệm: Record<questionId, string | number>
  const [choiceState, setChoiceState] = useState<Record<string, string | number>>({});

  // Lưu các câu đã hoàn thành: Record<questionId, boolean>
  const [completedQuestions, setCompletedQuestions] = useState<Record<string, boolean>>({});

  // Tải tiến độ từ localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.completed) setCompletedQuestions(parsed.completed);
        if (parsed.gridState) setGridState(parsed.gridState);
        if (parsed.choiceState) setChoiceState(parsed.choiceState);
      }
    } catch {}
  }, []);

  const saveProgress = useCallback((newCompleted: Record<string, boolean>) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          completed: newCompleted,
          gridState,
          choiceState,
        })
      );
    } catch {}
  }, [gridState, choiceState]);

  // Lọc câu hỏi theo danh mục
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'all') return ADVANCED_QUESTIONS;
    return ADVANCED_QUESTIONS.filter((q) => q.type === selectedCategory);
  }, [selectedCategory]);

  const currentQuestion: AdvancedQuestion = filteredQuestions[currentIndex] || filteredQuestions[0] || ADVANCED_QUESTIONS[0];

  // Khởi tạo trạng thái Code Breaker nếu chưa có
  useEffect(() => {
    if (currentQuestion && currentQuestion.type === 'code-breaker') {
      const q = currentQuestion as CodeBreakerQuestion;
      if (!codeBreakerState[q.id]) {
        setCodeBreakerState((prev) => ({ ...prev, [q.id]: Array(q.digitsCount).fill('0') }));
      }
    }
  }, [currentQuestion, codeBreakerState]);

  // Reset trạng thái khi đổi câu
  useEffect(() => {
    setShowHelp(false);
    setShowAnswer(false);
    setValidationResult(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentQuestion.id]);

  // Phóng to / thu nhỏ cỡ chữ
  const handleZoom = (delta: number) => {
    setFontSizePercent((prev) => Math.min(130, Math.max(85, prev + delta)));
  };

  // Đọc âm thanh giọng nói (TTS)
  const speakText = (lang: 'vi-VN' | 'en-US') => {
    if (!('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    let textToSpeak = '';
    if (lang === 'vi-VN') {
      textToSpeak = currentQuestion.title;
      if ('clues' in currentQuestion && currentQuestion.clues) {
        textToSpeak += '. ' + currentQuestion.clues.join('. ');
      }
    } else {
      textToSpeak = currentQuestion.titleEn || currentQuestion.title;
      if ('cluesEn' in currentQuestion && (currentQuestion as any).cluesEn) {
        textToSpeak += '. ' + (currentQuestion as any).cluesEn.join('. ');
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Tương tác ô Logic Grid: Trống -> Check (✓) -> Cross (✗) -> Trống
  const handleCellClick = (row: string, col: string) => {
    playMiniGameSound('step');
    const qId = currentQuestion.id;
    const currentQuestionGrid = gridState[qId] || {};
    const currentVal = currentQuestionGrid[`${row}-${col}`] || '';

    let nextVal: 'check' | 'cross' | '' = 'check';
    if (currentVal === 'check') nextVal = 'cross';
    else if (currentVal === 'cross') nextVal = '';

    const newQGrid = { ...currentQuestionGrid, [`${row}-${col}`]: nextVal };
    setGridState({ ...gridState, [qId]: newQGrid });
    setValidationResult(null);
  };

  // Tương tác chữ số Code Breaker
  const handleCodeDigitChange = (index: number, delta: number) => {
    playMiniGameSound('step');
    const qId = currentQuestion.id;
    const currentDigits = [...(codeBreakerState[qId] || ['0', '0', '0'])];
    const num = (parseInt(currentDigits[index] || '0', 10) + delta + 10) % 10;
    currentDigits[index] = String(num);
    setCodeBreakerState({ ...codeBreakerState, [qId]: currentDigits });
    setValidationResult(null);
  };

  // Tương tác ô Tháp Số
  const handlePyramidChange = (r: number, c: number, val: string) => {
    const qId = currentQuestion.id;
    const currentP = { ...(pyramidState[qId] || {}) };
    currentP[`${r}-${c}`] = val;
    setPyramidState({ ...pyramidState, [qId]: currentP });
    setValidationResult(null);
  };

  // Chọn đáp án trắc nghiệm
  const handleSelectChoice = (option: string | number) => {
    playMiniGameSound('step');
    const qId = currentQuestion.id;
    setChoiceState((prev) => ({ ...prev, [qId]: option }));
    setValidationResult(null);
  };

  // Kiểm tra đáp án
  const handleCheckAnswer = () => {
    if (currentQuestion.type === 'logic-grid') {
      const q = currentQuestion as LogicGridQuestion;
      const qGrid = gridState[q.id] || {};
      let isAllCorrect = true;

      for (const row of q.rows) {
        const expectedCol = q.solution[row];
        const userChecked = qGrid[`${row}-${expectedCol}`] === 'check';
        if (!userChecked) {
          isAllCorrect = false;
          break;
        }

        for (const col of q.cols) {
          if (col !== expectedCol && qGrid[`${row}-${col}`] === 'check') {
            isAllCorrect = false;
            break;
          }
        }
      }

      if (isAllCorrect) {
        setValidationResult('correct');
        setShowAnswer(true);
        playCorrectSound();
        const updated = { ...completedQuestions, [q.id]: true };
        setCompletedQuestions(updated);
        saveProgress(updated);
      } else {
        setValidationResult('wrong');
        playWrongSound();
      }
    } else if (currentQuestion.type === 'code-breaker') {
      const q = currentQuestion as CodeBreakerQuestion;
      const currentDigits = (codeBreakerState[q.id] || ['0', '0', '0']).join('');
      if (currentDigits === q.correctCode) {
        setValidationResult('correct');
        setShowAnswer(true);
        playCorrectSound();
        const updated = { ...completedQuestions, [q.id]: true };
        setCompletedQuestions(updated);
        saveProgress(updated);
      } else {
        setValidationResult('wrong');
        playWrongSound();
      }
    } else if (currentQuestion.type === 'number-pyramid') {
      const q = currentQuestion as NumberPyramidQuestion;
      const userP = pyramidState[q.id] || {};
      let allCorrect = true;

      q.pyramidRows.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell === null) {
            const entered = parseInt(userP[`${r}-${c}`] || '', 10);
            if (entered !== q.solutionRows[r][c]) {
              allCorrect = false;
            }
          }
        });
      });

      if (allCorrect) {
        setValidationResult('correct');
        setShowAnswer(true);
        playCorrectSound();
        const updated = { ...completedQuestions, [q.id]: true };
        setCompletedQuestions(updated);
        saveProgress(updated);
      } else {
        setValidationResult('wrong');
        playWrongSound();
      }
    } else {
      // Các câu hỏi trắc nghiệm
      const q = currentQuestion as ChoiceQuestion;
      const userChoice = choiceState[q.id];
      if (userChoice !== undefined && String(userChoice) === String(q.correctAnswer)) {
        setValidationResult('correct');
        setShowAnswer(true);
        playCorrectSound();
        const updated = { ...completedQuestions, [q.id]: true };
        setCompletedQuestions(updated);
        saveProgress(updated);
      } else {
        setValidationResult('wrong');
        playWrongSound();
      }
    }
  };

  // Reset nháp câu hiện tại
  const handleResetCurrent = () => {
    playMiniGameSound('reset');
    const qId = currentQuestion.id;
    if (currentQuestion.type === 'logic-grid') {
      setGridState((prev) => {
        const copy = { ...prev };
        delete copy[qId];
        return copy;
      });
    } else if (currentQuestion.type === 'code-breaker') {
      setCodeBreakerState((prev) => {
        const copy = { ...prev };
        delete copy[qId];
        return copy;
      });
    } else if (currentQuestion.type === 'number-pyramid') {
      setPyramidState((prev) => {
        const copy = { ...prev };
        delete copy[qId];
        return copy;
      });
    } else {
      setChoiceState((prev) => {
        const copy = { ...prev };
        delete copy[qId];
        return copy;
      });
    }
    setValidationResult(null);
    setShowAnswer(false);
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNextQuestion = () => {
    if (currentIndex < filteredQuestions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const completedCount = useMemo(() => {
    return Object.values(completedQuestions).filter(Boolean).length;
  }, [completedQuestions]);

  return (
    <div
      className="mx-auto max-w-5xl px-3 sm:px-6 py-6 text-slate-800 dark:text-slate-100 transition-all"
      style={{ fontSize: `${fontSizePercent}%` }}
    >
      {/* Top Banner Card */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <span>🧠 Hạng mục Nâng cao</span>
              <span>·</span>
              <span>Toán Tư Duy & IQ Tiểu Học</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
              Toán Tư Duy & Suy Luận IQ Tiểu Học
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-indigo-100 max-w-xl">
              Hệ thống bài tập tư duy logic theo sách 1001 Bài toán tư duy tiểu học: toán que diêm, xếp hàng & bậc thang, khoảng cách trồng cây, biểu đồ Venn, xem đồng hồ & lịch tuần, tháp số và toán thám tử.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shrink-0">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="text-[11px] font-bold uppercase text-amber-300">Tiến độ nâng cao</div>
              <div className="text-lg font-black">
                {completedCount} / {ADVANCED_QUESTIONS.length} câu hoàn thành
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-white/20">
          {ADVANCED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white text-indigo-900 shadow-md scale-105 font-black'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        {/* Toolbar Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Pill Số Câu */}
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-violet-600 text-white font-black text-sm shadow-sm">
              Câu {currentQuestion.questionNumber}
            </span>

            {/* Tên danh mục rõ ràng thân thiện (không còn slug kiểu sudoku-bieu-tuong) */}
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-200/60 dark:border-amber-800/40">
              {currentQuestion.categoryTitle}
            </span>

            {/* Zoom Controls */}
            <div className="inline-flex items-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs">
              <button
                type="button"
                onClick={() => handleZoom(-10)}
                className="px-2 py-1 hover:text-indigo-600 dark:hover:text-indigo-400 font-black cursor-pointer"
                title="Thu nhỏ chữ"
              >
                -
              </button>
              <span className="px-1.5 select-none">{fontSizePercent}%</span>
              <button
                type="button"
                onClick={() => handleZoom(10)}
                className="px-2 py-1 hover:text-indigo-600 dark:hover:text-indigo-400 font-black cursor-pointer"
                title="Phóng to chữ"
              >
                +
              </button>
            </div>

            {/* TTS Tiếng Việt */}
            <button
              type="button"
              onClick={() => speakText('vi-VN')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md animate-pulse'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
              }`}
            >
              <span>🔊</span>
              <span>Đọc bài</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold transition cursor-pointer hover:bg-amber-100"
            >
              <span>💡</span>
              <span>Gợi ý</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAnswer(!showAnswer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition cursor-pointer hover:bg-emerald-100"
            >
              <span>📖</span>
              <span>Lời giải</span>
            </button>
          </div>
        </div>

        {/* Question Body */}
        <div className="p-5 sm:p-7">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-relaxed">
            {currentQuestion.title}
          </h2>

          {/* Dữ kiện manh mối nếu có */}
          {'clues' in currentQuestion && currentQuestion.clues && currentQuestion.clues.length > 0 && (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-indigo-200/90 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 sm:p-5">
              <div className="space-y-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                {currentQuestion.clues.map((clue, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {clue}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* DẠNG: TOÁN QUE DIÊM (MATCHSTICK) */}
          {currentQuestion.type === 'matchstick' && (
            <div className="mt-6 max-w-xl mx-auto flex flex-col items-center">
              {(currentQuestion as ChoiceQuestion).visualContent && (
                <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800/60 text-center mb-6 w-full shadow-inner">
                  <div className="text-4xl sm:text-5xl font-mono font-black text-amber-900 dark:text-amber-200 tracking-wider">
                    {(currentQuestion as ChoiceQuestion).visualContent?.data.equation}
                  </div>
                  <div className="mt-3 text-xs sm:text-sm font-bold text-amber-800 dark:text-amber-300">
                    🥢 {(currentQuestion as ChoiceQuestion).visualContent?.data.moveClue}
                  </div>
                </div>
              )}
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                Chọn câu trả lời đúng:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {(currentQuestion as ChoiceQuestion).options.map((opt) => {
                  const isSelected = choiceState[currentQuestion.id] === opt;
                  const isCorrect = (currentQuestion as ChoiceQuestion).correctAnswer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectChoice(opt)}
                      className={`p-4 rounded-2xl border-2 font-black text-base sm:text-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? showAnswer && isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                            : 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                          : showAnswer && isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DẠNG: BÀI TOÁN XẾP HÀNG & BẬC THANG (LINEUP) */}
          {currentQuestion.type === 'lineup-logic' && (
            <div className="mt-6 max-w-xl mx-auto flex flex-col items-center">
              {(currentQuestion as ChoiceQuestion).visualContent && (
                <div className="p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800 text-center mb-6 w-full">
                  <div className="flex items-center justify-center gap-2 sm:gap-4 text-3xl sm:text-4xl py-2">
                    <span>🚶‍♂️</span>
                    <span>🚶‍♀️</span>
                    <span>🧍‍♂️</span>
                    <span>⭐</span>
                    <span>🧍‍♀️</span>
                    <span>🚶‍♂️</span>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    Sơ đồ hàng dọc / bậc thang mô phỏng theo bài toán
                  </div>
                </div>
              )}
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                Chọn kết quả đúng:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {(currentQuestion as ChoiceQuestion).options.map((opt) => {
                  const isSelected = choiceState[currentQuestion.id] === opt;
                  const isCorrect = (currentQuestion as ChoiceQuestion).correctAnswer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectChoice(opt)}
                      className={`p-4 rounded-2xl border-2 font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? showAnswer && isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                            : 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                          : showAnswer && isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DẠNG: BÀI TOÁN TRỒNG CÂY (TREE INTERVAL) */}
          {currentQuestion.type === 'tree-interval' && (
            <div className="mt-6 max-w-xl mx-auto flex flex-col items-center">
              <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800 text-center mb-6 w-full">
                <div className="flex items-center justify-center gap-3 sm:gap-6 text-3xl sm:text-4xl py-3">
                  <span>🌳</span>
                  <span className="text-xs font-bold text-emerald-600 border-b-2 border-dashed border-emerald-400 pb-1">khoảng cách</span>
                  <span>🌳</span>
                  <span className="text-xs font-bold text-emerald-600 border-b-2 border-dashed border-emerald-400 pb-1">khoảng cách</span>
                  <span>🌳</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">
                  Ghi nhớ tư duy: Số khoảng cách = Số cây - 1
                </div>
              </div>

              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                Chọn kết quả đúng:
              </p>
              <div className="grid grid-cols-2 gap-3 w-full">
                {(currentQuestion as ChoiceQuestion).options.map((opt) => {
                  const isSelected = choiceState[currentQuestion.id] === opt;
                  const isCorrect = (currentQuestion as ChoiceQuestion).correctAnswer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectChoice(opt)}
                      className={`p-4 rounded-2xl border-2 font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? showAnswer && isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                            : 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                          : showAnswer && isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DẠNG: BIỂU ĐỒ VENN (VENN DIAGRAM) */}
          {currentQuestion.type === 'venn-diagram' && (
            <div className="mt-6 max-w-xl mx-auto flex flex-col items-center">
              <div className="p-6 rounded-3xl bg-sky-50 dark:bg-sky-950/40 border-2 border-sky-200 dark:border-sky-800 text-center mb-6 w-full">
                <div className="flex items-center justify-center gap-[-20px] relative py-4">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-blue-400 bg-blue-100/60 dark:bg-blue-900/40 flex items-center justify-center text-xs font-black text-blue-900 dark:text-blue-200 text-center p-2 -mr-6 shadow-sm">
                    Tập hợp A
                  </div>
                  <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/40 flex items-center justify-center text-xs font-black text-emerald-900 dark:text-emerald-200 text-center p-2 -ml-6 shadow-sm">
                    Tập hợp B
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-bold text-sky-800 dark:text-sky-300">
                  Phần ở giữa là phần giao nhau (thỏa mãn cả 2 điều kiện)
                </div>
              </div>

              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                Chọn kết quả phân loại:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {(currentQuestion as ChoiceQuestion).options.map((opt) => {
                  const isSelected = choiceState[currentQuestion.id] === opt;
                  const isCorrect = (currentQuestion as ChoiceQuestion).correctAnswer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectChoice(opt)}
                      className={`p-4 rounded-2xl border-2 font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? showAnswer && isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                            : 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                          : showAnswer && isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DẠNG: ĐỒNG HỒ & LỊCH TUẦN (CALENDAR & CLOCK) */}
          {currentQuestion.type === 'calendar-clock' && (
            <div className="mt-6 max-w-xl mx-auto flex flex-col items-center">
              <div className="p-5 rounded-3xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-200 dark:border-purple-800 text-center mb-6 w-full">
                <div className="flex items-center justify-center gap-4 text-4xl sm:text-5xl py-2">
                  <span>⏰</span>
                  <span>🗓️</span>
                </div>
                <div className="mt-2 text-xs sm:text-sm font-bold text-purple-800 dark:text-purple-300">
                  Đồng hồ kim, đồng hồ điện tử và chu kỳ các ngày trong tuần
                </div>
              </div>

              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                Chọn đáp án đúng:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {(currentQuestion as ChoiceQuestion).options.map((opt) => {
                  const isSelected = choiceState[currentQuestion.id] === opt;
                  const isCorrect = (currentQuestion as ChoiceQuestion).correctAnswer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectChoice(opt)}
                      className={`p-4 rounded-2xl border-2 font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? showAnswer && isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                            : 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                          : showAnswer && isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DẠNG: QUY LUẬT DÃY SỐ & DÃY HÌNH (PATTERN) */}
          {currentQuestion.type === 'pattern-matrix' && (
            <div className="mt-6 max-w-xl mx-auto flex flex-col items-center">
              <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-indigo-200 dark:border-indigo-900 text-center mb-6 w-full">
                <div className="text-2xl sm:text-3xl font-black text-indigo-700 dark:text-indigo-300 py-2">
                  {(currentQuestion as ChoiceQuestion).visualContent?.data?.pattern || '🧩 Quy luật tăng / giảm dần'}
                </div>
              </div>

              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                Chọn phương án tiếp theo:
              </p>
              <div className="grid grid-cols-2 gap-3 w-full">
                {(currentQuestion as ChoiceQuestion).options.map((opt) => {
                  const isSelected = choiceState[currentQuestion.id] === opt;
                  const isCorrect = (currentQuestion as ChoiceQuestion).correctAnswer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectChoice(opt)}
                      className={`p-4 rounded-2xl border-2 font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? showAnswer && isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                            : 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                          : showAnswer && isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DẠNG: ĐẾM HÌNH & KHỐI 3D (SHAPE COUNTING) */}
          {currentQuestion.type === 'shape-counting' && (
            <div className="mt-6 max-w-xl mx-auto flex flex-col items-center">
              <div className="p-5 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-800 text-center mb-6 w-full">
                <div className="flex items-center justify-center gap-4 text-4xl sm:text-5xl py-2">
                  <span>📐</span>
                  <span>🔺</span>
                  <span>🧊</span>
                </div>
                <div className="mt-2 text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-300">
                  Tư duy hình học trực quan & đếm các hình đơn, hình ghép
                </div>
              </div>

              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                Chọn số lượng hình:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {(currentQuestion as ChoiceQuestion).options.map((opt) => {
                  const isSelected = choiceState[currentQuestion.id] === opt;
                  const isCorrect = (currentQuestion as ChoiceQuestion).correctAnswer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectChoice(opt)}
                      className={`p-4 rounded-2xl border-2 font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? showAnswer && isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                            : 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                          : showAnswer && isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DẠNG: VẬT CHE CHỮ SỐ (SYMBOL SUBSTITUTE) */}
          {currentQuestion.type === 'symbol-substitute' && (
            <div className="mt-6 max-w-xl mx-auto flex flex-col items-center">
              {(currentQuestion as ChoiceQuestion).visualContent && (
                <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-center mb-6 w-full shadow-inner">
                  <div className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-200">
                    {(currentQuestion as ChoiceQuestion).visualContent?.data.line1}
                  </div>
                  {(currentQuestion as ChoiceQuestion).visualContent?.data.line2 && (
                    <div className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-200 mt-2">
                      {(currentQuestion as ChoiceQuestion).visualContent?.data.line2}
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                Chọn chữ số bí mật:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                {(currentQuestion as ChoiceQuestion).options.map((opt) => {
                  const isSelected = choiceState[currentQuestion.id] === opt;
                  const isCorrect = (currentQuestion as ChoiceQuestion).correctAnswer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectChoice(opt)}
                      className={`p-4 rounded-2xl border-2 font-black text-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? showAnswer && isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                            : 'bg-indigo-600 text-white border-indigo-700 shadow-md'
                          : showAnswer && isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* DẠNG: TOÁN THÁM TỬ (BẢNG LOGIC GRID) */}
          {currentQuestion.type === 'logic-grid' && (
            <div className="mt-8 flex flex-col items-center">
              <div className="overflow-x-auto w-full flex justify-center py-2">
                <table className="border-collapse border border-slate-400 dark:border-slate-600 shadow-md rounded-2xl overflow-hidden bg-white dark:bg-slate-800 text-center">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-black text-sm sm:text-base">
                      <th className="border border-slate-300 dark:border-slate-600 px-4 sm:px-6 py-3 w-28 sm:w-36 text-center">
                        {(currentQuestion as LogicGridQuestion).rowHeader}
                      </th>
                      {(currentQuestion as LogicGridQuestion).cols.map((col) => (
                        <th
                          key={col}
                          className="border border-slate-300 dark:border-slate-600 px-4 sm:px-6 py-3 min-w-[90px] sm:min-w-[110px] text-center"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(currentQuestion as LogicGridQuestion).rows.map((row) => (
                      <tr key={row} className="hover:bg-slate-50/60 dark:hover:bg-slate-750 transition-colors">
                        <td className="border border-slate-300 dark:border-slate-600 px-4 py-3 font-bold text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-750">
                          {row}
                        </td>
                        {(currentQuestion as LogicGridQuestion).cols.map((col) => {
                          const cellKey = `${row}-${col}`;
                          const cellVal = (gridState[currentQuestion.id] || {})[cellKey] || '';
                          const isExpectedMatch = (currentQuestion as LogicGridQuestion).solution[row] === col;

                          return (
                            <td
                              key={col}
                              onClick={() => handleCellClick(row, col)}
                              className={`border border-slate-300 dark:border-slate-600 h-14 sm:h-16 w-20 sm:w-28 text-center text-2xl font-black cursor-pointer select-none transition-all active:scale-95 ${
                                cellVal === 'check'
                                  ? showAnswer && isExpectedMatch
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold'
                                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                                  : cellVal === 'cross'
                                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-black'
                                  : showAnswer && isExpectedMatch
                                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-500/50'
                                  : 'hover:bg-indigo-50/30'
                              }`}
                            >
                              {cellVal === 'check' && <span>✓</span>}
                              {cellVal === 'cross' && <span>✗</span>}
                              {!cellVal && showAnswer && isExpectedMatch && (
                                <span className="text-emerald-400/60 text-lg">✓</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5">
                <span>👉</span>
                <span>Chạm 1 lần để đánh ✓ (đúng), chạm lần nữa để đánh ✗ (loại trừ), chạm lần ba để xoá</span>
              </p>
            </div>
          )}

          {/* DẠNG: PHÁ KHÓA MẬT MÃ (CODE BREAKER) */}
          {currentQuestion.type === 'code-breaker' && (() => {
            const q = currentQuestion as CodeBreakerQuestion;
            const currentDigits = codeBreakerState[q.id] || Array(q.digitsCount).fill('0');

            return (
              <div className="mt-6 max-w-2xl mx-auto">
                {/* Dải gợi ý dạng scanner */}
                <div className="space-y-2.5 mb-6">
                  {q.clueStrips.map((strip, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-xl px-3 py-1 bg-slate-900 text-amber-400 rounded-xl tracking-widest">
                          {strip.code}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                          {strip.description}
                        </span>
                      </div>
                      <span className="self-start sm:self-auto text-[11px] font-black px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {strip.badge}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Ổ khóa xoay số tương tác */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-indigo-500/20 border-2 border-amber-400/60 dark:border-amber-600/60 text-center shadow-inner">
                  <div className="text-4xl mb-2">
                    {validationResult === 'correct' ? '🔓' : '🔐'}
                  </div>
                  <div className="text-xs font-black uppercase text-amber-800 dark:text-amber-300 tracking-wider mb-4">
                    Xoay các con số để mở khóa rương
                  </div>

                  <div className="flex items-center justify-center gap-4 sm:gap-6">
                    {currentDigits.map((digit, dIdx) => (
                      <div key={dIdx} className="flex flex-col items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCodeDigitChange(dIdx, 1)}
                          className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-white font-black text-base shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          ▲
                        </button>
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-slate-900 text-amber-400 font-mono font-black text-3xl sm:text-4xl flex items-center justify-center shadow-lg border-2 border-amber-400">
                          {digit}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCodeDigitChange(dIdx, -1)}
                          className="h-9 w-9 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-white font-black text-base shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* DẠNG: THÁP SỐ KIM TỰ THÁP (NUMBER PYRAMID) */}
          {currentQuestion.type === 'number-pyramid' && (() => {
            const q = currentQuestion as NumberPyramidQuestion;
            const userP = pyramidState[q.id] || {};

            return (
              <div className="mt-6 max-w-xl mx-auto flex flex-col items-center">
                <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 w-full">
                  {q.pyramidRows.map((row, r) => (
                    <div key={r} className="flex items-center gap-2 justify-center">
                      {row.map((cell, c) => {
                        const isPreset = cell !== null;
                        const cellKey = `${r}-${c}`;
                        const enteredVal = userP[cellKey] || '';
                        const isCorrect = showAnswer && parseInt(enteredVal, 10) === q.solutionRows[r][c];

                        return (
                          <div key={c} className="flex items-center justify-center">
                            {isPreset ? (
                              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-amber-400 text-slate-950 font-black text-lg sm:text-xl flex items-center justify-center shadow-md">
                                {cell}
                              </div>
                            ) : (
                              <input
                                type="number"
                                value={showAnswer ? q.solutionRows[r][c] : enteredVal}
                                onChange={(e) => handlePyramidChange(r, c, e.target.value)}
                                placeholder="?"
                                className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl text-center font-black text-lg sm:text-xl border-2 outline-none shadow-sm transition-all ${
                                  isCorrect || showAnswer
                                    ? 'bg-emerald-100 border-emerald-500 text-emerald-800 font-extrabold'
                                    : 'bg-white dark:bg-slate-700 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Gợi ý khi bấm nút Gợi ý */}
          {showHelp && (
            <div className="mt-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">💡</span>
                <div>
                  <h4 className="font-black text-amber-800 dark:text-amber-300 text-sm uppercase tracking-wide">
                    Gợi ý tư duy:
                  </h4>
                  <p className="mt-1 text-sm font-medium text-amber-900 dark:text-amber-200 leading-relaxed">
                    {currentQuestion.hint}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Phản hồi kết quả sau khi kiểm tra */}
          {validationResult && (
            <div
              className={`mt-6 rounded-2xl p-4 sm:p-5 flex items-center gap-3 ${
                validationResult === 'correct'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              <span className="text-3xl">
                {validationResult === 'correct' ? '🎉' : '🤔'}
              </span>
              <div>
                <div className="font-black text-base">
                  {validationResult === 'correct'
                    ? 'Chính xác xuất sắc! Bé đã suy luận rất đúng!'
                    : 'Chưa chính xác hoặc còn thiếu ô, bé thử suy luận lại nhé!'}
                </div>
                <div className="text-xs mt-0.5 opacity-90">
                  {validationResult === 'correct'
                    ? 'Hãy xem lời giải từng bước bên dưới hoặc bấm Câu tiếp theo để sang thử thách mới.'
                    : 'Bấm nút "💡 Gợi ý" nếu bé cần một gợi ý nhỏ.'}
                </div>
              </div>
            </div>
          )}

          {/* Lời giải chi tiết khi bấm Xem đáp án */}
          {showAnswer && (
            <div className="mt-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300/80 dark:border-emerald-800/60 p-5">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-sm uppercase tracking-wider mb-2">
                <span>📖</span>
                <span>Lời giải chi tiết & Các bước suy luận:</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                {currentQuestion.explanation}
              </p>

              {'explanationSteps' in currentQuestion &&
                (currentQuestion as any).explanationSteps && (
                  <div className="mt-3 space-y-1.5 border-t border-emerald-200 dark:border-emerald-800/40 pt-3">
                    {(currentQuestion as any).explanationSteps.map((step: string, sIdx: number) => (
                      <div key={sIdx} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">▸</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Thanh Điều Hướng Đáy Câu Hỏi */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
          <button
            type="button"
            onClick={handlePrevQuestion}
            disabled={currentIndex === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-sm transition-all cursor-pointer ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>←</span>
            <span>Câu trước</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetCurrent}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              🔄 Xoá nháp
            </button>

            <button
              type="button"
              onClick={handleCheckAnswer}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs sm:text-sm shadow-md shadow-violet-600/20 active:scale-95 transition cursor-pointer"
            >
              Kiểm tra đáp án
            </button>
          </div>

          <button
            type="button"
            onClick={handleNextQuestion}
            disabled={currentIndex === filteredQuestions.length - 1}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white font-black text-sm shadow-md shadow-violet-600/20 transition-all cursor-pointer ${
              currentIndex === filteredQuestions.length - 1
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-violet-500 active:scale-95'
            }`}
          >
            <span>Câu tiếp theo</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Danh sách câu hỏi Nâng cao */}
      <div className="mt-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <span>🎯</span>
          <span>Danh sách câu hỏi Nâng cao ({filteredQuestions.length} câu)</span>
        </h3>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {filteredQuestions.map((q, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = completedQuestions[q.id];

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-11 w-11 rounded-2xl font-black text-sm transition-all cursor-pointer flex items-center justify-center relative ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-400 scale-105'
                    : isCompleted
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{q.questionNumber}</span>
                {isCompleted && !isActive && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white font-bold">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
