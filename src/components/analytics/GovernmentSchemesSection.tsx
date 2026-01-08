import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  indianStates, 
  getCategoryLabel, 
  getCategoryColor,
  IndianState,
  GovernmentScheme,
} from '@/data/governmentSchemes';
import { useGovernmentSchemes } from '@/hooks/useGovernmentSchemes';
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
  Wifi,
  WifiOff,
  Clock,
  Lightbulb,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

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

interface SchemeCardProps {
  scheme: GovernmentScheme & { applicationProcess?: string; deadline?: string };
  isApplicable: boolean;
}

const SchemeCard = ({ scheme, isApplicable }: SchemeCardProps) => {
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
              {!scheme.isActive && (
                <Badge variant="outline" className="text-muted-foreground">
                  Inactive
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-foreground text-lg">{scheme.name}</h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3">{scheme.description}</p>

        {/* Benefits - Point wise */}
        <div className="p-3 rounded-lg bg-secondary/50 mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Key Benefits</h4>
          <ul className="space-y-1.5">
            {scheme.benefits.split(/[.•]/).filter(b => b.trim()).map((benefit, index) => (
              <li key={index} className="text-sm text-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{benefit.trim()}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* States & Deadline */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>
              {scheme.applicableStates.includes('All India') 
                ? 'Available across India' 
                : scheme.applicableStates.slice(0, 3).join(', ')}
              {scheme.applicableStates.length > 3 && ` +${scheme.applicableStates.length - 3} more`}
            </span>
          </div>
          {scheme.deadline && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{scheme.deadline}</span>
            </div>
          )}
        </div>

        {/* Expandable Section */}
        <div className="border-t border-border pt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>View Details</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {isExpanded && (
            <div className="mt-3 space-y-4">
              {/* Eligibility */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Eligibility Criteria
                </h4>
                <ul className="space-y-1.5">
                  {scheme.eligibility.map((criteria, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-success mt-1">•</span>
                      {criteria}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Application Process */}
              {scheme.applicationProcess && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary" />
                    How to Apply
                  </h4>
                  <p className="text-sm text-muted-foreground">{scheme.applicationProcess}</p>
                </div>
              )}
            </div>
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
  const [monthlyConsumption, setMonthlyConsumption] = useState<string>('');
  
  const { 
    schemes, 
    eligibilityNotes,
    isLoading, 
    lastFetched, 
    isLiveData,
    refreshSchemes 
  } = useGovernmentSchemes();

  // Fetch schemes when state or consumption changes
  useEffect(() => {
    const consumption = monthlyConsumption ? parseInt(monthlyConsumption) : undefined;
    refreshSchemes(selectedState, consumption);
  }, [selectedState]);

  const handleRefresh = () => {
    const consumption = monthlyConsumption ? parseInt(monthlyConsumption) : undefined;
    refreshSchemes(selectedState, consumption);
  };

  const handleConsumptionSearch = () => {
    const consumption = monthlyConsumption ? parseInt(monthlyConsumption) : undefined;
    refreshSchemes(selectedState, consumption);
  };

  const filteredSchemes = useMemo(() => {
    return schemes.filter((scheme) => {
      if (categoryFilter !== 'all' && scheme.category !== categoryFilter) {
        return false;
      }
      return true;
    });
  }, [schemes, categoryFilter]);

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
                Live updates on subsidies, free electricity limits, and solar schemes
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Live Status Indicator */}
              <Badge 
                variant="outline" 
                className={`text-xs ${isLiveData ? 'text-success border-success' : 'text-muted-foreground'}`}
              >
                {isLiveData ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Live Data
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Cached
                  </>
                )}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Updating...' : 'Refresh'}
              </Button>
            </div>
          </div>
          {lastFetched && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {format(new Date(lastFetched), 'dd MMM yyyy, hh:mm a')}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
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
            <div>
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
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Monthly Consumption (kWh)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="e.g. 200"
                  value={monthlyConsumption}
                  onChange={(e) => setMonthlyConsumption(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="secondary" 
                  size="icon"
                  onClick={handleConsumptionSearch}
                  disabled={isLoading}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Eligibility Notes */}
          {eligibilityNotes && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Personalized Recommendation</p>
                  <p className="text-sm text-muted-foreground">{eligibilityNotes}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Fetching latest government schemes...</p>
          </div>
        </div>
      )}

      {/* Applicable Schemes */}
      {!isLoading && applicableSchemes.length > 0 && (
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
      {!isLoading && otherSchemes.length > 0 && selectedState !== 'All India' && (
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
      {!isLoading && applicableSchemes.length === 0 && otherSchemes.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Schemes Found</h3>
            <p className="text-muted-foreground">
              Try changing the category filter or refreshing to see more schemes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          <strong className="text-foreground">Disclaimer:</strong> Scheme details are fetched from AI-powered sources and updated regularly. 
          Please verify eligibility and benefits on official government portals before applying. 
          {isLiveData && ' Data is refreshed in real-time.'}
        </p>
      </div>
    </div>
  );
};

export default GovernmentSchemesSection;
