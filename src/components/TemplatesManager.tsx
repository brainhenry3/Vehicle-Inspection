import React, { useState } from "react";
import { InspectionTemplate } from "../types";
import { Wrench, Plus, Edit3, Trash2, Copy, CheckCircle2, XCircle, Save, X, Layers } from "lucide-react";

interface TemplatesManagerProps {
  templates: InspectionTemplate[];
  onSaveTemplate: (tpl: InspectionTemplate) => void;
  onDeleteTemplate: (id: string) => void;
}

export const TemplatesManager: React.FC<TemplatesManagerProps> = ({ templates, onSaveTemplate, onDeleteTemplate }) => {
  const [selectedTpl, setSelectedTpl] = useState<InspectionTemplate | null>(templates[0] || null);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerName, setHeaderName] = useState("");
  const [headerVehicleType, setHeaderVehicleType] = useState("");
  const [headerVersion, setHeaderVersion] = useState("");

  const [newCategoryName, setNewCategoryName] = useState("");
  const [activeCategoryForNewItem, setActiveCategoryForNewItem] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");

  const [editingItemCoords, setEditingItemCoords] = useState<{ catIdx: number; itemIdx: number } | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemDesc, setEditItemDesc] = useState("");

  const handleSelectTemplate = (tpl: InspectionTemplate) => {
    setSelectedTpl(tpl);
    setHeaderName(tpl.name);
    setHeaderVehicleType(tpl.vehicleType);
    setHeaderVersion(tpl.version);
    setIsEditingHeader(false);
    setActiveCategoryForNewItem(null);
    setEditingItemCoords(null);
  };

  const handleDuplicate = (tpl: InspectionTemplate) => {
    const dup: InspectionTemplate = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      name: `${tpl.name} (Copy)`,
    };
    onSaveTemplate(dup);
    handleSelectTemplate(dup);
  };

  const handleToggleActive = (tpl: InspectionTemplate) => {
    const updated = { ...tpl, active: !tpl.active };
    onSaveTemplate(updated);
    if (selectedTpl?.id === tpl.id) setSelectedTpl(updated);
  };

  const handleSaveHeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTpl) return;
    const updated = {
      ...selectedTpl,
      name: headerName || selectedTpl.name,
      vehicleType: headerVehicleType || selectedTpl.vehicleType,
      version: headerVersion || selectedTpl.version,
    };
    onSaveTemplate(updated);
    setSelectedTpl(updated);
    setIsEditingHeader(false);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTpl || !newCategoryName.trim()) return;
    const updatedCategories = [...selectedTpl.categories, { name: newCategoryName.trim(), items: [] }];
    const updated = { ...selectedTpl, categories: updatedCategories };
    onSaveTemplate(updated);
    setSelectedTpl(updated);
    setNewCategoryName("");
  };

  const handleDeleteCategory = (catIdx: number) => {
    if (!selectedTpl) return;
    if (!window.confirm("Are you sure you want to delete this category and all its items?")) return;
    const updatedCategories = selectedTpl.categories.filter((_, idx) => idx !== catIdx);
    const updated = { ...selectedTpl, categories: updatedCategories };
    onSaveTemplate(updated);
    setSelectedTpl(updated);
  };

  const handleAddItem = (catIdx: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTpl || !newItemName.trim()) return;
    const updatedCategories = selectedTpl.categories.map((cat, idx) => {
      if (idx === catIdx) {
        return {
          ...cat,
          items: [...cat.items, { name: newItemName.trim(), description: newItemDesc.trim() }]
        };
      }
      return cat;
    });
    const updated = { ...selectedTpl, categories: updatedCategories };
    onSaveTemplate(updated);
    setSelectedTpl(updated);
    setNewItemName("");
    setNewItemDesc("");
    setActiveCategoryForNewItem(null);
  };

  const handleDeleteItem = (catIdx: number, itemIdx: number) => {
    if (!selectedTpl) return;
    const updatedCategories = selectedTpl.categories.map((cat, idx) => {
      if (idx === catIdx) {
        return {
          ...cat,
          items: cat.items.filter((_, i) => i !== itemIdx)
        };
      }
      return cat;
    });
    const updated = { ...selectedTpl, categories: updatedCategories };
    onSaveTemplate(updated);
    setSelectedTpl(updated);
  };

  const handleUpdateItem = (catIdx: number, itemIdx: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTpl) return;
    const updatedCategories = selectedTpl.categories.map((cat, idx) => {
      if (idx === catIdx) {
        const newItems = cat.items.map((item, i) => {
          if (i === itemIdx) {
            return { name: editItemName, description: editItemDesc };
          }
          return item;
        });
        return { ...cat, items: newItems };
      }
      return cat;
    });
    const updated = { ...selectedTpl, categories: updatedCategories };
    onSaveTemplate(updated);
    setSelectedTpl(updated);
    setEditingItemCoords(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Dynamic Inspection Templates Manager</h1>
          <p className="text-xs text-slate-400">Configure vehicle-specific inspection checklists, categories, and item lines</p>
        </div>
        <button
          onClick={() => {
            const newTpl: InspectionTemplate = {
              id: `tpl-${Date.now()}`,
              name: "New Fleet Inspection Template",
              vehicleType: "SUV",
              active: true,
              version: "1.0",
              categories: [
                {
                  name: "General Condition",
                  items: [
                    { name: "Exterior Paint & Body Panels", description: "Check for scratches or dents" },
                    { name: "Windshield Glass & Wipers", description: "Check for cracks and wiper performance" }
                  ]
                }
              ]
            };
            onSaveTemplate(newTpl);
            handleSelectTemplate(newTpl);
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-medium shadow flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List Sidebar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider px-2">Available Templates</div>
          <div className="space-y-2">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-4 rounded-xl cursor-pointer border transition flex items-center justify-between ${
                  selectedTpl?.id === tpl.id
                    ? "bg-blue-600/10 border-blue-500/50 text-white"
                    : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                <div>
                  <div className="font-bold text-sm">{tpl.name}</div>
                  <div className="text-xs text-blue-400 mt-0.5">{tpl.vehicleType} • v{tpl.version}</div>
                </div>
                <div className="flex items-center space-x-1">
                  {tpl.active ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" title="Active" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-500" title="Inactive" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Template Details & Categories */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-6">
          {selectedTpl ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 gap-4">
                {!isEditingHeader ? (
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                      <span>{selectedTpl.name}</span>
                      <button
                        onClick={() => {
                          setIsEditingHeader(true);
                          setHeaderName(selectedTpl.name);
                          setHeaderVehicleType(selectedTpl.vehicleType);
                          setHeaderVersion(selectedTpl.version);
                        }}
                        className="text-slate-400 hover:text-white"
                        title="Edit Template Header"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">Target Vehicle: {selectedTpl.vehicleType} | Version {selectedTpl.version}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSaveHeader} className="space-y-3 w-full sm:w-auto">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={headerName}
                        onChange={(e) => setHeaderName(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                        placeholder="Template Name"
                        required
                      />
                      <input
                        type="text"
                        value={headerVehicleType}
                        onChange={(e) => setHeaderVehicleType(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white w-32"
                        placeholder="Vehicle Type"
                        required
                      />
                      <input
                        type="text"
                        value={headerVersion}
                        onChange={(e) => setHeaderVersion(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white w-20"
                        placeholder="Version"
                        required
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold">Save</button>
                      <button type="button" onClick={() => setIsEditingHeader(false)} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs">Cancel</button>
                    </div>
                  </form>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(selectedTpl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                      selectedTpl.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {selectedTpl.active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => handleDuplicate(selectedTpl)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
                    title="Duplicate Template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTemplate(selectedTpl.id)}
                    className="p-2 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl transition"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex gap-2 items-center">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New Category Name (e.g. Steering & Suspension)"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-medium shadow flex items-center space-x-1 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </form>

              {/* Categories & Items List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Inspection Categories & Item Lines</h3>
                {selectedTpl.categories.map((cat, catIdx) => (
                  <div key={catIdx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="font-bold text-white text-sm flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-blue-400" />
                        <span>{cat.name}</span>
                        <span className="text-xs text-slate-500 font-normal">({cat.items.length} items)</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setActiveCategoryForNewItem(activeCategoryForNewItem === cat.name ? null : cat.name)}
                          className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Item</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(catIdx)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Add Item Form for this category */}
                    {activeCategoryForNewItem === cat.name && (
                      <form onSubmit={(e) => handleAddItem(catIdx, e)} className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2">
                        <div className="text-xs font-bold text-slate-300">Add New Item to {cat.name}</div>
                        <input
                          type="text"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="Item Name (e.g. Brake Pad Thickness)"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                          required
                        />
                        <input
                          type="text"
                          value={newItemDesc}
                          onChange={(e) => setNewItemDesc(e.target.value)}
                          placeholder="Description / Instructions (e.g. Measure in mm, min 3mm)"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                        />
                        <div className="flex justify-end space-x-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setActiveCategoryForNewItem(null)}
                            className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                          >
                            Save Item
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Items Grid */}
                    <div className="space-y-2">
                      {cat.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4">
                          {editingItemCoords?.catIdx === catIdx && editingItemCoords?.itemIdx === itemIdx ? (
                            <form onSubmit={(e) => handleUpdateItem(catIdx, itemIdx, e)} className="flex-1 space-y-2">
                              <input
                                type="text"
                                value={editItemName}
                                onChange={(e) => setEditItemName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-semibold"
                                required
                              />
                              <input
                                type="text"
                                value={editItemDesc}
                                onChange={(e) => setEditItemDesc(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300"
                              />
                              <div className="flex space-x-2">
                                <button type="submit" className="px-2.5 py-1 bg-blue-600 text-white rounded text-[11px] font-semibold">Save</button>
                                <button type="button" onClick={() => setEditingItemCoords(null)} className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-[11px]">Cancel</button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <div className="space-y-0.5">
                                <div className="font-semibold text-xs text-slate-200">{item.name}</div>
                                <div className="text-[11px] text-slate-400">{item.description}</div>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingItemCoords({ catIdx, itemIdx });
                                    setEditItemName(item.name);
                                    setEditItemDesc(item.description);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-white transition"
                                  title="Edit Item"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(catIdx, itemIdx)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      {cat.items.length === 0 && (
                        <div className="text-center py-3 text-xs text-slate-500 italic">No inspection items in this category yet. Click "Add Item" above.</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500">Select a template to inspect categories.</div>
          )}
        </div>
      </div>
    </div>
  );
};
