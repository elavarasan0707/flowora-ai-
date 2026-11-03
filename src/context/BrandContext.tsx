import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrandProfile } from '../types/index.ts';
import { api } from '../lib/api.ts';
import { useAuth } from './AuthContext.tsx';

interface BrandContextType {
  brands: BrandProfile[];
  activeBrand: BrandProfile | null;
  isLoading: boolean;
  setActiveBrand: (brand: BrandProfile | null) => void;
  loadBrands: () => Promise<void>;
  createBrand: (brand: Omit<BrandProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<BrandProfile>;
  updateBrand: (id: string, updates: Partial<BrandProfile>) => Promise<BrandProfile>;
  deleteBrand: (id: string) => Promise<void>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [activeBrand, setActiveBrand] = useState<BrandProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadBrands = async () => {
    if (!user) {
      setBrands([]);
      setActiveBrand(null);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.getBrands();
      setBrands(res.brands);
      if (res.brands.length > 0 && !activeBrand) {
        setActiveBrand(res.brands[0]);
      } else if (activeBrand) {
        const stillExists = res.brands.find(b => b.id === activeBrand.id);
        if (stillExists) setActiveBrand(stillExists);
        else setActiveBrand(res.brands[0] || null);
      }
    } catch (e) {
      console.warn('Failed to load brands:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, [user?.id]);

  const createBrand = async (brandData: Omit<BrandProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const res = await api.createBrand(brandData);
    setBrands(prev => [...prev, res.brand]);
    setActiveBrand(res.brand);
    return res.brand;
  };

  const updateBrand = async (id: string, updates: Partial<BrandProfile>) => {
    const res = await api.updateBrand(id, updates);
    setBrands(prev => prev.map(b => (b.id === id ? res.brand : b)));
    if (activeBrand?.id === id) {
      setActiveBrand(res.brand);
    }
    return res.brand;
  };

  const deleteBrand = async (id: string) => {
    await api.deleteBrand(id);
    setBrands(prev => prev.filter(b => b.id !== id));
    if (activeBrand?.id === id) {
      setActiveBrand(brands.find(b => b.id !== id) || null);
    }
  };

  return (
    <BrandContext.Provider
      value={{
        brands,
        activeBrand,
        isLoading,
        setActiveBrand,
        loadBrands,
        createBrand,
        updateBrand,
        deleteBrand,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
