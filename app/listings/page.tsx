'use client';

import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/lib/auth-context';
import { DUMMY_LISTINGS } from '@/lib/dummy-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Home,
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Eye,
  Heart,
  MessageSquare,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Video,
  CheckCircle,
  XCircle,
  RefreshCw,
  Upload,
  Globe,
  Layers,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

// Platform configs
const PLATFORMS = [
  { id: 'property_finder', name: 'Property Finder', icon: '🏠', color: 'bg-red-100 text-red-800' },
  { id: 'bayut', name: 'Bayut', icon: '🏡', color: 'bg-blue-100 text-blue-800' },
  { id: 'dubizzle', name: 'Dubizzle', icon: '📍', color: 'bg-orange-100 text-orange-800' },
  { id: 'website', name: 'Your Website', icon: '🌐', color: 'bg-green-100 text-green-800' },
];

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-blue-100 text-blue-800',
  rented: 'bg-purple-100 text-purple-800',
  inactive: 'bg-red-100 text-red-800',
};

export default function ListingsPage() {
  const { isGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'draft' | 'sold'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Use dummy data for demo
  const listings = useMemo(() => isGuest ? DUMMY_LISTINGS : [], [isGuest]);

  // Filter listings
  const filteredListings = useMemo(() => {
    let filtered = listings;

    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter(l => l.status === 'active');
    } else if (activeTab === 'draft') {
      filtered = filtered.filter(l => l.status === 'draft' || l.status === 'pending');
    } else if (activeTab === 'sold') {
      filtered = filtered.filter(l => l.status === 'sold' || l.status === 'rented');
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.area.toLowerCase().includes(query) ||
        l.reference_number.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [listings, activeTab, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = listings.length;
    const active = listings.filter(l => l.status === 'active').length;
    const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
    const totalInquiries = listings.reduce((sum, l) => sum + l.inquiries, 0);
    
    return { total, active, totalViews, totalInquiries };
  }, [listings]);

  const formatPrice = (price: number, type: string, rentalPeriod?: string) => {
    const formatted = price >= 10000000
      ? `₹${(price / 10000000).toFixed(2)}Cr`
      : price >= 100000
        ? `₹${(price / 100000).toFixed(1)}L`
        : `₹${price.toLocaleString()}`;
    
    if (type === 'rent' && rentalPeriod) {
      return `${formatted}/${rentalPeriod === 'monthly' ? 'mo' : rentalPeriod === 'yearly' ? 'yr' : rentalPeriod}`;
    }
    return formatted;
  };

  const handleSync = (listingId: string, platform: string) => {
    toast.success(`Syncing to ${platform}...`);
    // In real app, trigger sync API
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSyncAll = (_listingId: string) => {
    toast.success('Syncing to all platforms...');
    // In real app, trigger bulk sync
  };

  const getSyncStatusIcon = (synced: boolean) => {
    return synced ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-gray-400" />
    );
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Property Listings</h1>
            <p className="text-muted-foreground">
              Manage and distribute your property listings across platforms
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Listing
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                  <h3 className="text-2xl font-bold">{stats.total}</h3>
                </div>
                <Building2 className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <h3 className="text-2xl font-bold">{stats.active}</h3>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <h3 className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</h3>
                </div>
                <Eye className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inquiries</p>
                  <h3 className="text-2xl font-bold">{stats.totalInquiries}</h3>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1">
            <TabsList>
              <TabsTrigger value="all">All ({listings.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({listings.filter(l => l.status === 'active').length})</TabsTrigger>
              <TabsTrigger value="draft">Draft ({listings.filter(l => l.status === 'draft' || l.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="sold">Sold/Rented</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Listings Grid/List */}
        {filteredListings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <h3 className="font-medium mb-2">No listings found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search term' : 'Add your first property listing'}
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Listing
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden group">
                {/* Image Section */}
                <div className="relative aspect-video bg-gray-100">
                  {listing.photos.length > 0 ? (
                    <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                      <span className="sr-only">No image</span>
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <Badge className={`absolute top-3 left-3 ${STATUS_COLORS[listing.status]}`}>
                    {listing.status}
                  </Badge>
                  
                  {/* Price Badge */}
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-bold">
                    {formatPrice(listing.price, listing.listing_type, listing.rental_period)}
                  </div>

                  {/* Virtual Tour Badge */}
                  {listing.virtual_tours.length > 0 && (
                    <Badge className="absolute top-3 right-3 bg-purple-600">
                      <Video className="mr-1 h-3 w-3" />
                      360°
                    </Badge>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Title and Location */}
                  <h3 className="font-semibold line-clamp-1 mb-1">{listing.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    {listing.area}, {listing.city}
                  </div>

                  {/* Specs */}
                  <div className="flex items-center gap-4 text-sm mb-4">
                    {listing.bedrooms > 0 && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4 text-muted-foreground" />
                        <span>{listing.bedrooms}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4 text-muted-foreground" />
                      <span>{listing.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="h-4 w-4 text-muted-foreground" />
                      <span>{listing.size_sqft} sqft</span>
                    </div>
                    {listing.parking_spaces > 0 && (
                      <div className="flex items-center gap-1">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>{listing.parking_spaces}</span>
                      </div>
                    )}
                  </div>

                  {/* Sync Status */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-muted-foreground">Synced to:</span>
                    <div className="flex gap-1">
                      {listing.sync_status.map((sync) => (
                        <div
                          key={sync.platform}
                          className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
                          title={`${PLATFORMS.find(p => p.id === sync.platform)?.name}: ${sync.synced ? 'Synced' : 'Not synced'}`}
                        >
                          {getSyncStatusIcon(sync.synced)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {listing.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {listing.favorites}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {listing.inquiries}
                      </span>
                    </div>
                    <span className="text-xs">#{listing.reference_number}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedListing(listing.id);
                        setShowSyncDialog(true);
                      }}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Sync
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Live
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // List View
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-150">
                {filteredListings.map((listing, index) => (
                  <div
                    key={listing.id}
                    className={`flex items-center gap-4 p-4 ${index > 0 ? 'border-t' : ''}`}
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-16 bg-gray-100 rounded flex items-center justify-center shrink-0">
                      <Home className="h-6 w-6 text-gray-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{listing.title}</h3>
                        <Badge className={STATUS_COLORS[listing.status]} variant="secondary">
                          {listing.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {listing.area}, {listing.city}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold">
                        {formatPrice(listing.price, listing.listing_type, listing.rental_period)}
                      </p>
                      <p className="text-xs text-muted-foreground">{listing.listing_type}</p>
                    </div>

                    {/* Sync Status */}
                    <div className="flex gap-1">
                      {listing.sync_status.map((sync) => (
                        <div
                          key={sync.platform}
                          className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
                          title={PLATFORMS.find(p => p.id === sync.platform)?.name}
                        >
                          {getSyncStatusIcon(sync.synced)}
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {listing.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {listing.inquiries}
                      </span>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedListing(listing.id);
                          setShowSyncDialog(true);
                        }}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync to Platforms
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Add Listing Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Listing</DialogTitle>
              <DialogDescription>
                Create a property listing and publish to multiple platforms
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-medium">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Property Title</Label>
                    <Input placeholder="e.g., Luxury 3BHK Apartment in Whitefield" />
                  </div>
                  <div>
                    <Label>Listing Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">For Sale</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Property Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="font-medium">Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Address</Label>
                    <Input placeholder="Full address" />
                  </div>
                  <div>
                    <Label>Area</Label>
                    <Input placeholder="e.g., Whitefield" />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input placeholder="e.g., Bangalore" />
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-4">
                <h3 className="font-medium">Specifications</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Bedrooms</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label>Bathrooms</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label>Size (sqft)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label>Parking</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="font-medium">Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (₹)</Label>
                    <Input type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label>Furnished Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="furnished">Furnished</SelectItem>
                        <SelectItem value="semi-furnished">Semi-Furnished</SelectItem>
                        <SelectItem value="unfurnished">Unfurnished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the property..."
                  rows={4}
                />
              </div>

              {/* Photos */}
              <div className="space-y-4">
                <h3 className="font-medium">Photos & Media</h3>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop photos here, or click to browse
                  </p>
                  <Button variant="outline" size="sm">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Upload Photos
                  </Button>
                </div>
              </div>

              {/* Publish To */}
              <div className="space-y-4">
                <h3 className="font-medium">Publish To</h3>
                <div className="grid grid-cols-2 gap-3">
                  {PLATFORMS.map((platform) => (
                    <div
                      key={platform.id}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input type="checkbox" className="rounded" defaultChecked={platform.id === 'website'} />
                      <span>{platform.icon}</span>
                      <span className="font-medium">{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
              <Button onClick={() => {
                toast.success('Listing created and synced!');
                setShowAddDialog(false);
              }}>
                <Globe className="mr-2 h-4 w-4" />
                Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sync Dialog */}
        <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sync to Platforms</DialogTitle>
              <DialogDescription>
                Choose where to publish this listing
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {PLATFORMS.map((platform) => {
                const listing = listings.find(l => l.id === selectedListing);
                const syncStatus = listing?.sync_status.find(s => s.platform === platform.id as 'property_finder' | 'bayut' | 'dubizzle' | 'website');
                
                return (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{platform.icon}</span>
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        {syncStatus?.synced && syncStatus.last_synced_at && (
                          <p className="text-xs text-muted-foreground">
                            Last synced {formatDistanceToNow(syncStatus.last_synced_at.toDate(), { addSuffix: true })}
                          </p>
                        )}
                        {syncStatus?.error && (
                          <p className="text-xs text-red-500">{syncStatus.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {syncStatus?.synced ? (
                        <Badge className="bg-green-100 text-green-800">Synced</Badge>
                      ) : (
                        <Badge variant="secondary">Not synced</Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(selectedListing!, platform.name)}
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSyncDialog(false)}>
                Close
              </Button>
              <Button onClick={() => {
                handleSyncAll(selectedListing!);
                setShowSyncDialog(false);
              }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
