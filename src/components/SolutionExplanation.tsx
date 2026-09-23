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
    <div className="mt-3 max-w-2xl text-left text-slate-700">
      <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-sm">
        <p className="flex items-center gap-2 font-black text-emerald-800">
          <span aria-hidden="true">🧠</span>
          Cách giải từng bước
        </p>

        {solutionSteps.length > 0 && (
          <ol className="mt-3 space-y-2">
            {solutionSteps.map((step, index) => (
              <li key={`${index}-${step}`} className="flex gap-3 font-semibold leading-7">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}

        <p className="mt-3 border-t border-emerald-100 pt-3 font-semibold leading-7">
          <span className="font-black text-emerald-800">Kết luận: </span>
          {conclusion}
        </p>
      </div>
    </div>
  );
}
