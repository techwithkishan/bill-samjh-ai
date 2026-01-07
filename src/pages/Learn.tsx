import Layout from '@/components/layout/Layout';
import { Zap, Calculator, TrendingUp, Clock, Lightbulb, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Learn = () => {
  const tariffSlabs = [
    { units: '0-100', rate: '₹3.00', description: 'Basic consumption slab' },
    { units: '101-200', rate: '₹4.50', description: 'Medium consumption slab' },
    { units: '201-300', rate: '₹6.00', description: 'Higher consumption slab' },
    { units: '301-500', rate: '₹8.00', description: 'High consumption slab' },
    { units: '500+', rate: '₹10.00', description: 'Very high consumption slab' },
  ];

  const conversionSteps = [
    {
      step: 1,
      title: 'Read Your Meter',
      description: 'Your meter shows kWh (kilowatt-hours). Subtract last month\'s reading from this month\'s reading.',
      icon: '📊',
      example: 'Current: 5420 kWh - Previous: 5120 kWh = 300 units consumed',
    },
    {
      step: 2,
      title: 'Understand Tariff Slabs',
      description: 'Electricity rates increase in slabs. First 100 units are cheapest, then rates go up.',
      icon: '📈',
      example: 'First 100 units × ₹3 + Next 100 × ₹4.5 + Next 100 × ₹6 = Total',
    },
    {
      step: 3,
      title: 'Calculate Slab-wise',
      description: 'Multiply units in each slab by that slab\'s rate and add them all.',
      icon: '🧮',
      example: '(100 × 3) + (100 × 4.5) + (100 × 6) = ₹300 + ₹450 + ₹600 = ₹1,350',
    },
    {
      step: 4,
      title: 'Add Fixed Charges',
      description: 'Add fixed/meter charges, fuel adjustment, electricity duty, and taxes.',
      icon: '💰',
      example: 'Energy: ₹1,350 + Fixed: ₹50 + Duty: ₹67.50 + Tax: ₹88 = ₹1,555.50',
    },
  ];

  const faqs = [
    {
      question: 'What is 1 unit of electricity?',
      answer: '1 unit = 1 kWh (kilowatt-hour). It means using 1000 watts for 1 hour. Example: A 100W bulb running for 10 hours = 1 unit, or a 1000W heater running for 1 hour = 1 unit.',
    },
    {
      question: 'Why does my bill vary each month?',
      answer: 'Your bill varies based on: seasonal usage (AC in summer, heater in winter), number of days in billing cycle, appliance usage patterns, and any changes in tariff rates.',
    },
    {
      question: 'What are peak hours and off-peak hours?',
      answer: 'Peak hours (usually 6 PM - 10 PM) have higher rates due to demand. Off-peak hours (usually 10 PM - 6 AM) may have lower rates. Check your state electricity board for exact timings.',
    },
    {
      question: 'What is power factor surcharge?',
      answer: 'Industrial/commercial connections may have a power factor surcharge if PF is below 0.9. Poor power factor means inefficient use of electricity. This doesn\'t apply to domestic consumers.',
    },
    {
      question: 'How can I reduce my electricity bill?',
      answer: 'Use LED bulbs, set AC to 24°C, unplug standby appliances, use solar water heaters, run heavy appliances during off-peak hours, and get regular appliance maintenance.',
    },
  ];

  const applianceConsumption = [
    { appliance: 'LED Bulb (9W)', daily: '0.09 kWh', monthly: '2.7 units', cost: '~₹16' },
    { appliance: 'Ceiling Fan', daily: '0.5 kWh', monthly: '15 units', cost: '~₹90' },
    { appliance: 'Refrigerator', daily: '1.5 kWh', monthly: '45 units', cost: '~₹270' },
    { appliance: 'AC (1.5 Ton)', daily: '6 kWh', monthly: '180 units', cost: '~₹1,440' },
    { appliance: 'Washing Machine', daily: '0.5 kWh', monthly: '15 units', cost: '~₹90' },
    { appliance: 'TV (LED 42")', daily: '0.3 kWh', monthly: '9 units', cost: '~₹54' },
    { appliance: 'Geyser (2000W)', daily: '2 kWh', monthly: '60 units', cost: '~₹480' },
    { appliance: 'Microwave', daily: '0.3 kWh', monthly: '9 units', cost: '~₹54' },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-br from-secondary via-background to-secondary/30">
        <div className="container-main text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-6">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Learn: Unit ↔ Money Conversion
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Understand how your electricity units (kWh) convert to rupees. 
            No complex formulas – just simple explanations with examples.
          </p>
        </div>
      </section>

      {/* Step by Step Guide */}
      <section className="section-padding">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              How Units Become Money
            </h2>
            <p className="text-muted-foreground">
              Follow these 4 simple steps to understand your bill calculation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {conversionSteps.map((step) => (
              <div key={step.step} className="card-elevated">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary text-primary-foreground">
                        Step {step.step}
                      </span>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{step.description}</p>
                    <div className="p-3 rounded-lg bg-secondary text-sm font-mono text-secondary-foreground">
                      {step.example}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Calculator Visual */}
      <section className="section-padding bg-secondary/30">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              <Zap className="inline h-8 w-8 text-primary mr-2" />
              Sample Tariff Slabs
            </h2>
            <p className="text-muted-foreground">
              Typical domestic electricity rates in India (rates vary by state)
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="card-elevated overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="px-4 py-3 text-left font-medium">Units (kWh)</th>
                    <th className="px-4 py-3 text-left font-medium">Rate per Unit</th>
                    <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {tariffSlabs.map((slab, index) => (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{slab.units}</td>
                      <td className="px-4 py-3 text-primary font-semibold">{slab.rate}</td>
                      <td className="px-4 py-3 text-muted-foreground text-sm hidden sm:table-cell">
                        {slab.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Example Calculation */}
            <div className="mt-6 p-6 rounded-xl bg-card border border-primary/20">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Example: 300 Units Bill Calculation
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">0-100 units × ₹3.00</span>
                  <span className="font-medium text-foreground">₹300</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">101-200 units × ₹4.50</span>
                  <span className="font-medium text-foreground">₹450</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">201-300 units × ₹6.00</span>
                  <span className="font-medium text-foreground">₹600</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Fixed Charges</span>
                  <span className="font-medium text-foreground">₹50</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Electricity Duty (5%)</span>
                  <span className="font-medium text-foreground">₹70</span>
                </div>
                <div className="flex justify-between py-3 bg-primary/10 rounded-lg px-3 -mx-3 mt-3">
                  <span className="font-semibold text-foreground">Total Amount</span>
                  <span className="font-bold text-primary text-lg">₹1,470</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Appliance Consumption Guide */}
      <section className="section-padding">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              <TrendingUp className="inline h-8 w-8 text-primary mr-2" />
              How Much Do Appliances Cost?
            </h2>
            <p className="text-muted-foreground">
              Average daily usage (8 hours) for common household appliances
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {applianceConsumption.map((item) => (
              <div key={item.appliance} className="card-elevated text-center">
                <h4 className="font-medium text-foreground mb-3">{item.appliance}</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">Daily: {item.daily}</p>
                  <p className="text-muted-foreground">Monthly: {item.monthly}</p>
                  <p className="text-primary font-semibold text-lg">{item.cost}/month</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            * Based on average tariff of ₹6/unit. Actual costs vary by state and usage patterns.
          </p>
        </div>
      </section>

      {/* Video Tutorials Placeholder */}
      <section className="section-padding bg-secondary/30">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              📺 Video Guides
            </h2>
            <p className="text-muted-foreground">
              Watch simple explanations in Hindi and English
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'How to Read Your Electricity Meter', duration: '3:45', language: 'Hindi' },
              { title: 'Understanding Tariff Slabs', duration: '5:20', language: 'English' },
              { title: 'Save Money on Electricity Bills', duration: '4:15', language: 'Hindi' },
            ].map((video, index) => (
              <div key={index} className="card-elevated group cursor-pointer">
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                  <div className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-2xl">▶️</span>
                  </div>
                  <span className="absolute bottom-2 right-2 text-xs bg-background/80 px-2 py-1 rounded">
                    {video.duration}
                  </span>
                </div>
                <h4 className="font-medium text-foreground mb-1">{video.title}</h4>
                <p className="text-sm text-muted-foreground">{video.language}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6 italic">
            Video tutorials coming soon. In the meantime, explore the guides above!
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding">
        <div className="container-main max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              <HelpCircle className="inline h-8 w-8 text-primary mr-2" />
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4">
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Peak Hours Visual */}
      <section className="section-padding bg-secondary/30">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              <Clock className="inline h-8 w-8 text-primary mr-2" />
              Peak vs Off-Peak Hours
            </h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="card-elevated p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 text-center p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <Clock className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <h4 className="font-medium text-foreground">Peak Hours</h4>
                  <p className="text-sm text-muted-foreground">6 PM - 10 PM</p>
                  <p className="text-xs text-destructive mt-2">Higher rates apply</p>
                </div>
                <div className="flex-1 text-center p-4 rounded-lg bg-success/10 border border-success/20">
                  <Clock className="h-8 w-8 text-success mx-auto mb-2" />
                  <h4 className="font-medium text-foreground">Off-Peak Hours</h4>
                  <p className="text-sm text-muted-foreground">10 PM - 6 AM</p>
                  <p className="text-xs text-success mt-2">Lower rates may apply</p>
                </div>
              </div>

              <div className="h-8 rounded-full overflow-hidden flex text-xs font-medium">
                <div className="bg-success/60 flex-1 flex items-center justify-center text-success-foreground">
                  12 AM - 6 AM
                </div>
                <div className="bg-muted flex-[2] flex items-center justify-center text-muted-foreground">
                  6 AM - 6 PM
                </div>
                <div className="bg-destructive/60 flex-1 flex items-center justify-center text-destructive-foreground">
                  6 PM - 10 PM
                </div>
                <div className="bg-success/60 flex-[0.5] flex items-center justify-center text-success-foreground">
                  10 PM+
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-4">
                💡 Tip: Run washing machines, dishwashers, and water heaters during off-peak hours to save money!
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Learn;
