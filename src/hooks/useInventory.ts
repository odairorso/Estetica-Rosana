import { useState, useEffect } from 'react';
<<<<<<< HEAD
import { supabase } from '@/lib/supabase';
import { getCurrentDateString, dateToString } from '@/lib/utils';
=======
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522

export interface Product {
  id: number;
  name: string;
  quantity: number;
  minStock: number;
  category: string;
  supplier?: string;
  costPrice: number;
  lastUpdated: string;
}

const INVENTORY_STORAGE_KEY = 'clinic-inventory';

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load products from localStorage on mount
  useEffect(() => {
    const loadProducts = () => {
      try {
        const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
        if (stored) {
          setProducts(JSON.parse(stored));
        } else {
          // Initialize with sample data if empty
          const sampleProducts: Product[] = [
            {
              id: 1,
              name: "Ácido Hialurônico (Seringa)",
              quantity: 15,
              minStock: 5,
              category: "Preenchedores",
              supplier: "Dermage",
              costPrice: 45.90,
              lastUpdated: "2023-05-01"
            },
            {
              id: 2,
              name: "Toxina Botulínica",
              quantity: 8,
              minStock: 10,
              category: "Toxinas",
              supplier: "Allergan",
              costPrice: 120.00,
              lastUpdated: "2023-05-10"
            },
            {
              id: 3,
              name: "Creme Hidratante Facial",
              quantity: 25,
              minStock: 15,
              category: "Skincare",
              supplier: "Neutrogena",
              costPrice: 25.50,
              lastUpdated: "2023-05-15"
            }
          ];
          setProducts(sampleProducts);
          localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(sampleProducts));
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(products));
    }
  }, [products]);

  const addProduct = (productData: Omit<Product, 'id' | 'lastUpdated'>) => {
    const newProduct: Product = {
      ...productData,
      id: Math.max(0, ...products.map(p => p.id)) + 1,
<<<<<<< HEAD
      lastUpdated: getCurrentDateString()
=======
      lastUpdated: new Date().toISOString().split('T')[0]
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
    };
    setProducts([...products, newProduct]);
    return newProduct;
  };

  const updateProduct = (id: number, productData: Partial<Product>) => {
    setProducts(products.map(product => 
<<<<<<< HEAD
      product.id === id ? { ...product, ...productData, lastUpdated: getCurrentDateString() } : product
=======
      product.id === id ? { ...product, ...productData, lastUpdated: new Date().toISOString().split('T')[0] } : product
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
    ));
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return "empty";
    if (product.quantity <= product.minStock / 2) return "critical";
    if (product.quantity <= product.minStock) return "low";
    return "ok";
  };

  return {
    products,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    getStockStatus,
  };
}