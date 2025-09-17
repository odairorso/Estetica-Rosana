import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Package, Plus, Boxes } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { SearchBar } from "@/components/ui/search-bar";
import { useInventory, Product } from "@/hooks/useInventory";
import { ProductCard } from "@/components/inventory/ProductCard";
import { ProductModal } from "@/components/inventory/ProductModal";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Inventory() {
  const { toast } = useToast();
  const { products, addProduct, updateProduct, deleteProduct, getStockStatus } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewProduct = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: number) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      const product = products.find(p => p.id === productToDelete);
      deleteProduct(productToDelete);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      toast({
        title: "Produto excluído",
        description: `O produto "${product?.name}" foi removido do seu estoque.`,
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Estoque | Gestão de Clínica Estética</title>
        <meta name="description" content="Cadastro de produtos, controle de estoque e alertas." />
        <link rel="canonical" href="/estoque" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">Estoque</h1>
            <p className="text-muted-foreground">Gerencie os produtos da sua clínica</p>
          </div>
          <div className="flex gap-3">
            <SearchBar 
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <NeonButton icon={Plus} onClick={handleNewProduct}>
              Novo Produto
            </NeonButton>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              status={getStockStatus(product)}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <GlassCard className="text-center py-12">
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Boxes className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm ? "Tente ajustar sua busca" : "Cadastre seu primeiro produto"}
                </p>
              </div>
              {!searchTerm && (
                <NeonButton icon={Plus} onClick={handleNewProduct}>
                  Cadastrar Produto
                </NeonButton>
              )}
            </div>
          </GlassCard>
        )}

        <ProductModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          product={editingProduct}
          onSave={handleSaveProduct}
          mode={editingProduct ? 'edit' : 'create'}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}