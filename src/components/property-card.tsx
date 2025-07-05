"use client"

import Image from 'next/image';
import { Bath, Bed, AreaChart, MapPin, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Property, Role } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import PropertyForm from './property-form';

interface PropertyCardProps {
  property: Property;
  role: Role;
  onSave: (property: Property) => void;
  onDelete: (propertyId: string) => void;
}

function getPropertyImageHint(type: Property['type']): string {
    switch (type) {
        case 'House': return 'suburban house';
        case 'Apartment': return 'modern apartment';
        case 'Villa': return 'luxury villa';
        case 'Commercial': return 'modern office';
        case 'Land': return 'green field';
        default: return 'real estate';
    }
}

export default function PropertyCard({ property, role, onSave, onDelete }: PropertyCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0 relative">
        <Badge className="absolute top-2 right-2 z-10 bg-primary/80 backdrop-blur-sm">{property.type}</Badge>
        <Image
          src={property.imageUrl}
          alt={property.title}
          width={600}
          height={400}
          className="object-cover w-full h-48"
          data-ai-hint={getPropertyImageHint(property.type)}
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-headline mb-1 line-clamp-1">{property.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            {property.location}
        </CardDescription>
        <p className="text-2xl font-bold text-primary">${property.price.toLocaleString()}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center bg-secondary/30">
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5" title={`${property.features.bedrooms} Bedrooms`}>
            <Bed className="h-5 w-5 text-primary" />
            <span>{property.features.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5" title={`${property.features.bathrooms} Bathrooms`}>
            <Bath className="h-5 w-5 text-primary" />
            <span>{property.features.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5" title={`${property.features.area} sqft`}>
            <AreaChart className="h-5 w-5 text-primary" />
            <span>{property.features.area.toLocaleString()}</span>
          </div>
        </div>
        {(role === 'Admin' || role === 'Seller') && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full hover:bg-accent">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <PropertyForm property={property} onSave={onSave}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
              </PropertyForm>
              <DropdownMenuItem onClick={() => onDelete(property.id)} className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardFooter>
    </Card>
  );
}
