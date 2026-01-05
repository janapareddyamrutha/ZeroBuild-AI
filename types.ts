
export enum UserRole {
  CLIENT = 'CLIENT',
  DEVELOPER = 'DEVELOPER'
}

export enum LocationType {
  URBAN = 'Urban',
  RURAL = 'Rural',
  COASTAL = 'Coastal'
}

export enum BuildingType {
  HOUSE = 'House',
  APARTMENT = 'Apartment',
  VILLA = 'Villa',
  SCHOOL = 'School',
  HOSPITAL = 'Hospital'
}

export enum RoomType {
  BEDROOM = 'Master Bedroom',
  GUEST_ROOM = 'Guest Room',
  KITCHEN = 'Kitchen',
  LIVING_ROOM = 'Living Room',
  BATHROOM = 'Bathroom',
  DINING = 'Dining Room',
  OFFICE = 'Home Office',
  KIDS_ROOM = 'Kids Room'
}

export enum BudgetLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  MANUAL = 'Manual'
}

export enum SatisfactionRating {
  BAD = 'Not Accurate',
  AVERAGE = 'Somewhat Accurate',
  GOOD = 'Good Accuracy',
  EXCELLENT = 'High Accuracy',
  OUTSTANDING = 'Perfect Visualization'
}

export interface UserAccount {
  email: string;
  password?: string;
  role: UserRole;
  name?: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  type: string;
  price: number;
  link: string;
  source: 'Amazon' | 'Flipkart' | 'IKEA' | 'Myntra';
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  color: string;
  furniture: FurnitureItem[];
  beforeImage?: string;
  afterImage?: string;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  plotArea: number;
  length: number;
  breadth: number;
  locationType: LocationType;
  budgetLevel: BudgetLevel;
  manualBudget?: number;
  buildingColor: string;
  architecturalStyle: string;
  buildingType: BuildingType;
  floors: number;
  rooms: Room[];
  createdAt: number;
  visualImage?: string;
  satisfaction?: SatisfactionRating;
  location?: {
    lat: number;
    lng: number;
    city: string;
    state: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type Language = 'en' | 'hi' | 'te';
