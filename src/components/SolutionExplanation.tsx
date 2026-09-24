type SolutionExplanationProps = {
  steps: readonly string[];
  conclusion: string;
};

function normalizeSentence(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('vi')
    .replace(/[.!?]+$/u, '')
    .replace(/\s+/g, ' ');
}

export default function SolutionExplanation({ steps, conclusion }: SolutionExplanationProps) {
  const normalizedConclusion = normalizeSentence(conclusion);
  const solutionSteps = steps
    .map((step) => step.trim())
    .filter(Boolean)
    .filter((step, index, allSteps) =>
      allSteps.findIndex((candidate) => normalizeSentence(candidate) === normalizeSentence(step)) === index
    )
    .filter((step) => normalizeSentence(step) !== normalizedConclusion);

  return (
    <div className="solution-explanation mt-3 max-w-2xl text-left text-slate-700 dark:text-slate-100">
      <div className="solution-explanation-card rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-sm dark:border-emerald-400/30 dark:bg-slate-900/90 dark:shadow-black/20">
        <p className="solution-explanation-title flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-300">
          <span aria-hidden="true">🧠</span>
          Cách giải từng bước
        </p>

        {solutionSteps.length > 0 && (
          <ol className="mt-3 space-y-2">
            {solutionSteps.map((step, index) => (
              <li key={`${index}-${step}`} className="solution-explanation-step flex gap-3 font-semibold leading-7 text-slate-700 dark:text-slate-100">
                <span className="solution-explanation-index mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-200">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}

        <p className="solution-explanation-conclusion mt-3 border-t border-emerald-100 pt-3 font-semibold leading-7 text-slate-700 dark:border-emerald-400/20 dark:text-slate-100">
          <span className="solution-explanation-title font-black text-emerald-800 dark:text-emerald-300">Kết luận: </span>
          {conclusion}
        </p>
      </div>
    </div>
  );
}
