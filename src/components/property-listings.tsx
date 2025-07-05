"use client"

import * as React from 'react';
import { Search, PlusCircle } from 'lucide-react';
import { properties, propertyTypes } from '@/lib/data';
import type { Role, Property } from '@/types';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import PropertyCard from '@/components/property-card';
import PropertyForm from '@/components/property-form';

export default function PropertyListings({ role }: { role: Role }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [propertyTypeFilter, setPropertyTypeFilter] = React.useState('all');
  const [priceRangeFilter, setPriceRangeFilter] = React.useState('all');
  
  const [localProperties, setLocalProperties] = React.useState<Property[]>(properties);

  const filteredProperties = localProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = propertyTypeFilter === 'all' || property.type === propertyTypeFilter;
    const matchesPrice = priceRangeFilter === 'all' ||
      (priceRangeFilter === 'under500k' && property.price < 500000) ||
      (priceRangeFilter === '500k-1m' && property.price >= 500000 && property.price <= 1000000) ||
      (priceRangeFilter === 'over1m' && property.price > 1000000);

    return matchesSearch && matchesType && matchesPrice;
  });

  const handlePropertySave = (newProperty: Property) => {
    const existingIndex = localProperties.findIndex(p => p.id === newProperty.id);
    if (existingIndex > -1) {
      const updatedProperties = [...localProperties];
      updatedProperties[existingIndex] = newProperty;
      setLocalProperties(updatedProperties);
    } else {
      setLocalProperties([newProperty, ...localProperties]);
    }
  };

  const handlePropertyDelete = (propertyId: string) => {
    setLocalProperties(localProperties.filter(p => p.id !== propertyId));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by title or location..."
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {propertyTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under500k">Under $500k</SelectItem>
                <SelectItem value="500k-1m">$500k - $1M</SelectItem>
                <SelectItem value="over1m">Over $1M</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-headline">Properties ({filteredProperties.length})</h2>
        {(role === 'Admin' || role === 'Seller') && (
          <PropertyForm onSave={handlePropertySave}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Property
            </Button>
          </PropertyForm>
        )}
      </div>

      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map(property => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              role={role} 
              onSave={handlePropertySave}
              onDelete={handlePropertyDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No properties match your search criteria.</p>
        </div>
      )}
    </div>
  );
}
