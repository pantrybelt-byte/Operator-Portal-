import React, { useState } from 'react';
import { Plus, Search, Trash2, X, Package, Download, Printer } from 'lucide-react';
import type { InventoryItem } from '../types';


interface InventoryPageProps {
  inventory: InventoryItem[];
  onAddInventoryItem: (newItem: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  onUpdateInventoryItem: (updatedItem: InventoryItem) => void;
  onDeleteInventoryItem: (id: string) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
  inventory,
  onAddInventoryItem,
  onUpdateInventoryItem,
  onDeleteInventoryItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [modalOpen, setModalOpen] = useState(false);

  // New Item Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('Fresh Produce');
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState<InventoryItem['unit']>('lbs');
  const [minThreshold, setMinThreshold] = useState<number>(20);
  const [notes, setNotes] = useState('');

  const categories = [
    'All',
    'Fresh Produce',
    'Canned Goods',
    'Dairy & Refrigerated',
    'Bakery & Grains',
    'Proteins & Meat',
    'Baby & Hygiene',
    'Prepared Meals',
  ];

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Status', 'Last Updated', 'Notes'];
    const rows = filteredItems.map(i => [i.name, i.category, i.quantity, i.unit, i.status, i.lastUpdated, i.notes || '']);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onAddInventoryItem({
      name,
      category,
      quantity,
      unit,
      inStock: quantity > 0,
      status: quantity === 0 ? 'Out of Stock' : quantity <= minThreshold ? 'Low Stock' : 'In Stock',
      minThreshold,
      notes,
    });

    setName('');
    setQuantity(50);
    setNotes('');
    setModalOpen(false);
  };

  const handleAdjustQuantity = (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    const newStatus = newQty === 0 ? 'Out of Stock' : newQty <= item.minThreshold ? 'Low Stock' : 'In Stock';
    onUpdateInventoryItem({
      ...item,
      quantity: newQty,
      inStock: newQty > 0,
      status: newStatus,
      lastUpdated: 'Just now',
    });
  };

  const statusBadge = (status: string) => {
    const styles = {
      'In Stock': 'bg-[#34c759]/10 text-[#34c759]',
      'Low Stock': 'bg-[#ff9500]/10 text-[#ff9500]',
      'Out of Stock': 'bg-[#ff3b30]/10 text-[#ff3b30]',
    }[status] || 'bg-[#f5f5f7] text-[#86868b]';

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-semibold ${styles}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight font-display">Inventory</h1>
          <p className="text-[14px] text-[#86868b] mt-0.5">
            Manage stock levels visible to community members
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white border border-[#e5e5ea] hover:border-[#d2d2d7] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Export to CSV"
          >
            <Download className="w-4 h-4 text-[#86868b]" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-white border border-[#e5e5ea] hover:border-[#d2d2d7] text-[#1d1d1f] text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Print Shift Inventory Sheet"
          >
            <Printer className="w-4 h-4 text-[#86868b]" />
            <span className="hidden sm:inline">Print Sheet</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add item</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search inventory…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-[13px] rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white placeholder:text-[#86868b]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`
                  px-3 py-1.5 rounded-xl text-[12px] font-semibold whitespace-nowrap transition-colors cursor-pointer
                  ${statusFilter === status
                    ? 'bg-[#1d1d1f] text-white'
                    : 'bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f]'
                  }
                `}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                px-3 py-1 rounded-full text-[12px] font-medium whitespace-nowrap transition-colors cursor-pointer
                ${selectedCategory === cat
                  ? 'bg-[#0071e3] text-white'
                  : 'bg-white border border-[#e5e5ea] text-[#86868b] hover:text-[#1d1d1f] hover:border-[#d2d2d7]'
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f5f5f7] border-b border-[#e5e5ea]">
              <tr>
                <th className="py-3 px-4 sm:px-5 text-[12px] font-semibold text-[#86868b]">Item</th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#86868b]">Category</th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#86868b]">Status</th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#86868b] text-center">Quantity</th>
                <th className="py-3 px-4 text-[12px] font-semibold text-[#86868b]">Updated</th>
                <th className="py-3 px-4 sm:px-5 text-[12px] font-semibold text-[#86868b] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5ea]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[14px] text-[#86868b]">
                    No items match your filters
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f5f5f7]/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-5">
                      <p className="text-[13px] font-semibold text-[#1d1d1f]">{item.name}</p>
                      {item.notes && <p className="text-[12px] text-[#86868b] mt-0.5">{item.notes}</p>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[12px] text-[#86868b] font-medium">{item.category}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => {
                          const nextInStock = !item.inStock;
                          onUpdateInventoryItem({
                            ...item,
                            inStock: nextInStock,
                            status: nextInStock ? 'In Stock' : 'Out of Stock',
                            quantity: nextInStock ? (item.quantity === 0 ? item.minThreshold + 10 : item.quantity) : 0,
                            lastUpdated: 'Just now',
                          });
                        }}
                        className="cursor-pointer group"
                        title="Click to toggle stock availability"
                      >
                        {statusBadge(item.status)}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAdjustQuantity(item, -10)}
                          className="w-6 h-6 rounded-lg border border-[#e5e5ea] hover:bg-[#f5f5f7] text-[#1d1d1f] text-[12px] font-bold flex items-center justify-center transition-colors cursor-pointer"
                          title="Decrease by 10"
                        >
                          −
                        </button>
                        <span className="text-[13px] font-bold text-[#1d1d1f] min-w-[55px] text-center">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          onClick={() => handleAdjustQuantity(item, 10)}
                          className="w-6 h-6 rounded-lg border border-[#e5e5ea] hover:bg-[#f5f5f7] text-[#1d1d1f] text-[12px] font-bold flex items-center justify-center transition-colors cursor-pointer"
                          title="Increase by 10"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[12px] text-[#86868b]">
                      {item.lastUpdated}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 text-right">
                      <button
                        onClick={() => onDeleteInventoryItem(item.id)}
                        className="p-1.5 rounded-lg text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e5e5ea]">
            <div className="flex items-center justify-between mb-5 border-b border-[#e5e5ea] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1d1d1f]">Add inventory item</h3>
                  <p className="text-[13px] text-[#86868b]">This will be visible on the AccessBelt app</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Item name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Apples, Peanut Butter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white placeholder:text-[#86868b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white"
                  >
                    {categories.filter(c => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Unit type</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white"
                  >
                    <option value="lbs">Pounds (lbs)</option>
                    <option value="boxes">Boxes</option>
                    <option value="crates">Crates</option>
                    <option value="cans">Cans</option>
                    <option value="units">Individual Units</option>
                    <option value="bags">Bags</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">Low stock threshold</label>
                  <input
                    type="number"
                    min={0}
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                    className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1">
                  Notes <span className="text-[#86868b] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Donated by Orchard Valley Farms"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-[13px] p-2.5 rounded-xl border border-[#e5e5ea] focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 bg-white placeholder:text-[#86868b]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5e5ea]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-semibold text-[#86868b] hover:text-[#1d1d1f] rounded-xl hover:bg-black/[0.04] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-[13px] font-semibold bg-[#0071e3] text-white rounded-xl hover:bg-[#0077ed] transition-colors cursor-pointer shadow-xs"
                >
                  Add item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
