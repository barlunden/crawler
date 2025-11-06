import React, { useState, useEffect } from 'react';

interface InventoryItem {
  id: string;
  itemId: string;
  quantity: number;
  item: {
    name: string;
    description: string;
    rarity: string;
    value: number;
  };
}

interface InventoryPanelProps {
  characterId: string;
  gold: number;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ characterId, gold }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, [characterId]);

  const loadInventory = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/inventory/${characterId}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toUpperCase()) {
      case 'LEGENDARY':
        return 'text-orange-400 bg-orange-400/10 border-orange-400';
      case 'EPIC':
        return 'text-purple-400 bg-purple-400/10 border-purple-400';
      case 'RARE':
        return 'text-blue-400 bg-blue-400/10 border-blue-400';
      case 'UNCOMMON':
        return 'text-green-400 bg-green-400/10 border-green-400';
      default:
        return 'text-text-muted bg-surface-light border-surface-light';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-text-muted">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gold Display */}
      <div className="bg-surface-light p-4 rounded-lg flex items-center justify-between">
        <span className="text-sm text-text-muted">Gold</span>
        <div className="flex items-center gap-2">
          <span className="text-gold text-2xl">⚜</span>
          <span className="text-2xl font-bold text-gold">{gold}</span>
        </div>
      </div>

      {/* Inventory Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-secondary uppercase tracking-wide">
          Inventory
        </h4>
        <span className="text-xs text-text-muted">
          {items.reduce((sum, item) => sum + item.quantity, 0)} items
        </span>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="bg-surface-light p-6 rounded-lg text-center">
            <p className="text-sm text-text-muted">Your inventory is empty</p>
            <p className="text-xs text-text-muted mt-2">
              Explore the dungeon to find items
            </p>
          </div>
        ) : (
          items.map((inventoryItem) => (
            <div
              key={inventoryItem.id}
              className={`p-3 rounded-lg border-2 cursor-pointer hover:scale-105 transition-transform ${getRarityColor(
                inventoryItem.item.rarity
              )}`}
            >
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{inventoryItem.item.name}</p>
                    {inventoryItem.quantity > 1 && (
                      <span className="text-xs px-2 py-0.5 bg-accent rounded">
                        x{inventoryItem.quantity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    {inventoryItem.item.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="opacity-75">{inventoryItem.item.rarity}</span>
                <span className="flex items-center gap-1">
                  <span className="text-gold">⚜</span>
                  {inventoryItem.item.value}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Inventory Actions */}
      {items.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-surface">
          <button className="w-full py-2 px-4 bg-secondary text-accent hover:bg-secondary/90 rounded transition-colors text-sm font-semibold">
            Sort by Rarity
          </button>
          <button className="w-full py-2 px-4 bg-surface-light hover:bg-surface text-text rounded transition-colors text-sm">
            Sell All Junk
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryPanel;
