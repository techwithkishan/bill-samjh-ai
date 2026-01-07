import { Upload, Brain, TrendingDown, Lightbulb } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Your Bill',
    description: 'Simply upload a photo or PDF of your electricity bill. Our AI can read any Indian state electricity board format.',
  },
  {
    icon: Brain,
    step: '02',
    title: 'AI Analyzes & Explains',
    description: 'Our AI reads every line item, calculates your tariff slabs, and explains in simple Hinglish why your bill is what it is.',
  },
  {
    icon: TrendingDown,
    step: '03',
    title: 'Get Predictions',
    description: 'Based on your usage patterns and seasonal trends, we estimate what your next bill might look like.',
  },
  {
    icon: Lightbulb,
    step: '04',
    title: 'Save Money',
    description: 'Receive personalized tips based on your actual consumption to reduce your electricity bill.',
  },
];

const SolutionSection = () => {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-main">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How BillSamajh AI Helps You
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to finally understand where your money is going 
            and how to keep more of it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line - Hidden on mobile and last item */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-border" />
              )}
              
              <div className="bg-card rounded-xl p-6 border border-border relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-4xl font-bold text-border">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
