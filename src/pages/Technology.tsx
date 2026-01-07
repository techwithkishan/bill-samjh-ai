import { Cloud, Brain, FileSearch, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';

const technologies = [
  {
    icon: FileSearch,
    title: 'Smart Bill Reading (OCR)',
    description: 'When you upload your bill, our system uses Optical Character Recognition to read and extract all the information from your bill image or PDF. It can read any Indian electricity board format.',
    simple: 'Your bill photo becomes text data that computers can understand.',
  },
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Azure AI services analyze your consumption patterns, calculate tariff breakdowns, and generate easy-to-understand explanations. The AI is trained on Indian electricity billing structures.',
    simple: 'A smart computer explains your bill like a helpful friend would.',
  },
  {
    icon: Cloud,
    title: 'Cloud Infrastructure',
    description: 'Built on Microsoft Azure cloud platform, ensuring fast processing, high availability, and the ability to handle millions of bill analyses. All processing happens in secure data centers.',
    simple: 'Powerful computers on the internet do the heavy lifting for you.',
  },
  {
    icon: Shield,
    title: 'Privacy First Design',
    description: 'Your bill data is processed in real-time and not stored permanently. We use encryption for data in transit and follow industry-standard security practices.',
    simple: 'We read your bill, explain it, and then forget about it.',
  },
];

const Technology = () => {
  return (
    <Layout>
      <section className="section-padding">
        <div className="container-main">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How BillSamajh AI Works
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Behind the simple interface is powerful technology designed to make 
              electricity bills understandable for everyone.
            </p>
          </div>

          {/* Technology Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {technologies.map((tech, index) => (
              <div key={index} className="card-elevated">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <tech.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {tech.title}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {tech.description}
                    </p>
                    <div className="bg-secondary rounded-lg p-3">
                      <p className="text-sm text-secondary-foreground">
                        <span className="font-medium">In simple words:</span> {tech.simple}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Architecture Diagram (Simplified) */}
          <div className="bg-secondary/30 rounded-2xl p-8 mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">
              The Journey of Your Bill
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              {[
                { step: '1', label: 'You Upload', icon: '📄' },
                { step: '2', label: 'OCR Reads', icon: '👁️' },
                { step: '3', label: 'AI Analyzes', icon: '🧠' },
                { step: '4', label: 'You Understand', icon: '💡' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 rounded-full bg-card border-2 border-primary flex items-center justify-center text-3xl mb-2">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  {index < 3 && (
                    <ArrowRight className="h-6 w-6 text-primary hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Powered By */}
          <div className="text-center mb-16">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Powered By
            </h3>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Cloud className="h-6 w-6" />
                <span>Microsoft Azure</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Brain className="h-6 w-6" />
                <span>Azure AI Services</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileSearch className="h-6 w-6" />
                <span>Azure Computer Vision</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ready to Try It?
            </h2>
            <p className="text-muted-foreground mb-6">
              Experience the technology yourself. Upload your electricity bill now.
            </p>
            <Button variant="hero" asChild>
              <Link to="/upload">
                Upload Your Bill
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Technology;
