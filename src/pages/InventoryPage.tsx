import React, { useState } from 'react';
import { Plus, Search, Trash2, X, Package, Download, Printer } from 'lucide-react';
import type { InventoryItem } from '../types';
import { stockStatus } from '../types';
import { formatRelative } from '../lib/datetime';


interface InventoryPageProps {
  inventory: InventoryItem[];
  onAddInventoryItem: (newItem: Omit<InventoryItem, 'id' | 'orgId' | 'pantryId' | 'updatedAt'>) => void;
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
    const matchesStatus = statusFilter === 'All' || stockStatus(item) === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Status', 'Last Updated', 'Notes'];
    const rows = filteredItems.map((i) => [
      i.name, i.category, i.quantity, i.unit, stockStatus(i), i.updatedAt.toISOString(), i.notes || '',
    ]);
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

    onAddInventoryItem({ name, category, quantity, unit, minThreshold, notes });

    setName('');
    setQuantity(50);
    setNotes('');
    setModalOpen(false);
  };

  const handleAdjustQuantity = (item: InventoryItem, delta: number) => {
    // Status is derived from quantity at render, so only quantity is written.
    onUpdateInventoryItem({
      ...item,
      quantity: Math.max(0, item.quantity + delta),
      updatedAt: new Date(),
    });
  };

  const statusBadge = (status: string) => {
    const tone =
      {
        'In Stock': 'badge-success',
        'Low Stock': 'badge-warn',
        'Out of Stock': 'badge-danger',
      }[status] ?? 'badge-neutral';

    return (
      <span className={`badge ${tone}`}>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Stock levels shown to families in the app</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="btn btn-secondary no-print"
            title="Export to CSV"
          >
            <Download className="h-4 w-4 text-fg-muted" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-secondary no-print"
            title="Print inventory sheet"
          >
            <Printer className="h-4 w-4 text-fg-muted" />
            <span className="hidden sm:inline">Print sheet</span>
          </button>

          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-primary"
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
            <Search className="w-4 h-4 text-fg-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search inventory…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-line focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-surface placeholder:text-fg-muted"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === status
                    ? 'border-accent bg-accent text-white'
                    : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'border-accent bg-accent text-white'
                  : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg'
              }`}
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
            <thead className="bg-sunken border-b border-line">
              <tr>
                <th className="py-3 px-4 sm:px-5 text-xs font-semibold text-fg-muted">Item</th>
                <th className="py-3 px-4 text-xs font-semibold text-fg-muted">Category</th>
                <th className="py-3 px-4 text-xs font-semibold text-fg-muted">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-fg-muted text-center">Quantity</th>
                <th className="py-3 px-4 text-xs font-semibold text-fg-muted">Updated</th>
                <th className="py-3 px-4 sm:px-5 text-xs font-semibold text-fg-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-base text-fg-muted">
                    No items match your filters
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-sunken/60 transition-colors">
                    <td className="py-3.5 px-4 sm:px-5">
                      <p className="text-sm font-semibold text-fg">{item.name}</p>
                      {item.notes && <p className="text-xs text-fg-muted mt-0.5">{item.notes}</p>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-fg-muted font-medium">{item.category}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() =>
                          onUpdateInventoryItem({
                            ...item,
                            quantity: item.quantity > 0 ? 0 : item.minThreshold + 10,
                            updatedAt: new Date(),
                          })
                        }
                        className="cursor-pointer group"
                        title="Click to toggle stock availability"
                      >
                        {statusBadge(stockStatus(item))}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAdjustQuantity(item, -10)}
                          className="w-6 h-6 rounded-lg border border-line hover:bg-sunken text-fg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                          title="Decrease by 10"
                        >
                          −
                        </button>
                        <span className="flex min-w-[76px] items-baseline justify-center gap-1">
                          <span className="tabular text-sm font-semibold text-fg">{item.quantity}</span>
                          <span className="meta">{item.unit}</span>
                        </span>
                        <button
                          onClick={() => handleAdjustQuantity(item, 10)}
                          className="w-6 h-6 rounded-lg border border-line hover:bg-sunken text-fg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                          title="Increase by 10"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-fg-muted">
                      {formatRelative(item.updatedAt)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-5 text-right">
                      <button
                        onClick={() => onDeleteInventoryItem(item.id)}
                        className="p-1.5 rounded-lg text-fg-muted hover:text-danger-text hover:bg-danger-tint transition-colors cursor-pointer"
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
          <div className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-line">
            <div className="flex items-center justify-between mb-5 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent-tint text-accent-text flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-fg">Add inventory item</h3>
                  <p className="text-sm text-fg-muted">This will be visible on the AccessBelt app</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-fg-muted hover:text-fg hover:bg-black/[0.04]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-fg mb-1">Item name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Apples, Peanut Butter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-line focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-surface placeholder:text-fg-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-fg mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-sm p-2.5 rounded-xl border border-line focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-surface"
                  >
                    {categories.filter(c => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-fg mb-1">Unit type</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full text-sm p-2.5 rounded-xl border border-line focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-surface"
                  >
                    <option value="lbs">Pounds (lbs)</option>
                    <option value="boxes">Boxes</option>
                    <option value="crates">Crates</option>
                    <option value="cans">Cans</option>
                    <option value="units">Individual units</option>
                    <option value="bags">Bags</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-fg mb-1">Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-sm p-2.5 rounded-xl border border-line focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-surface"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-fg mb-1">Low stock threshold</label>
                  <input
                    type="number"
                    min={0}
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                    className="w-full text-sm p-2.5 rounded-xl border border-line focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-fg mb-1">
                  Notes <span className="text-fg-muted font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Donated by Orchard Valley Farms"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-xl border border-line focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 bg-surface placeholder:text-fg-muted"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-fg-muted hover:text-fg rounded-xl hover:bg-black/[0.04] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors cursor-pointer shadow-xs"
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
