'use client';

// FRESHCUT X - Product CMS
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, Edit, Trash2,
    Package, DollarSign, Tag,
    Search, Filter, ShoppingBag
} from 'lucide-react';
import type { Product } from '@/types';
import { mockProducts } from '@/data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

import { useRealtime } from '@/hooks/useRealtime';

export function ProductManagement() {
    const realtimeProducts = useRealtime<Product>('products', []);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (realtimeProducts.length > 0) {
            // eslint-disable-next-line
            setProducts(realtimeProducts);
        }
    }, [realtimeProducts]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image: '',
    });

    const handleDelete = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
        toast.success('Produit supprimé');
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.price || !formData.stock) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (editingProduct) {
            setProducts(prev => prev.map(p =>
                p.id === editingProduct.id
                    ? {
                        ...p,
                        name: formData.name,
                        description: formData.description,
                        price: Number(formData.price),
                        stock: Number(formData.stock),
                        category: formData.category,
                        image: formData.image,
                    }
                    : p
            ));
            toast.success('Produit mis à jour');
        } else {
            const newProduct: Product = {
                id: `prod_${Date.now()}`,
                shopId: 'shop_001',
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                stock: Number(formData.stock),
                category: formData.category || 'Autre',
                image: formData.image || 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?auto=format&fit=crop&q=80&w=200',
                isActive: true,
            };
            setProducts(prev => [...prev, newProduct]);
            toast.success('Produit ajouté avec succès');
        }

        setIsAddDialogOpen(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            stock: '',
            category: '',
            image: '',
        });
    };

    const startEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            stock: product.stock.toString(),
            category: product.category,
            image: product.image || '',
        });
        setIsAddDialogOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass-card border-0">
                    <CardContent className="p-4">
                        <p className="text-sm text-white/60">Produits total</p>
                        <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-cyber-neon" />
                            <p className="text-2xl font-bold text-white">{products.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-0">
                    <CardContent className="p-4">
                        <p className="text-sm text-white/60">Valeur stock</p>
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-cyber-orange" />
                            <p className="text-2xl font-bold text-white">{totalStockValue}€</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-0">
                    <CardContent className="p-4">
                        <p className="text-sm text-white/60">Rupture stock</p>
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-red-400" />
                            <p className="text-2xl font-bold text-red-500">
                                {products.filter(p => p.stock === 0).length}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-0">
                    <CardContent className="p-4">
                        <p className="text-sm text-white/60">Catégories</p>
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-cyber-cyan" />
                            <p className="text-2xl font-bold text-white">
                                {new Set(products.map(p => p.category)).size}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                        placeholder="Rechercher un produit..."
                        className="input-cyber pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtres
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="btn-neon">
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter Produit
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-cyber-gray border-white/10 max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="text-white">
                                    {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <div>
                                    <label className="text-sm text-white/60 mb-1 block">Nom du produit *</label>
                                    <Input
                                        placeholder="ex: Cire Matte"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-cyber"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-white/60 mb-1 block">Description</label>
                                    <Input
                                        placeholder="Description du produit..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input-cyber"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-white/60 mb-1 block">Prix (€) *</label>
                                        <Input
                                            type="number"
                                            placeholder="15"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            className="input-cyber"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-white/60 mb-1 block">Stock *</label>
                                        <Input
                                            type="number"
                                            placeholder="20"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            className="input-cyber"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-white/60 mb-1 block">Catégorie</label>
                                        <Input
                                            placeholder="ex: Coiffage"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="input-cyber"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-white/60 mb-1 block">URL Photo</label>
                                        <Input
                                            placeholder="https://..."
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="input-cyber"
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-full btn-neon"
                                    onClick={handleSubmit}
                                >
                                    {editingProduct ? 'Mettre à jour' : 'Ajouter le produit'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card overflow-hidden flex flex-col group"
                    >
                        <div className="aspect-video w-full overflow-hidden relative">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                            />
                            <div className="absolute top-2 right-2">
                                <Badge className={product.stock > 0 ? 'bg-cyber-neon/80 text-cyber-dark' : 'bg-red-500 text-white'}>
                                    {product.stock > 0 ? `${product.stock} en stock` : 'Rupture'}
                                </Badge>
                            </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="text-white font-bold">{product.name}</h3>
                                    <p className="text-xs text-cyber-cyan">{product.category}</p>
                                </div>
                                <p className="text-lg font-bold text-cyber-neon">{product.price}€</p>
                            </div>

                            <p className="text-sm text-white/50 mb-4 line-clamp-2">
                                {product.description}
                            </p>

                            <div className="mt-auto flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-white/10 text-white hover:bg-white/10"
                                    onClick={() => startEdit(product)}
                                >
                                    <Edit className="w-3.5 h-3.5 mr-2" />
                                    Modifier
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-white/10 text-red-400 hover:bg-red-400/10 hover:border-red-400/30"
                                    onClick={() => handleDelete(product.id)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
