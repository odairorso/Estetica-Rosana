import { useState, useEffect } from 'react';

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

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Ácido Hialurônico (Seringa)",
    quantity: 15,
    minStock: 5,
    category: "Preenchedores",
    supplier: "Dermage",
    costPrice: 45.00,
    lastUpdated: "2023-05-01"
  },
  {
    id: 2,
    name: "Botox 50U",
    quantity: 3,
    minStock: 5,
    category: "Toxina Botulínica",
    supplier: "Allergan",
    costPrice: 1200.00,
    lastUpdated: "2023-05-10"
  },
  {
    id: 3,
    name: "Argila Verde",
    quantity: 8,
    minStock: 10,
    category: "Cosméticos",
    supplier: "Natureza Brasil",
    costPrice: 25.00,
    lastUpdated: "2023-04-15"
  }
];

export function useInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const storedProducts = localStorage.getItem('inventory');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(MOCK_PRODUCTS);
        localStorage.setItem('inventory', JSON.stringify(MOCK_PRODUCTS));
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const addProduct = (productData: Omit<Product, 'id' | 'lastUpdated'>) => {
    const newProduct = {
      ...productData,
      id: Date.now(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('inventory', JSON.stringify(updatedProducts));
    return newProduct;
  };

  const updateProduct = (id: number, productData: Partial<Product>) => {
    const updatedProducts = products.map(product => 
      product.id === id ? { 
        ...product, 
        ...productData,
        lastUpdated: new Date().toISOString().split('T')[0]
      } : product
    );
    setProducts(updatedProducts);
    localStorage.setItem('inventory', JSON.stringify(updatedProducts));
    return updatedProducts.find(product => product.id === id);
  };

  const deleteProduct = (id: number) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('inventory', JSON.stringify(updatedProducts));
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
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    getStockStatus
  };
}