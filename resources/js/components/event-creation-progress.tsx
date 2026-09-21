import { Check } from 'lucide-react';

const steps = ['Informações', 'Presentes', 'Personalização', 'Finalização'];

export function EventCreationProgress({
    currentStep,
}: {
    currentStep: number;
}) {
    return (
        <nav aria-label="Progresso da criação do evento">
            <ol className="grid grid-cols-4 gap-1 sm:gap-3">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCurrent = stepNumber === currentStep;
                    const isComplete = stepNumber < currentStep;

                    return (
                        <li
                            key={step}
                            aria-current={isCurrent ? 'step' : undefined}
                            className="min-w-0"
                        >
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <span
                                    className={`flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold sm:size-8 ${
                                        isCurrent
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : isComplete
                                              ? 'border-primary/30 bg-primary/10 text-primary'
                                              : 'border-border bg-card text-muted-foreground'
                                    }`}
                                >
                                    {isComplete ? (
                                        <Check className="size-4" />
                                    ) : (
                                        stepNumber
                                    )}
                                </span>
                                <span
                                    className={`hidden truncate text-sm font-medium sm:block ${
                                        isCurrent
                                            ? 'text-foreground'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {step}
                                </span>
                            </div>
                            <span
                                className={`mt-1 block truncate text-center text-[0.65rem] font-medium sm:hidden ${
                                    isCurrent
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {step}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
