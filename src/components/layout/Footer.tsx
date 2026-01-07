import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Zap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">BillSamajh AI</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Making electricity bills understandable for every Indian household. 
              Powered by AI to help you save money and understand your consumption.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/upload" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Upload Bill
                </Link>
              </li>
              <li>
                <Link to="/technology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">
                contact@billsamajh.ai
              </li>
              <li className="text-sm text-muted-foreground">
                Made for India 🇮🇳
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="bg-secondary/50 rounded-lg p-4 mb-6">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Disclaimer:</strong> This tool provides estimates and explanations based on AI analysis. 
              The values shown are for informational purposes only and should not be considered as official billing information. 
              Always refer to your official electricity bill for accurate data.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 BillSamajh AI. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built for Microsoft Imagine Cup 2025
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
