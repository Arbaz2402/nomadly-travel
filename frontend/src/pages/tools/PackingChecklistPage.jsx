import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Luggage,
  RotateCcw,
  Share2,
  Printer,
  Sun,
  CloudSnow,
  Compass,
  Flame,
  Check,
  FolderPlus,
  ListPlus,
  X
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const DEFAULT_TEMPLATES = {
  beach: {
    label: 'Beach & Coastal',
    icon: Sun,
    categories: [
      {
        name: 'Essential Documents & Cash',
        items: [
          { text: 'Passport / National ID & 2 color photocopies', packed: false },
          { text: 'Hotel reservation voucher & booking confirmation', packed: false },
          { text: 'Travel insurance card / policy details', packed: false },
          { text: 'Credit / Debit cards & local cash for beach shacks', packed: false },
        ],
      },
      {
        name: 'Clothing & Beachwear',
        items: [
          { text: 'Swimsuits / Swim trunks (2 pairs)', packed: false },
          { text: 'Lightweight linen / cotton shirts & t-shirts (4-5)', packed: false },
          { text: 'Shorts & comfortable evening trousers', packed: false },
          { text: 'UV-protection sunglasses with polarized lenses', packed: false },
          { text: 'Wide-brim sun hat or cap', packed: false },
          { text: 'Flip-flops / beach sliders & comfortable walking sandals', packed: false },
          { text: 'Quick-dry microfiber beach towel', packed: false },
        ],
      },
      {
        name: 'Sun Care & Toiletries',
        items: [
          { text: 'Broad-spectrum SPF 50+ waterproof sunscreen', packed: false },
          { text: 'Soothing Aloe Vera gel / after-sun lotion', packed: false },
          { text: 'Lip balm with SPF protection', packed: false },
          { text: 'Deodorant, toothbrush, toothpaste & travel shampoo', packed: false },
          { text: 'Mosquito & insect repellent lotion', packed: false },
        ],
      },
      {
        name: 'Electronics & Water Protection',
        items: [
          { text: 'Waterproof phone dry bag / pouch', packed: false },
          { text: 'Portable power bank (10,000mAh+)', packed: false },
          { text: 'Water-resistant Bluetooth speaker', packed: false },
          { text: 'Phone charger & universal adapter', packed: false },
        ],
      },
    ],
  },
  mountains: {
    label: 'Mountains & Cold',
    icon: CloudSnow,
    categories: [
      {
        name: 'Essential Documents & Passes',
        items: [
          { text: 'Passport / Government ID & required mountain permits', packed: false },
          { text: 'Hotel / Resort booking voucher', packed: false },
          { text: 'Travel insurance covering high-altitude activities', packed: false },
          { text: 'Emergency local cash (remote ATMs often out of service)', packed: false },
        ],
      },
      {
        name: 'Thermal & Outerwear',
        items: [
          { text: 'Thermal base layer tops & bottoms (merino wool/synthetic)', packed: false },
          { text: 'Fleece mid-layer jacket or wool sweater', packed: false },
          { text: 'Heavy down jacket / windproof waterproof parka', packed: false },
          { text: 'Sturdy waterproof hiking boots with ankle support', packed: false },
          { text: 'Thick thermal wool socks (3-4 pairs)', packed: false },
          { text: 'Insulated waterproof gloves & beanie / woolen cap', packed: false },
          { text: 'Neck warmer / fleece balaclava', packed: false },
        ],
      },
      {
        name: 'Skincare & First Aid',
        items: [
          { text: 'Heavy cold-cream moisturizer & intensive lip balm', packed: false },
          { text: 'Mountain sunblock (high UV reflection on snow)', packed: false },
          { text: 'Altitude sickness pills (Diamox if advised by doctor)', packed: false },
          { text: 'Pain relievers, bandages & blister pads', packed: false },
          { text: 'Hand warmers (disposable chemical heat packs)', packed: false },
        ],
      },
      {
        name: 'Gear & Tech',
        items: [
          { text: 'Thermal stainless steel vacuum flask / thermos', packed: false },
          { text: 'High-lumen headlamp or LED flashlight', packed: false },
          { text: 'Cold-resistant power bank & extra cables', packed: false },
          { text: 'UV400 Category 3/4 sunglasses (snow blindness prevention)', packed: false },
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
          { text: 'Passport / ID & digital backup on phone', packed: false },
          { text: 'Transit / Metro pass or travel contactless card', packed: false },
          { text: 'Hotel & museum booking confirmations', packed: false },
          { text: 'RFID-blocking wallet or passport pouch', packed: false },
        ],
      },
      {
        name: 'City Walking Apparel',
        items: [
          { text: 'High-comfort walking sneakers / cushioned shoes', packed: false },
          { text: 'Smart casual day outfits & evening dinner attire', packed: false },
          { text: 'Lightweight packable rain jacket or compact umbrella', packed: false },
          { text: 'Breathable anti-blister socks', packed: false },
        ],
      },
      {
        name: 'Tech & Daily Essentials',
        items: [
          { text: 'Noise-canceling earphones for trains & flights', packed: false },
          { text: 'Compact fast-charging power bank', packed: false },
          { text: 'Crossbody anti-theft sling bag or daypack', packed: false },
          { text: 'Reusable water bottle with filter', packed: false },
          { text: 'Hand sanitizer & disinfectant wipes', packed: false },
        ],
      },
    ],
  },
  adventure: {
    label: 'Adventure & Trek',
    icon: Flame,
    categories: [
      {
        name: 'Permits & Medical',
        items: [
          { text: 'Trail permits, national park entry passes & ID', packed: false },
          { text: 'Comprehensive outdoor first-aid kit & antiseptic', packed: false },
          { text: 'Electrolyte packets (ORS) & water purification tablets', packed: false },
          { text: 'Emergency whistle & multi-tool pocket knife', packed: false },
        ],
      },
      {
        name: 'Trek Gear & Apparel',
        items: [
          { text: 'Ergonomic 40-50L backpack with rain cover', packed: false },
          { text: 'Adjustable carbon-fiber trekking poles (pair)', packed: false },
          { text: 'Moisture-wicking dry-fit trail shirts & cargo pants', packed: false },
          { text: 'Gore-Tex waterproof trail runners or boots', packed: false },
          { text: 'Packable emergency foil thermal blanket', packed: false },
        ],
      },
    ],
  },
};

