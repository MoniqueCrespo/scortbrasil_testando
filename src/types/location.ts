export type CategoryType = 'mulheres' | 'homens' | 'trans' | 'casais' | 'massagistas';

export type GenderType = 'feminino' | 'masculino' | 'trans' | 'casal';

export interface BrazilState {
  code: string;
  name: string;
  slug: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
  isNeighborhood?: boolean;
  parentCitySlug?: string;
}

export interface LocationProfile {
  id: number;
  name: string;
  location: string;
  age: number;
  rating: number;
  image: string;
  description: string;
  tags: string[];
  verified?: boolean;
  featured?: boolean;
  category: CategoryType;
  gender: GenderType;
  state: string;
  city: string;
  price: number;
  height: number;
  weight: number;
  eyeColor: string;
  hairColor: string;
  services: string[];
  availability: string[];
  neighborhoods: string[];
  isNew?: boolean;
  isOnline?: boolean;
  photos?: string[];
  latitude?: number;
  longitude?: number;
  views?: number;
}
