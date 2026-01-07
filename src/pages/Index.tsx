import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import ProblemSection from '@/components/home/ProblemSection';
import SolutionSection from '@/components/home/SolutionSection';
import DifferentiatorSection from '@/components/home/DifferentiatorSection';
import CTASection from '@/components/home/CTASection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <DifferentiatorSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
