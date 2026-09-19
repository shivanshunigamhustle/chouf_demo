"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Primitives";
import { useChoufStore } from "@/lib/store";

export function AddProductModal({
  open,
  onClose,
  merchantId,
  existingCategories,
}: {
  open: boolean;
  onClose: () => void;
  merchantId: string;
  existingCategories: string[];
}) {
  const addProduct = useChoufStore((s) => s.addProduct);
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [category, setCategory] = useState(existingCategories[0] ?? "");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function reset() {
    setName("");
    setNameAr("");
    setCategory(existingCategories[0] ?? "");
    setPrice("");
    setDescription("");
    setError("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    const priceNum = Number(price);
    if (!name.trim()) return setError("Product name is required.");
    if (!category.trim()) return setError("Category is required.");
    if (!priceNum || priceNum <= 0) return setError("Enter a valid price.");

    addProduct({
      merchantId,
      name: name.trim(),
      nameAr: nameAr.trim(),
      description: description.trim() || `${name.trim()}, freshly made to order.`,
      price: priceNum,
      category: category.trim(),
      categoryAr: category.trim(),
    });
    handleClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add product">
      <div className="flex flex-col gap-4">
        <div>
          <Label>Product name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Spicy Chicken Wrap" />
        </div>
        <div>
          <Label>Product name (Arabic) — optional</Label>
          <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="لفافة دجاج حار" dir="rtl" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Mains" list="category-suggestions" />
            <datalist id="category-suggestions">
              {existingCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div>
            <Label>Price (AED)</Label>
            <Input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min={0} step="0.5" placeholder="0.00" />
          </div>
        </div>
        <div>
          <Label>Description — optional</Label>
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description shown to customers" />
        </div>

        {error && <p className="text-xs font-semibold text-danger-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit}>
            Add to menu
          </Button>
        </div>
      </div>
    </Modal>
  );
}
