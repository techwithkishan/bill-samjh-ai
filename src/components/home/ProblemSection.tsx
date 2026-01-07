import { AlertCircle, FileQuestion, Calculator, HelpCircle } from 'lucide-react';

const problems = [
  {
    icon: FileQuestion,
    title: 'Complex Bill Structure',
    description: 'Multiple tariff slabs, fixed charges, fuel adjustment charges, and government levies make bills impossible to decode.',
  },
  {
    icon: Calculator,
    title: 'No Usage Breakdown',
    description: 'You see the total amount but never understand which appliances consumed how much electricity.',
  },
  {
    icon: AlertCircle,
    title: 'Sudden Bill Spikes',
    description: 'Bills jump unexpectedly and you have no idea whether it\'s your usage or a billing error.',
  },
  {
    icon: HelpCircle,
    title: 'No Savings Guidance',
    description: 'Even if you want to reduce your bill, there\'s no personalized advice on what changes will help.',
  },
];

const ProblemSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-main">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Are Electricity Bills So Confusing?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every month, crores of Indians receive electricity bills they don't understand. 
            This isn't just frustrating—it costs you money.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem, index) => (
            <div key={index} className="card-elevated">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <problem.icon className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
