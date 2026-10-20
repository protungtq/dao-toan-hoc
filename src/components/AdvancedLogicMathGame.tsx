import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ADVANCED_QUESTIONS,
  ADVANCED_CATEGORIES,
  type AdvancedQuestion,
  type LogicGridQuestion,
  type OrderComparisonQuestion,
  type ScaleBalanceQuestion,
  type PatternMatrixQuestion,
  type TruthLieQuestion
} from '../data/advancedLogicMath';
import { playCorrectSound, playWrongSound, playFinalSound } from '../lib/gameAudio';
import { playMiniGameSound } from '../lib/minigameSounds';

const STORAGE_KEY = 'trang-toan:advanced-logic-v1';

export default function AdvancedLogicMathGame() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [fontSizePercent, setFontSizePercent] = useState<number>(100);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<'correct' | 'wrong' | null>(null);

  // Lưu trạng thái bảng logic grid cho từng câu: Record<questionId, Record<`${row}-${col}`, 'check' | 'cross' | ''>>
  const [gridState, setGridState] = useState<Record<string, Record<string, 'check' | 'cross' | ''>>>({});

  // Lưu đáp án trắc nghiệm cho các câu còn lại: Record<questionId, string | number>
  const [choiceState, setChoiceState] = useState<Record<string, string | number>>({});

  // Lưu danh sách các câu đã làm đúng: Record<questionId, boolean>
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

  // Lưu tiến độ vào localStorage
  const saveProgress = useCallback((newCompleted: Record<string, boolean>) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          completed: newCompleted,
          gridState,
          choiceState
        })
      );
    } catch {}
  }, [gridState, choiceState]);

  // Danh sách câu hỏi theo bộ lọc
  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'all') return ADVANCED_QUESTIONS;
    return ADVANCED_QUESTIONS.filter((q) => q.type === selectedCategory);
  }, [selectedCategory]);

  const currentQuestion: AdvancedQuestion = filteredQuestions[currentIndex] || filteredQuestions[0];

  // Reset các trạng thái tạm khi đổi câu
  useEffect(() => {
    setShowHelp(false);
    setShowAnswer(false);
    setValidationResult(null);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentQuestion.id]);

  // Đổi kích thước chữ
  const handleZoom = (delta: number) => {
    setFontSizePercent((prev) => Math.min(130, Math.max(85, prev + delta)));
  };

  // Đọc âm thanh (TTS)
  const speakText = (lang: 'vi-VN' | 'en-US') => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt không hỗ trợ tính năng đọc giọng nói tự động.');
      return;
    }

    window.speechSynthesis.cancel();

    let textToSpeak = '';
    if (lang === 'vi-VN') {
      textToSpeak = currentQuestion.title;
      if ('clues' in currentQuestion && currentQuestion.clues) {
        textToSpeak += '. ' + currentQuestion.clues.join('. ');
      }
      if ('statements' in currentQuestion && currentQuestion.statements) {
        textToSpeak += '. ' + currentQuestion.statements.map((s) => `${s.speaker} nói: ${s.statement}`).join('. ');
      }
    } else {
      textToSpeak = currentQuestion.titleEn;
      if ('cluesEn' in currentQuestion && currentQuestion.cluesEn) {
        textToSpeak += '. ' + currentQuestion.cluesEn.join('. ');
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

  // Tương tác với ô bảng logic grid: Click để xoay vòng: Trống -> Check (✓) -> Cross (X) -> Trống
  const handleCellClick = (row: string, col: string) => {
    playMiniGameSound('step');
    const qId = currentQuestion.id;
    const cellKey = `${row}-${col}`;
    const currentQuestionGrid = gridState[qId] || {};
    const currentVal = currentQuestionGrid[cellKey] || '';

    let nextVal: 'check' | 'cross' | '' = 'check';
    if (currentVal === 'check') nextVal = 'cross';
    else if (currentVal === 'cross') nextVal = '';

    const newQGrid = { ...currentQuestionGrid, [cellKey]: nextVal };
    const newAllGrids = { ...gridState, [qId]: newQGrid };
    setGridState(newAllGrids);
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

      // Mỗi hàng phải có đúng ô thuộc tính theo lời giải
      for (const row of q.rows) {
        const expectedCol = q.solution[row];
        const userChecked = qGrid[`${row}-${expectedCol}`] === 'check';
        if (!userChecked) {
          isAllCorrect = false;
          break;
        }

        // Các ô khác trong cùng hàng không được đánh check
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
    } else {
      // Các dạng khác
      const selected = choiceState[currentQuestion.id];
      const correct = (currentQuestion as any).correctAnswer;

      if (String(selected).trim() === String(correct).trim()) {
        setValidationResult('correct');
        setShowAnswer(true);
        playCorrectSound();
        const updated = { ...completedQuestions, [currentQuestion.id]: true };
        setCompletedQuestions(updated);
        saveProgress(updated);
      } else {
        setValidationResult('wrong');
        playWrongSound();
      }
    }
  };

  // Đặt lại / xoá nháp câu hiện tại
  const handleResetCurrent = () => {
    playMiniGameSound('miss');
    const qId = currentQuestion.id;
    setGridState((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
    setChoiceState((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
    setValidationResult(null);
    setShowAnswer(false);
  };

  // Chuyển câu trước / sau
  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Tổng số câu đã hoàn thành
  const completedCount = useMemo(() => {
    return Object.values(completedQuestions).filter(Boolean).length;
  }, [completedQuestions]);

  return (
    <div
      className="mx-auto max-w-5xl px-3 sm:px-6 py-6 text-slate-800 dark:text-slate-100 transition-all"
      style={{ fontSize: `${fontSizePercent}%` }}
    >
      {/* Top Header Card: Title, Badge & Category Selector */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-md">
              <span>🧠 Hạng mục Nâng cao</span>
              <span>·</span>
              <span>Toán Tư Duy & Suy Luận</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">
              Toán Thám Tử & Suy Luận Logic
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-indigo-100 max-w-xl">
              Rèn luyện tư duy logic phản biện, phương pháp loại trừ theo bảng và các dạng toán tư duy nâng cao chuẩn quốc tế.
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white text-indigo-900 shadow-md scale-102'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Exercise Card (Giao diện chuẩn như trong ảnh mẫu) */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        {/* Thanh công cụ đỉnh câu hỏi (Toolbar khớp 100% với ảnh đính kèm) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Pill Số Câu: Câu 1, Câu 2... */}
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-violet-600 text-white font-black text-sm shadow-sm">
              Câu {currentQuestion.questionNumber}
            </span>

            {/* Tag loại câu hỏi */}
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-200/60 dark:border-amber-800/40">
              {currentQuestion.tag}
            </span>

            {/* Bộ điều chỉnh kích thước phóng to / thu nhỏ: - 100% + */}
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

            {/* Nút Đọc Tiếng Việt */}
            <button
              type="button"
              onClick={() => speakText('vi-VN')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md animate-pulse'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40'
              }`}
            >
              <span>🔊</span>
              <span>Đọc TV</span>
            </button>

            {/* Nút Đọc Tiếng Anh */}
            <button
              type="button"
              onClick={() => speakText('en-US')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-xs font-bold transition-all cursor-pointer"
            >
              <span>🔊</span>
              <span>Read Eng</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Nút Xem đáp án */}
            <button
              type="button"
              onClick={() => {
                setShowAnswer(!showAnswer);
                playMiniGameSound('collect');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <span>✓</span>
              <span>{showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}</span>
            </button>

            {/* Nút Trợ giúp */}
            <button
              type="button"
              onClick={() => {
                setShowHelp(!showHelp);
                playMiniGameSound('step');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <span>💡</span>
              <span>Trợ giúp</span>
            </button>
          </div>
        </div>

        {/* Nội dung câu hỏi chính */}
        <div className="p-6 sm:p-8">
          {/* Đề bài (Typography đậm rõ ràng) */}
          <h2 className="text-lg sm:text-xl font-bold leading-relaxed text-slate-900 dark:text-white">
            {currentQuestion.title}
          </h2>

          {/* Khung Dữ kiện / Manh mối suy luận (Khớp thiết kế nét đứt nền tím nhạt trong ảnh) */}
          {'clues' in currentQuestion && currentQuestion.clues && currentQuestion.clues.length > 0 && (
            <div className="mt-5 rounded-2xl border-2 border-dashed border-indigo-200/90 dark:border-indigo-800/80 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 sm:p-5">
              <div className="space-y-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                {currentQuestion.clues.map((clue, idx) => (
                  <p key={idx} className="leading-relaxed">
                    {clue}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* DẠNG 1: BẢNG SUY LUẬN LOGIC GRID (TOÁN THÁM TỬ) */}
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

              {/* Hướng dẫn tương tác (Khớp ghi chú bàn tay chỉ trong ảnh mẫu) */}
              <p className="mt-4 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5">
                <span>👉</span>
                <span>Chạm 1 lần để đánh ✓, chạm lần nữa để đánh X (nháp), chạm lần ba để xoá</span>
              </p>
            </div>
          )}

          {/* DẠNG 2: SUY LUẬN THỨ TỰ & XẾP HẠNG */}
          {currentQuestion.type === 'order-comparison' && (
            <div className="mt-8 max-w-xl mx-auto">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                Chọn phương án trả lời đúng:
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {(currentQuestion as OrderComparisonQuestion).options.map((opt) => {
                  const isSelected = choiceState[currentQuestion.id] === opt;
                  const isCorrect = (currentQuestion as OrderComparisonQuestion).correctAnswer === opt;
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

          {/* DẠNG 3: CÂN THĂNG BẰNG LOGIC */}
          {currentQuestion.type === 'scale-balance' && (
            <div className="mt-8 max-w-2xl mx-auto">
              {(currentQuestion as ScaleBalanceQuestion).scaleVisual && (
                <div className="grid gap-3 sm:grid-cols-2 mb-6">
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-center">
                    <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                      Đĩa cân số 1 (Thăng bằng)
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-black">
                      <span className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xs">
                        {(currentQuestion as ScaleBalanceQuestion).scaleVisual?.left1}
                      </span>
                      <span>⚖️</span>
                      <span className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xs">
                        {(currentQuestion as ScaleBalanceQuestion).scaleVisual?.right1}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/50 text-center">
                    <div className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider mb-1">
                      Đĩa cân số 2 (Thăng bằng)
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-black">
                      <span className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xs">
                        {(currentQuestion as ScaleBalanceQuestion).scaleVisual?.left2}
                      </span>
                      <span>⚖️</span>
                      <span className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xs">
                        {(currentQuestion as ScaleBalanceQuestion).scaleVisual?.right2}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                Chọn kết quả cân thăng bằng:
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {(currentQuestion as ScaleBalanceQuestion).options.map((opt) => {
                  const isSelected = choiceState[currentQuestion.id] === opt;
                  const isCorrect = (currentQuestion as ScaleBalanceQuestion).correctAnswer === opt;
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

          {/* DẠNG 4: MA TRẬN SỐ & QUY LUẬT */}
          {currentQuestion.type === 'pattern-matrix' && (
            <div className="mt-8 max-w-xl mx-auto flex flex-col items-center">
              <div className="grid grid-cols-3 gap-3 p-4 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border-2 border-indigo-200 dark:border-indigo-900 shadow-inner mb-6">
                {(currentQuestion as PatternMatrixQuestion).matrix.map((row, rIdx) =>
                  row.map((cell, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl shadow-sm ${
                        cell === '?'
                          ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 animate-pulse'
                          : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white'
                      }`}
                    >
                      {cell === '?' && choiceState[currentQuestion.id]
                        ? choiceState[currentQuestion.id]
                        : cell}
                    </div>
                  ))
                )}
              </div>

              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                Chọn số thay thế cho dấu hỏi chấm (?):
              </p>
              <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full">
                {(currentQuestion as PatternMatrixQuestion).options.map((opt) => {
                  const isSelected = choiceState[currentQuestion.id] === opt;
                  const isCorrect = (currentQuestion as PatternMatrixQuestion).correctAnswer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectChoice(opt)}
                      className={`py-3 sm:py-4 rounded-2xl border-2 font-black text-lg sm:text-xl transition-all cursor-pointer flex items-center justify-center ${
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

          {/* DẠNG 5: MỆNH ĐỀ THẬT – GIẢ */}
          {currentQuestion.type === 'truth-lie' && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="space-y-3 mb-6">
                {(currentQuestion as TruthLieQuestion).statements.map((st, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-3xl shrink-0">{st.avatar}</span>
                    <div>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 mr-2">
                        {st.speaker} nói:
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 italic">
                        "{st.statement}"
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                {(currentQuestion as TruthLieQuestion).questionPrompt}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {(currentQuestion as TruthLieQuestion).options.map((opt) => {
                  const isSelected = choiceState[currentQuestion.id] === opt;
                  const isCorrect = (currentQuestion as TruthLieQuestion).correctAnswer === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectChoice(opt)}
                      className={`p-3.5 rounded-2xl border-2 font-black text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center ${
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

          {/* Hộp Trợ Giúp / Gợi Ý khi bấm nút Trợ Giúp */}
          {showHelp && (
            <div className="mt-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 p-4 sm:p-5 animate-fadeIn">
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
              className={`mt-6 rounded-2xl p-4 sm:p-5 flex items-center gap-3 animate-bounce ${
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
                    : 'Bấm nút "💡 Trợ giúp" nếu bé cần một gợi ý nhỏ.'}
                </div>
              </div>
            </div>
          )}

          {/* Lời giải chi tiết từng bước khi bấm Xem đáp án */}
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
                (currentQuestion as LogicGridQuestion).explanationSteps && (
                  <div className="mt-3 space-y-1.5 border-t border-emerald-200 dark:border-emerald-800/40 pt-3">
                    {(currentQuestion as LogicGridQuestion).explanationSteps.map((step, sIdx) => (
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

        {/* Thanh Điều Hướng Đáy Câu Hỏi (Khớp 100% với các nút ở chân ảnh mẫu) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
          {/* Nút Câu trước */}
          <button
            type="button"
            onClick={handlePrevQuestion}
            disabled={currentIndex === 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-sm transition-all cursor-pointer ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <span>←</span>
            <span>Câu trước</span>
          </button>

          {/* Nhóm nút giữa: Đặt lại & Kiểm tra */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetCurrent}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm transition cursor-pointer"
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

          {/* Nút Câu tiếp theo */}
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

      {/* Danh sách các câu hỏi trong mục Nâng cao để nhảy nhanh */}
      <div className="mt-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <span>🎯</span>
          <span>Danh sách câu hỏi Nâng cao ({filteredQuestions.length} câu)</span>
        </h3>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {filteredQuestions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isDone = completedQuestions[q.id];

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-11 w-11 rounded-2xl font-black text-sm transition-all cursor-pointer flex items-center justify-center relative ${
                  isCurrent
                    ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-400 scale-105'
                    : isDone
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{q.questionNumber}</span>
                {isDone && !isCurrent && (
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
