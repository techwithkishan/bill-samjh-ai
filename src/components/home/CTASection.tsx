import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section className="section-padding bg-gradient-to-b from-secondary/50 to-background">
      <div className="container-main">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Understand Your Bill?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Upload your electricity bill now and get a complete breakdown in seconds. 
            It's free, fast, and your data isn't stored.
          </p>
          
          <Button variant="hero" size="xl" asChild>
            <Link to="/upload">
              Upload Your Bill Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">
            Works with bills from MSEDCL, TPDDL, BSES, CESC, TANGEDCO, and all state electricity boards.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
