export type PetSpecies = 'dog' | 'cat' | 'bird' | 'other';

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: string;
  weight?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type CreatePetInput = Omit<Pet, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export type UpdatePetInput = Partial<CreatePetInput>;
