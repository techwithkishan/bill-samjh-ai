import { Check, X } from 'lucide-react';

const comparisons = [
  {
    feature: 'Bill Understanding',
    paymentApps: 'Just shows amount due',
    billSamajh: 'Explains every charge in Hinglish',
  },
  {
    feature: 'Usage Analysis',
    paymentApps: 'No breakdown provided',
    billSamajh: 'Identifies high-consumption periods',
  },
  {
    feature: 'Next Bill Prediction',
    paymentApps: 'Not available',
    billSamajh: 'AI-based monthly estimates',
  },
  {
    feature: 'Savings Tips',
    paymentApps: 'Generic advice',
    billSamajh: 'Personalized to your usage',
  },
  {
    feature: 'Data Privacy',
    paymentApps: 'Linked to payments',
    billSamajh: 'No data stored permanently',
  },
];

const DifferentiatorSection = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-main">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            We're Not Another Payment App
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Payment apps help you pay bills. We help you understand them. 
            That's a big difference.
          </p>
        </div>

        <div className="max-w-4xl mx-auto overflow-hidden rounded-xl border border-border">
          {/* Table Header */}
          <div className="grid grid-cols-3 bg-secondary">
            <div className="p-4 font-semibold text-foreground">Feature</div>
            <div className="p-4 font-semibold text-foreground text-center border-l border-border">Payment Apps</div>
            <div className="p-4 font-semibold text-primary text-center border-l border-border">BillSamajh AI</div>
          </div>

          {/* Table Body */}
          {comparisons.map((row, index) => (
            <div 
              key={index} 
              className={`grid grid-cols-3 ${index % 2 === 0 ? 'bg-card' : 'bg-muted/30'}`}
            >
              <div className="p-4 text-foreground font-medium">{row.feature}</div>
              <div className="p-4 text-center border-l border-border">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <X className="h-4 w-4 text-destructive" />
                  <span className="text-sm">{row.paymentApps}</span>
                </div>
              </div>
              <div className="p-4 text-center border-l border-border">
                <div className="flex items-center justify-center gap-2 text-foreground">
                  <Check className="h-4 w-4 text-success" />
                  <span className="text-sm">{row.billSamajh}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorSection;
