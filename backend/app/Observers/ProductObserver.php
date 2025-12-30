<?php

namespace App\Observers;

use App\Models\Product;

class ProductObserver
{
    /**
     * Handle the Product "updating" event.
     * Increment version for optimistic locking
     */
    public function updating(Product $product): void
    {
        // Increment version on every update
        // The ?? 0 is a safety fallback - version should always exist (set to 1 by created event)
        // but if somehow it doesn't, we start from 0 and increment to 1
        if ($product->isDirty() && !$product->isDirty('version')) {
            $product->version = ($product->version ?? 0) + 1;
        }
    }

    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        // Ensure version starts at 1
        if (!$product->version) {
            $product->version = 1;
            $product->saveQuietly(); // Save without triggering events
        }
    }
}
