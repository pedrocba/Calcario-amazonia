// CÓDIGO COMPLETO E CORRIGIDO PARA /src/pages/Products.jsx

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/SimpleAuthContext";
import { useCompany } from "../components/common/CompanyContext";
import ProductForm from "../components/products/ProductForm"; // Importação direta
import SearchDebounce from "../components/common/SearchDebounce";
import PaginatedList from "../components/common/PaginatedList";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const { user, isAuthenticated } = useAuth();
  const { currentCompany } = useCompany();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!currentCompany?.id) {
        console.warn("Nenhuma empresa selecionada");
        setProducts([]);
        setCategories([]);
        return;
      }

      // Filtrar produtos pela empresa atual
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`*, product_categories ( name )`)
        .eq('empresa_id', currentCompany.id);

      if (productsError) throw productsError;

      // Filtrar categorias pela empresa atual
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('product_categories')
        .select('*')
        .eq('empresa_id', currentCompany.id);

      if (categoriesError) throw categoriesError;

      const processedProducts = productsData.map(p => ({
        ...p,
        category_name: p.product_categories?.name || 'Sem categoria'
      }));

      setProducts(processedProducts);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentCompany?.id) {
      loadProducts();
    }
  }, [currentCompany?.id]);

  const handleNewProductClick = async () => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error("Usuário não autenticado.");
      }

      if (!currentCompany?.id) {
        throw new Error("Nenhuma empresa selecionada.");
      }
      
      const { data: lastProduct } = await supabase
        .from('products')
        .select('code')
        .eq('empresa_id', currentCompany.id)
        .order('code', { ascending: false })
        .limit(1)
        .single();

      let newCodeNumber = 1;
      if (lastProduct && lastProduct.code) {
        const lastNumber = parseInt(lastProduct.code.replace(/\D/g, ''), 10);
        if (!isNaN(lastNumber)) {
          newCodeNumber = lastNumber + 1;
        }
      }
      
      const newCode = `PROD${String(newCodeNumber).padStart(5, '0')}`;
      
      console.log('NOVO CÓDIGO GERADO:', newCode);

      setEditingProduct({ code: newCode }); // Passa apenas o código para o formulário
      setShowForm(true);

    } catch (error) {
      console.error("Erro ao gerar código do produto:", error);
      alert("Erro ao gerar novo código de produto: " + error.message);
    }
  };

  const handleSubmit = async (productData) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error("Usuário não autenticado.");
      }

      if (!currentCompany?.id) {
        throw new Error("Nenhuma empresa selecionada.");
      }

      // Prepara os dados do produto (empresa_id será preenchido pela trigger)
      const productToSave = { 
        ...productData
        // empresa_id será preenchido automaticamente pela trigger
      };
      
      // Remove campos virtuais que não existem na tabela products
      delete productToSave.initial_stock; // Remove o campo do formulário
      delete productToSave.category_name;
      delete productToSave.product_categories;

      if (editingProduct && editingProduct.id) {
        // MODO UPDATE - Mapeia initial_stock do formulário para current_stock do banco
        const currentStock = editingProduct.current_stock || 0;
        const newStock = productData.initial_stock || 0; // Associa o campo do form à coluna do DB
        const stockChanged = currentStock !== newStock;
        
        if (stockChanged) {
          // Criar registro de movimentação de estoque
          const stockDifference = newStock - currentStock;
          const { error: movementError } = await supabase
            .from('movimentacoes_estoque')
            .insert([{
              product_id: editingProduct.id,
              movement_type: 'ajuste_edicao',
              quantity: stockDifference,
              previous_stock: currentStock,
              new_stock: newStock,
              reason: 'Ajuste manual via tela de edição de produto.',
              company_id: companyId
            }]);
          
          if (movementError) {
            console.error('Erro ao registrar movimentação de estoque:', movementError);
            // Continua mesmo com erro na movimentação
          }
          
          // Atualizar o estoque atual do produto
          productToSave.current_stock = newStock;
        }
        
        const { error } = await supabase.from('products').update(productToSave).eq('id', editingProduct.id).eq('company_id', companyId);
        if (error) throw error;
        
        const message = stockChanged 
          ? `Produto atualizado com sucesso! Estoque ajustado de ${currentStock} para ${newStock} unidades.`
          : 'Produto atualizado com sucesso!';
        alert(message);
      } else {
        // MODO CREATE - Mapeia initial_stock do formulário para current_stock do banco
        const productWithStock = {
          ...productToSave,
          current_stock: productData.initial_stock || 0 // Associa o campo do form à coluna do DB
        };
        
        const { error } = await supabase.from('products').insert([productWithStock]);
        if (error) throw error;
        alert(`Produto criado com sucesso! Estoque inicial: ${productData.initial_stock || 0} unidades.`);
      }

      await loadProducts();
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert(`Erro ao salvar produto: ${error.message}`);
    }
  };
  
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      searchTerm === '' ||
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Gestão de Produtos</h1>
        <Button onClick={handleNewProductClick}><Plus className="w-5 h-5 mr-2" />Novo Produto</Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-8 overflow-hidden">
            <ProductForm 
              product={editingProduct} 
              onSubmit={handleSubmit} 
              onCancel={() => { setShowForm(false); setEditingProduct(null); }}
              categories={categories}
              onCategoryAdded={loadProducts}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="mb-6">
        <CardHeader><CardTitle>Filtros e Busca</CardTitle></CardHeader>
        <CardContent>
          <SearchDebounce placeholder="Buscar por nome ou código..." onSearch={setSearchTerm} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lista de Produtos ({filteredProducts.length})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" count={3} />
          ) : (
            <PaginatedList
              data={filteredProducts}
              defaultItemsPerPage={10}
              renderItem={(product) => (
                <div key={product.id} className="p-4 border-b flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-bold">{product.name} ({product.code})</p>
                    <p className="text-sm text-gray-500">{product.category_name}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-blue-600 font-medium">Estoque: {product.current_stock || 0} {product.unit_of_measure || 'UN'}</span>
                      <span className="text-green-600 font-medium">R$ {product.sale_price || 0}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setEditingProduct(product); setShowForm(true); }}>Editar</Button>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}