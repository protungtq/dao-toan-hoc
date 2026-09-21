import { useMemo, useState } from 'react';

type Question = {
  object: string;
  objectName: string;
  count: number;
  answers: number[];
  character: string;
  characterName: string;
  message: string;
};

const questions: Question[] = [
  {
    object: '🍎',
    objectName: 'quả táo',
    count: 8,
    answers: [6, 7, 8, 9],
    character: '🐿️',
    characterName: 'Sóc Nâu',
    message: 'Sóc Nâu cần biết mình đã nhặt được bao nhiêu quả táo.',
  },
  {
    object: '🍯',
    objectName: 'hũ mật ong',
    count: 5,
    answers: [3, 4, 5, 6],
    character: '🐻',
    characterName: 'Gấu Mật',
    message: 'Gấu Mật đang kiểm tra số hũ mật ong trong kho.',
  },
  {
    object: '🥕',
    objectName: 'củ cà rốt',
    count: 7,
    answers: [5, 6, 7, 8],
    character: '🐰',
    characterName: 'Thỏ Trắng',
    message: 'Thỏ Trắng vừa thu hoạch một giỏ cà rốt.',
  },
];

export default function CountingGame() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = questions[questionIndex];

  const isCorrect = selectedAnswer === question.count;
  const progress = ((questionIndex + (completed ? 1 : 0)) / questions.length) * 100;

  const objects = useMemo(
    () => Array.from({ length: question.count }),
    [question.count]
  );

  function selectAnswer(answer: number) {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);

    if (answer === question.count) {
      setCorrectAnswers((current) => current + 1);
    }
  }

  function nextQuestion() {
    if (questionIndex === questions.length - 1) {
      setCompleted(true);
      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelectedAnswer(null);
  }

  function restartGame() {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setCompleted(false);
  }

  if (completed) {
    const earnedStars =
      correctAnswers === 3 ? 3 : correctAnswers === 2 ? 2 : 1;

    return (
      <section className="mx-auto max-w-2xl px-4 py-10 text-center">
        <div className="rounded-[2.5rem] border-4 border-white bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 p-8 shadow-2xl">
          <div className="text-7xl">🎉</div>

          <p className="mt-5 text-sm font-black uppercase tracking-widest text-orange-600">
            Hoàn thành bài học
          </p>

          <h1 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">
            Bé làm tốt lắm!
          </h1>

          <p className="mt-4 text-lg font-semibold text-slate-600">
            Bé đã trả lời đúng {correctAnswers}/{questions.length} câu.
          </p>

          <div className="mt-6 flex justify-center gap-3 text-5xl">
            {[1, 2, 3].map((star) => (
              <span
                key={star}
                className={
                  star <= earnedStars
                    ? 'drop-shadow-lg'
                    : 'grayscale opacity-20'
                }
              >
                ⭐
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={restartGame}
              className="rounded-2xl bg-violet-600 px-7 py-4 font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-1 hover:bg-violet-700"
            >
              Làm lại bài
            </button>

            <a
              href="/"
              className="rounded-2xl border-2 border-slate-200 bg-white px-7 py-4 font-black text-slate-700 transition hover:bg-slate-50"
            >
              Về trang chủ
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <a
          href="/"
          className="rounded-xl bg-white px-4 py-3 font-black text-slate-600 shadow-md transition hover:-translate-y-0.5"
        >
          ← Trang chủ
        </a>

        <div className="text-right">
          <p className="text-sm font-black text-violet-600">
            Câu {questionIndex + 1}/{questions.length}
          </p>
          <p className="text-sm font-bold text-slate-500">
            Đúng {correctAnswers} câu
          </p>
        </div>
      </div>

      <div className="mb-7 h-4 overflow-hidden rounded-full bg-white shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="rounded-[2.5rem] border-4 border-white bg-white p-6 shadow-2xl shadow-sky-100 md:p-10">
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="grid h-28 w-28 shrink-0 place-items-center rounded-[2rem] bg-amber-100 text-7xl">
            {question.character}
          </div>

          <div>
            <p className="font-black text-orange-600">
              {question.characterName} hỏi:
            </p>

            <h1 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">
              Có tất cả bao nhiêu {question.objectName}?
            </h1>

            <p className="mt-2 font-semibold text-slate-500">
              {question.message}
            </p>
          </div>
        </div>

        <div className="my-9 rounded-3xl bg-gradient-to-br from-sky-50 to-cyan-50 p-6">
          <div className="flex min-h-40 flex-wrap content-center justify-center gap-4">
            {objects.map((_, index) => (
              <span
                key={index}
                className="inline-block cursor-default text-5xl drop-shadow-md transition hover:-translate-y-2 hover:scale-110 md:text-6xl"
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                {question.object}
              </span>
            ))}
          </div>
        </div>

        <p className="mb-5 text-center text-lg font-black text-slate-700">
          Chạm vào đáp án đúng
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {question.answers.map((answer) => {
            const selected = selectedAnswer === answer;
            const correct = answer === question.count;
            const revealCorrect = selectedAnswer !== null && correct;

            let style =
              'border-slate-200 bg-white text-slate-800 hover:-translate-y-1 hover:border-violet-300 hover:bg-violet-50';

            if (selected && !correct) {
              style = 'border-red-400 bg-red-50 text-red-600';
            }

            if (revealCorrect) {
              style = 'border-emerald-400 bg-emerald-50 text-emerald-600';
            }

            return (
              <button
                key={answer}
                type="button"
                disabled={selectedAnswer !== null}
                onClick={() => selectAnswer(answer)}
                className={`rounded-2xl border-4 px-5 py-5 text-3xl font-black shadow-md transition ${style}`}
              >
                {answer}
              </button>
            );
          })}
        </div>

        {selectedAnswer !== null && (
          <div
            className={`mt-7 rounded-3xl border-2 p-5 ${
              isCorrect
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-orange-200 bg-orange-50'
            }`}
          >
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-4">
                <span className="text-4xl">
                  {isCorrect ? '🎉' : '💡'}
                </span>

                <div>
                  <p
                    className={`text-xl font-black ${
                      isCorrect ? 'text-emerald-700' : 'text-orange-700'
                    }`}
                  >
                    {isCorrect
                      ? 'Chính xác!'
                      : 'Mình cùng đếm lại nhé!'}
                  </p>

                  <p className="mt-1 font-semibold text-slate-600">
                    Có tất cả {question.count} {question.objectName}.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={nextQuestion}
                className="w-full rounded-2xl bg-violet-600 px-6 py-4 font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-1 hover:bg-violet-700 sm:w-auto"
              >
                {questionIndex === questions.length - 1
                  ? 'Xem kết quả'
                  : 'Câu tiếp theo →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}