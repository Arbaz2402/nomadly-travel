import React, { useState, useEffect } from 'react';
import {
  Luggage,
  Plus,
  Trash2,
  Check,
  FolderPlus,
  Share2,
  Printer,
  RotateCcw,
  Sparkles,
  Sun,
  CloudSnow,
  Compass,
  Flame,
  Loader2
} from 'lucide-react';
import { ApiClient } from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

const JOURNEY_TEMPLATES = {
  beach: {
    label: 'Beach & Coastal',
    icon: Sun,
    categories: [
      {
        name: 'Documents & Cash',
        items: [
          { text: 'Passport / ID & booking confirmation', packed: false },
          { text: 'Travel insurance details & emergency cash', packed: false },
        ],
      },
      {
        name: 'Beachwear & Sun Care',
        items: [
          { text: 'Swimwear & lightweight cotton/linen outfits', packed: false },
          { text: 'SPF 50+ sunscreen, sunglasses & sun hat', packed: false },
          { text: 'Flip-flops, beach towel & waterproof phone pouch', packed: false },
        ],
      },
      {
        name: 'Tech & Toiletries',
        items: [
          { text: 'Phone charger, power bank & universal adapter', packed: false },
          { text: 'Toothbrush, deodorant & mosquito repellent', packed: false },
        ],
      },
    ],
  },
  mountains: {
    label: 'Mountains & Cold',
    icon: CloudSnow,
    categories: [
      {
        name: 'Documents & Permits',
        items: [
          { text: 'ID / Passport & local hill-station permits', packed: false },
          { text: 'Offline maps & emergency cash', packed: false },
        ],
      },
      {
        name: 'Warm & Layered Clothing',
        items: [
          { text: 'Thermal base layers & fleece jacket', packed: false },
          { text: 'Windproof / waterproof outer jacket', packed: false },
          { text: 'Warm socks, gloves, beanie & sturdy hiking shoes', packed: false },
        ],
      },
      {
        name: 'Health & Gear',
        items: [
          { text: 'Moisturizer, lip balm & mountain sunscreen', packed: false },
          { text: 'First-aid kit, pain relievers & thermos flask', packed: false },
          { text: 'Power bank & flashlight / headlamp', packed: false },
        ],
      },
    ],
  },
  city: {
    label: 'City & Sightseeing',
    icon: Compass,
    categories: [
      {
        name: 'Documents & Wallet',
        items: [
          { text: 'Passport / ID & hotel vouchers', packed: false },
          { text: 'Transit card, credit cards & local currency', packed: false },
        ],
      },
      {
        name: 'Apparel & Daily Carry',
        items: [
          { text: 'Comfortable walking sneakers & daypack', packed: false },
          { text: 'Smart casual outfits & packable rain jacket/umbrella', packed: false },
          { text: 'Phone charger, power bank & earphones', packed: false },
        ],
      },
    ],
  },
  adventure: {
    label: 'Adventure & Trek',
    icon: Flame,
    categories: [
      {
        name: 'Permits & First Aid',
        items: [
          { text: 'Trail permits, ID & outdoor first-aid kit', packed: false },
          { text: 'ORS electrolyte packets & water bottle', packed: false },
        ],
      },
      {
        name: 'Trek Gear',
        items: [
          { text: 'Trekking shoes, dry-fit clothes & rain poncho', packed: false },
          { text: 'Backpack with rain cover & power bank', packed: false },
        ],
      },
    ],
  },
};

const guessTemplateForDestination = (dest = '') => {
  const d = dest.toLowerCase();
  if (/goa|bali|phuket|maldives|andaman|varkala|pondicherry|beach|island|miami/.test(d)) return 'beach';
  if (/coorg|manali|shimla|ladakh|kashmir|munnar|ooty|leh|swiss|alps|mountain/.test(d)) return 'mountains';
  if (/trek|camp|spiti|rishikesh|nepal|safari/.test(d)) return 'adventure';
  return 'city';
};