const STORAGE_KEY = 'nomadly_packing_checklist_v1';
const CUSTOM_LISTS_KEY = 'nomadly_custom_checklists_v1';

export const PackingChecklistPage = () => {
  const { showToast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('beach');
  const [checklist, setChecklist] = useState(DEFAULT_TEMPLATES.beach.categories);
  const [customChecklists, setCustomChecklists] = useState([]);

  // Add item & category inputs
  const [newItemText, setNewItemText] = useState('');
  const [targetCategory, setTargetCategory] = useState(0);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Create custom checklist modal/panel state
  const [showCreator, setShowCreator] = useState(false);
  const [customListTitle, setCustomListTitle] = useState('');
  const [customStarterMode, setCustomStarterMode] = useState('essentials'); // 'blank' | 'essentials'

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedCustom = localStorage.getItem(CUSTOM_LISTS_KEY);
      if (savedCustom) {
        const parsedCustom = JSON.parse(savedCustom);
        if (Array.isArray(parsedCustom)) setCustomChecklists(parsedCustom);
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.categories)) {
          setChecklist(parsed.categories);
          if (parsed.templateKey) setSelectedTemplate(parsed.templateKey);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved checklist:', err);
    }
    setChecklist(DEFAULT_TEMPLATES.beach.categories);
  }, []);

  // Persist active checklist & sync any updates to customChecklists if active is custom
  useEffect(() => {
    if (checklist && Array.isArray(checklist)) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ templateKey: selectedTemplate, categories: checklist })
      );

      if (selectedTemplate.startsWith('custom_')) {
        setCustomChecklists((prev) => {
          const updated = prev.map((c) =>
            c.id === selectedTemplate ? { ...c, categories: checklist } : c
          );
          localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [checklist, selectedTemplate]);

  const switchTemplate = (key) => {
    const customMatch = customChecklists.find((c) => c.id === key);
    if (customMatch) {
      setSelectedTemplate(key);
      setChecklist(JSON.parse(JSON.stringify(customMatch.categories)));
      setTargetCategory(0);
      showToast(`Switched to "${customMatch.label}"`, 'info');
      return;
    }

    if (
      window.confirm(
        'Switching templates will load a new packing list. Reset current checklist?'
      )
    ) {
      setSelectedTemplate(key);
      setChecklist(JSON.parse(JSON.stringify(DEFAULT_TEMPLATES[key].categories)));
      setTargetCategory(0);
      showToast(`Loaded ${DEFAULT_TEMPLATES[key].label} checklist`, 'info');
    }
  };

  const handleCreateCustomChecklist = (e) => {
    e.preventDefault();
    const trimmed = customListTitle.trim();
    if (!trimmed) {
      showToast('Please enter a name for your checklist', 'error');
      return;
    }

    const newId = `custom_${Date.now()}`;
    const starterCategories =
      customStarterMode === 'blank'
        ? [{ name: 'My Packing Items', items: [] }]
        : [
            {
              name: 'Documents & Essentials',
              items: [
                { text: 'Passport / Government ID', packed: false },
                { text: 'Phone charger & power bank', packed: false },
                { text: 'Wallet, cards & local cash', packed: false },
              ],
            },
            {
              name: 'Clothing & Personal Care',
              items: [
                { text: 'Daily outfits & comfortable shoes', packed: false },
                { text: 'Toothbrush, toothpaste & toiletries', packed: false },
              ],
            },
          ];

    const newList = {
      id: newId,
      label: trimmed,
      categories: starterCategories,
    };

    const nextCustomLists = [...customChecklists, newList];
    setCustomChecklists(nextCustomLists);
    localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(nextCustomLists));

    setSelectedTemplate(newId);
    setChecklist(JSON.parse(JSON.stringify(starterCategories)));
    setTargetCategory(0);
    setCustomListTitle('');
    setShowCreator(false);
    showToast(`Created custom checklist "${trimmed}"!`, 'success');
  };

  const handleDeleteCustomChecklist = (e, id, label) => {
    e.stopPropagation();
    if (!window.confirm(`Delete custom checklist "${label}"?`)) return;

    const nextCustomLists = customChecklists.filter((c) => c.id !== id);
    setCustomChecklists(nextCustomLists);
    localStorage.setItem(CUSTOM_LISTS_KEY, JSON.stringify(nextCustomLists));

    if (selectedTemplate === id) {
      setSelectedTemplate('beach');
      setChecklist(JSON.parse(JSON.stringify(DEFAULT_TEMPLATES.beach.categories)));
      setTargetCategory(0);
    }
    showToast(`Deleted "${label}"`, 'info');
  };

  const toggleItem = (catIdx, itemIdx) => {
    setChecklist((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[catIdx].items[itemIdx].packed = !copy[catIdx].items[itemIdx].packed;
      return copy;
    });
  };

  const deleteItem = (catIdx, itemIdx) => {
    setChecklist((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[catIdx].items.splice(itemIdx, 1);
      return copy;
    });
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    setChecklist((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const idx = copy[targetCategory] ? targetCategory : 0;
      if (!copy[idx]) {
        copy.push({ name: 'General Items', items: [] });
      }
      copy[idx].items.push({ text: newItemText.trim(), packed: false });
      return copy;
    });
    setNewItemText('');
    showToast('Item added to packing list', 'success');
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setChecklist((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.push({ name: newCategoryName.trim(), items: [] });
      setTargetCategory(copy.length - 1);
      return copy;
    });
    setNewCategoryName('');
    showToast('New category added', 'success');
  };

  const handleDeleteCategory = (catIdx, name) => {
    if (checklist.length <= 1) {
      showToast('At least one category is required', 'error');
      return;
    }
    if (!window.confirm(`Remove category "${name}" and all its items?`)) return;
    setChecklist((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy.splice(catIdx, 1);
      return copy;
    });
    setTargetCategory(0);
  };

  const resetAllItems = () => {
    if (window.confirm('Uncheck all items to start fresh?')) {
      setChecklist((prev) => {
        const copy = JSON.parse(JSON.stringify(prev));
        copy.forEach((cat) => cat.items.forEach((it) => (it.packed = false)));
        return copy;
      });
      showToast('Checklist reset', 'info');
    }
  };

  // Calculations
  const totalItems = checklist.reduce((acc, cat) => acc + cat.items.length, 0);
  const packedItems = checklist.reduce(
    (acc, cat) => acc + cat.items.filter((it) => it.packed).length,
    0
  );
  const percentage = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  const activeLabel =
    DEFAULT_TEMPLATES[selectedTemplate]?.label ||
    customChecklists.find((c) => c.id === selectedTemplate)?.label ||
    'Custom Trip';

  const handleShare = () => {
    const lines = [
      `Nomadly Travel Packing Checklist (${activeLabel})`,
      `Progress: ${packedItems}/${totalItems} items packed (${percentage}%)`,
      '',
    ];

    checklist.forEach((cat) => {
      lines.push(`${cat.name}:`);
      cat.items.forEach((it) => {
        lines.push(`${it.packed ? ' [x] ' : ' [ ] '} ${it.text}`);
      });
      lines.push('');
    });

    lines.push('Generated with Nomadly Travel Platform');
    navigator.clipboard.writeText(lines.join('\n'));
    showToast('Checklist copied to clipboard! Ready to share on WhatsApp.', 'success');
  };

  return (
    <div className="min-h-screen pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-coral-500/10 border border-coral-500/20 text-coral-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Luggage className="w-4 h-4" />
          Smart Packing Assistant
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight font-display mb-2">
          Travel Packing Checklist
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Pick a smart trip template or create your own custom checklist with custom categories and items.
        </p>
      </div>

      {/* Preset & Custom Checklist Selector */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {Object.keys(DEFAULT_TEMPLATES).map((key) => {
          const t = DEFAULT_TEMPLATES[key];
          const Icon = t.icon;
          const isSelected = selectedTemplate === key;
          return (
            <button
              key={key}
              onClick={() => switchTemplate(key)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border transition-all ${
                isSelected
                  ? 'bg-coral-500 text-white border-coral-500 shadow-glow'
                  : 'bg-ink-900 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}

        {customChecklists.map((custom) => {
          const isSelected = selectedTemplate === custom.id;
          return (
            <div
              key={custom.id}
              onClick={() => switchTemplate(custom.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-teal-500 text-white border-teal-500 shadow-glow'
                  : 'bg-ink-900 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
              }`}
            >
              <ListPlus className="w-4 h-4" />
              <span>{custom.label}</span>
              <button
                type="button"
                onClick={(e) => handleDeleteCustomChecklist(e, custom.id, custom.label)}
                className="ml-1 p-0.5 rounded-full hover:bg-black/20 text-white/70 hover:text-white"
                title="Delete custom checklist"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setShowCreator((v) => !v)}
          className="px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 border border-dashed border-coral-500/50 text-coral-400 hover:bg-coral-500/10 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Your Own
        </button>
      </div>

      {/* Inline Custom Checklist Creator */}
      {showCreator && (
        <form
          onSubmit={handleCreateCustomChecklist}
          className="glass-panel p-5 rounded-3xl border border-coral-500/30 bg-ink-900/90 shadow-xl space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <ListPlus className="w-4 h-4 text-coral-400" />
              Create Custom Packing Checklist
            </h3>
            <button
              type="button"
              onClick={() => setShowCreator(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6">
              <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                Checklist Name *
              </label>
              <input
                type="text"
                required
                value={customListTitle}
                onChange={(e) => setCustomListTitle(e.target.value)}
                placeholder="e.g. Dubai Family Trip, Solo Bike Ride, Business Tour"
                className="w-full px-3.5 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-coral-500"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                Starting Items
              </label>
              <select
                value={customStarterMode}
                onChange={(e) => setCustomStarterMode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-ink-950 border border-white/10 text-xs font-semibold text-slate-200 focus:outline-none"
              >
                <option value="essentials">Include Basic Essentials (ID, Charger)</option>
                <option value="blank">Start Completely Blank</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold shadow-glow transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Progress & Stats Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Luggage Packing Progress ({activeLabel})</span>
            <span className="font-mono text-coral-400">
              {packedItems} / {totalItems} Packed ({percentage}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-ink-950 overflow-hidden border border-white/5 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage === 100
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                  : 'bg-gradient-to-r from-coral-500 to-amber-400'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-ink-900 hover:bg-ink-800 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Share checklist on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-coral-400" /> Share
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-ink-900 hover:bg-ink-800 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Print checklist"
          >
            <Printer className="w-3.5 h-3.5 text-teal-400" /> Print
          </button>
          <button
            onClick={resetAllItems}
            className="p-2 rounded-xl bg-ink-900 hover:bg-rose-500/20 border border-white/10 text-slate-400 hover:text-rose-400 transition-colors"
            title="Reset checklist"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categories & Checklist Items */}
      <div className="space-y-5">
        {checklist.map((cat, catIdx) => {
          const catPacked = cat.items.filter((it) => it.packed).length;
          const catTotal = cat.items.length;

          return (
            <div
              key={catIdx}
              className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-lg"
            >
              {/* Category Header */}
              <div className="p-4 bg-ink-950/80 border-b border-white/5 flex items-center justify-between text-xs">
                <span className="font-bold text-white font-display text-sm flex items-center gap-2">
                  <Luggage className="w-4 h-4 text-coral-400" />
                  {cat.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400">
                    {catPacked} / {catTotal} packed
                  </span>
                  {checklist.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(catIdx, cat.name)}
                      className="text-slate-600 hover:text-rose-400 transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-white/5">
                {cat.items.length === 0 ? (
                  <div className="p-4 text-center text-[11px] text-slate-500 italic">
                    No items in this category yet. Add items below!
                  </div>
                ) : (
                  cat.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className={`p-3.5 px-5 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                        item.packed
                          ? 'bg-emerald-500/[0.03] text-slate-500 line-through'
                          : 'hover:bg-white/[0.02] text-slate-200'
                      }`}
                      onClick={() => toggleItem(catIdx, itemIdx)}
                    >
                      <div className="flex items-center gap-3 select-none flex-1">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            item.packed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-600 bg-transparent text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className={`text-xs ${item.packed ? 'text-slate-500' : 'text-slate-200 font-medium'}`}>
                          {item.text}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(catIdx, itemIdx);
                        }}
                        className="text-slate-600 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Item & Add New Category Forms */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <form
          onSubmit={handleAddItem}
          className="md:col-span-8 glass-panel p-4 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center gap-2.5"
        >
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add item (e.g. Scuba goggles, tripod)"
            className="w-full px-3.5 py-2.5 rounded-2xl bg-ink-950 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-coral-500"
          />

          <select
            value={targetCategory}
            onChange={(e) => setTargetCategory(parseInt(e.target.value))}
            className="w-full sm:w-44 px-3 py-2.5 rounded-2xl bg-ink-950 border border-white/10 text-xs font-semibold text-slate-200 focus:outline-none shrink-0"
          >
            {checklist.map((c, i) => (
              <option key={i} value={i}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-coral-500 hover:bg-coral-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-glow shrink-0 transition-all"
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
            className="px-3.5 py-2.5 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center gap-1 shrink-0 transition-all"
            title="Add new category"
          >
            <FolderPlus className="w-4 h-4" /> Add
          </button>
        </form>
      </div>
    </div>
  );
};
