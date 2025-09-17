import { useState, useEffect } from "react";

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

const STORAGE_KEY = "clinic-inventory";

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Ácido Hialurônico (Seringa)",
    quantity: 5,
    minStock: 10,
    category: "Preenchedores",
    supplier: "Fornecedor A",
    costPrice: 150.00,
    lastUpdated: "2024-09-15"
  },
  {
    id: 2,
    name: "Máscara de Argila Verde (Pote 250g)",
    quantity: 15,
    minStock: 5,
    category: "Máscaras Faciais",
    supplier: "Fornecedor B",
    costPrice: 45.00,
    lastUpdated: "2024-09-10"
  },
  {
    id: 3,
    name: "Óleo Essencial de Lavanda (10ml)",
    quantity: 2,
    minStock: 8,
    category: "Aromaterapia",
    supplier: "Fornecedor C",
    costPrice: 25.00,
    lastUpdated: "2024-09-12"
  }
];

export function useInventory() {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialProducts;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  const addProduct = (productData: Omit<Product, 'id' | 'lastUpdated'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: number, productData: Partial<Product>) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, ...productData, lastUpdated: new Date().toISOString().split('T')[0] } : product
      )
    );
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProduct = (id: number) => {
    return products.find(product => product.id === id);
  };

  const getStockStatus = (product: Product) => {
    if (product.quantity <= 0) return "empty";
    if (product.quantity <= product.minStock / 2) return "critical";
    if (product.quantity <= product.minStock) return "low";
    return "ok";
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getStockStatus
  };
}