export const PackingView = ({ trip, canEdit, onRefresh }) => {
  const { showToast } = useToast();
  const [list, setList] = useState(trip.packingList || []);
  const [saving, setSaving] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [targetCategory, setTargetCategory] = useState(0);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    setList(trip.packingList || []);
  }, [trip._id, trip.packingList]);

  const persistPackingList = async (nextList, toastMsg = null) => {
    setList(nextList);
    try {
      setSaving(true);
      const res = await ApiClient.updateTrip(trip._id, { packingList: nextList });
      if (res.success) {
        if (toastMsg) showToast(toastMsg, 'success');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to sync packing list', 'error');
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (key) => {
    const template = JOURNEY_TEMPLATES[key];
    if (!template) return;
    if (list.length > 0 && !window.confirm(`Replace current packing list for "${trip.title}" with ${template.label} template?`)) {
      return;
    }
    const nextList = JSON.parse(JSON.stringify(template.categories));
    persistPackingList(nextList, `Synced ${template.label} packing list for ${trip.title}!`);
  };

  const startBlank = () => {
    const nextList = [{ name: 'Trip Essentials', items: [] }];
    persistPackingList(nextList, 'Created blank packing checklist for this journey!');
  };

  const toggleItem = (catIdx, itemIdx) => {
    if (!canEdit) return;
    const nextList = JSON.parse(JSON.stringify(list));
    nextList[catIdx].items[itemIdx].packed = !nextList[catIdx].items[itemIdx].packed;
    persistPackingList(nextList);
  };

  const deleteItem = (catIdx, itemIdx) => {
    if (!canEdit) return;
    const nextList = JSON.parse(JSON.stringify(list));
    nextList[catIdx].items.splice(itemIdx, 1);
    persistPackingList(nextList);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim() || !canEdit) return;
    const nextList = JSON.parse(JSON.stringify(list));
    const idx = nextList[targetCategory] ? targetCategory : 0;
    if (!nextList[idx]) nextList.push({ name: 'Trip Essentials', items: [] });
    nextList[idx].items.push({ text: newItemText.trim(), packed: false });
    setNewItemText('');
    persistPackingList(nextList, 'Item added & synced to journey!');
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !canEdit) return;
    const nextList = JSON.parse(JSON.stringify(list));
    nextList.push({ name: newCategoryName.trim(), items: [] });
    setTargetCategory(nextList.length - 1);
    setNewCategoryName('');
    persistPackingList(nextList, 'Category added!');
  };

  const handleDeleteCategory = (catIdx, name) => {
    if (!canEdit || list.length <= 1) return;
    if (!window.confirm(`Remove category "${name}"?`)) return;
    const nextList = JSON.parse(JSON.stringify(list));
    nextList.splice(catIdx, 1);
    setTargetCategory(0);
    persistPackingList(nextList);
  };

  const handleReset = () => {
    if (!canEdit || !window.confirm('Uncheck all packed items for this trip?')) return;
    const nextList = JSON.parse(JSON.stringify(list));
    nextList.forEach((c) => c.items.forEach((it) => (it.packed = false)));
    persistPackingList(nextList, 'Checklist reset');
  };

  const totalItems = list.reduce((acc, c) => acc + c.items.length, 0);
  const packedItems = list.reduce((acc, c) => acc + c.items.filter((it) => it.packed).length, 0);
  const percentage = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
  const recommendedKey = guessTemplateForDestination(trip.destination);

  const handleShare = () => {
    const lines = [
      `${trip.title} (${trip.destination}) - Packing Checklist`,
      `Progress: ${packedItems}/${totalItems} packed (${percentage}%)`,
      '',
    ];
    list.forEach((c) => {
      lines.push(`${c.name}:`);
      c.items.forEach((it) => lines.push(`${it.packed ? ' [x] ' : ' [ ] '} ${it.text}`));
      lines.push('');
    });
    navigator.clipboard.writeText(lines.join('\n'));
    showToast('Journey packing checklist copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-ink-900/60 p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white font-display">
              {trip.title} — Packing Checklist
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center gap-1">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {saving ? 'Syncing...' : 'Synced to Journey'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dedicated packing checklist saved specifically for <strong>{trip.destination}</strong> and shared with all trip collaborators.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShare}
            disabled={list.length === 0}
            className="px-3.5 py-2 rounded-xl bg-ink-950 hover:bg-ink-800 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Share2 className="w-3.5 h-3.5 text-coral-400" /> Share
          </button>
          <button
            onClick={() => window.print()}
            disabled={list.length === 0}
            className="px-3.5 py-2 rounded-xl bg-ink-950 hover:bg-ink-800 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" /> Print
          </button>
          {canEdit && list.length > 0 && (
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-ink-950 hover:bg-rose-500/20 border border-white/10 text-slate-400 hover:text-rose-400 transition-colors"
              title="Uncheck all items"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Empty State / Smart Destination Template Picker */}
      {list.length === 0 ? (
        <div className="glass-panel p-8 rounded-3xl border border-white/10 text-center space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-coral-500/10 border border-coral-500/20 text-coral-400 flex items-center justify-center mx-auto">
            <Luggage className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h4 className="text-base font-bold text-white font-display">
              No Packing List Yet for {trip.destination}
            </h4>
            <p className="text-xs text-slate-400">
              Generate a smart checklist tailored to <strong>{trip.destination}</strong> or start your own custom list from scratch.
            </p>
          </div>

          {canEdit && (
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              {Object.keys(JOURNEY_TEMPLATES).map((key) => {
                const t = JOURNEY_TEMPLATES[key];
                const Icon = t.icon;
                const isRecommended = key === recommendedKey;
                return (
                  <button
                    key={key}
                    onClick={() => applyTemplate(key)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
                      isRecommended
                        ? 'bg-coral-500 text-white border-coral-500 shadow-glow'
                        : 'bg-ink-950 border-white/10 text-slate-300 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                    {isRecommended && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/20">
                        Recommended
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={startBlank}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-dashed border-teal-500/50 text-teal-400 hover:bg-teal-500/10 transition-all"
              >
                <Plus className="w-4 h-4" /> Start Blank Checklist
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Progress Bar */}
          <div className="glass-panel p-5 rounded-3xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>Journey Packing Progress</span>
              <span className="font-mono text-coral-400">
                {packedItems} / {totalItems} Packed ({percentage}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-ink-950 overflow-hidden border border-white/5 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  percentage === 100
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                    : 'bg-gradient-to-r from-coral-500 to-amber-400'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            {list.map((cat, catIdx) => {
              const catPacked = cat.items.filter((it) => it.packed).length;
              return (
                <div key={catIdx} className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
                  <div className="p-4 bg-ink-950/80 border-b border-white/5 flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-display flex items-center gap-2">
                      <Luggage className="w-4 h-4 text-coral-400" />
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400">
                        {catPacked} / {cat.items.length} packed
                      </span>
                      {canEdit && list.length > 1 && (
                        <button
                          onClick={() => handleDeleteCategory(catIdx, cat.name)}
                          className="text-slate-600 hover:text-rose-400 transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-white/5">
                    {cat.items.length === 0 ? (
                      <div className="p-4 text-center text-[11px] text-slate-500 italic">
                        No items in this category yet.
                      </div>
                    ) : (
                      cat.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          onClick={() => toggleItem(catIdx, itemIdx)}
                          className={`p-3.5 px-5 flex items-center justify-between gap-3 text-xs transition-colors ${
                            canEdit ? 'cursor-pointer' : ''
                          } ${
                            item.packed
                              ? 'bg-emerald-500/[0.03] text-slate-500 line-through'
                              : 'hover:bg-white/[0.02] text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                item.packed
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-slate-600 bg-transparent text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                            <span className={item.packed ? 'text-slate-500' : 'text-slate-200 font-medium'}>
                              {item.text}
                            </span>
                          </div>

                          {canEdit && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(catIdx, itemIdx);
                              }}
                              className="text-slate-600 hover:text-rose-400 p-1 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Item & Add Category */}
          {canEdit && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <form
                onSubmit={handleAddItem}
                className="md:col-span-8 glass-panel p-4 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center gap-2.5"
              >
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Add packing item for this journey..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-ink-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-coral-500"
                />
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(parseInt(e.target.value))}
                  className="w-full sm:w-44 px-3 py-2.5 rounded-2xl bg-ink-950 border border-white/10 text-xs font-semibold text-slate-200 shrink-0"
                >
                  {list.map((c, i) => (
                    <option key={i} value={i}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-glow shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </form>

              <form
                onSubmit={handleAddCategory}
                className="md:col-span-4 glass-panel p-4 rounded-3xl border border-white/10 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-ink-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2.5 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  <FolderPlus className="w-4 h-4" /> Add
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};
