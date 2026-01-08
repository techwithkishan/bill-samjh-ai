import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  governmentSchemes, 
  indianStates, 
  getCategoryLabel, 
  getCategoryColor,
  IndianState,
  GovernmentScheme,
} from '@/data/governmentSchemes';
import { 
  Landmark, 
  MapPin, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw,
  Sun,
  Zap,
  Percent,
  Gift,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const getCategoryIcon = (category: GovernmentScheme['category']) => {
  switch (category) {
    case 'solar':
      return <Sun className="h-4 w-4" />;
    case 'free_electricity':
      return <Zap className="h-4 w-4" />;
    case 'subsidy':
      return <Percent className="h-4 w-4" />;
    case 'discount':
      return <Gift className="h-4 w-4" />;
  }
};

const SchemeCard = ({ 
  scheme, 
  isApplicable 
}: { 
  scheme: GovernmentScheme; 
  isApplicable: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`transition-all ${isApplicable ? 'ring-2 ring-success/50 bg-success/5' : ''}`}>
      <CardContent className="pt-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge className={getCategoryColor(scheme.category)}>
                <span className="flex items-center gap-1">
                  {getCategoryIcon(scheme.category)}
                  {getCategoryLabel(scheme.category)}
                </span>
              </Badge>
              {isApplicable && (
                <Badge variant="outline" className="text-success border-success bg-success/10">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Applicable to You
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-foreground text-lg">{scheme.name}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3">{scheme.description}</p>

        {/* Benefits */}
        <div className="p-3 rounded-lg bg-secondary/50 mb-3">
          <p className="text-sm font-medium text-foreground">{scheme.benefits}</p>
        </div>

        {/* States */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          <span>
            {scheme.applicableStates.includes('All India') 
              ? 'Available across India' 
              : scheme.applicableStates.join(', ')}
          </span>
        </div>

        {/* Expandable Eligibility */}
        <div className="border-t border-border pt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Eligibility Criteria</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {isExpanded && (
            <ul className="mt-3 space-y-1.5">
              {scheme.eligibility.map((criteria, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  {criteria}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Source Link */}
        {scheme.sourceLink && (
          <div className="mt-3 pt-3 border-t border-border">
            <a
              href={scheme.sourceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Official Website
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const GovernmentSchemesSection = () => {
  const [selectedState, setSelectedState] = useState<IndianState>('All India');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredSchemes = useMemo(() => {
    return governmentSchemes.filter((scheme) => {
      // Category filter
      if (categoryFilter !== 'all' && scheme.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [categoryFilter]);

  const applicableSchemes = useMemo(() => {
    return filteredSchemes.filter((scheme) => 
      scheme.applicableStates.includes('All India') || 
      scheme.applicableStates.includes(selectedState)
    );
  }, [filteredSchemes, selectedState]);

  const otherSchemes = useMemo(() => {
    return filteredSchemes.filter((scheme) => 
      !scheme.applicableStates.includes('All India') && 
      !scheme.applicableStates.includes(selectedState)
    );
  }, [filteredSchemes, selectedState]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Landmark className="h-6 w-6 text-primary" />
                Government Electricity Schemes & Benefits
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Discover subsidies, free electricity limits, and solar schemes available in your state
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Select Your State
              </label>
              <Select value={selectedState} onValueChange={(v) => setSelectedState(v as IndianState)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose your state" />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Filter by Category
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="free_electricity">Free Electricity</SelectItem>
                  <SelectItem value="solar">Solar Schemes</SelectItem>
                  <SelectItem value="subsidy">Subsidies</SelectItem>
                  <SelectItem value="discount">Discounts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applicable Schemes */}
      {applicableSchemes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-success" />
            Schemes Applicable to {selectedState === 'All India' ? 'All States' : selectedState}
            <Badge variant="secondary">{applicableSchemes.length}</Badge>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {applicableSchemes.map((scheme) => (
              <SchemeCard 
                key={scheme.id} 
                scheme={scheme} 
                isApplicable={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Schemes */}
      {otherSchemes.length > 0 && selectedState !== 'All India' && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            Other State Schemes
            <Badge variant="outline">{otherSchemes.length}</Badge>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {otherSchemes.map((scheme) => (
              <SchemeCard 
                key={scheme.id} 
                scheme={scheme} 
                isApplicable={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {applicableSchemes.length === 0 && otherSchemes.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Schemes Found</h3>
            <p className="text-muted-foreground">
              Try changing the category filter to see more schemes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          <strong className="text-foreground">Disclaimer:</strong> Scheme details are updated periodically. 
          Please verify eligibility and benefits on official government portals before applying.
        </p>
      </div>
    </div>
  );
};

export default GovernmentSchemesSection;
